import { useState } from 'react'
import { Save } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { Switch } from '@/components/ui/Switch'
import { PageHeader } from '@/components/shared/PageHeader'

export function AIConfiguration() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [form, setForm] = useState(data.settings)
  const save = () => { setData(prev => ({ ...prev, settings: { ...prev.settings, ...form } })); audit('Updated AI configuration','AI Configuration','Recognition thresholds and automation settings'); toast('AI configuration saved','success') }
  return <div className="space-y-5">
    <PageHeader title="AI Configuration" description="Simulated AI recognition thresholds and automation preferences." actions={<Button onClick={save}><Save className="h-4 w-4" />Save Configuration</Button>} />
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Recognition Thresholds</CardTitle></CardHeader><CardContent className="space-y-4">
        <Field label="Automatic approval threshold (%)"><Input type="number" min={50} max={99} value={form.confidenceThreshold} onChange={e=>setForm({...form,confidenceThreshold:Number(e.target.value)})} /></Field>
        <Field label="Manual review threshold (%)"><Input type="number" min={30} max={95} value={form.reviewThreshold} onChange={e=>setForm({...form,reviewThreshold:Number(e.target.value)})} /></Field>
        <p className="text-xs text-slate-500">Recognition results below the automatic approval threshold may be flagged for review.</p>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Automation Behavior</CardTitle></CardHeader><CardContent className="space-y-4">
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3"><div><p className="text-sm font-medium text-slate-900">Automatic gate operation</p><p className="text-xs text-slate-500">Allow authorized detections to trigger simulated gate actions.</p></div><Switch checked={form.automaticGates} onCheckedChange={v=>setForm({...form,automaticGates:v})} label="Automatic gate operation" /></label>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3"><div><p className="text-sm font-medium text-slate-900">Incident alerts</p><p className="text-xs text-slate-500">Create simulated alerts for critical recognition events.</p></div><Switch checked={form.incidentAlerts} onCheckedChange={v=>setForm({...form,incidentAlerts:v})} label="Incident alerts" /></label>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3"><div><p className="text-sm font-medium text-slate-900">Email notifications</p><p className="text-xs text-slate-500">Simulate email delivery for security events.</p></div><Switch checked={form.emailNotifications} onCheckedChange={v=>setForm({...form,emailNotifications:v})} label="Email notifications" /></label>
      </CardContent></Card>
    </div>
  </div>
}
export function AIConfig() { return <AIConfiguration /> }
