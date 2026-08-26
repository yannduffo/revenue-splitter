'use client'

import { useReadContract } from 'wagmi'
import { splitterFactoryAbi } from '@/lib/generated';

export default function Home() {
  const { data, error, isLoading } = useReadContract({
    abi: splitterFactoryAbi,
    address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
    functionName: 'implementation',
  })

  if (isLoading) return <p className='p-8'>Lecture ...</p>
  if (error) return <pre className='p-8 text-red-600'>{error.message}</pre>

  return <main><p className='p-8 font-mono'>implementation : {data}</p></main>
}
