import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Car, ClipboardList, CheckCircle2, Clock, XCircle, IndianRupee, AlertTriangle } from 'lucide-react'
import { fetchAdminStats } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { StatSkeleton } from '../components/Skeletons'
import ErrorState from '../components/ErrorState'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setStats(await fetchAdminStats())
    } catch (err) {
      setError(err.message || 'Unable to load dashboard stats.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const cards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users },
    { label: 'Total Vehicles', value: stats.total_vehicles, icon: Car },
    { label: 'Total Bookings', value: stats.total_bookings, icon: ClipboardList },
    { label: 'Confirmed', value: stats.confirmed_bookings, icon: CheckCircle2, accent: true },
    { label: 'Pending Payment', value: stats.pending_bookings, icon: Clock },
    { label: 'Cancelled', value: stats.cancelled_bookings, icon: XCircle },
    { label: 'Total Revenue', value: `₹${Number(stats.total_revenue).toLocaleString('en-IN')}`, icon: IndianRupee, accent: true },
    { label: 'Payments Pending', value: stats.pending_payments, icon: AlertTriangle },
  ] : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1">Fleet, bookings, and revenue at a glance.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/vehicles')} className="btn-outline">Manage Vehicles</button>
          <button onClick={() => navigate('/admin/bookings')} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors">
            Manage Bookings
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
              : cards.map((c) => <StatCard key={c.label} {...c} />)}
          </div>

          {!loading && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Bookings</h2>
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                {stats.recent_bookings.length === 0 ? (
                  <p className="text-center text-neutral-500 py-10">No bookings yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
                      <tr>
                        <th className="text-left px-5 py-3">ID</th>
                        <th className="text-left px-5 py-3">Vehicle</th>
                        <th className="text-left px-5 py-3">Customer</th>
                        <th className="text-left px-5 py-3">Amount</th>
                        <th className="text-left px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {stats.recent_bookings.map((b) => (
                        <tr key={b.id}>
                          <td className="px-5 py-3 font-mono text-neutral-500">#{b.id}</td>
                          <td className="px-5 py-3 font-medium text-neutral-900">{b.vehicle_name}</td>
                          <td className="px-5 py-3 text-neutral-600">{b.customer_name}</td>
                          <td className="px-5 py-3 text-neutral-900">₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-red-50' : 'bg-neutral-100'}`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-red-600' : 'text-neutral-600'}`} strokeWidth={2} />
        </span>
      </div>
      <p className="text-2xl font-extrabold text-neutral-900 tracking-tight">{value}</p>
    </div>
  )
}