import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { Testimonial } from './sections/Testimonial'
import { Marketplace } from './sections/Marketplace'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <div className="canvas">
          <Testimonial />
          <Marketplace />
        </div>
      </main>
    </>
  )
}
