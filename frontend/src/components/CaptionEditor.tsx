import { useEffect, useState } from 'react'

import { formatTimecode, type Word } from '../api'

/**
 * Word-level caption editing.
 *
 * The job here is fixing what Whisper misheard — names, jargon, acronyms. Only
 * the text is editable; timings stay locked to the measured audio, because a
 * hand-typed timestamp is how captions drift out of sync.
 */
export function CaptionEditor({
  words,
  onChange,
  onSave,
  saving,
  dirty,
}: {
  words: Word[]
  onChange: (words: Word[]) => void
  onSave: () => void
  saving: boolean
  dirty: boolean
}) {
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => setEditing(null), [words.length])

  const commit = (index: number) => {
    const text = draft.trim()
    if (text && text !== words[index].text) {
      const next = words.map((word, i) => (i === index ? { ...word, text } : word))
      onChange(next)
    }
    setEditing(null)
  }

  if (words.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        No transcript for this clip yet.
      </p>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <span className="font-mono text-xs font-black uppercase text-black">Interactive Transcript</span>
        <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black font-mono">
          {words.length} words
        </span>
      </div>

      <div className="mt-3 max-h-[36vh] overflow-y-auto rounded-xl border-2 border-black bg-[#FAF7F0] p-3 text-xs leading-[2.2]">
        {words.map((word, index) =>
          editing === index ? (
            <input
              key={index}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => commit(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit(index)
                if (e.key === 'Escape') setEditing(null)
                if (e.key === 'Tab') {
                  e.preventDefault()
                  commit(index)
                  const next = index + (e.shiftKey ? -1 : 1)
                  if (next >= 0 && next < words.length) {
                    setDraft(words[next].text)
                    setEditing(next)
                  }
                }
              }}
              className="mr-1.5 rounded bg-[#C6F247] px-1 py-0.5 text-xs font-black text-black border-2 border-black outline-none"
              style={{ width: `${Math.max(4, draft.length + 1)}ch` }}
            />
          ) : (
            <button
              key={index}
              onClick={() => {
                setDraft(word.text)
                setEditing(index)
              }}
              title={formatTimecode(word.start)}
              className="mr-1 rounded px-1.5 py-0.5 font-bold text-black border border-black bg-white hover:bg-[#C6F247] transition-colors"
            >
              {word.text}
            </button>
          ),
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button onClick={onSave} disabled={!dirty || saving} className="neo-btn neo-btn-primary text-xs py-1.5 px-3 uppercase">
          {saving ? 'Saving…' : 'Save Edits'}
        </button>
        <span className="font-mono text-[10px] font-bold text-[#666]">
          {dirty ? '⚠️ Unsaved edits' : 'Click word to edit'}
        </span>
      </div>
    </div>
  )
}
