import { useState } from 'react'
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MetricCard } from '@/components/shared/MetricCard'
import { CameraSimulation } from '@/components/shared/CameraSimulation'
import { BarrierGateSimulator } from '@/components/dashboard/BarrierGateSimulator'
import { trafficData, typeData, weeklyData } from '@/data/mock'

export function Dashboard() {
  const { data } = useApp()
  const [cameraId, setCameraId] = useState(data.cameras[0]?.id ?? '')

  const currentCameraIndex = data.cameras.findIndex(c => c.id === cameraId)
  const camera = currentCameraIndex >= 0 ? data.cameras[currentCameraIndex] : data.cameras[0]
  const isOnline = camera?.status === 'Online'

  const todayDenied = data.recognitionLogs.filter(
    log => log.decision === 'DENIED' && new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length
  const authorized = data.vehicles.filter(vehicle => vehicle.status === 'Authorized').length
  const pending = data.applications.filter(application => application.status === 'Pending').length
  const activeGates = data.gates.filter(gateItem => gateItem.status === 'Online').length
  const recent = data.recognitionLogs.slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[7fr_3fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Live Camera Monitoring</CardTitle>
                <p className="mt-1 text-xs text-slate-500">Surveillance preview and latest detection</p>
              </div>
              <Badge value={camera?.status || 'Offline'} variant={isOnline ? 'success' : 'destructive'} />
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Widescreen Live Camera Feed Container */}
              <div className="relative h-[180px] w-full overflow-hidden rounded-lg border border-slate-200/80 bg-slate-950 shadow-sm xl:h-[200px]">
                <CameraSimulation
                  title={camera?.name || 'Camera'}
                  framed={false}
                  showCaption={false}
                  className="h-full w-full"
                />

                {/* Top-Right HUD Badge: Camera switcher */}
                <button
                  type="button"
                  onClick={() => {
                    if (!data.cameras.length) return
                    const nextIndex = (currentCameraIndex + 1) % data.cameras.length
                    setCameraId(data.cameras[nextIndex].id)
                  }}
                  aria-label="Switch camera"
                  className="pointer-events-auto absolute right-3.5 top-3.5 z-20 inline-flex items-center rounded-md bg-black/80 px-3 py-1.5 text-[11px] font-medium text-slate-100 shadow-md backdrop-blur-sm transition-colors hover:bg-black/90"
                >
                  Camera {data.cameras.length > 0 ? `${(currentCameraIndex >= 0 ? currentCameraIndex : 0) + 1}/${data.cameras.length}` : '1/2'}
                </button>

                {/* Bottom-Right HUD Badge: Location / Camera Name */}
                <div className="pointer-events-none absolute bottom-3.5 right-3.5 z-10 inline-flex items-center rounded-md bg-black/80 px-3 py-1.5 text-[11px] font-medium text-slate-100 shadow-md backdrop-blur-sm">
                  {(camera as { location?: string })?.location || camera?.name || 'P6, Valencia / Ph'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Vehicle Entry and Exit Traffic</CardTitle>
                <p className="mt-1 text-xs text-slate-500">Hourly volume for the current operating day</p>
              </div>
              <Badge value="Live simulation" variant="blue" />
            </CardHeader>
            <CardContent>
              <div className="h-56 xl:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="entries" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
                    <Area type="monotone" dataKey="exits" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.08} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex h-full flex-col gap-3">
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <MetricCard compact label="Today's Entries" value={data.gates.reduce((sum, gateItem) => sum + gateItem.entriesToday, 0)} helper="Entries today" icon={<Activity className="h-4 w-4" />} tone="blue" />
            <MetricCard compact label="Denied Today" value={todayDenied} helper="Rejected attempts" icon={<AlertTriangle className="h-4 w-4" />} tone="red" />
            <MetricCard compact label="Registered" value={data.vehicles.length} helper={`${authorized} authorized`} icon={<CarIcon />} tone="blue" />
            <MetricCard compact label="Authorized" value={authorized} helper="Active profiles" icon={<CheckCircle2 className="h-4 w-4" />} tone="emerald" />
          </div>
          <div className="min-h-0 flex-1">
            <BarrierGateSimulator />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Authorized vs. Denied Access</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 xl:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="authorized" fill="#10b981" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="denied" fill="#ef4444" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vehicle Classification Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3 md:flex-row">
              <div className="h-48 w-full md:w-52 xl:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86}>
                      {typeData.map((item, index) => <Cell key={index} fill={item.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-x-2 gap-y-1.5">
                {typeData.map(item => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto font-semibold text-slate-700">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Recent Access Activity</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Plate</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Camera</th>
                    <th className="px-4 py-3 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(record => (
                    <tr key={record.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 text-slate-500">{new Date(record.timestamp).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{record.plate}</td>
                      <td className="px-4 py-3 text-slate-700">{record.type}</td>
                      <td className="px-4 py-3 text-slate-500">{record.cameraId}</td>
                      <td className="px-4 py-3"><Badge value={record.decision} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Barrier Gates</p>
                {data.gates.map(gateItem => (
                  <div key={gateItem.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="truncate text-sm font-medium text-slate-900">{gateItem.name}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge value={gateItem.status} />
                      <Badge value={gateItem.barrier} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Cameras</p>
                {data.cameras.map(cameraItem => (
                  <div key={cameraItem.id} className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-900">{cameraItem.name}</p>
                    <Badge value={cameraItem.status} />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">AI Models</p>
                {data.models.filter(model => model.status === 'Active').map(model => (
                  <div key={model.id} className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-900">{model.name}</p>
                    <span className="shrink-0 text-sm font-semibold text-emerald-600">{model.accuracy}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Operations Summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700">Pending Applications</p>
                <p className="mt-1 font-display text-xl font-extrabold text-amber-900">{pending}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">Active Barrier Gates</p>
                <p className="mt-1 font-display text-xl font-extrabold text-slate-900">{activeGates}/{data.gates.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CarIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13l2-5h14l2 5M5 13h14v5H5z" /></svg>
}