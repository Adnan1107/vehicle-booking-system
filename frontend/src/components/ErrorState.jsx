import { AlertTriangle, RotateCw } from 'lucide-react'

export default function ErrorState({ message = 'Unable to connect to the backend.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border border-red-100 bg-red-50/50">
      <div className="w-14 h-14 rounded-full bg-white border border-red-200 flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-neutral-900 font-semibold text-lg">Something went wrong</h3>
      <p className="text-neutral-500 text-sm mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  )
}