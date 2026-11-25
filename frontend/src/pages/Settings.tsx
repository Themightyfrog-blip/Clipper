import { useEffect, useState } from 'react'

import { api, type ProviderStatus, type Settings as SettingsData, type SystemStatus } from '../api'
import { ErrorNote } from '../components/ErrorNote'

const SECRET_LABELS: Record<string, string> = {
  anthropic: 'Anthropic Claude API Key',
  openai: 'OpenAI-Compatible API Key',
  gemini: 'Google Gemini API Key',
  huggingface_token: 'HuggingFace Token',
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [system, setSystem] = useState<SystemStatus | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [saved, setSaved] = useState(false)

  const reload = () => {
    void api.getSettings().then(setSettings).catch((e) => setError(e as Error))
    void api.providerStatus().then(setProviders).catch(() => undefined)
    void api.system().then(setSystem).catch(() => undefined)
  }

  useEffect(reload, [])

  const patch = async (update: Partial<SettingsData>) => {
    setError(null)
    try {
      setSettings(await api.putSettings(update))
      setSaved(true)
      setTimeout(() => setSaved(false), 1600)
    } catch (err) {
      setError(err as Error)
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center gap-3 pt-24 text-base font-black text-black">
        <span className="spinner" /> Loading Workshop Settings…
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border-[2.5px] border-black bg-white p-6 md:p-8 shadow-[5px_5px_0px_#000] flex items-center justify-between">
        <div>
          <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black">
            Workshop Settings
          </h1>
          <p className="mt-1 text-xs font-bold text-[#666]">
            Configure your AI provider models, API keys, and hardware drivers
          </p>
        </div>

        <span
          className="bg-[#C6F247] px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] transition-opacity duration-200"
          style={{ opacity: saved ? 1 : 0 }}
        >
          ✓ Saved!
        </span>
      </div>

      {error && (
        <ErrorNote error={error} onDismiss={() => setError(null)} />
      )}

      {settings.insecure_secret_storage && (
        <div className="rounded-xl border-[2.5px] border-black bg-[#FFE600] p-4 text-xs font-black shadow-[4px_4px_0px_#000]">
          Notice: No system keyring detected. API keys are currently stored in plain text in config.json.
        </div>
      )}

      {/* Section 1: AI Provider */}
      <section className="rounded-2xl border-[2.5px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-2">
          1. AI Model Provider
        </h2>
        <p className="mt-2 text-xs font-bold text-[#666]">
          Which intelligence model identifies virality hooks and ranks clips.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {providers.map((provider) => (
            <button
              key={provider.name}
              onClick={() => patch({ active_provider: provider.name })}
              className={[
                'rounded-xl border-2 border-black p-3.5 text-left font-black transition-all',
                provider.name === settings.active_provider
                  ? 'bg-[#C6F247] shadow-[3px_3px_0px_#000]'
                  : 'bg-[#FAF7F0] hover:bg-white shadow-[2px_2px_0px_#000]',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-black">{provider.name}</span>
                <span
                  className={[
                    'text-[10px] font-mono px-2 py-0.5 rounded border border-black',
                    provider.available ? 'bg-black text-white' : 'bg-[#FF5A36] text-white',
                  ].join(' ')}
                >
                  {provider.available ? 'Ready' : 'Offline'}
                </span>
              </div>
              {provider.models.length > 0 && (
                <span className="mt-2 block font-mono text-[10px] text-[#555] truncate">
                  {provider.models.slice(0, 4).join(' • ')}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 border-t-2 border-black pt-4">
          <label className="block">
            <span className="font-mono text-xs font-black uppercase text-black">
              Model Identifier
            </span>
            <input
              className="neo-input mt-1 text-xs font-mono"
              placeholder="e.g. gemini-2.0-flash, gpt-4o"
              defaultValue={settings.providers[settings.active_provider]?.model ?? ''}
              onBlur={(e) =>
                patch({
                  providers: {
                    [settings.active_provider]: {
                      ...settings.providers[settings.active_provider],
                      model: e.target.value,
                    },
                  },
                })
              }
            />
          </label>

          <label className="block">
            <span className="font-mono text-xs font-black uppercase text-black">
              Custom API Base URL
            </span>
            <input
              className="neo-input mt-1 text-xs font-mono"
              placeholder="https://..."
              defaultValue={settings.providers[settings.active_provider]?.base_url ?? ''}
              onBlur={(e) =>
                patch({
                  providers: {
                    [settings.active_provider]: {
                      ...settings.providers[settings.active_provider],
                      base_url: e.target.value || null,
                    },
                  },
                })
              }
            />
          </label>
        </div>
      </section>

      {/* Section 2: Keys */}
      <section className="rounded-2xl border-[2.5px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-2">
          2. API Credentials
        </h2>
        <div className="mt-4 space-y-3">
          {Object.entries(SECRET_LABELS).map(([key, label]) => (
            <SecretRow
              key={key}
              secretKey={key}
              label={label}
              present={settings.keys_present[key] ?? false}
              onChanged={reload}
              onError={setError}
            />
          ))}
        </div>
      </section>

      {/* Section 3: Speech Recognition */}
      <section className="rounded-2xl border-[2.5px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-2">
          3. Whisper Speech Alignment
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-xs font-black uppercase text-black">
              Whisper Model
            </span>
            <select
              value={settings.whisper.model}
              onChange={(e) => patch({ whisper: { ...settings.whisper, model: e.target.value } })}
              className="neo-input mt-1 text-xs"
            >
              {['tiny', 'base', 'small', 'medium', 'large-v3'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-xs font-black uppercase text-black">
              Spoken Language
            </span>
            <input
              className="neo-input mt-1 text-xs font-mono"
              placeholder="auto (e.g. en, es)"
              defaultValue={settings.whisper.language}
              onBlur={(e) => patch({ whisper: { ...settings.whisper, language: e.target.value } })}
            />
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 font-mono text-xs font-bold text-black cursor-pointer">
          <input
            type="checkbox"
            checked={settings.whisper.diarization}
            disabled={!system?.diarization_available}
            onChange={(e) => patch({ whisper: { ...settings.whisper, diarization: e.target.checked } })}
            className="size-4 accent-black"
          />
          Identify individual speakers (Diarization)
        </label>
      </section>

      {/* Section 4: Export Defaults */}
      <section className="rounded-2xl border-[2.5px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-2">
          4. Export & Hardware Encoding
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-xs font-black uppercase text-black">
              Default Aspect Ratio
            </span>
            <select
              value={settings.export.ratio}
              onChange={(e) => patch({ export: { ...settings.export, ratio: e.target.value } })}
              className="neo-input mt-1 text-xs"
            >
              {['9:16', '1:1', '16:9'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-xs font-black uppercase text-black">
              Audio LUFS Loudness
            </span>
            <input
              type="number"
              className="neo-input mt-1 text-xs font-mono"
              defaultValue={settings.export.loudness_lufs}
              onBlur={(e) => patch({ export: { ...settings.export, loudness_lufs: Number(e.target.value) } })}
            />
          </label>
        </div>

        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 font-mono text-xs font-bold text-black cursor-pointer">
            <input
              type="checkbox"
              checked={settings.export.prefer_hardware_encoder}
              onChange={(e) => patch({ export: { ...settings.export, prefer_hardware_encoder: e.target.checked } })}
              className="size-4 accent-black"
            />
            Prefer Hardware GPU Encoder (NVIDIA NVENC)
          </label>

          <label className="flex items-center gap-2 font-mono text-xs font-bold text-black cursor-pointer">
            <input
              type="checkbox"
              checked={settings.export.write_srt}
              onChange={(e) => patch({ export: { ...settings.export, write_srt: e.target.checked } })}
              className="size-4 accent-black"
            />
            Generate .srt subtitle sidecar file on export
          </label>
        </div>
      </section>

      {/* Section 5: Diagnostics */}
      {system && (
        <section className="rounded-2xl border-[2.5px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
          <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-2">
            5. System Diagnostics
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <DiagItem label="OS Platform" val={system.platform} />
            <DiagItem label="Python Version" val={system.python_version} />
            <DiagItem label="FFmpeg Engine" val={system.ffmpeg_version ?? 'Not Found'} />
            <DiagItem label="Acceleration Core" val={system.accel.toUpperCase()} />
            <DiagItem label="GPU Device" val={system.gpu_name ?? 'None'} />
            <DiagItem label="NVENC Encoder" val={system.nvenc_works ? 'Available' : 'Unavailable'} />
          </div>
        </section>
      )}
    </div>
  )
}

function DiagItem({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border-2 border-black bg-[#FAF7F0] font-mono text-xs font-bold shadow-[2px_2px_0px_#000]">
      <span className="text-[#666]">{label}</span>
      <span className="text-black font-black">{val}</span>
    </div>
  )
}

function SecretRow({
  secretKey,
  label,
  present,
  onChanged,
  onError,
}: {
  secretKey: string
  label: string
  present: boolean
  onChanged: () => void
  onError: (error: Error) => void
}) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (!value.trim()) return
    setBusy(true)
    try {
      await api.putSecret(secretKey, value.trim())
      setValue('')
      onChanged()
    } catch (err) {
      onError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.deleteSecret(secretKey)
      onChanged()
    } catch (err) {
      onError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl border-2 border-black bg-[#FAF7F0] shadow-[2px_2px_0px_#000]">
      <label className="min-w-56 flex-1">
        <span className="font-mono text-xs font-black uppercase text-black flex items-center justify-between">
          <span>{label}</span>
          {present && <span className="text-[#10b981] font-black">✓ Stored</span>}
        </span>
        <input
          type="password"
          className="neo-input mt-1 text-xs font-mono"
          value={value}
          placeholder={present ? '••••••••••••••••••••' : 'Paste API Key'}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
      </label>
      <button onClick={save} disabled={!value.trim() || busy} className="neo-btn neo-btn-primary text-xs py-2 px-3">
        Save
      </button>
      {present && (
        <button onClick={remove} disabled={busy} className="neo-btn text-xs py-2 px-3 text-[#FF5A36]">
          Remove
        </button>
      )}
    </div>
  )
}
