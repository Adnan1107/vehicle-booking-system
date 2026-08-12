const STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase()
  const style = STYLES[key] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  )
}