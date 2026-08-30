import { lazy } from 'react'

/** Shared lazy entry so orbit + expand share one Mux Player chunk. */
export function loadMuxPlayerModule() {
  return import('@mux/mux-player-react')
}

export const LazyMuxPlayer = lazy(async () => {
  const mod = await loadMuxPlayerModule()
  return { default: mod.default }
})

/** Start downloading the Mux Player bundle before the center phone needs it. */
export function prefetchMuxPlayer() {
  void loadMuxPlayerModule()
}
