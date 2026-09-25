import { CreatorsHero } from '../sections/creators/CreatorsHero'
import { Monetize } from '../sections/creators/Monetize'
import { Platform } from '../sections/creators/Platform'
import { CreatorQuote } from '../sections/creators/CreatorQuote'
import { CreatorResults } from '../sections/creators/CreatorResults'
import { Reviews } from '../sections/creators/Reviews'
import { CreatorsFaq } from '../sections/creators/CreatorsFaq'
import { CreatorsCta } from '../sections/creators/CreatorsCta'

export default function Creators() {
  return (
    <main className="canvas">
      <CreatorsHero />
      <Monetize />
      <Platform />
      <CreatorQuote />
      <CreatorResults />
      <Reviews />
      <CreatorsFaq />
      <CreatorsCta />
    </main>
  )
}
