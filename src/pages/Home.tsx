import { About } from '../sections/About/About'
import { Contact } from '../sections/Contact/Contact'
import { Featured } from '../sections/Featured/Featured'
import { Hero } from '../sections/Hero/Hero'
import { Reels } from '../sections/Reels/Reels'

export function Home() {
  return (
    <>
      <Hero />
      <About />
      <Reels />
      <Featured />
      <Contact />
    </>
  )
}
