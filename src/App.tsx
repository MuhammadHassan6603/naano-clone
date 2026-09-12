import { Suspense, lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ScrollManager } from './components/ScrollManager'
import { Header } from './sections/Header'
import { Footer } from './sections/Footer'
import Home from './pages/Home'

const Creators = lazy(() => import('./pages/Creators'))
const Agencies = lazy(() => import('./pages/Agencies'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

export default function App() {
  const { pathname } = useLocation()
  const hasOwnFooter = pathname.startsWith('/blog')

  return (
    <>
      <ScrollManager />
      <Header />
      <Suspense fallback={<div className="min-h-svh" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      {!hasOwnFooter && <Footer />}
    </>
  )
}
