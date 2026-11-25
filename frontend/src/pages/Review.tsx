import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  api,
  formatBytes,
  formatDuration,
  type CaptionStyle,
  type Clip,
  type CropPath,
  type Job,
  type Word,
} from '../api'
import { CaptionEditor } from '../components/CaptionEditor'
import { ClipPlayer } from '../components/ClipPlayer'
import { ErrorNote } from '../components/ErrorNote'
import { TrimBar } from '../components/TrimBar'

const RATIOS = ['9:16', '1:1', '16:9'] as const

export function Review() {
  const { jobId } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [clips, setClips] = useState<Clip[]>([])
  const [styles, setStyles] = useState<CaptionStyle[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [cropPath, setCropPath] = useState<CropPath | null>(null)
  const [wordsDirty, setWordsDirty] = useState(false)
  const [savingWords, setSavingWords] = useState(false)
  const [exporting, setExporting] = useState<Set<string>>(new Set())
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!jobId) return
    void Promise.all([api.getJob(jobId), api.listClips(jobId), api.captionStyles()])
      .then(([loadedJob, loadedClips, loadedStyles]) => {
        setJob(loadedJob)
        setClips(loadedClips)
        setStyles(loadedStyles)
        setSelectedId((current) => current ?? loadedClips[0]?.id ?? null)
      })
      .catch((err) => setError(err as Error))
  }, [jobId])

  const selected = useMemo(
    () => clips.find((clip) => clip.id === selectedId) ?? null,
    [clips, selectedId],
  )

  useEffect(() => {
    if (!selected) return
    setWordsDirty(false)
    api
      .getClipWords(selected.id)
      .then(setWords)
      .catch(() => setWords([]))
    api
      .getCropPath(selected.id)
      .then(setCropPath)
      .catch(() => setCropPath(null))
  }, [selected?.id])

  const patchClip = useCallback((updated: Clip) => {
    setClips((current) => current.map((clip) => (clip.id === updated.id ? updated : clip)))
  }, [])

  const setStatus = async (clip: Clip, status: Clip['status']) => {
    try {
      patchClip(await api.patchClip(clip.id, { status }))
    } catch (err) {
      setError(err as Error)
    }
  }

  const commitTrim = async (start: number, end: number) => {
    if (!selected) return
    try {
      patchClip(await api.patchClip(selected.id, { start_s: start, end_s: end }))
      setWords(await api.getClipWords(selected.id))
    } catch (err) {
      setError(err as Error)
    }
  }

  const saveWords = async () => {
    if (!selected) return
    setSavingWords(true)
    try {
      patchClip(await api.patchCaptions(selected.id, { words }))
      setWordsDirty(false)
    } catch (err) {
      setError(err as Error)
    } finally {
      setSavingWords(false)
    }
  }

  const setStyle = async (clip: Clip, styleKey: string) => {
    try {
      patchClip(await api.patchCaptions(clip.id, { caption_style: styleKey }))
    } catch (err) {
      setError(err as Error)
    }
  }

  const setRatio = async (clip: Clip, ratio: string) => {
    try {
      patchClip(await api.patchCaptions(clip.id, { ratio }))
    } catch (err) {
      setError(err as Error)
    }
  }

  const exportClip = async (clip: Clip) => {
    setExporting((current) => new Set(current).add(clip.id))
    setError(null)
    try {
      await api.exportClip(clip.id, clip.ratio, clip.caption_style)
      patchClip(await api.getClip(clip.id))
    } catch (err) {
      setError(err as Error)
    } finally {
      setExporting((current) => {
        const next = new Set(current)
        next.delete(clip.id)
        return next
      })
    }
  }

  const exportKept = async () => {
    const targets = clips.filter((clip) => clip.status === 'kept')
    for (const clip of targets) await exportClip(clip)
  }

  const keptCount = clips.filter((clip) => clip.status === 'kept').length
  const activeStyle = styles.find((style) => style.key === selected?.caption_style)

  if (error && clips.length === 0) {
    return (
      <div className="max-w-3xl pt-10">
        <ErrorNote error={error} />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex items-center gap-3 pt-24 text-base font-black text-black">
        <span className="spinner" /> Loading Studio workshop…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border-[2.5px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-mono text-xs font-black uppercase text-black hover:text-[#FF5A36] transition-colors"
            >
              ← ALL PROJECTS
            </Link>
            <h1 className="mt-1 font-black text-2xl sm:text-3xl tracking-tight text-black truncate max-w-3xl">
              {job.source?.title || 'Untitled Video'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-[#FAF7F0] px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000]">
              {clips.length} Clips Found
            </span>
            <span className="bg-[#C6F247] px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000]">
              {keptCount} Kept
            </span>
            <button
              onClick={exportKept}
              disabled={keptCount === 0}
              className="neo-btn neo-btn-coral py-2 px-4 text-xs font-black uppercase"
            >
              Export Kept ({keptCount})
            </button>
          </div>
        </div>
      </div>

      {error && (
        <ErrorNote error={error} onDismiss={() => setError(null)} />
      )}

      {clips.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[21rem_minmax(0,26rem)_minmax(0,1fr)]">
          {/* Column 1: Clip List */}
          <section className="rounded-2xl border-[2.5px] border-black bg-white p-4 shadow-[5px_5px_0px_#000] max-h-[82vh] flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 px-2">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
                Ranked Clips
              </span>
              <span className="bg-black text-white px-2 py-0.5 rounded text-[11px] font-black">
                {clips.length}
              </span>
            </div>

            <div className="mt-3 overflow-y-auto space-y-2.5 pr-1 flex-1">
              {clips.map((clip, index) => (
                <ClipRow
                  key={clip.id}
                  clip={clip}
                  index={index}
                  selected={clip.id === selectedId}
                  onSelect={() => setSelectedId(clip.id)}
                  onKeep={() =>
                    setStatus(clip, clip.status === 'kept' ? 'candidate' : 'kept')
                  }
                  onDiscard={() =>
                    setStatus(clip, clip.status === 'discarded' ? 'candidate' : 'discarded')
                  }
                />
              ))}
            </div>
          </section>

          {/* Column 2: Player & Trim */}
          <section className="rounded-2xl border-[2.5px] border-black bg-white p-5 shadow-[5px_5px_0px_#000] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
                Clip Preview Monitor
              </span>
              <span className="bg-[#C6F247] px-2 py-0.5 rounded border border-black text-[10px] font-black uppercase">
                {selected?.ratio || '9:16'}
              </span>
            </div>

            {selected && jobId && (
              <>
                <div className="rounded-xl overflow-hidden border-2 border-black bg-black shadow-[4px_4px_0px_#000]">
                  <ClipPlayer
                    src={api.mediaUrl(jobId)}
                    startS={selected.start_s}
                    endS={selected.end_s}
                    words={words}
                    style={activeStyle}
                    ratio={selected.ratio}
                    cropPath={cropPath}
                  />
                </div>

                <div className="rounded-xl border-2 border-black bg-[#FAF7F0] p-3.5 shadow-[3px_3px_0px_#000]">
                  <TrimBar
                    words={words}
                    startS={selected.start_s}
                    endS={selected.end_s}
                    originalStart={selected.start_s}
                    originalEnd={selected.end_s}
                    onCommit={commitTrim}
                  />
                </div>
              </>
            )}
          </section>

          {/* Column 3: Intelligence & Controls */}
          <section className="space-y-5 max-h-[82vh] overflow-y-auto pr-1">
            {selected && (
              <>
                {/* Why This Clip Card */}
                <div className="rounded-2xl border-[2.5px] border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <span className="font-mono text-xs font-black uppercase text-black">
                      AI Hook Rationale
                    </span>
                    <span className="bg-[#C6F247] px-2 py-0.5 rounded border-2 border-black text-xs font-black shadow-[1.5px_1.5px_0px_#000]">
                      ⚡ {selected.score} SCORE
                    </span>
                  </div>

                  {selected.hook && (
                    <div className="mt-3 rounded-xl border-2 border-black bg-[#FF5A36] p-3 text-white shadow-[3px_3px_0px_#000]">
                      <p className="font-mono text-[10px] font-black uppercase tracking-wider text-black">
                        Opening Hook
                      </p>
                      <p className="mt-1 font-black text-sm italic">
                        &ldquo;{selected.hook}&rdquo;
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-xs font-bold leading-relaxed text-[#444]">
                    {selected.reason || 'No rationale returned for this clip.'}
                  </p>
                </div>

                {/* Subtitle Caption Editor Card */}
                <div className="rounded-2xl border-[2.5px] border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
                  <CaptionEditor
                    words={words}
                    onChange={(next) => {
                      setWords(next)
                      setWordsDirty(true)
                    }}
                    onSave={saveWords}
                    saving={savingWords}
                    dirty={wordsDirty}
                  />
                </div>

                {/* Caption Styles & Ratio Card */}
                <div className="rounded-2xl border-[2.5px] border-black bg-white p-5 shadow-[5px_5px_0px_#000] space-y-4">
                  <div>
                    <span className="font-mono text-xs font-black uppercase text-black block mb-2">
                      Caption Style
                    </span>
                    <div className="space-y-1.5">
                      {styles.map((style) => (
                        <button
                          key={style.key}
                          onClick={() => setStyle(selected, style.key)}
                          className={[
                            'w-full text-left p-2.5 rounded-xl border-2 border-black font-extrabold text-xs transition-all',
                            style.key === selected.caption_style
                              ? 'bg-[#C6F247] shadow-[2px_2px_0px_#000]'
                              : 'bg-white hover:bg-[#FAF7F0]',
                          ].join(' ')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-black font-black">{style.label}</span>
                            {style.key === selected.caption_style && <span>✓</span>}
                          </div>
                          <span className="text-[10px] font-bold text-[#666] block mt-0.5">
                            {style.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 border-black pt-3">
                    <span className="font-mono text-xs font-black uppercase text-black block mb-2">
                      Crop Frame Ratio
                    </span>
                    <div className="flex gap-2">
                      {RATIOS.map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setRatio(selected, ratio)}
                          className={[
                            'neo-btn flex-1 text-xs py-2',
                            ratio === selected.ratio ? 'neo-btn-primary' : 'bg-white',
                          ].join(' ')}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Export Action Card */}
                <div className="rounded-2xl border-[2.5px] border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
                  <button
                    onClick={() => exportClip(selected)}
                    disabled={exporting.has(selected.id)}
                    className="neo-btn neo-btn-coral w-full py-3 text-sm font-black uppercase tracking-wider"
                  >
                    {exporting.has(selected.id) ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner" /> Rendering Clip…
                      </span>
                    ) : (
                      'Export This Clip →'
                    )}
                  </button>

                  {selected.exports.length > 0 && (
                    <div className="mt-4 border-t-2 border-black pt-3">
                      <span className="font-mono text-[11px] font-black uppercase text-black block mb-2">
                        Download Exported Files:
                      </span>
                      <ul className="space-y-1.5">
                        {selected.exports.map((record) => (
                          <li
                            key={record.id}
                            className="flex items-center justify-between rounded-lg border-2 border-black bg-[#FAF7F0] p-2 text-xs font-black shadow-[2px_2px_0px_#000]"
                          >
                            <a
                              href={record.download_url}
                              download
                              className="text-black hover:text-[#FF5A36] underline"
                            >
                              {record.ratio} • {record.style}
                            </a>
                            <span className="font-mono text-[11px] text-[#666]">
                              {formatBytes(record.size_bytes)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function ClipRow({
  clip,
  index,
  selected,
  onSelect,
  onKeep,
  onDiscard,
}: {
  clip: Clip
  index: number
  selected: boolean
  onSelect: () => void
  onKeep: () => void
  onDiscard: () => void
}) {
  return (
    <div
      className={[
        'group cursor-pointer rounded-xl border-2 border-black p-3 transition-all',
        selected
          ? 'bg-[#C6F247] shadow-[4px_4px_0px_#000] translate-x-1'
          : 'bg-[#FAF7F0] hover:bg-white shadow-[2px_2px_0px_#000]',
        clip.status === 'discarded' ? 'opacity-40 grayscale' : '',
      ].join(' ')}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect()
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="bg-black text-white px-2 py-0.5 rounded border border-black font-black text-xs font-mono">
          ⚡ {clip.score}
        </span>
        <span className="font-mono text-xs font-bold text-black">
          {formatDuration(clip.duration_s)}
        </span>
      </div>

      <p className="mt-2 text-xs font-black text-black line-clamp-2 leading-snug">
        {clip.title || `Clip #${index + 1}`}
      </p>

      <div className="mt-2.5 flex items-center justify-between border-t border-black/40 pt-2 text-[11px]">
        <span className="font-mono text-[#555] font-bold">
          {clip.exports.length > 0 ? '✓ Exported' : `#${index + 1}`}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onKeep()
            }}
            className={[
              'px-2 py-0.5 rounded border border-black font-black uppercase text-[10px] transition-colors',
              clip.status === 'kept'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white',
            ].join(' ')}
          >
            {clip.status === 'kept' ? '✓ Kept' : '+ Keep'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDiscard()
            }}
            className="px-2 py-0.5 rounded border border-black bg-white text-black font-black uppercase text-[10px] hover:bg-[#FF5A36] hover:text-white transition-colors"
          >
            {clip.status === 'discarded' ? 'Undo' : 'Drop'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-[2.5px] border-black bg-white p-8 max-w-xl shadow-[5px_5px_0px_#000]">
      <h2 className="font-black text-2xl uppercase text-black">No clips returned.</h2>
      <p className="mt-3 text-sm font-bold text-[#666] leading-relaxed">
        The model didn&apos;t detect segments strong enough to isolate. Try adjusting the duration range or using a larger provider model in Settings.
      </p>
    </div>
  )
}
