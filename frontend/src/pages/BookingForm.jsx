import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { fetchVehicle, createBooking } from '../utils/api'
import VehicleImage from '../components/VehicleImage'

export default function BookingForm() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState(null)
  const [vehicleLoading, setVehicleLoading] = useState(true)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVehicle(vehicleId)
      .then(setVehicle)
      .catch(() => setVehicle(null))
      .finally(() => setVehicleLoading(false))
  }, [vehicleId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    // Validate dates
    if (startDate && endDate && endDate < startDate) {
      setError('End date cannot be before the start date.')
      return
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    // Correct booking payload
    const bookingData = {
      vehicle: Number(vehicleId),
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: phoneNumber,          // ← correct field name
      start_date: startDate,
      end_date: endDate,
    }

    setSubmitting(true)

    try {
      const data = await createBooking(bookingData)

      navigate('/booking-success', {
        state: {
          booking: data,
        },
      })
    } catch (err) {
      console.error('Error:', err)

      if (err.data) {
        console.error('Backend Error:', err.data)
        // Show actual backend error if available
        const messages = Object.values(err.data).flat().join(' ')
        setError(messages || 'Booking failed. Please check your details.')
      } else {
        setError('Unable to connect to the server.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-8">
        Book Vehicle
      </h1>

      {/* Vehicle Summary */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-neutral-200 p-4 mb-8 shadow-sm">
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
          <VehicleImage
            src={vehicle?.image}
            alt={vehicle?.name}
            className="w-full h-full"
          />
        </div>

        <div>
          {vehicleLoading ? (
            <p className="text-neutral-400 text-sm">Loading vehicle...</p>
          ) : vehicle ? (
            <>
              <p className="font-bold text-neutral-900">
                {vehicle.brand} {vehicle.name}
              </p>
              <p className="text-neutral-500 text-sm">
                {vehicle.year} • {vehicle.fuel_type} · ₹{vehicle.price_per_day}/day
              </p>
            </>
          ) : (
            <p className="text-neutral-500 text-sm">
              Vehicle ID: {vehicleId}
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5"
      >
        <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
          Customer Information
        </h2>

        <Field label="Customer Name">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            required
            className="input"
          />
        </Field>

        <Field label="Customer Email">
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="input"
          />
        </Field>

        <Field label="Phone Number">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              if (value.length <= 10) {
                setPhoneNumber(value)
              }
            }}
            placeholder="Enter 10-digit phone number"
            maxLength="10"
            required
            className="input"
          />
        </Field>

        <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-wide pt-2">
          Booking Dates
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Start Date">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="input"
            />
          </Field>

          <Field label="End Date">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="input"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}