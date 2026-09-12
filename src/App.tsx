import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { Testimonial } from './sections/Testimonial'
import { Marketplace } from './sections/Marketplace'
import { Workflow } from './sections/Workflow'
import { Proof } from './sections/Proof'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <div className="canvas">
          <Testimonial />
          <Marketplace />
          <Workflow />
          <Proof />
        </div>
      </main>
    </>
  )
}
