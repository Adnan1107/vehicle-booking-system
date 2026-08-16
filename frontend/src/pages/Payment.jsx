import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, Loader2, AlertCircle, Info } from 'lucide-react'
import { fetchBooking, fetchPayments, payDemo } from '../utils/api'

export default function Payment() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [booking, setBooking] = useState(location.state?.booking || null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [bookingData, payments] = await Promise.all([
        fetchBooking(bookingId),
        fetchPayments(),
      ])
      setBooking(bookingData)
      setPayment(payments.find((p) => p.booking_id === Number(bookingId)) || null)
    } catch (err) {
      setError(err.message || 'Unable to load payment details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const handlePay = async () => {
    if (!payment) return
    setPaying(true)
    setError('')
    try {
      const result = await payDemo(payment.id)
      navigate('/booking-success', {
        state: { booking: { ...booking, status: 'CONFIRMED' }, payment: result.payment },
      })
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (error && !payment) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-neutral-700">{error}</p>
        <button onClick={load} className="mt-5 btn-outline">Retry</button>
      </div>
    )
  }

  if (payment?.status === 'PAID') {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-neutral-700 font-medium">This booking has already been paid.</p>
        <button onClick={() => navigate('/bookings')} className="mt-5 btn-outline">View My Bookings</button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-1">Payment</h1>
      <p className="text-neutral-500 mb-8">Complete payment to confirm your booking.</p>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Booking</span>
          <span className="font-semibold text-neutral-900">#{booking?.id} — {booking?.vehicle_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">{booking?.num_days} day{booking?.num_days > 1 ? 's' : ''} × ₹{booking?.price_per_day}</span>
          <span className="text-neutral-900">₹{Number(booking?.total_amount).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-3 border-t border-neutral-100">
          <span className="text-neutral-900">Amount Due</span>
          <span className="text-neutral-900">₹{Number(payment?.amount ?? booking?.total_amount).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Demo Payment.</strong> No real charge will be made — this environment has no
            gateway credentials configured. This flow is architected so Razorpay/Stripe can be
            plugged in without changing the booking logic.
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying || !payment}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {paying ? 'Processing...' : 'Pay Now (Demo)'}
        </button>
      </div>
    </div>
  )
}