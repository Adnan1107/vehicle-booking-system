import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, LayoutDashboard } from 'lucide-react'

export default function BookingSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const booking = location.state?.booking
  const payment = location.state?.payment

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Booking Not Found</h1>
        <p className="text-neutral-500 mt-2">Booking details are not available.</p>
        <button onClick={() => navigate('/vehicles')} className="mt-6 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors">
          Back to Vehicles
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={2} />
      </div>

      <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Booking Confirmed</h1>
      <p className="text-neutral-500 mt-2">Your vehicle booking has been successfully confirmed.</p>

      <div className="text-left bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mt-8 space-y-3">
        <Row label="Booking ID" value={`#${booking.id}`} mono />
        <Row label="Vehicle" value={booking.vehicle_name} />
        <Row label="Customer Name" value={booking.customer_name} />
        <Row label="Email" value={booking.customer_email} />
        <Row label="Start Date" value={booking.start_date} />
        <Row label="End Date" value={booking.end_date} />
        <Row label="Total Amount" value={`₹${Number(booking.total_amount || 0).toLocaleString('en-IN')}`} />
        <Row label="Booking Status" value={booking.status} />
        {payment && <Row label="Payment" value={`${payment.status} (${payment.method === 'DEMO' ? 'Demo Payment' : payment.method})`} />}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-8">
        <button onClick={() => navigate('/bookings')} className="btn-outline">View Bookings</button>
        <button onClick={() => navigate('/vehicles')} className="btn-outline">Browse Vehicles</button>
        <button onClick={() => navigate('/')} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
      <span className="text-neutral-500">{label}</span>
      <span className={`font-semibold text-neutral-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}