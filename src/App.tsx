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
import NotFound from './pages/NotFound'
import './App.css'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Login Route */}
        <Route path="login" element={<Login />} />

        {/* Protected Route Table */}
        <Route element={<ProtectedRoute />}>
          <Route index element={<Home />} />
          <Route path="courts" element={<Courts />} />
          <Route path="courts/:courtId" element={<CourtDetails />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="my-bookings" element={<MyBookings />} />
        </Route>

        {/* Catch-All 404 Route for Unmatched Paths */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App