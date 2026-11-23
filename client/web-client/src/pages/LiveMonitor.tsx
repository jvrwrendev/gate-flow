import { useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, Minimize2, Pause, Play, RefreshCw, VideoOff, WifiOff } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CameraSimulation } from '@/components/shared/CameraSimulation'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn, formatTime } from '@/lib/utils'
import type { Camera, RecognitionLog } from '@/types'

type CameraRole = 'entrance' | 'exit'

interface CameraPanelState {
  running: boolean
  current: RecognitionLog | null
  history: RecognitionLog[]
  refreshing: boolean
  refreshKey: number
  videoError: boolean
  fullscreen: boolean
}

function createPanelState(logs: RecognitionLog[]): CameraPanelState {
  return {
    running: false,
    current: logs[0] ?? null,
    history: logs.slice(0, 6),
    refreshing: false,
    refreshKey: 0,
    videoError: false,
    fullscreen: false,
  }
}

function pickRandom<T>(items: T[]): T | undefined {
  if (!items.length) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

function roleForCamera(camera: Camera | undefined, index: number): CameraRole {
  if (camera?.id === 'CAM-01' || /entrance/i.test(camera?.name ?? '')) return 'entrance'
  if (camera?.id === 'CAM-02' || /exit/i.test(camera?.name ?? '')) return 'exit'
  return index === 0 ? 'entrance' : 'exit'
}

function roleLabel(role: CameraRole) {
  return role === 'entrance' ? 'Entrance Camera' : 'Exit Camera'
}

export function LiveMonitor() {
  const { data } = useApp()
  const { toast } = useToast()
  const [now, setNow] = useState(new Date())
  const [activeCameraId, setActiveCameraId] = useState<string>('')

  const cameras = useMemo(() => {
    const byId = new Map(data.cameras.map(c => [c.id, c]))
    const ordered = [byId.get('CAM-01'), byId.get('CAM-02')].filter(Boolean) as Camera[]
    if (ordered.length === 2) return ordered
    return data.cameras.slice(0, 2)
  }, [data.cameras])

  const logsByCamera = useMemo(() => {
    const map = new Map<string, RecognitionLog[]>()
    for (const cam of cameras) {
      map.set(cam.id, data.recognitionLogs.filter(l => l.cameraId === cam.id))
    }
    return map
  }, [cameras, data.recognitionLogs])

  const [panelStates, setPanelStates] = useState<Record<string, CameraPanelState>>({})
  const panelStatesRef = useRef(panelStates)
  panelStatesRef.current = panelStates
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const refreshTimers = useRef<Record<string, number>>({})

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    setPanelStates(prev => {
      const next: Record<string, CameraPanelState> = {}
      for (const cam of cameras) {
        const logs = logsByCamera.get(cam.id) ?? []
        const existing = prev[cam.id]
        next[cam.id] = existing ? { ...existing, current: existing.current ?? logs[0] ?? null, history: existing.history.length ? existing.history : logs.slice(0, 6) } : createPanelState(logs)
      }
      return next
    })
    if (!activeCameraId || !cameras.some(c => c.id === activeCameraId)) {
      setActiveCameraId(cameras[0]?.id ?? '')
    }
  }, [cameras, logsByCamera, activeCameraId])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeEl = document.fullscreenElement
      setPanelStates(prev => {
        let changed = false
        const next = { ...prev }
        for (const cam of cameras) {
          const isFull = activeEl === containerRefs.current[cam.id]
          if (next[cam.id] && next[cam.id].fullscreen !== isFull) {
            next[cam.id] = { ...next[cam.id], fullscreen: isFull }
            changed = true
          }
        }
        return changed ? next : prev
      })
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [cameras])

  useEffect(() => () => {
    for (const timer of Object.values(refreshTimers.current)) window.clearTimeout(timer)
  }, [])

  const runningKey = cameras.map(c => `${c.id}:${panelStates[c.id]?.running ? '1' : '0'}`).join('|')

  useEffect(() => {
    const timers: number[] = []
    for (const cam of cameras) {
      const running = panelStatesRef.current[cam.id]?.running
      const logs = logsByCamera.get(cam.id) ?? []
      if (!running || !logs.length) continue
      const timer = window.setInterval(() => {
        if (!panelStatesRef.current[cam.id]?.running) return
        const nextLog = pickRandom(logs)
        if (!nextLog) return
        setPanelStates(prev => {
          const curr = prev[cam.id]
          if (!curr) return prev
          return { ...prev, [cam.id]: { ...curr, current: nextLog, history: [nextLog, ...curr.history].slice(0, 8) } }
        })
        setActiveCameraId(cam.id)
        toast(nextLog.decision === 'DENIED' ? 'Denied detection simulated' : 'Detection simulated', 'info', `${cam.name}: ${nextLog.plate}`)
      }, 4200)
      timers.push(timer)
    }
    return () => { for (const t of timers) window.clearInterval(t) }
  }, [cameras, logsByCamera, runningKey, toast])

  const anyRunning = cameras.some(c => panelStates[c.id]?.running)

  const toggleGlobalSimulation = () => {
    const nextRunning = !anyRunning
    setPanelStates(prev => {
      const next = { ...prev }
      for (const cam of cameras) {
        const curr = next[cam.id] ?? createPanelState(logsByCamera.get(cam.id) ?? [])
        next[cam.id] = { ...curr, running: nextRunning }
      }
      return next
    })
  }

  const simulateDetection = () => {
    const updates = cameras.map(cam => {
      const logs = logsByCamera.get(cam.id) ?? []
      const log = pickRandom(logs) ?? data.recognitionLogs[0]
      return { cam, logs, log }
    }).filter((u): u is { cam: Camera; logs: RecognitionLog[]; log: RecognitionLog } => !!u.log)

    if (!updates.length) return

    setPanelStates(prev => {
      const next = { ...prev }
      for (const { cam, logs, log } of updates) {
        const curr = next[cam.id] ?? createPanelState(logs)
        next[cam.id] = { ...curr, current: log, history: [log, ...curr.history].slice(0, 8) }
      }
      return next
    })

    const last = updates[updates.length - 1]
    setActiveCameraId(last.cam.id)
    toast('Detection simulated', 'info', `Latest: ${last.log.plate}`)
  }

  const refreshCamera = (cameraId: string) => {
    const curr = panelStates[cameraId]
    if (curr?.refreshing) return
    setPanelStates(prev => ({ ...prev, [cameraId]: { ...(prev[cameraId] ?? createPanelState([])), refreshing: true, videoError: false } }))
    if (refreshTimers.current[cameraId]) window.clearTimeout(refreshTimers.current[cameraId])
    refreshTimers.current[cameraId] = window.setTimeout(() => {
      setPanelStates(prev => {
        const state = prev[cameraId]
        if (!state) return prev
        return { ...prev, [cameraId]: { ...state, refreshing: false, refreshKey: state.refreshKey + 1 } }
      })
      delete refreshTimers.current[cameraId]
    }, 700)
  }

  const toggleFullscreen = async (cameraId: string) => {
    const el = containerRefs.current[cameraId]
    if (!el) return
    try {
      if (document.fullscreenElement === el) await document.exitFullscreen()
      else if (el.requestFullscreen) await el.requestFullscreen()
    } catch {
      // ignore
    }
  }

  const activeCamera = cameras.find(c => c.id === activeCameraId) ?? cameras[0]
  const activeState = activeCamera ? panelStates[activeCamera.id] : undefined
  const activeDetection = activeState?.current ?? null
  const activeRole = roleForCamera(activeCamera, cameras.indexOf(activeCamera as Camera))
  const activeGate = data.gates.find(g => g.id === activeCamera?.gateId)

  const combinedHistory = useMemo(() => {
    const rows: Array<{ log: RecognitionLog; camera: Camera | undefined; role: CameraRole }> = []
    cameras.forEach((cam, idx) => {
      const state = panelStates[cam.id]
      const logs = state?.history?.length ? state.history : (logsByCamera.get(cam.id) ?? []).slice(0, 6)
      for (const log of logs) rows.push({ log, camera: cam, role: roleForCamera(cam, idx) })
    })
    const seen = new Set<string>()
    return rows
      .sort((a, b) => +new Date(b.log.timestamp) - +new Date(a.log.timestamp))
      .filter(r => {
        const key = `${r.log.id}-${r.camera?.id}-${r.log.timestamp}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 8)
  }, [cameras, panelStates, logsByCamera])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Monitoring"
        description="Dual-camera monitoring for entrance and exit lanes. Detection data is simulated from mock recognition logs."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={anyRunning ? 'outline' : 'default'} onClick={toggleGlobalSimulation}>
              {anyRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {anyRunning ? 'Pause Simulation' : 'Start Simulation'}
            </Button>
            <Button variant="outline" onClick={simulateDetection}>
              <RefreshCw className="h-4 w-4" />
              Simulate Detection
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Current Date</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{now.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Current Time</p>
          <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{formatTime(now.toISOString())}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Assigned Gate</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{activeGate?.name || 'Unassigned'}</p>
          <p className="mt-0.5 text-xs text-slate-500">{activeCamera?.name || 'No active camera'}</p>
        </div>
      </div>

      {cameras.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">No cameras available for live monitoring.</CardContent>
        </Card>
      ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        {cameras.map((cam, idx) => {
          const role = roleForCamera(cam, idx)
          const state = panelStates[cam.id] ?? createPanelState(logsByCamera.get(cam.id) ?? [])
          const isOnline = cam.status === 'Online'
          const hasError = !isOnline || state.videoError
          const detection = state.current

          return (
            <Card key={cam.id} className={cn('overflow-hidden', activeCameraId === cam.id && 'ring-1 ring-blue-200')}>
              <CardHeader className="gap-3 border-b border-slate-100 pb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{roleLabel(role)}</CardTitle>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">{cam.id}</span>
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Offline
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">{cam.name} · {cam.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => refreshCamera(cam.id)} aria-label={`Refresh ${roleLabel(role).toLowerCase()}`} title="Refresh feed" disabled={state.refreshing}>
                    <RefreshCw className={cn('h-4 w-4', state.refreshing && 'animate-spin')} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => toggleFullscreen(cam.id)} aria-label={state.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={state.fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                    {state.fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-2 sm:p-3">
                <div
                  ref={el => { containerRefs.current[cam.id] = el }}
                  className={cn('relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950', state.fullscreen && 'h-screen w-screen rounded-none border-0')}
                >
                  <div className={cn('relative w-full bg-slate-950', state.fullscreen ? 'h-full' : 'aspect-video min-h-[260px] sm:min-h-[320px]')}>
                    {!hasError ? (
                      <CameraSimulation
                        key={`${cam.id}-${state.refreshKey}`}
                        title={cam.name}
                        framed={false}
                        showCaption={false}
                        className="h-full w-full"
                        iframeClassName="h-full w-full object-cover"
                        onError={() => setPanelStates(prev => ({ ...prev, [cam.id]: { ...(prev[cam.id] ?? createPanelState([])), videoError: true } }))}
                        onLoadedData={() => setPanelStates(prev => ({ ...prev, [cam.id]: { ...(prev[cam.id] ?? createPanelState([])), videoError: false } }))}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950 px-6 text-center">
                        <div className="max-w-sm">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300">
                            {isOnline ? <VideoOff className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                          </div>
                          <p className="text-sm font-semibold text-slate-100">{isOnline ? 'Connection error' : 'Camera offline'}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {isOnline ? 'Unable to load the camera preview. Try refreshing the feed.' : 'This camera is currently offline. Monitoring will resume when the connection is restored.'}
                          </p>
                          <Button variant="outline" size="sm" className="mt-4 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white" onClick={() => refreshCamera(cam.id)}>
                            <RefreshCw className={cn('h-4 w-4', state.refreshing && 'animate-spin')} /> Retry
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3">
                      <div className="rounded-md bg-black/55 px-2.5 py-1.5 text-white backdrop-blur-sm">
                        <p className="text-[11px] font-semibold sm:text-xs">{roleLabel(role)}</p>
                        <p className="text-[10px] text-slate-200/90">{cam.location}</p>
                      </div>
                      <div className="rounded-md bg-black/55 px-2.5 py-1.5 text-[10px] font-medium text-slate-200 backdrop-blur-sm">
                        {formatTime(now.toISOString())}
                      </div>
                    </div>

                    {!hasError && detection && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3">
                        <div className="inline-flex max-w-full flex-col gap-1 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">Simulated detection</span>
                            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase', detection.decision === 'AUTHORIZED' ? 'bg-emerald-500/20 text-emerald-200' : detection.decision === 'DENIED' ? 'bg-red-500/20 text-red-200' : 'bg-amber-500/20 text-amber-200')}>{detection.decision}</span>
                          </div>
                          <p className="truncate text-xs"><span className="font-mono font-semibold">{detection.plate}</span> · {detection.type} · {detection.color}</p>
                        </div>
                      </div>
                    )}

                    {state.refreshing && !hasError && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35">
                        <div className="inline-flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                          <RefreshCw className="h-4 w-4 animate-spin" /> Refreshing feed...
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveCameraId(cam.id)}
                      className="absolute inset-0 z-10"
                      aria-label={`Select ${roleLabel(role)} as active detection source`}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-800 bg-slate-950/95 px-3 py-2 text-xs text-slate-400">
                    <span className="truncate">{roleLabel(role)} · {isOnline ? 'Monitoring active' : 'Monitoring unavailable'}</span>
                    <span className={cn('shrink-0 font-medium', state.running ? 'text-emerald-400' : 'text-slate-500')}>{state.running ? 'Simulation running' : 'Simulation paused'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Detected Vehicle Information</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              {activeCamera ? `Latest detection from ${roleLabel(activeRole)} (${activeCamera.id})` : 'No camera selected'}
            </p>
          </div>
          {activeDetection && <Badge value={activeDetection.decision} />}
        </CardHeader>
        <CardContent>
          {!activeDetection ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No detection data available. Start simulation or trigger a simulated detection.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Recognized Plate</p>
                <p className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-slate-950">{activeDetection.plate}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge value={activeDetection.decision} />
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {roleLabel(activeRole)} · {activeCamera?.id}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{activeDetection.reason}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ['Vehicle Type', activeDetection.type],
                  ['Color', activeDetection.color],
                  ['Confidence', `${activeDetection.confidence.toFixed(1)}%`],
                  ['Camera', `${activeCamera?.name ?? activeDetection.cameraId} (${activeDetection.cameraId})`],
                  ['Gate', data.gates.find(g => g.id === activeDetection.gateId)?.name ?? activeDetection.gateId],
                  ['Detection Time', formatTime(activeDetection.timestamp)],
                  ['Detection Source', roleLabel(activeRole)],
                  ['Authorization Status', activeDetection.decision],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Detection History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {combinedHistory.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">No detection history available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Plate</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Color</th>
                    <th className="px-4 py-3 font-medium">Confidence</th>
                    <th className="px-4 py-3 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedHistory.map((row, i) => (
                    <tr key={`${row.log.id}-${row.camera?.id}-${i}`} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 text-slate-500">{formatTime(row.log.timestamp)}</td>
                      <td className="px-4 py-3 text-slate-700">{roleLabel(row.role)} ({row.camera?.id})</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{row.log.plate}</td>
                      <td className="px-4 py-3 text-slate-700">{row.log.type}</td>
                      <td className="px-4 py-3 text-slate-700">{row.log.color}</td>
                      <td className="px-4 py-3 text-slate-700">{row.log.confidence.toFixed(1)}%</td>
                      <td className="px-4 py-3"><Badge value={row.log.decision} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}