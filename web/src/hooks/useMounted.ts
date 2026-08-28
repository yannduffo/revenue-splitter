'use client'

//import { useState, useEffect } from "react"
import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

//use to fix hydratation mismatch between server and browser (for wallet connection)
export function useMounted() {
  // old React way to do things : using a useEffect triggered after the 1 React rendering :
  //
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => setMounted(true), [])
  // return mounted

  //modern way to do it : using "useSyncExternalStore" -> automatically going to true when 1st rendering is complete
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
