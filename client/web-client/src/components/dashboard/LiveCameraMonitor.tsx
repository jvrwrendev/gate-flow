import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Maximize2, Minimize2, RefreshCw, VideoOff, WifiOff } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { CameraSimulation } from '@/components/shared/CameraSimulation'
import { cn } from '@/lib/utils'
import type { AccessDecision, RecognitionLog } from '@/types'

function formatDateTime(value: Date) {
  return value.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

function decisionLabel(decision: AccessDecision) {
  if (decision === 'AUTHORIZED') return 'Authorized'
  if (decision === 'DENIED') return 'Denied'
  return 'Needs Review'
}

function decisionClasses(decision: AccessDecision) {
  if (decision === 'AUTHORIZED') return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
  if (decision === 'DENIED') return 'border-red-400/40 bg-red-500/15 text-red-200'
  return 'border-amber-400/40 bg-amber-500/15 text-amber-200'
}

function detectionBoxClasses(decision: AccessDecision) {
  if (decision === 'AUTHORIZED') return 'border-emerald-400/80'
  if (decision === 'DENIED') return 'border-red-400/80'
  return 'border-amber-400/80'
}

export function LiveCameraMonitor() {
  const { data } = useApp()
  const [cameraId, setCameraId] = useState(data.cameras[0]?.id ?? '')
  const [now, setNow] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [videoError, setVideoError] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const refreshTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!data.cameras.some(c => c.id === cameraId)) {
      setCameraId(data.cameras[0]?.id ?? '')
    }
  }, [cameraId, data.cameras])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => () => {
    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current)
  }, [])

  const camera = useMemo(() => data.cameras.find(c => c.id === cameraId) ?? data.cameras[0], [cameraId, data.cameras])
  const isOnline = camera?.status === 'Online'
  const hasError = !isOnline || videoError

  const latestDetection = useMemo<RecognitionLog | null>(() => {
    if (!camera) return null
    return data.recognitionLogs.find(log => log.cameraId === camera.id) ?? null
  }, [camera, data.recognitionLogs])

  const fallbackDetection = useMemo<RecognitionLog | null>(() => {
    if (!camera) return null
    return data.recognitionLogs[0] ?? null
  }, [camera, data.recognitionLogs])

  const detection = latestDetection ?? fallbackDetection
  const isSimulatedDetection = !latestDetection && !!fallbackDetection

  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    setVideoError(false)
    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = window.setTimeout(() => {
      setRefreshKey(k => k + 1)
      setIsRefreshing(false)
      refreshTimerRef.current = null
    }, 700)
  }

  const toggleFullscreen = async () => {
    const el = containerRef.current
    if (!el) return
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen()
      } else if (el.requestFullscreen) {
        await el.requestFullscreen()
      }
    } catch {
      // Ignore fullscreen errors (unsupported/blocked)
    }
  }

  const cameraOptions = data.cameras.map(c => ({ value: c.id, label: `${c.name} (${c.id})` }))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 border-b border-slate-100 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base sm:text-lg">Live Camera Monitoring</CardTitle>
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Offline
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {camera ? `${camera.name} · ${camera.location}` : 'No camera available'}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-[260px]">
            <Select
              aria-label="Select camera"
              value={camera?.id ?? ''}
              onChange={e => { setCameraId(e.target.value); setVideoError(false) }}
              options={cameraOptions.length ? cameraOptions : [{ value: '', label: 'No cameras available' }]}
              disabled={!cameraOptions.length}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} aria-label="Refresh camera feed" title="Refresh feed" disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-3">
        <div
          ref={containerRef}
          className={cn(
            'relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950',
            isFullscreen && 'h-screen w-screen rounded-none border-0'
          )}
        >
          <div className={cn('relative w-full bg-slate-950', isFullscreen ? 'h-full' : 'aspect-video min-h-[280px] sm:min-h-[360px] xl:min-h-[420px]')}>
            {!hasError ? (
              <CameraSimulation
                key={`${camera?.id}-${refreshKey}`}
                title={camera?.name || 'Camera'}
                framed={false}
                showCaption={false}
                className="h-full w-full"
                iframeClassName="h-full w-full object-cover"
                onError={() => setVideoError(true)}
                onLoadedData={() => setVideoError(false)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950 px-6 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300">
                    {isOnline ? <VideoOff className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                  </div>
                  <p className="text-sm font-semibold text-slate-100">{isOnline ? 'Connection error' : 'Camera offline'}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {isOnline
                      ? 'Unable to load the camera preview. Check the connection and try refreshing the feed.'
                      : 'This camera is currently offline. Monitoring will resume when the connection is restored.'}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white" onClick={handleRefresh}>
                    <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Top overlay */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-4">
              <div className="pointer-events-none max-w-[70%] rounded-lg bg-black/55 px-3 py-2 text-white backdrop-blur-sm">
                <p className="truncate text-xs font-semibold sm:text-sm">{camera?.name || 'Camera'}</p>
                <p className="truncate text-[11px] text-slate-200/90">{camera?.location || 'Unknown location'}</p>
              </div>
              <div className="pointer-events-none rounded-lg bg-black/55 px-3 py-2 text-right text-white backdrop-blur-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-300">Live Date/Time</p>
                <p className="mt-0.5 font-mono text-[11px] sm:text-xs">{formatDateTime(now)}</p>
              </div>
            </div>

            {/* AI detection overlay */}
            {!hasError && detection && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 sm:p-4">
                <div className="absolute bottom-[18%] left-[12%] h-[38%] w-[42%] rounded-md border-2 border-dashed opacity-70 sm:left-[16%] sm:w-[34%]">
                  <div className={cn('h-full w-full rounded-[4px] border-2', detectionBoxClasses(detection.decision))} />
                  <span className="absolute -top-6 left-0 rounded bg-black/65 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-200">
                    Simulated detection box
                  </span>
                </div>

                <div className="ml-auto max-w-full rounded-lg border border-white/10 bg-black/60 p-3 text-white backdrop-blur-sm sm:max-w-[360px]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">AI Detection</p>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', decisionClasses(detection.decision))}>
                      {decisionLabel(detection.decision)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Vehicle</p>
                      <p className="mt-0.5 font-medium text-slate-100">{detection.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Plate</p>
                      <p className="mt-0.5 font-mono font-semibold text-slate-100">{detection.plate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Status</p>
                      <p className="mt-0.5 font-medium text-slate-100">{decisionLabel(detection.decision)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">
                    {isSimulatedDetection ? 'Simulated overlay: showing sample detection data (no camera-specific log available).' : 'Simulated overlay: detection box is illustrative; metadata from recognition logs.'}
                  </p>
                </div>
              </div>
            )}

            {isRefreshing && !hasError && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35">
                <div className="inline-flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Refreshing feed...
                </div>
              </div>
            )}
          </div>

          {/* Control bar */}
          <div className="flex flex-col gap-2 border-t border-slate-800 bg-slate-950/95 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Camera className="h-4 w-4 text-slate-500" />
              <span className="truncate">{camera?.name || 'No camera'}{camera?.id ? ` · ${camera.id}` : ''}</span>
              <Badge value={camera?.status || 'Offline'} variant={isOnline ? 'success' : 'destructive'} className="ml-1" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full sm:w-[220px]">
                <Select
                  aria-label="Switch camera"
                  value={camera?.id ?? ''}
                  onChange={e => { setCameraId(e.target.value); setVideoError(false) }}
                  options={cameraOptions.length ? cameraOptions : [{ value: '', label: 'No cameras available' }]}
                  disabled={!cameraOptions.length}
                  className="h-8 border-slate-700 bg-slate-900 text-xs text-slate-100 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}