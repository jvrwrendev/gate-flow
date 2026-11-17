import { useRef, useState } from 'react'
import { FileUp, Play, Shield, Upload } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import { FullScreenDetail } from '@/components/shared/FullScreenDetail'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'
import type { AIModel } from '@/types'

const categories = ['Vehicle Detection','License Plate Recognition','Vehicle Classification','Vehicle Color Recognition'] as const
export function AIModels() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [uploadOpen, setUploadOpen] = useState(false); const [details, setDetails] = useState<AIModel | null>(null); const [testModel, setTestModel] = useState<AIModel | null>(null); const [fileName, setFileName] = useState('')
  const [form, setForm] = useState({ name: '', category: categories[0], version: 'v1.0.0' })
  const fileRef = useRef<HTMLInputElement>(null)
  const toggleStatus = (model: AIModel) => { const next = model.status === 'Active' ? 'Inactive' : 'Active'; setData(prev => ({ ...prev, models: prev.models.map(m => m.id === model.id ? { ...m, status: next } : m) })); audit(`${next === 'Active' ? 'Activated' : 'Deactivated'} model`, 'AI Models', model.name); toast(`Model ${next.toLowerCase()}`, 'success', model.name) }
  const upload = () => { if (!form.name.trim()) return; const record: AIModel = { id: `MDL-${Date.now().toString().slice(-4)}`, category: form.category, name: form.name, version: form.version, status: 'Inactive', accuracy: 0, lastUpdated: new Date().toISOString().slice(0,10), size: fileName ? 'Uploaded file' : '24.0 MB', description: 'Uploaded model package awaiting validation.', metricLabel: 'Validation accuracy' }; setData(prev => ({ ...prev, models: [record, ...prev.models] })); audit('Uploaded model','AI Models',record.name); toast('Model uploaded (simulated)','success',record.name); setUploadOpen(false); setFileName('') }
  return <div className="space-y-5">
    <PageHeader title="AI Model Management" description="Manage recognition model packages, versions, activation, and simulated tests. No real training or inference is performed." actions={<Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" />Upload Model</Button>} />
    <div className="grid gap-4 xl:grid-cols-2">{data.models.map(model => <Card key={model.id}><CardHeader><div><CardTitle>{model.name}</CardTitle><p className="mt-1 text-xs text-slate-500">{model.category} · {model.version}</p></div><Badge value={model.status} /></CardHeader><CardContent className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">{model.description}</p>
      <div className="grid grid-cols-2 gap-3 text-sm">{[['Accuracy', `${model.accuracy.toFixed(1)}%`],['Metric', model.metricLabel],['Size', model.size],['Updated', model.lastUpdated]].map(([k,v])=><div key={k} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 font-medium text-slate-900">{v}</p></div>)}</div>
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setDetails(model)}><Shield className="h-4 w-4" />Details</Button><Button size="sm" variant="outline" onClick={() => setTestModel(model)}><Play className="h-4 w-4" />Test</Button><Button size="sm" variant={model.status==='Active'?'destructive':'success'} onClick={() => toggleStatus(model)}>{model.status==='Active'?'Deactivate':'Activate'}</Button></div>
      <p className="text-[11px] text-slate-400">Metrics are mock data for demonstration only.</p>
    </CardContent></Card>)}</div>
    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}><DialogContent title="Upload Model Package"><div className="space-y-4 p-6"><Field label="Model Name"><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></Field><Field label="Category"><Select value={form.category} onChange={e=>setForm({...form,category:e.target.value as any})} options={categories.map(v=>({value:v,label:v}))} /></Field><Field label="Version"><Input value={form.version} onChange={e=>setForm({...form,version:e.target.value})} /></Field><Field label="Model File (simulated)"><input ref={fileRef} type="file" className="form-input" onChange={e=>setFileName(e.target.files?.[0]?.name || '')} /><p className="mt-1 text-xs text-slate-500">{fileName || 'No file selected. Upload is simulated and no file is processed.'}</p></Field><DialogFooter><Button variant="outline" onClick={()=>setUploadOpen(false)}>Cancel</Button><Button onClick={upload}><FileUp className="h-4 w-4" />Upload</Button></DialogFooter></div></DialogContent></Dialog>
    <FullScreenDetail
      open={!!details}
      onClose={() => setDetails(null)}
      title="Model Details"
      description={details?.id}
      status={details && <Badge value={details.status} />}
    >
      {details && (
        <DetailSection title="Model Information">
          <DetailGrid>
            <DetailField label="Model ID" value={details.id} mono />
            <DetailField label="Name" value={details.name} />
            <DetailField label="Category" value={details.category} />
            <DetailField label="Version" value={details.version} />
            <DetailField label="Status" value={<Badge value={details.status} />} />
            <DetailField label="Accuracy" value={`${details.accuracy}%`} />
            <DetailField label={details.metricLabel} value={`${details.accuracy}%`} />
            <DetailField label="Size" value={details.size} />
            <DetailField label="Last Updated" value={details.lastUpdated} />
            <DetailField label="Description" value={details.description} className="sm:col-span-2" />
          </DetailGrid>
        </DetailSection>
      )}
    </FullScreenDetail>    <Dialog open={!!testModel} onOpenChange={()=>setTestModel(null)}><DialogContent title="Test Model (Simulated)" description={testModel?.name}><div className="space-y-4 p-6"><div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">This test uses mock sample data. No real inference is executed.</div><div className="grid gap-3 sm:grid-cols-2 text-sm">{[['Sample Plate','NBC 1234'],['Sample Type','SUV'],['Sample Color','White'],['Result Confidence','94.2%'],['Decision','AUTHORIZED']].map(([k,v])=><div key={k} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 font-medium text-slate-900">{v}</p></div>)}</div><DialogFooter><Button onClick={()=>{toast('Model test completed (simulated)','success',testModel?.name);setTestModel(null)}}>Complete Test</Button></DialogFooter></div></DialogContent></Dialog>
  </div>
}
