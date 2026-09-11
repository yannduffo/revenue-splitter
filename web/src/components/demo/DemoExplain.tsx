import { DEMO_CONTENT, type DemoContext } from '@/lib/demo-content'

function Block({ title, body }: { title: string; body: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-sm uppercase tracking-wide text-muted">{title}</h3>
      {body.map((p, i) => (
        <p key={i} className="text-sm">
          {p}
        </p>
      ))}
    </div>
  )
}

export function DemoExplain({ context }: { context: DemoContext }) {
  return (
    <section className="flex flex-col gap-4">
      <Block {...DEMO_CONTENT.base} />
      <div className="border-t border-rule" />
      <Block {...DEMO_CONTENT.contexts[context]} />
    </section>
  )
}
