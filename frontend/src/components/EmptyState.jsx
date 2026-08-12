import { Inbox } from 'lucide-react'

export default function EmptyState({ title, message, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50">
      <div className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-neutral-900 font-semibold text-lg">{title}</h3>
      {message && <p className="text-neutral-500 text-sm mt-1 max-w-xs">{message}</p>}
    </div>
  )
}