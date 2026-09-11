'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { FlaskConical, X } from 'lucide-react'

import { resolveDemoContext } from '@/lib/demo-context'
import { DemoExplain } from './DemoExplain'
import { DemoFaucet } from './DemoFaucet'

export function DemoPanel() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { context, splitter } = resolveDemoContext(pathname ?? '/')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {/* right-8 matches the header px-8, so it sits under the wallet button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="fixed right-8 top-20 z-30 flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 shadow-sm transition-colors hover:bg-amber-200"
      >
        <FlaskConical size={14} />
        Demo tools
      </button>

      {open && (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-ink/20"
          />

          {/* fixed: never shifts the centered page layout */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Demo tools"
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col overflow-y-auto border-l border-rule bg-paper shadow-lg sm:w-[380px]"
          >
            <div className="flex items-center justify-between border-b border-rule px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <FlaskConical size={16} className="text-amber-700" />
                Demo tools
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close demo tools"
                className="cursor-pointer rounded p-0.5 text-muted transition-colors hover:text-accent"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-4">
              <DemoExplain context={context} />
              <div className="border-t border-rule" />
              <DemoFaucet splitter={splitter} />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
