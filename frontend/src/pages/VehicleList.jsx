import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, AlertCircle } from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000'

export default function VehicleList() {
  const navigate = useNavigate()

  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_URL}/api/vehicles/`)

        if (!response.ok) {
          throw new Error('Failed to load vehicles.')
        }

        const data = await response.json()
        setVehicles(data)
      } catch (err) {
        setError(err.message || 'Unable to connect to the backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  // Filter by name or brand, case-insensitive
  const filteredVehicles = vehicles.filter((vehicle) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true

    return (
      vehicle.name?.toLowerCase().includes(term) ||
      vehicle.brand?.toLowerCase().includes(term)
    )
  })

  const getImageUrl = (image) => {
    if (!image) return null
    return image.startsWith('http') ? image : `${API_URL}${image}`
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-neutral-700 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900">
          Available Vehicles
        </h1>
        <p className="text-neutral-500 mt-1">
          Choose a vehicle for your booking.
        </p>
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

      {filteredVehicles.length === 0 ? (
        <p className="text-center text-neutral-500 py-16">
          No vehicles match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 bg-neutral-100">
                {getImageUrl(vehicle.image) ? (
                  <img
                    src={getImageUrl(vehicle.image)}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    No image
                  </div>
                )}

                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    vehicle.is_available
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-900 text-white'
                  }`}
                >
                  {vehicle.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="p-5">
                <h2 className="font-bold text-neutral-900 uppercase tracking-tight">
                  {vehicle.brand} {vehicle.name}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {vehicle.year} • {vehicle.fuel_type}
                </p>

                <p className="mt-3">
                  <span className="text-2xl font-extrabold text-neutral-900">
                    ₹{Number(vehicle.price_per_day).toFixed(2)}
                  </span>
                  <span className="text-neutral-500 text-sm"> /day</span>
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => navigate(`/book/${vehicle.id}`)}
                    disabled={!vehicle.is_available}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-colors ${
                      vehicle.is_available
                        ? 'bg-red-600 text-white hover:bg-red-500'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    {vehicle.is_available ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}