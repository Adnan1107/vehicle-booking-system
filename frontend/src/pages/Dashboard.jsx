import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Car, ClipboardCheck, Layers } from 'lucide-react'
import { fetchVehicles, fetchBookings } from '../utils/api'
import VehicleImage from '../components/VehicleImage'
import VehicleCard from '../components/VehicleCard'
import { VehicleCardSkeleton, StatSkeleton } from '../components/Skeletons'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

export default function Dashboard() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [bookingCount, setBookingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [vehicleData, bookingData] = await Promise.all([
        fetchVehicles(),
        fetchBookings(),
      ])
      setVehicles(vehicleData)
      setBookingCount(bookingData.length)
    } catch (err) {
      console.error('Dashboard Error:', err)
      setError('Unable to connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const availableCount = vehicles.filter((v) => v.is_available).length
  const heroVehicle = vehicles.find((v) => v.image) || vehicles[0]
  const featured = vehicles.slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-red-500 text-xs font-semibold tracking-widest uppercase mb-4">
                Vehicle Booking System
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Find Your Perfect Ride
              </h1>
              <p className="text-neutral-400 text-lg mt-5 max-w-md leading-relaxed">
                Browse our fleet, compare vehicles, and book the right one for your trip in minutes — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={() => navigate('/vehicles')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors"
                >
                  Browse Vehicles
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/bookings')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-700 text-white font-semibold text-sm hover:bg-neutral-900 transition-colors"
                >
                  View Bookings
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/40 h-72 sm:h-80">
                <VehicleImage
                  src={heroVehicle?.image}
                  alt={heroVehicle?.name || 'Featured vehicle'}
                  className="w-full h-full"
                />
              </div>
              {heroVehicle && (
                <div className="absolute -bottom-5 left-5 right-5 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-900 text-sm">{heroVehicle.name}</p>
                    <p className="text-neutral-500 text-xs">{heroVehicle.vehicle_type}</p>
                  </div>
                  <p className="font-bold text-red-600 text-sm">₹{heroVehicle.price_per_day}/day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {error && (
          <div className="mt-8">
            <ErrorState message={error} onRetry={loadData} />
          </div>
        )}

        {!error && (
          <>
            {/* Stats */}
            <section className="grid sm:grid-cols-3 gap-4 -mt-8 relative z-10 pt-16 sm:pt-0 sm:mt-10">
              {loading ? (
                <>
                  <StatSkeleton />
                  <StatSkeleton />
                  <StatSkeleton />
                </>
              ) : (
                <>
                  <StatCard icon={Layers} label="Total Vehicles" value={vehicles.length} />
                  <StatCard icon={Car} label="Available Vehicles" value={availableCount} accent />
                  <StatCard icon={ClipboardCheck} label="Total Bookings" value={bookingCount} />
                </>
              )}
            </section>

            {/* Featured vehicles */}
            <section className="mt-16 pb-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Featured Vehicles</h2>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="text-sm font-semibold text-red-600 hover:text-red-500 flex items-center gap-1"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <VehicleCardSkeleton />
                  <VehicleCardSkeleton />
                  <VehicleCardSkeleton />
                </div>
              ) : featured.length === 0 ? (
                <EmptyState icon={Car} title="No vehicles available" message="Check back later for new additions to the fleet." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {featured.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
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
      <p className="text-3xl font-extrabold text-neutral-900 tracking-tight">{value}</p>
    </div>
  )
}