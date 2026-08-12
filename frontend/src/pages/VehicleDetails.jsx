import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Tag, Calendar, Fuel, IndianRupee, CircleCheck } from 'lucide-react'
import { fetchVehicle } from '../utils/api'
import VehicleImage from '../components/VehicleImage'
import ErrorState from '../components/ErrorState'

export default function VehicleDetails() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadVehicle = async () => {
    setLoading(true)
    setError('')
    try {
      setVehicle(await fetchVehicle(vehicleId))
    } catch (err) {
      console.error('Vehicle Details Error:', err)
      setError('Unable to load vehicle details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicle()
  }, [vehicleId])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-32 mb-6" />
        <div className="h-80 bg-neutral-200 rounded-2xl mb-6" />
        <div className="h-8 bg-neutral-200 rounded w-1/3 mb-3" />
        <div className="h-4 bg-neutral-200 rounded w-1/4" />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <ErrorState
          message={error || 'This vehicle could not be found.'}
          onRetry={error ? loadVehicle : undefined}
        />
        <button
          onClick={() => navigate('/vehicles')}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate('/vehicles')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Vehicles
      </button>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Image */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden border border-neutral-200 h-80 sm:h-96 shadow-sm">
            <VehicleImage src={vehicle.image} alt={vehicle.name} className="w-full h-full" />
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              vehicle.is_available
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <CircleCheck className="w-3.5 h-3.5" />
            {vehicle.is_available ? 'Available' : 'Not Available'}
          </span>

          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-3">
            {vehicle.brand} {vehicle.name}
          </h1>

          <div className="mt-6 space-y-4 divide-y divide-neutral-100">
            <InfoRow icon={Tag} label="Brand" value={vehicle.brand} />
            <InfoRow icon={Calendar} label="Year" value={vehicle.year} />
            <InfoRow icon={Fuel} label="Fuel Type" value={vehicle.fuel_type} />
            <InfoRow icon={IndianRupee} label="Price Per Day" value={`₹${vehicle.price_per_day}`} />
          </div>

          <button
            onClick={() => vehicle.is_available && navigate(`/book/${vehicle.id}`)}
            disabled={!vehicle.is_available}
            className={`w-full mt-8 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
              vehicle.is_available
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {vehicle.is_available ? 'Book Now' : 'Vehicle Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center justify-between pt-4 first:pt-0">
      <span className="flex items-center gap-2 text-neutral-500 text-sm">
        <Icon className="w-4 h-4" /> {label}
      </span>
      <span className={`font-semibold text-neutral-900 text-sm ${mono ? 'font-mono uppercase tracking-wide' : ''}`}>
        {value}
      </span>
    </div>
  )
}