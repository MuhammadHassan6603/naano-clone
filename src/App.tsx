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
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const FreeTools = lazy(() => import('./pages/FreeTools'))
const CaseStudy = lazy(() => import('./pages/CaseStudy'))

export default function App() {
  const { pathname } = useLocation()
  const bare =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/free-tools' ||
    pathname.startsWith('/case-studies')
  const hasOwnFooter = bare || pathname.startsWith('/blog')

  return (
    <>
      <ScrollManager />
      {!bare && <Header />}
      <Suspense fallback={<div className="min-h-svh" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/free-tools" element={<FreeTools />} />
          <Route path="/case-studies/blogseo" element={<CaseStudy />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      {!hasOwnFooter && <Footer />}
    </>
  )
}
