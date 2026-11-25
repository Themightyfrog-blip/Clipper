import { ApiError } from '../api'

export function ErrorNote({ error, onDismiss }: { error: Error; onDismiss?: () => void }) {
  const hint = error instanceof ApiError ? error.hint : ''

  return (
    <div className="rounded-xl border-[2.5px] border-black bg-[#FF5A36] p-4 text-white shadow-[4px_4px_0px_#000]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="font-black text-lg">⚠️</span>
          <p className="font-black text-sm text-black">{error.message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="size-6 rounded-md border-2 border-black bg-white text-black font-black text-xs hover:bg-black hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
      {hint && (
        <p className="mt-2 ml-7 max-w-prose whitespace-pre-line text-xs font-bold text-black/90 bg-white/30 p-2.5 rounded-lg border border-black/40">
          {hint}
        </p>
      )}
    </div>
  )
}
