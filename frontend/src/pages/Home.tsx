import { Hero } from '../sections/Hero'
import { Testimonial } from '../sections/Testimonial'
import { Marketplace } from '../sections/Marketplace'
import { Workflow } from '../sections/Workflow'
import { Proof } from '../sections/Proof'
import { Results } from '../sections/Results'
import { Pricing } from '../sections/Pricing'
import { Faq } from '../sections/Faq'
import { Cta } from '../sections/Cta'

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="canvas">
        <Testimonial />
        <Marketplace />
        <Workflow />
      </div>
      <Proof />
      <Results />
      <Pricing />
      <Faq />
      <Cta />
    </main>
  )
}
