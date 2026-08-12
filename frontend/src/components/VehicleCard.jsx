import { useNavigate } from 'react-router-dom'
import VehicleImage from './VehicleImage'

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate()

  // Safety check
  if (!vehicle) return null

  return (
    <div className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <VehicleImage
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
            vehicle.is_available
              ? 'bg-emerald-500/90 text-white border-emerald-400'
              : 'bg-neutral-900/80 text-neutral-200 border-neutral-700'
          }`}
        >
          {vehicle.is_available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-neutral-900 text-lg leading-tight">
          {vehicle.brand} {vehicle.name}
        </h3>

        <p className="text-neutral-500 text-sm mt-0.5">
          {vehicle.year} • {vehicle.fuel_type}
        </p>

        <div className="mt-4 flex items-end gap-1">
          <span className="text-2xl font-bold text-neutral-900">₹{vehicle.price_per_day}</span>
          <span className="text-neutral-400 text-sm mb-0.5">/day</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate(`/vehicle/${vehicle.id}`)}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => vehicle.is_available && navigate(`/book/${vehicle.id}`)}
            disabled={!vehicle.is_available}
            className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
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
  )
}