import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { api, type SystemStatus } from './api'

export function App() {
  const [system, setSystem] = useState<SystemStatus | null>(null)

  useEffect(() => {
    api.system().then(setSystem).catch(() => setSystem(null))
  }, [])

  return (
    <div className="min-h-screen text-[#121212]">
      {/* Neo-brutalist Header exactly matching the design */}
      <header className="border-b-[2.5px] border-black bg-[#FAF7F0] sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1500px] items-center gap-6 px-6 py-4 lg:px-10">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-1.5 text-2xl font-black tracking-tight text-black">
            <span>Auto</span>
            <span className="bg-[#C6F247] px-2 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
              Clip
            </span>
          </NavLink>

          {/* Navigation */}
          <nav className="flex items-center gap-3 ml-2">
            <TopLink to="/" end>
              Studio
            </TopLink>
            <TopLink to="/settings">
              Settings
            </TopLink>
          </nav>

          {/* System Telemetry */}
          <div className="ml-auto flex items-center gap-3">
            {system && <SystemBadge system={system} />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  )
}

function TopLink({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'px-4 py-1.5 rounded-xl text-sm font-extrabold transition-all duration-100',
          isActive
            ? 'bg-[#121212] text-white border-2 border-black shadow-[2px_2px_0px_#000]'
            : 'text-[#555555] hover:text-black hover:bg-[#eae5d8]',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

function SystemBadge({ system }: { system: SystemStatus }) {
  const accel = system.accel.toUpperCase()
  return (
    <div className="hidden sm:flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000]">
      <span className="font-mono text-black">
        {accel}
        {system.gpu_name && accel === 'CUDA' && (
          <span className="text-[#666]"> · {system.gpu_name.replace('NVIDIA GeForce ', '')}</span>
        )}
      </span>
      <span className="h-3 w-[2px] bg-black" />
      <span className="flex items-center gap-1.5">
        <span
          className={[
            'size-2.5 rounded-full border border-black',
            system.ready ? 'bg-[#C6F247]' : 'bg-[#FF5A36]',
          ].join(' ')}
        />
        <span className={system.ready ? 'text-black' : 'text-[#FF5A36]'}>
          {system.ready ? 'ready' : 'not ready'}
        </span>
      </span>
    </div>
  )
}
