import { useEffect, useMemo, useState } from 'react'
import { Search, ClipboardList } from 'lucide-react'
import { fetchBookings, cancelBooking } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { BookingSkeleton } from '../components/Skeletons'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

export default function BookingList() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [cancellingId, setCancellingId] = useState(null)

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      setBookings(await fetchBookings())
    } catch (err) {
      console.error('Booking API Error:', err)
      setError('Unable to load bookings. Please make sure the Django server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  // Cancelled bookings are hidden from the default "All" view.
  // They only appear if the user explicitly selects the "CANCELLED" filter.
  const visibleBookings = useMemo(
    () => bookings.filter((b) => b.status !== 'CANCELLED'),
    [bookings]
  )

  const statuses = useMemo(
    () => ['All', ...new Set(bookings.map((b) => b.status).filter(Boolean))],
    [bookings]
  )

  const filtered = useMemo(() => {
    const source = statusFilter === 'CANCELLED' ? bookings : visibleBookings

    return source.filter((b) => {
      const matchesSearch =
        !search ||
        b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.vehicle_name?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, visibleBookings, search, statusFilter])

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return

    setCancellingId(bookingId)
    try {
      await cancelBooking(bookingId)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        )
      )
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Bookings</h1>
        <p className="text-neutral-500 mt-1">
          {loading ? 'Loading...' : `Total Bookings: ${visibleBookings.length}`}
        </p>
      </div>

      {!error && bookings.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or vehicle..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
            />
          </div>
          {statuses.length > 1 && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={loadBookings} />
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <BookingSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={visibleBookings.length === 0 ? 'No bookings yet' : 'No matches found'}
          message={visibleBookings.length === 0 ? 'There are currently no active bookings.' : 'Try a different search or filter.'}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-400 font-mono">#{booking.id}</p>
                  <h3 className="font-bold text-neutral-900 mt-0.5">{booking.vehicle_name}</h3>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
                <p className="text-neutral-500">
                  Customer <span className="text-neutral-900 font-medium ml-1">{booking.customer_name}</span>
                </p>
                <p className="text-neutral-500">
                  Phone <span className="text-neutral-900 font-medium ml-1">{booking.customer_phone}</span>
                </p>
                <p className="text-neutral-500">
                  Start <span className="text-neutral-900 font-medium ml-1">{booking.start_date}</span>
                </p>
                <p className="text-neutral-500">
                  End <span className="text-neutral-900 font-medium ml-1">{booking.end_date}</span>
                </p>
              </div>

              {booking.status !== 'CANCELLED' && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}