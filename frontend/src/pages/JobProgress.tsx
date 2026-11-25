import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { api, formatDuration } from '../api'
import { ErrorNote } from '../components/ErrorNote'
import { useJobStream } from '../useJobStream'

/** Stage order and labels, mirroring autoclip.pipeline.Stage. */
const STAGES = [
  { key: 'prepare', label: '01. Ingest & Demux', note: 'Extracting audio and video streams' },
  { key: 'transcribe', label: '02. Neural Transcription', note: 'Word-level alignment via Whisper' },
  { key: 'highlights', label: '03. Viral Hook Detection', note: 'Detecting highest-retention moments' },
  { key: 'reframe', label: '04. Smart 9:16 Reframe', note: 'Tracking speaker face into vertical' },
  { key: 'captions', label: '05. Subtitle Rendering', note: 'Building kinetic animated caption timing' },
  { key: 'export', label: '06. Hardware Export', note: 'Rendering final vertical MP4 clips' },
] as const

export function JobProgress() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { job, progress } = useJobStream(jobId)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState<Error | null>(null)

  useEffect(() => {
    if (job?.status === 'done') {
      const timer = setTimeout(() => navigate(`/jobs/${job.id}/clips`), 900)
      return () => clearTimeout(timer)
    }
  }, [job?.status, job?.id, navigate])

  if (!job) {
    return (
      <div className="flex items-center gap-3 pt-24 text-base font-black text-black">
        <span className="spinner" /> Initializing Workshop Pipeline…
      </div>
    )
  }

  const activeIndex = STAGES.findIndex((s) => s.key === job.current_stage)
  const percent = Math.round((progress?.overall ?? job.progress) * 100)

  const cancel = async () => {
    setCancelling(true)
    setActionError(null)
    try {
      await api.cancelJob(job.id)
    } catch (err) {
      setActionError(err as Error)
    } finally {
      setCancelling(false)
    }
  }

  const retry = async () => {
    setActionError(null)
    try {
      await api.retryJob(job.id)
      window.location.reload()
    } catch (err) {
      setActionError(err as Error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner Card */}
      <div className="rounded-2xl border-[2.5px] border-black bg-white p-6 md:p-8 shadow-[5px_5px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <span
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000]',
                job.status === 'running'
                  ? 'bg-[#FFE600] text-black'
                  : job.status === 'done'
                    ? 'bg-[#C6F247] text-black'
                    : job.status === 'failed'
                      ? 'bg-[#FF5A36] text-white'
                      : 'bg-white text-black',
              ].join(' ')}
            >
              {job.status === 'running' && <span className="size-2 rounded-full bg-black animate-ping" />}
              {job.status}
            </span>

            <h1 className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-black truncate">
              {job.source?.title || 'Processing Source Video'}
            </h1>

            {job.source && (
              <p className="mt-1 font-mono text-xs font-bold text-[#666]">
                {formatDuration(job.source.duration_s)} • {job.source.width}×{job.source.height} • Provider: {job.provider}
              </p>
            )}
          </div>

          <div className="flex items-center gap-5">
            <div className="bg-[#C6F247] px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] text-center">
              <span className="font-black text-4xl text-black block leading-none">
                {percent}%
              </span>
              <span className="font-mono text-[10px] font-bold uppercase text-black">
                Progress
              </span>
            </div>

            <div className="flex items-center gap-2">
              {(job.status === 'running' || job.status === 'queued') && (
                <button onClick={cancel} disabled={cancelling} className="neo-btn text-xs py-2 px-3">
                  {cancelling ? 'Cancelling…' : 'Cancel'}
                </button>
              )}
              {(job.status === 'failed' || job.status === 'cancelled') && (
                <button onClick={retry} className="neo-btn neo-btn-coral text-xs py-2 px-4 uppercase">
                  Retry
                </button>
              )}
              {job.status === 'done' && (
                <button onClick={() => navigate(`/jobs/${job.id}/clips`)} className="neo-btn neo-btn-primary text-xs py-2 px-4 uppercase">
                  Review Clips →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {job.error && (
        <ErrorNote error={new Error(job.error)} />
      )}

      {actionError && (
        <ErrorNote error={actionError} onDismiss={() => setActionError(null)} />
      )}

      {/* 6-Stage Checklist */}
      <div className="rounded-2xl border-[2.5px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <div className="border-b-2 border-black pb-3">
          <span className="font-mono text-xs font-black uppercase text-black">
            Pipeline Checklist
          </span>
        </div>

        <ol className="mt-4 space-y-3">
          {STAGES.map((stage, index) => {
            const failedHere =
              (job.status === 'failed' || job.status === 'cancelled') && index === activeIndex

            const state =
              job.status === 'done' || (activeIndex >= 0 && index < activeIndex)
                ? 'done'
                : failedHere
                  ? 'stopped'
                  : index === activeIndex && job.status === 'running'
                    ? 'active'
                    : 'pending'

            const fraction =
              state === 'done' ? 1 : state === 'active' ? (progress?.stageProgress ?? 0) : 0

            return (
              <li
                key={stage.key}
                className={[
                  'rounded-xl border-2 border-black p-4 transition-all',
                  state === 'active'
                    ? 'bg-[#C6F247] shadow-[3px_3px_0px_#000]'
                    : state === 'done'
                      ? 'bg-[#FAF7F0] shadow-[2px_2px_0px_#000]'
                      : 'bg-white opacity-70',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        'grid size-7 place-items-center rounded-lg border-2 border-black font-black font-mono text-xs shadow-[1.5px_1.5px_0px_#000]',
                        state === 'done'
                          ? 'bg-black text-white'
                          : state === 'stopped'
                            ? 'bg-[#FF5A36] text-white'
                            : state === 'active'
                              ? 'bg-white text-black'
                              : 'bg-white text-[#888]',
                      ].join(' ')}
                    >
                      {state === 'done' ? '✓' : state === 'stopped' ? '✕' : state === 'active' ? <span className="spinner !size-3" /> : index + 1}
                    </span>

                    <div>
                      <h3 className="font-black text-sm text-black">
                        {stage.label}
                      </h3>
                      <p className="font-mono text-xs font-bold text-[#666]">
                        {state === 'stopped'
                          ? 'Failed at this stage'
                          : state === 'active'
                            ? (progress?.message ?? stage.note)
                            : stage.note}
                      </p>
                    </div>
                  </div>

                  {state === 'active' && (
                    <span className="font-mono font-black text-xs text-black">
                      {Math.round(fraction * 100)}%
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 w-full rounded-full border border-black bg-white overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-200"
                    style={{ width: `${fraction * 100}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
