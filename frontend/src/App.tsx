import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { ScrollManager } from './components/ScrollManager'
import CreatorProfile from './pages/CreatorProfile'
import Login from './pages/Login'
import Marketplace from './pages/Marketplace'
import NewBooking from './pages/NewBooking'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import Wallet from './pages/Wallet'

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="register" element={<Navigate to="/signup" replace />} />
        <Route element={<Layout />}>
          <Route index element={<Marketplace />} />
          <Route path="creators/:id" element={<CreatorProfile />} />
          <Route
            path="book/:creatorId"
            element={
              <RequireAuth role="brand">
                <NewBooking />
              </RequireAuth>
            }
          />
          <Route
            path="wallet"
            element={
              <RequireAuth>
                <Wallet />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
