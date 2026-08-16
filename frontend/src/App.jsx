import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'

import Dashboard from './pages/Dashboard'
import VehicleList from './pages/VehicleList'
import VehicleDetails from './pages/VehicleDetails'
import BookingList from './pages/BookingList'
import BookingForm from './pages/BookingForm'
import Payment from './pages/Payment'
import BookingSuccess from './pages/BookingSuccess'
import Register from './pages/Register'
import Login from './pages/login'
import AdminDashboard from './pages/AdminDashboard'
import AdminVehicles from './pages/AdminVehicles'
import AdminBookings from './pages/AdminBookings'
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED (customer) */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><VehicleList /></ProtectedRoute>} />
        <Route path="/vehicle/:vehicleId" element={<ProtectedRoute><VehicleDetails /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingList /></ProtectedRoute>} />
        <Route path="/book/:vehicleId" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
        <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/booking-success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />

        {/* ADMIN ONLY */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/vehicles" element={<AdminRoute><AdminVehicles /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App