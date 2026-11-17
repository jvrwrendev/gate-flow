import { useMemo, useState } from 'react'
import { Edit, Plus, Search, ShieldOff, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { VehicleImage } from '@/components/shared/VehicleImage'
import { FullScreenDetail } from '@/components/shared/FullScreenDetail'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'
import { PageHeader } from '@/components/shared/PageHeader'
import { vehicleTypes, vehicleColors } from '@/data/options'
import type { Vehicle, VehicleColor, VehicleType } from '@/types'
const schema = z.object({ plate: z.string().min(6, 'Plate is required'), ownerId: z.string().min(1, 'Owner is required'), type: z.string(), model: z.string().min(2, 'Model is required'), color: z.string(), status: z.string() })
type FormValues = z.infer<typeof schema>

export function Vehicles() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [search, setSearch] = useState(''); const [type, setType] = useState(''); const [color, setColor] = useState(''); const [status, setStatus] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null); const [selected, setSelected] = useState<Vehicle | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { plate: '', ownerId: '', type: 'Sedan', model: '', color: 'White', status: 'Authorized' } })
  const filtered = useMemo(() => data.vehicles.filter(v => (!search || v.plate.toLowerCase().includes(search.toLowerCase()) || v.ownerName.toLowerCase().includes(search.toLowerCase())) && (!type || v.type === type) && (!color || v.color === color) && (!status || v.status === status)), [data.vehicles, search, type, color, status])
  const openAdd = () => { form.reset({ plate: '', ownerId: data.owners[0]?.id || '', type: 'Sedan', model: '', color: 'White', status: 'Authorized' }); setModal('add') }
  const openEdit = (v: Vehicle) => { setSelected(v); form.reset({ plate: v.plate, ownerId: v.ownerId, type: v.type, model: v.model, color: v.color, status: v.status }); setModal('edit') }
  const onSubmit = (values: FormValues) => {
    const owner = data.owners.find(o => o.id === values.ownerId)
    if (!owner) return
    const payload = { plate: values.plate.toUpperCase(), ownerId: owner.id, ownerName: owner.name, contact: owner.phone, type: values.type as VehicleType, model: values.model, color: values.color as VehicleColor, status: values.status as Vehicle['status'] }
    if (modal === 'add') {
      const record: Vehicle = { id: `VH-${Date.now().toString().slice(-5)}`, ...payload, registrationDate: new Date().toISOString().slice(0, 10) }
      setData(prev => ({ ...prev, vehicles: [record, ...prev.vehicles] })); audit('Created vehicle', 'Registered Vehicles', `Added ${record.plate}`); toast('Vehicle added', 'success', record.plate)
    } else if (selected) {
      setData(prev => ({ ...prev, vehicles: prev.vehicles.map(v => v.id === selected.id ? { ...v, ...payload } : v) })); audit('Updated vehicle', 'Registered Vehicles', `Updated ${payload.plate}`); toast('Vehicle updated', 'success', payload.plate)
    }
    setModal(null)
  }
  const toggleSuspend = (v: Vehicle) => { const next = v.status === 'Suspended' ? 'Authorized' : 'Suspended'; setData(prev => ({ ...prev, vehicles: prev.vehicles.map(x => x.id === v.id ? { ...x, status: next } : x) })); audit(`${next === 'Suspended' ? 'Suspended' : 'Reactivated'} vehicle`, 'Registered Vehicles', v.plate); toast(`Vehicle ${next.toLowerCase()}`, 'success', v.plate) }
  return <div className="space-y-5">
    <PageHeader title="Registered Vehicles" description="Manage registered vehicles, owner linkage, authorization status, and vehicle records." actions={<Button onClick={openAdd}><Plus className="h-4 w-4" />Add Vehicle</Button>} />
    <Card><CardContent className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by plate or owner..." className="pl-9" /></div>
        <Select value={type} onChange={e => setType(e.target.value)} options={[{value:'',label:'All types'},...vehicleTypes.map(v=>({value:v,label:v}))]} className="lg:w-40" />
        <Select value={color} onChange={e => setColor(e.target.value)} options={[{value:'',label:'All colors'},...vehicleColors.map(v=>({value:v,label:v}))]} className="lg:w-40" />
        <Select value={status} onChange={e => setStatus(e.target.value)} options={[{value:'',label:'All statuses'},{value:'Authorized',label:'Authorized'},{value:'Pending',label:'Pending'},{value:'Suspended',label:'Suspended'},{value:'Denied',label:'Denied'}]} className="lg:w-44" />
      </div>
      <DataTable data={filtered} emptyTitle="No vehicles found" emptyDescription="Try different filters or add a new vehicle." onRowClick={v => { setSelected(v); setModal('view') }} columns={[
        { key: 'plate', header: 'Plate', render: v => <span className="font-mono font-semibold text-slate-900">{v.plate}</span>, value: v => v.plate },
        { key: 'owner', header: 'Owner', render: v => <div><p className="font-medium text-slate-900">{v.ownerName}</p><p className="text-xs text-slate-500">{v.contact}</p></div>, value: v => v.ownerName },
        { key: 'type', header: 'Type', render: v => v.type, value: v => v.type },
        { key: 'model', header: 'Model', render: v => v.model, value: v => v.model },
        { key: 'color', header: 'Color', render: v => v.color, value: v => v.color },
        { key: 'registered', header: 'Registered', render: v => v.registrationDate, value: v => v.registrationDate },
        { key: 'status', header: 'Status', render: v => <Badge value={v.status} /> },
        { key: 'actions', header: 'Actions', sortable: false, render: v => <div className="flex gap-1" onClick={e => e.stopPropagation()}><Button size="icon" variant="ghost" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => toggleSuspend(v)}><ShieldOff className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => { setSelected(v); setDeleteId(v.id) }}><Trash2 className="h-4 w-4 text-red-600" /></Button></div> },
      ]} />
    </CardContent></Card>
    <FullScreenDetail
      open={modal === 'view' && !!selected}
      onClose={() => setModal(null)}
      title="Vehicle Details"
      description={selected?.plate}
      status={selected && <Badge value={selected.status} />}
    >
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Vehicle Preview</p>
          <VehicleImage type={selected?.type} color={selected?.color} neutral className="aspect-[4/3] w-full" />
        </div>
        <div className="space-y-5">
          <DetailSection title="Vehicle Information">
            {selected && (
              <DetailGrid>
                <DetailField label="Plate Number" value={selected.plate} mono />
                <DetailField label="Vehicle Type" value={selected.type} />
                <DetailField label="Model" value={selected.model} />
                <DetailField label="Color" value={selected.color} />
                <DetailField label="Authorization" value={<Badge value={selected.status} />} />
                <DetailField label="Registered" value={selected.registrationDate} />
              </DetailGrid>
            )}
          </DetailSection>
          <DetailSection title="Ownership &amp; Contact">
            {selected && (
              <DetailGrid>
                <DetailField label="Owner" value={selected.ownerName} />
                <DetailField label="Contact Number" value={selected.contact} />
              </DetailGrid>
            )}
          </DetailSection>
        </div>
      </div>
    </FullScreenDetail>
    <Dialog open={modal === 'add' || modal === 'edit'} onOpenChange={() => setModal(null)}><DialogContent title={modal === 'add' ? 'Add Vehicle' : 'Edit Vehicle'} description="Simulated vehicle record. No external validation service is used."><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6"><Field label="Plate Number" error={form.formState.errors.plate?.message}><Input {...form.register('plate')} placeholder="ABC 1234" /></Field><Field label="Owner" error={form.formState.errors.ownerId?.message}><Select {...form.register('ownerId')} options={data.owners.map(o => ({ value: o.id, label: `${o.name} · ${o.phone}` }))} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Vehicle Type"><Select {...form.register('type')} options={vehicleTypes.map(v => ({ value: v, label: v }))} /></Field><Field label="Vehicle Color"><Select {...form.register('color')} options={vehicleColors.map(v => ({ value: v, label: v }))} /></Field></div><Field label="Brand / Model" error={form.formState.errors.model?.message}><Input {...form.register('model')} placeholder="Toyota Vios" /></Field><Field label="Authorization Status"><Select {...form.register('status')} options={[{value:'Authorized',label:'Authorized'},{value:'Pending',label:'Pending'},{value:'Suspended',label:'Suspended'},{value:'Denied',label:'Denied'}]} /></Field><DialogFooter><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button type="submit" loading={form.formState.isSubmitting}>{modal === 'add' ? 'Add Vehicle' : 'Save Changes'}</Button></DialogFooter></form></DialogContent></Dialog>
    <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete vehicle" description="This removes the simulated vehicle record. This action cannot be undone." destructive confirmLabel="Delete" onConfirm={() => { const v = data.vehicles.find(x => x.id === deleteId); setData(prev => ({ ...prev, vehicles: prev.vehicles.filter(x => x.id !== deleteId) })); audit('Deleted vehicle', 'Registered Vehicles', v?.plate || deleteId || ''); toast('Vehicle deleted', 'success'); setDeleteId(null) }} />
  </div>
}

