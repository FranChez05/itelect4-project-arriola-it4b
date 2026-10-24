import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Courts from './pages/Courts'
import CourtDetails from './pages/CourtDetails'
import BookingPage from './pages/BookingPage'
import MyBookings from './pages/MyBookings'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/AdminDashboard'
import AiReviewPage from './pages/AiReviewPage'
import { useAuthStore } from './store/authStore'
import './App.css'

const App: React.FC = () => {
  const role = useAuthStore((state) => state.user?.role)
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected Route Table */}
        <Route element={<ProtectedRoute />}>
          <Route index element={role === 'admin' ? <AdminDashboard /> : <Home />} />
          <Route path="admin" element={role === 'admin' ? <AdminDashboard /> : <NotFound />} />
          <Route path="courts" element={<Courts />} />
          <Route path="courts/:courtId" element={<CourtDetails />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="ai-review" element={<AiReviewPage />} />
        </Route>

        {/* Catch-All 404 Route for Unmatched Paths */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App