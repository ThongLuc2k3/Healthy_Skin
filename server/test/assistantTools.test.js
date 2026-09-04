import test from 'node:test'
import assert from 'node:assert/strict'
import { ASSISTANT_TOOL_SCHEMAS, MUTATING_ASSISTANT_TOOLS, READ_ASSISTANT_TOOLS, executeAssistantTool } from '../src/services/assistantTools.js'

test('Agent công bố bộ tool schema đầy đủ và không trùng tên', () => {
  const names = ASSISTANT_TOOL_SCHEMAS.map(tool => tool.name)
  assert.ok(names.length >= 50)
  assert.equal(new Set(names).size, names.length)
  assert.equal(READ_ASSISTANT_TOOLS.size + MUTATING_ASSISTANT_TOOLS.size, names.length)
  for (const tool of ASSISTANT_TOOL_SCHEMAS) {
    assert.ok(tool.description)
    assert.equal(tool.parameters.type, 'OBJECT')
  }
})

test('tool RAG dùng chung ngưỡng 85%', async () => {
  const results = await executeAssistantTool('search_tlucs_knowledge', { query: 'phí nền tảng là bao nhiêu' })
  assert.ok(results.length > 0)
  assert.ok(results.every(result => result.confidence >= .85))
})
