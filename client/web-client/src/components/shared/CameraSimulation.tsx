import cctvVideoUrl from '@/assets/cctv.mp4'
import { cn } from '@/lib/utils'

interface CameraSimulationProps {
  title?: string
  className?: string
  iframeClassName?: string
  showCaption?: boolean
  framed?: boolean
  onError?: () => void
  onLoadedData?: () => void
}

export function CameraSimulation({
  title,
  className,
  iframeClassName,
  showCaption = true,
  framed = true,
  onError,
  onLoadedData,
}: CameraSimulationProps) {
  return (
    <div className={cn(framed ? 'overflow-hidden rounded-xl border border-slate-200 bg-slate-950' : 'h-full w-full', className)}>
      <video
        title={`${title || 'Camera'} CCTV feed`}
        src={cctvVideoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${title || 'Camera'} CCTV feed`}
        onError={onError}
        onLoadedData={onLoadedData}
        className={cn('block w-full object-cover', showCaption ? 'aspect-video' : 'h-full', iframeClassName)}
      />
      {showCaption && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-3 py-2 text-[11px] text-slate-400">
          CCTV feed. Simulated monitoring only.
        </div>
      )}
    </div>
  )
}
