import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  ApiError,
  api,
  formatDuration,
  type Job,
  type JobSettingsOverrides,
  type ProviderStatus,
} from '../api'
import { ErrorNote } from '../components/ErrorNote'
import { InteractiveVideoShowcase } from '../components/InteractiveVideoShowcase'

export function Ingest() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState<'url' | 'file' | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [overrides, setOverrides] = useState<JobSettingsOverrides>({})
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.listJobs(8).then(setJobs).catch(() => undefined)
    api.providerStatus().then(setProviders).catch(() => undefined)
  }, [])

  const start = useCallback(
    async (kind: 'url' | 'file', run: () => Promise<{ id: string }>) => {
      setBusy(kind)
      setError(null)
      try {
        const source = await run()
        const job = await api.createJob(source.id, overrides)
        navigate(`/jobs/${job.id}`)
      } catch (err) {
        setError(err as Error)
      } finally {
        setBusy(null)
      }
    },
    [navigate, overrides],
  )

  const submitUrl = (event: React.FormEvent) => {
    event.preventDefault()
    if (!url.trim()) return
    void start('url', () => api.ingestYouTube(url.trim()))
  }

  const submitFile = (file: File) => void start('file', () => api.uploadSource(file))

  const usableProvider = providers.find((p) => p.available)

  return (
    <div className="space-y-8">
      {/* 1. Hero Card — Exact Neo-Brutalist Layout from Reference Image */}
      <section className="relative overflow-hidden rounded-2xl border-[2.5px] border-black bg-[#C6F247] p-8 md:p-12 shadow-[6px_6px_0px_#000]">
        {/* Top Eyebrow & Star Icon */}
        <div className="flex items-start justify-between">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/80">
            YOUR LITTLE CLIP WORKSHOP &nbsp; / &nbsp; HEY THERE
          </p>
          {/* Neo-brutalist 8-point Asterisk / Star */}
          <div className="text-black select-none leading-none -mt-2 -mr-2">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            </svg>
          </div>
        </div>

        {/* Big Bold Headline */}
        <div className="mt-4">
          <h1 className="font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05] text-black">
            GOT A LONG VIDEO?
            <br />
            <span className="text-[#FF5A36] drop-shadow-[2.5px_2.5px_0px_#000]">
              LET&apos;S FIND THE GOOD BITS.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl font-bold text-black/85 text-base md:text-lg leading-relaxed">
            Drop in that 40-minute video. We&apos;ll help you fish out the funny, chaotic, useful, wait-WHAT moments. Less scrubbing. More posting.
          </p>
        </div>
      </section>

      {/* 2. The Recipe Card — Exact Second Card from Reference Image */}
      <section className="rounded-2xl border-[2.5px] border-black bg-[#FF5A36] p-6 md:p-8 text-black shadow-[6px_6px_0px_#000]">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/80 mb-4">
          THE RECIPE
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col">
            <span className="font-black text-5xl md:text-6xl text-white drop-shadow-[3px_3px_0px_#000] leading-none">
              01
            </span>
            <span className="mt-2 text-xs md:text-sm font-black uppercase tracking-wider text-black">
              DROP YOUR SOURCE
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-black text-5xl md:text-6xl text-white drop-shadow-[3px_3px_0px_#000] leading-none">
              02
            </span>
            <span className="mt-2 text-xs md:text-sm font-black uppercase tracking-wider text-black">
              FIND THE MOMENTS
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-black text-5xl md:text-6xl text-white drop-shadow-[3px_3px_0px_#000] leading-none">
              03
            </span>
            <span className="mt-2 text-xs md:text-sm font-black uppercase tracking-wider text-black">
              MAKE IT YOURS
            </span>
          </div>
        </div>
      </section>

      {/* 3. Neo-Brutalist Source Inputs (URL & Upload) */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* URL Card */}
        <div className="rounded-2xl border-[2.5px] border-black bg-white p-6 md:p-8 shadow-[5px_5px_0px_#000]">
          <div className="flex items-center gap-2">
            <span className="bg-[#C6F247] px-2 py-0.5 rounded border-2 border-black text-xs font-black uppercase">
              URL
            </span>
            <h2 className="text-base font-black uppercase tracking-wider text-black">
              Paste Video or Podcast Link
            </h2>
          </div>
          <p className="mt-2 text-xs font-bold text-[#666]">
            Supports YouTube, podcasts, and online media links.
          </p>

          <form onSubmit={submitUrl} className="mt-5 space-y-3">
            <input
              id="url"
              className="neo-input font-bold text-sm"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={busy !== null}
            />
            <button
              type="submit"
              className="neo-btn neo-btn-primary w-full py-3 text-sm font-black uppercase tracking-wider"
              disabled={busy !== null || !url.trim()}
            >
              {busy === 'url' ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" /> Analyzing Video…
                </span>
              ) : (
                'Find Clips Now →'
              )}
            </button>
          </form>

          <AdvancedOptions
            open={advancedOpen}
            onToggle={() => setAdvancedOpen((v) => !v)}
            overrides={overrides}
            onChange={setOverrides}
            providers={providers}
          />
        </div>

        {/* Upload Card */}
        <div className="rounded-2xl border-[2.5px] border-black bg-white p-6 md:p-8 shadow-[5px_5px_0px_#000]">
          <div className="flex items-center gap-2">
            <span className="bg-[#FF5A36] text-white px-2 py-0.5 rounded border-2 border-black text-xs font-black uppercase">
              FILE
            </span>
            <h2 className="text-base font-black uppercase tracking-wider text-black">
              Upload Video or Audio
            </h2>
          </div>
          <p className="mt-2 text-xs font-bold text-[#666]">
            Direct local processing without uploading to third-party clouds.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) submitFile(file)
            }}
            className={[
              'mt-5 flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[2.5px] border-dashed border-black p-6 text-center transition-all duration-150',
              dragging
                ? 'bg-[#C6F247] shadow-[4px_4px_0px_#000]'
                : 'bg-[#FAF7F0] hover:bg-[#F2EFE7] hover:shadow-[3px_3px_0px_#000]',
            ].join(' ')}
            onClick={() => fileInput.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInput.current?.click()
            }}
          >
            <span className="text-3xl">📦</span>
            <span className="font-black text-base text-black">
              {busy === 'file' ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" /> Uploading source…
                </span>
              ) : (
                'Click or drag video file here'
              )}
            </span>
            <span className="font-mono text-xs font-bold text-[#666]">
              MP4, MOV, MKV, WEBM, WAV, MP3
            </span>
          </div>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            accept="video/*,audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) submitFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorNote error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {providers.length > 0 && !usableProvider && (
        <div className="rounded-xl border-[2.5px] border-black bg-[#FFE600] p-4 text-xs font-black shadow-[4px_4px_0px_#000]">
          ⚠️ No AI model provider is reachable right now. Set up an API key or start local Ollama in{' '}
          <a href="/settings" className="underline font-black text-black">
            Settings
          </a>
          .
        </div>
      )}

      {/* 4. Neo-Brutalist Interactive Video Showcase */}
      <InteractiveVideoShowcase />

      {/* 5. Recent Projects Section */}
      <RecentJobs jobs={jobs} />
    </div>
  )
}

function AdvancedOptions({
  open,
  onToggle,
  overrides,
  onChange,
  providers,
}: {
  open: boolean
  onToggle: () => void
  overrides: JobSettingsOverrides
  onChange: (next: JobSettingsOverrides) => void
  providers: ProviderStatus[]
}) {
  const set = <K extends keyof JobSettingsOverrides>(key: K, value: JobSettingsOverrides[K]) =>
    onChange({ ...overrides, [key]: value })

  return (
    <div className="mt-4 border-t-2 border-black pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 font-mono text-xs font-black uppercase text-black hover:text-[#FF5A36] transition-colors"
      >
        <span
          className="inline-block transition-transform duration-150 font-bold"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
        >
          ▶
        </span>
        {open ? 'Hide Options' : 'Tune Pipeline Options'}
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-xl border-2 border-black bg-[#FAF7F0] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[11px] font-black uppercase text-black">
                AI Provider
              </span>
              <select
                value={overrides.provider ?? ''}
                onChange={(e) => set('provider', e.target.value || undefined)}
                className="neo-input mt-1 text-xs"
              >
                <option value="">Auto (Default)</option>
                {providers.map((p) => (
                  <option key={p.name} value={p.name} disabled={!p.available}>
                    {p.name} {!p.available ? '(unavailable)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] font-black uppercase text-black">
                Whisper Model
              </span>
              <select
                value={overrides.whisper_model ?? ''}
                onChange={(e) => set('whisper_model', e.target.value || undefined)}
                className="neo-input mt-1 text-xs"
              >
                <option value="">Auto (Default)</option>
                <option value="tiny">Tiny (Fastest)</option>
                <option value="base">Base</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large-v3">Large-v3 (Accurate)</option>
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] font-black uppercase text-black">
                Max Clips
              </span>
              <input
                type="number"
                className="neo-input mt-1 text-xs font-mono"
                placeholder="10"
                min={1}
                max={50}
                value={overrides.max_clips ?? ''}
                onChange={(e) => set('max_clips', e.target.value ? Number(e.target.value) : undefined)}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase text-black">
                  Min Sec
                </span>
                <input
                  type="number"
                  className="neo-input mt-1 text-xs font-mono"
                  placeholder="20"
                  value={overrides.min_duration_s ?? ''}
                  onChange={(e) => set('min_duration_s', e.target.value ? Number(e.target.value) : undefined)}
                />
              </label>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase text-black">
                  Max Sec
                </span>
                <input
                  type="number"
                  className="neo-input mt-1 text-xs font-mono"
                  placeholder="90"
                  value={overrides.max_duration_s ?? ''}
                  onChange={(e) => set('max_duration_s', e.target.value ? Number(e.target.value) : undefined)}
                />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 font-mono text-xs font-bold text-black cursor-pointer">
            <input
              type="checkbox"
              checked={overrides.diarization ?? false}
              onChange={(e) => set('diarization', e.target.checked || undefined)}
              className="size-4 accent-black border-2 border-black"
            />
            Speaker Diarization — Identify voices and cut to speaker
          </label>
        </div>
      )}
    </div>
  )
}

function RecentJobs({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) return null

  return (
    <section className="mt-12 rounded-2xl border-[2.5px] border-black bg-white p-6 md:p-8 shadow-[5px_5px_0px_#000]">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-black">
            Recent Projects
          </h2>
          <p className="text-xs font-bold text-[#666]">
            Past clipping jobs saved on this machine
          </p>
        </div>
        <span className="bg-[#C6F247] px-3 py-1 rounded-lg border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000]">
          {jobs.length} total
        </span>
      </div>

      <div className="mt-4 divide-y-2 divide-black">
        {jobs.map((job) => (
          <a
            key={job.id}
            href={job.status === 'done' ? `/jobs/${job.id}/clips` : `/jobs/${job.id}`}
            className="group flex flex-wrap items-center justify-between gap-4 py-4 px-2 hover:bg-[#FAF7F0] rounded-lg transition-colors"
          >
            <div className="min-w-0 max-w-xl">
              <span className="text-sm font-black text-black group-hover:text-[#FF5A36] transition-colors truncate block">
                {job.source?.title || 'Untitled Video Source'}
              </span>
              <span className="font-mono text-xs font-bold text-[#666]">
                {job.source ? formatDuration(job.source.duration_s) : '—'} • Provider: {job.provider}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={[
                  'px-3 py-1 rounded-lg border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000]',
                  job.status === 'done'
                    ? 'bg-[#C6F247] text-black'
                    : job.status === 'running'
                      ? 'bg-[#FFE600] text-black'
                      : job.status === 'failed'
                        ? 'bg-[#FF5A36] text-white'
                        : 'bg-white text-black',
                ].join(' ')}
              >
                {job.status === 'running' ? `${Math.round(job.progress * 100)}%` : job.status.toUpperCase()}
              </span>
              <span className="font-black text-black text-sm">→</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
