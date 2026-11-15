import { useState } from 'react'
import { Database, Save } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Input, Select } from '@/components/ui/Field'
import { Switch } from '@/components/ui/Switch'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockData } from '@/data/mock'

export function Settings() {
  const { data, setData, resetData, audit } = useApp(); const { toast } = useToast()
  const [form, setForm] = useState(data.settings); const [resetOpen, setResetOpen] = useState(false)
  const save = () => { setData(prev => ({ ...prev, settings: { ...prev.settings, ...form } })); audit('Updated system settings','System Settings','Platform, timezone, and notification settings'); toast('Settings saved','success') }
  return <div className="space-y-5">
    <PageHeader title="System Settings" description="Simulated platform configuration stored locally in the browser." actions={<Button onClick={save}><Save className="h-4 w-4" />Save Settings</Button>} />
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Platform</CardTitle></CardHeader><CardContent className="space-y-4">
        <Field label="Platform name"><Input value={form.platformName} onChange={e=>setForm({...form,platformName:e.target.value})} /></Field>
        <Field label="System timezone"><Select value={form.timezone} onChange={e=>setForm({...form,timezone:e.target.value})} options={[{value:'Asia/Manila',label:'Asia/Manila (Philippines)'}]} /></Field>
        <Field label="Date format"><Select value={form.dateFormat} onChange={e=>setForm({...form,dateFormat:e.target.value})} options={[{value:'MMM dd, yyyy',label:'MMM dd, yyyy'},{value:'dd/MM/yyyy',label:'dd/MM/yyyy'},{value:'yyyy-MM-dd',label:'yyyy-MM-dd'}]} /></Field>
        <Field label="Time format"><Select value={form.timeFormat} onChange={e=>setForm({...form,timeFormat:e.target.value as any})} options={[{value:'12-hour',label:'12-hour'},{value:'24-hour',label:'24-hour'}]} /></Field>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Recognition & Gate Automation</CardTitle></CardHeader><CardContent className="space-y-4">
        <Field label="Recognition confidence threshold (%)"><Input type="number" value={form.confidenceThreshold} onChange={e=>setForm({...form,confidenceThreshold:Number(e.target.value)})} /></Field>
        <Field label="Manual review threshold (%)"><Input type="number" value={form.reviewThreshold} onChange={e=>setForm({...form,reviewThreshold:Number(e.target.value)})} /></Field>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3"><div><p className="text-sm font-medium text-slate-900">Automatic gate operation</p><p className="text-xs text-slate-500">Simulated automatic barrier actions for authorized vehicles.</p></div><Switch checked={form.automaticGates} onCheckedChange={v=>setForm({...form,automaticGates:v})} label="Automatic gate operation" /></label>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Notifications</CardTitle></CardHeader><CardContent className="space-y-4">
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3"><div><p className="text-sm font-medium text-slate-900">Email notifications</p><p className="text-xs text-slate-500">Simulated email delivery.</p></div><Switch checked={form.emailNotifications} onCheckedChange={v=>setForm({...form,emailNotifications:v})} label="Email notifications" /></label>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3"><div><p className="text-sm font-medium text-slate-900">Push notifications</p><p className="text-xs text-slate-500">Browser-style simulated alerts.</p></div><Switch checked={form.pushNotifications} onCheckedChange={v=>setForm({...form,pushNotifications:v})} label="Push notifications" /></label>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3"><div><p className="text-sm font-medium text-slate-900">Incident alerts</p><p className="text-xs text-slate-500">Alerts for critical simulated events.</p></div><Switch checked={form.incidentAlerts} onCheckedChange={v=>setForm({...form,incidentAlerts:v})} label="Incident alerts" /></label>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Demo Data</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-slate-600">Reset all simulated records to the original mock dataset. This clears local browser changes.</p><Button variant="destructive" onClick={()=>setResetOpen(true)}><Database className="h-4 w-4" />Reset Demo Data</Button></CardContent></Card>
    </div>
    <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen} title="Reset demo data" description="All simulated changes will be replaced with the original mock dataset." destructive confirmLabel="Reset" onConfirm={()=>{resetData(); setForm(structuredClone(mockData.settings)); toast('Demo data reset','success'); setResetOpen(false)}} />
  </div>
}
