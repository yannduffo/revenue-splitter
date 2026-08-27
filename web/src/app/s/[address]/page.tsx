'use client'

import { useParams } from 'next/navigation'
import { isAddress } from 'viem'
import { useSplitter } from '@/hooks/useSplitter'
import { AllocationBar } from '@/components/splitter/AllocationBar'
import { shortenAddress } from '@/lib/format'
import { Address } from 'viem'

export default function SplitterPage() {
  const params = useParams<{ address: string }>()
  const address = params.address

  if (!isAddress(address)) {
    return <p className="p-8 text-muted">Not a valid address.</p>
  }

  //we are calling an internal component so the useSplitter hook is non
  // conditionnaly called
  return <SplitterView address={address} />
}

function SplitterView({ address }: { address: Address }) {
  const { data, isLoading, error } = useSplitter(address)

  if (isLoading) return <p className="p-8 text-muted">Loading…</p>
  if (error) return <pre className="p-8 text-sm">{error.message}</pre>
  if (!data) return null

  return (
    <main className="mx-auto max-w-275 p-8">
      <div className="mb-6">
        <p className="text-[13px] text-muted">Splitter</p>
        <p className="font-mono text-lg">{shortenAddress(address, 6)}</p>
      </div>
      <AllocationBar members={data.members} />
    </main>
  )
}
