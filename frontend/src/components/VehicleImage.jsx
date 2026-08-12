import { useState } from 'react'
import { Car } from 'lucide-react'

// Single source of truth for "no image / broken image" — never shows
// a broken-image icon anywhere in the app.
export default function VehicleImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !src || failed

  if (showPlaceholder) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 ${className}`}>
        <Car className="w-10 h-10 text-neutral-300" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}