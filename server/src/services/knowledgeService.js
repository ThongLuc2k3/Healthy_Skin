import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const knowledgeDir = resolve(here, '../../../knowledge')
export const MIN_KNOWLEDGE_CONFIDENCE = 0.85
let cache
let expansionCache

export function normalizeKnowledgeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd')
}

const STOP_WORDS = new Set(['va','hay','cho','cua','voi','the','nao','toi','minh','ban','la','dang','lam','gi','bao','nhieu','co','khong','duoc','ve','sau','khi','cach'])
function tokens(value) { return [...new Set((normalizeKnowledgeText(value).match(/[a-z0-9]{2,}/g) || []).filter(token => !STOP_WORDS.has(token)))] }
function tokenSet(value) { return new Set(tokens(value)) }

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return { metadata: {}, body: text }
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) return { metadata: {}, body: text }
  const metadata = {}
  for (const line of text.slice(4, end).split('\n')) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    const key = line.slice(0, separator).trim(), raw = line.slice(separator + 1).trim()
    metadata[key] = raw.startsWith('[') ? raw.slice(1, -1).split(',').map(item => item.trim()).filter(Boolean) : raw
  }
  return { metadata, body: text.slice(end + 5) }
}

function chunksFromMarkdown(text, source) {
  const { metadata, body } = parseFrontmatter(text), chunks = [], hierarchy = []
  let current
  const flush = () => {
    if (!current) return
    const content = current.lines.join('\n').trim()
    if (content) chunks.push({ id: `${source}#${chunks.length + 1}`, source, title: current.title, hierarchy: current.hierarchy, level: current.level, domain: metadata.domain || 'general', riskLevel: metadata.risk_level || 'low', authority: metadata.authority || 'product_documentation', reviewedAt: metadata.reviewed_at || null, tags: Array.isArray(metadata.tags) ? metadata.tags : [], content: content.slice(0, 2400) })
  }
  for (const line of body.split('\n')) {
    const heading = line.match(/^(#{1,3})\s+(.+)/)
    if (!heading) { if (current) current.lines.push(line); continue }
    flush(); const level = heading[1].length; hierarchy[level - 1] = heading[2].trim(); hierarchy.length = level
    current = { title: heading[2].trim(), level, hierarchy: [...hierarchy], lines: [line] }
  }
  flush(); return chunks
}

async function load() {
  if (cache) return cache
  const files = (await readdir(knowledgeDir)).filter(file => file.endsWith('.md') && file !== 'README.md')
  cache = (await Promise.all(files.map(async source => chunksFromMarkdown(await readFile(resolve(knowledgeDir, source), 'utf8'), source)))).flat()
  return cache
}

async function expansions() {
  if (!expansionCache) expansionCache = JSON.parse(await readFile(resolve(knowledgeDir, 'query-expansions.json'), 'utf8'))
  return expansionCache
}

export async function searchKnowledge(query, limit = 4) {
  const [chunks, config] = await Promise.all([load(), expansions()])
  const normalized = normalizeKnowledgeText(query), directTokens = tokens(query)
  if (!directTokens.length) return []
  const activeGroups = config.groups.filter(group => group.terms.some(term => normalized.includes(normalizeKnowledgeText(term))))
  const hasIntentPhrase = activeGroups.some(group => group.terms.some(term => tokens(term).length >= 2 && normalized.includes(normalizeKnowledgeText(term))))
  const expandedTokens = new Set(directTokens)
  for (const group of activeGroups) tokens(group.terms.join(' ')).forEach(token => expandedTokens.add(token))
  return chunks.map(chunk => {
    const title = tokenSet(chunk.title), tags = tokenSet(chunk.tags.join(' ')), path = tokenSet(chunk.hierarchy.join(' ')), body = tokenSet(chunk.content)
    const all = new Set([...title, ...tags, ...path, ...body])
    const score = [...expandedTokens].reduce((sum, token) => sum + (title.has(token) ? 5 : 0) + (tags.has(token) ? 4 : 0) + (path.has(token) ? 2 : 0) + (body.has(token) ? 1 : 0), 0)
    const directMatches = directTokens.filter(token => all.has(token)).length
    const coverage = directMatches / directTokens.length
    const aligned = activeGroups.some(group => tokens(group.terms.join(' ')).some(token => all.has(token)))
    const titleDirect = directTokens.some(token => title.has(token))
    const confidence = Math.min(1, coverage * .4 + (hasIntentPhrase && aligned ? .6 : aligned ? .25 : 0) + (titleDirect ? .1 : 0))
    return { ...chunk, score, confidence: Number(confidence.toFixed(3)), retrievalMode: 'hybrid_json_keyword' }
  }).filter(chunk => chunk.confidence >= MIN_KNOWLEDGE_CONFIDENCE)
    .sort((a, b) => b.score - a.score).slice(0, Math.min(Math.max(Number(limit) || 4, 1), 8))
}

export async function getKnowledgeStats() {
  const chunks = await load()
  return { documents: new Set(chunks.map(x => x.source)).size, chunks: chunks.length, domains: [...new Set(chunks.map(x => x.domain))].sort() }
}

export async function answerFromKnowledge(query) {
  const [chunk] = await searchKnowledge(query, 1)
  if (!chunk) return { answer: 'Mình chưa biết câu trả lời từ kho tài liệu TLUCS hiện có.', confidence: 0, source: null }
  const paragraphs = chunk.content.split(/\n\s*\n/).slice(1).filter(part => !part.startsWith('## Nguồn'))
  return { answer: `${paragraphs.join('\n\n').trim().slice(0, 1000)}\n\nNguồn: [${chunk.source} > ${chunk.title}]`, confidence: chunk.confidence, source: chunk.source }
}
