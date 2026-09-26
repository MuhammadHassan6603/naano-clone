import { Navigate, Route, Routes } from 'react-router-dom'
import { AssistantBar } from './components/assistant/AssistantBar'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { ScrollManager } from './components/ScrollManager'
import CreatorProfile from './pages/CreatorProfile'
import Audience from './pages/dashboard/Audience'
import BookingDetail from './pages/dashboard/BookingDetail'
import Bookings from './pages/dashboard/Bookings'
import Overview from './pages/dashboard/Overview'
import Profile from './pages/dashboard/Profile'
import Wallet from './pages/dashboard/Wallet'
import Login from './pages/Login'
import Marketplace from './pages/Marketplace'
import NewBooking from './pages/NewBooking'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import Welcome from './pages/Welcome'
import { useAuth } from './lib/auth'
import { NotificationsProvider } from './components/Notifications'

function Assistant() {
  const { user } = useAuth()
  return user ? <AssistantBar key={user.id} user={user} /> : null
}

export default function App() {
  const { user } = useAuth()
  return (
    <NotificationsProvider userId={user?.id}>
      <ScrollManager />
      <Assistant />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route
          path="welcome"
          element={
            <RequireAuth>
              <Welcome />
            </RequireAuth>
          }
        />
        <Route path="register" element={<Navigate to="/signup" replace />} />
        <Route path="wallet" element={<Navigate to="/dashboard/wallet" replace />} />
        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Overview />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="audience" element={<Audience />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </NotificationsProvider>
  )
}
