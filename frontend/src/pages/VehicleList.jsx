import { useEffect, useState } from 'react'
import { Search, Car } from 'lucide-react'
import { fetchVehicles } from '../utils/api'
import VehicleCard from '../components/VehicleCard'
import { VehicleCardSkeleton } from '../components/Skeletons'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setVehicles(await fetchVehicles())
    } catch (err) {
      setError(err.message || 'Unable to load vehicles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = vehicles.filter((v) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return v.name?.toLowerCase().includes(term) || v.brand?.toLowerCase().includes(term)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900">Available Vehicles</h1>
        <p className="text-neutral-500 mt-1">Choose a vehicle for your booking.</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or brand..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title={vehicles.length === 0 ? 'No vehicles available' : 'No matches found'}
          message={vehicles.length === 0 ? 'Check back later for new additions to the fleet.' : 'Try a different search term.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      )}
    </div>
  )
}