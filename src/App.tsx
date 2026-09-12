import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ScrollManager } from './components/ScrollManager'
import { Header } from './sections/Header'
import { Footer } from './sections/Footer'
import Home from './pages/Home'

const Creators = lazy(() => import('./pages/Creators'))

export default function App() {
  return (
    <>
      <ScrollManager />
      <Header />
      <Suspense fallback={<div className="min-h-svh" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}
