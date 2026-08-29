import { useEffect } from 'react'

const LOCK_CLASS = 'reels-expand-scroll-lock'

/** Block page/Lenis scroll while the expand overlay is open. */
export function useExpandScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return undefined

    const root = document.documentElement
    root.classList.add(LOCK_CLASS)

    const blockScroll = (event: Event) => {
      event.preventDefault()
    }

    window.addEventListener('wheel', blockScroll, { passive: false })
    window.addEventListener('touchmove', blockScroll, { passive: false })

    return () => {
      root.classList.remove(LOCK_CLASS)
      window.removeEventListener('wheel', blockScroll)
      window.removeEventListener('touchmove', blockScroll)
    }
  }, [active])
}
