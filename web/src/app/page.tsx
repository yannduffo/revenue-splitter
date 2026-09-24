'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSplitters } from '@/hooks/useSplitters'
import { useConnectedMember } from '@/hooks/useConnectedMember'
import { SplitterList } from '@/components/splitter/home/SplitterList'
import { SearchBar } from '@/components/SearchBar'
import Image from 'next/image'

export default function Home() {
  const [search, setSearch] = useState('')
  const { all, mine, isLoading, error } = useSplitters()
  const { address } = useConnectedMember()

  const filter = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!filter) return { all, mine }
    const match = (entry: (typeof all)[number]) =>
      entry.splitter.address.toLowerCase().includes(filter) ||
      entry.splitter.members.some((m) => m.address.toLowerCase().includes(filter))
    return { all: all.filter(match), mine: mine.filter(match) }
  }, [all, mine, filter])

  return (
    <main className="mx-auto flex max-w-275 flex-col gap-4 p-4 sm:p-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className='flex gap-2'>
            {/* alt="" : the header already carries the brand, here it is decoration */}
            <Image
              src="/logo-no-txt.svg"
              alt=""
              width={38}
              height={38}
            />
            <span className='text-2xl font-mono'>/ home </span>
          </h1>
          <Link
            href="/create"
            className="rounded-lg bg-accent px-3 py-1.5 text-sm text-paper"
          >
            New splitter
          </Link>
        </div>
        <div className="mt-2 flex flex-col gap-1 text-base text-muted sm:text-lg">
          <p>Split ERC-20 revenue between a fixed set of members, on-chain</p>
          <p>
            Shares are set once at creation and can never be changed, not by the
            creator, not by anyone
          </p>
          <p>
            Send any token to a splitter&apos;s address: it is credited to every
            member pro rata, each one claim their share whenever they want
          </p>
        </div>
      </div>


      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted">Looking for a splitter ?</p>
        <SearchBar value={search} onChange={setSearch} />

        {error && (
          <p className="rounded-xl border border-rule bg-surface p-4 text-sm text-muted">
            Could not read the factory. Is the chain reachable?
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-4">
        <SplitterList
          title="Yours"
          entries={filtered.mine}
          isLoading={isLoading}
          empty={
            address
              ? "You're not part of any splitter yet."
              : 'Connect your wallet to see the splitters you belong to.'
          }
        />

        <SplitterList
          title="All splitters"
          entries={filtered.all}
          isLoading={isLoading}
          empty="No splitter has been created yet."
          />
        </div>
      </div>
      </main>
  )
}
