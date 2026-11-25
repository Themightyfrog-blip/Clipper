import { useEffect, useRef, useState } from 'react'

interface Preset {
  id: string
  title: string
  category: string
  score: number
  speaker: string
  hook: string
  duration: number
  words: { text: string; start: number; end: number; highlight?: boolean }[]
}

const PRESETS: Preset[] = [
  {
    id: 'ai-future',
    title: 'The Real Secret to AGI',
    category: 'Tech Podcast',
    score: 98,
    speaker: 'Alex Rivera',
    hook: '“Most people think AI will replace developers, but here is what actually happens…”',
    duration: 18,
    words: [
      { text: 'Most', start: 0.5, end: 0.9 },
      { text: 'people', start: 0.9, end: 1.3 },
      { text: 'think', start: 1.3, end: 1.7 },
      { text: 'AI', start: 1.7, end: 2.2, highlight: true },
      { text: 'will', start: 2.2, end: 2.5 },
      { text: 'replace', start: 2.5, end: 3.1, highlight: true },
      { text: 'developers.', start: 3.1, end: 3.8 },
      { text: 'Here', start: 4.2, end: 4.6 },
      { text: 'is', start: 4.6, end: 4.9 },
      { text: 'the', start: 4.9, end: 5.2 },
      { text: 'TRUTH', start: 5.2, end: 5.9, highlight: true },
      { text: 'nobody', start: 6.0, end: 6.5 },
      { text: 'talks', start: 6.5, end: 7.0 },
      { text: 'about.', start: 7.0, end: 7.6 },
      { text: 'The', start: 8.0, end: 8.3 },
      { text: '10x', start: 8.3, end: 8.8, highlight: true },
      { text: 'engineer', start: 8.8, end: 9.4 },
      { text: 'is', start: 9.4, end: 9.7 },
      { text: 'now', start: 9.7, end: 10.1 },
      { text: 'a', start: 10.1, end: 10.3 },
      { text: '100x', start: 10.3, end: 11.0, highlight: true },
      { text: 'orchestrator.', start: 11.0, end: 12.2, highlight: true },
    ],
  },
  {
    id: 'growth-hack',
    title: 'How We Scaled to $10M ARR',
    category: 'Founder Story',
    score: 96,
    speaker: 'Elena Vance',
    hook: '“We stopped running paid ads completely, and our revenue tripled in 90 days.”',
    duration: 16,
    words: [
      { text: 'We', start: 0.4, end: 0.7 },
      { text: 'stopped', start: 0.7, end: 1.2, highlight: true },
      { text: 'running', start: 1.2, end: 1.6 },
      { text: 'PAID', start: 1.6, end: 2.1, highlight: true },
      { text: 'ADS', start: 2.1, end: 2.6, highlight: true },
      { text: 'completely.', start: 2.6, end: 3.3 },
      { text: 'And', start: 3.8, end: 4.1 },
      { text: 'our', start: 4.1, end: 4.4 },
      { text: 'revenue', start: 4.4, end: 5.0 },
      { text: 'TRIPLED', start: 5.0, end: 5.8, highlight: true },
      { text: 'in', start: 5.8, end: 6.1 },
      { text: '90', start: 6.1, end: 6.6, highlight: true },
      { text: 'days.', start: 6.6, end: 7.2 },
      { text: 'Organic', start: 7.6, end: 8.2, highlight: true },
      { text: 'short-form', start: 8.2, end: 9.0, highlight: true },
      { text: 'video', start: 9.0, end: 9.5 },
      { text: 'is', start: 9.5, end: 9.8 },
      { text: 'the', start: 9.8, end: 10.0 },
      { text: 'NEW', start: 10.0, end: 10.5, highlight: true },
      { text: 'search', start: 10.5, end: 11.0 },
      { text: 'engine.', start: 11.0, end: 11.8 },
    ],
  },
  {
    id: 'deep-work',
    title: 'The 4-Hour Focus Formula',
    category: 'Productivity',
    score: 94,
    speaker: 'Marcus Drake',
    hook: '“If you work 8 hours a day, you are wasting at least half of your brain energy.”',
    duration: 15,
    words: [
      { text: 'If', start: 0.5, end: 0.8 },
      { text: 'you', start: 0.8, end: 1.0 },
      { text: 'work', start: 1.0, end: 1.4 },
      { text: '8', start: 1.4, end: 1.8, highlight: true },
      { text: 'hours', start: 1.8, end: 2.2 },
      { text: 'a', start: 2.2, end: 2.4 },
      { text: 'day,', start: 2.4, end: 2.9 },
      { text: 'you', start: 3.3, end: 3.6 },
      { text: 'are', start: 3.6, end: 3.8 },
      { text: 'wasting', start: 3.8, end: 4.4, highlight: true },
      { text: 'HALF', start: 4.4, end: 5.1, highlight: true },
      { text: 'your', start: 5.1, end: 5.4 },
      { text: 'brain', start: 5.4, end: 5.9, highlight: true },
      { text: 'power.', start: 5.9, end: 6.5 },
      { text: 'Deep', start: 7.0, end: 7.5, highlight: true },
      { text: 'blocks', start: 7.5, end: 8.0, highlight: true },
      { text: 'beat', start: 8.0, end: 8.4 },
      { text: 'long', start: 8.4, end: 8.8 },
      { text: 'hours', start: 8.8, end: 9.3 },
      { text: 'every', start: 9.3, end: 9.7 },
      { text: 'single', start: 9.7, end: 10.1 },
      { text: 'time.', start: 10.1, end: 10.8, highlight: true },
    ],
  },
]

export function InteractiveVideoShowcase() {
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0])
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [aspect, setAspect] = useState<'9:16' | '1:1'>('9:16')
  const [showFaceBox, setShowFaceBox] = useState(true)
  const [showWaveform, setShowWaveform] = useState(true)

  const reqRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(performance.now())

  useEffect(() => {
    lastTimeRef.current = performance.now()
    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt
          if (next >= selectedPreset.duration) {
            return 0
          }
          return next
        })
      }
      reqRef.current = requestAnimationFrame(loop)
    }

    reqRef.current = requestAnimationFrame(loop)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [isPlaying, selectedPreset.duration])

  const togglePlay = () => setIsPlaying((p) => !p)

  const activeWord = selectedPreset.words.find(
    (w) => currentTime >= w.start && currentTime <= w.end,
  )
  const currentChunk = selectedPreset.words.filter(
    (w) => currentTime >= w.start - 0.4 && currentTime <= w.end + 0.8,
  )

  return (
    <div className="rounded-2xl border-[2.5px] border-black bg-white p-6 md:p-8 shadow-[5px_5px_0px_#000]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#C6F247] px-2 py-0.5 rounded border border-black text-[11px] font-black uppercase">
              Interactive
            </span>
            <span className="font-mono text-xs font-bold uppercase text-[#555]">
              Real-Time Simulator
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-black">
            Test The AI Clipping Engine
          </h2>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset)
                setCurrentTime(0)
              }}
              className={[
                'neo-btn text-xs py-1.5 px-3',
                selectedPreset.id === preset.id ? 'neo-btn-primary' : 'bg-white',
              ].join(' ')}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* Phone Mockup in Neo-Brutalist Frame */}
        <div className="flex justify-center">
          <div
            className={[
              'relative overflow-hidden rounded-2xl border-[3px] border-black bg-[#121212] shadow-[6px_6px_0px_#000] transition-all duration-300',
              aspect === '9:16' ? 'w-[300px] h-[520px]' : 'w-[360px] h-[360px]',
            ].join(' ')}
          >
            {/* Notch */}
            <div className="absolute top-2.5 left-1/2 z-30 h-3.5 w-20 -translate-x-1/2 rounded-full bg-black border border-[#333]" />

            {/* Badges on video */}
            <div className="absolute top-8 left-3 z-20">
              <span className="bg-[#C6F247] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000]">
                ⚡ {selectedPreset.score} VIRAL SCORE
              </span>
            </div>

            <div className="absolute top-8 right-3 z-20">
              <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000]">
                9:16 VERTICAL
              </span>
            </div>

            {/* Stage */}
            <div className="relative size-full flex flex-col items-center justify-center p-4 select-none">
              {/* Speaker card */}
              <div
                className="relative transition-transform duration-300"
                style={{
                  transform: isPlaying
                    ? `scale(${1 + Math.sin(currentTime * 3) * 0.02})`
                    : 'scale(1)',
                }}
              >
                {/* Face Box */}
                {showFaceBox && (
                  <div
                    className="absolute -inset-3 rounded-xl border-2 border-[#C6F247] transition-all duration-200"
                    style={{
                      transform: `translate(${Math.sin(currentTime * 1.5) * 5}px, ${Math.cos(currentTime * 2) * 3}px)`,
                    }}
                  >
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C6F247] text-black text-[8px] font-black px-1.5 py-0.2 rounded border border-black uppercase whitespace-nowrap">
                      Face Track 99%
                    </span>
                  </div>
                )}

                <div className="size-24 rounded-2xl border-2 border-black bg-[#222] p-1 shadow-[3px_3px_0px_#000]">
                  <div className="flex size-full items-center justify-center rounded-xl bg-[#333] text-4xl">
                    {selectedPreset.id === 'ai-future' ? '👨‍💻' : selectedPreset.id === 'growth-hack' ? '👩‍💼' : '🧑‍🏫'}
                  </div>
                </div>
                <p className="mt-2 text-center text-xs font-black text-white">
                  {selectedPreset.speaker}
                </p>
                <p className="text-center text-[10px] font-bold text-[#888]">
                  {selectedPreset.category}
                </p>
              </div>

              {/* Kinetic Captions */}
              <div className="absolute inset-x-3 bottom-16 z-20 text-center">
                <div className="bg-black/90 p-2.5 rounded-xl border-2 border-white shadow-[2px_2px_0px_#000] inline-block max-w-[95%]">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {currentChunk.map((w, idx) => {
                      const isCurrent = activeWord?.text === w.text
                      return (
                        <span
                          key={idx}
                          className={[
                            'font-black uppercase tracking-tight text-sm transition-all',
                            isCurrent
                              ? 'bg-[#C6F247] text-black px-1 rounded scale-105'
                              : w.highlight
                                ? 'text-[#FF5A36]'
                                : 'text-white',
                          ].join(' ')}
                        >
                          {w.text}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Waveform */}
              {showWaveform && isPlaying && (
                <div className="absolute inset-x-6 bottom-9 z-10 flex h-4 items-end justify-center gap-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-sm bg-[#C6F247]"
                      style={{
                        height: `${Math.max(20, (Math.sin(currentTime * 8 + i * 0.6) * 0.5 + 0.5) * 100)}%`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Scrub line */}
              <div className="absolute inset-x-3 bottom-3 z-30">
                <div className="h-1.5 w-full bg-[#333] rounded-full overflow-hidden border border-black">
                  <div
                    className="h-full bg-[#C6F247]"
                    style={{ width: `${(currentTime / selectedPreset.duration) * 100}%` }}
                  />
                </div>
              </div>

              {/* Play/Pause Click Overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
              >
                <span className="neo-btn neo-btn-primary size-12 !p-0 rounded-full text-lg">
                  {isPlaying ? '⏸' : '▶'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Neo-Brutalist Controls Column */}
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-black bg-[#FAF7F0] p-5 shadow-[3px_3px_0px_#000]">
            <h3 className="font-mono text-xs font-black uppercase text-black">
              Output Aspect Ratio
            </h3>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setAspect('9:16')}
                className={[
                  'neo-btn text-xs py-2 flex-1',
                  aspect === '9:16' ? 'neo-btn-primary' : 'bg-white',
                ].join(' ')}
              >
                9:16 Vertical
              </button>
              <button
                onClick={() => setAspect('1:1')}
                className={[
                  'neo-btn text-xs py-2 flex-1',
                  aspect === '1:1' ? 'neo-btn-primary' : 'bg-white',
                ].join(' ')}
              >
                1:1 Square
              </button>
            </div>

            <h3 className="font-mono text-xs font-black uppercase text-black mt-4">
              Real-Time Feature Toggles
            </h3>
            <div className="mt-2 space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg border-2 border-black bg-white cursor-pointer font-bold text-xs text-black shadow-[2px_2px_0px_#000]">
                <span>Face Lock & Auto-Center</span>
                <input
                  type="checkbox"
                  checked={showFaceBox}
                  onChange={(e) => setShowFaceBox(e.target.checked)}
                  className="size-4 accent-black"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border-2 border-black bg-white cursor-pointer font-bold text-xs text-black shadow-[2px_2px_0px_#000]">
                <span>Voice Audio Waveform</span>
                <input
                  type="checkbox"
                  checked={showWaveform}
                  onChange={(e) => setShowWaveform(e.target.checked)}
                  className="size-4 accent-black"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={togglePlay}
                className="neo-btn neo-btn-coral flex-1 py-2.5 text-xs font-black uppercase"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play Simulation'}
              </button>
              <button
                onClick={() => setCurrentTime(0)}
                className="neo-btn bg-white py-2.5 text-xs font-black"
              >
                Restart
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border-2 border-black bg-white p-3 text-center shadow-[3px_3px_0px_#000]">
              <p className="font-black text-2xl text-black">100%</p>
              <p className="font-mono text-[10px] font-bold uppercase text-[#666]">Local</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#C6F247] p-3 text-center shadow-[3px_3px_0px_#000]">
              <p className="font-black text-2xl text-black">0s</p>
              <p className="font-mono text-[10px] font-bold uppercase text-black">Cloud Wait</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-white p-3 text-center shadow-[3px_3px_0px_#000]">
              <p className="font-black text-2xl text-black">4K</p>
              <p className="font-mono text-[10px] font-bold uppercase text-[#666]">NVENC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
