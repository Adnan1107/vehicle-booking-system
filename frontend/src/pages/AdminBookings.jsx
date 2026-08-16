import { useEffect, useMemo, useState } from 'react'
import { Search, ClipboardList } from 'lucide-react'
import { fetchBookings, adminSetBookingStatus } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { BookingSkeleton } from '../components/Skeletons'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

const STATUS_OPTIONS = ['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PAYMENT_FAILED']

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setBookings(await fetchBookings())
    } catch (err) {
      setError(err.message || 'Unable to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => bookings.filter((b) => {
    const matchesSearch = !search ||
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle_name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter
    return matchesSearch && matchesStatus
  }), [bookings, search, statusFilter])

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      const updated = await adminSetBookingStatus(id, newStatus)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    } catch (err) {
      alert(err.message || 'Unable to update status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-1">All Bookings</h1>
      <p className="text-neutral-500 mb-8">{loading ? 'Loading...' : `${filtered.length} of ${bookings.length} bookings`}</p>

      {!error && bookings.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer or vehicle..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white">
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <BookingSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No bookings found" message="Try a different search or filter." />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-400 font-mono">#{b.id}</p>
                  <h3 className="font-bold text-neutral-900 mt-0.5">{b.vehicle_name}</h3>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
                <p className="text-neutral-500">Customer <span className="text-neutral-900 font-medium ml-1">{b.customer_name}</span></p>
                <p className="text-neutral-500">Amount <span className="text-neutral-900 font-medium ml-1">₹{Number(b.total_amount).toLocaleString('en-IN')}</span></p>
                <p className="text-neutral-500">Start <span className="text-neutral-900 font-medium ml-1">{b.start_date}</span></p>
                <p className="text-neutral-500">End <span className="text-neutral-900 font-medium ml-1">{b.end_date}</span></p>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-3">
                <label className="text-xs text-neutral-500 font-medium">Change status:</label>
                <select
                  value={b.status}
                  disabled={updatingId === b.id}
                  onChange={(e) => handleStatusChange(b.id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm bg-white disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}