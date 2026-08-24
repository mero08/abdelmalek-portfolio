import { About } from '../sections/About/About'
import { Contact } from '../sections/Contact/Contact'
import { Featured } from '../sections/Featured/Featured'
import { Hero } from '../sections/Hero/Hero'
import { Reels } from '../sections/Reels/Reels'
import { useLenis } from '../hooks/useLenis'
import { useSectionReveal } from '../hooks/useSectionReveal'

export function Home() {
  useLenis()
  const revealRef = useSectionReveal()

  return (
    <div ref={revealRef}>
      <Hero />
      <About />
      <Reels />
      <Featured />
      <Contact />
    </div>
  )
}
