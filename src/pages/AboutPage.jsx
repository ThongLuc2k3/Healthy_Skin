import aboutContent from '../data/aboutContent'
import { LeafIcon, SparklesIcon } from '../components/Icons'

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pt-28">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
          <SparklesIcon className="h-3.5 w-3.5" />
          Về chúng tôi
        </span>
        <h1 className="mt-4 flex items-center justify-center gap-2 text-3xl font-black tracking-tight text-slate-900">
          <LeafIcon className="h-7 w-7 text-emerald-600" />
          Healthy Skin
        </h1>
      </div>

      <section className="motion-rise surface-tint-strong mt-8 rounded-[2rem] border border-white/80 p-6 shadow-sm sm:p-8">
        {aboutContent.intro.map((block, index) => (
          <p key={index} className="mt-3 text-sm leading-7 text-slate-600 first:mt-0">
            {block.text}
          </p>
        ))}
      </section>

      <section className="motion-rise mt-6 rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-sm sm:p-8">
        {aboutContent.contact.map((block, index) =>
          block.type === 'article' ? (
            <h2 key={index} className="text-lg font-bold tracking-tight text-slate-900">
              {block.text}
            </h2>
          ) : (
            <p key={index} className="mt-2 text-sm leading-6 text-slate-600">
              {block.text}
            </p>
          ),
        )}
      </section>
    </div>
  )
}

export default AboutPage
