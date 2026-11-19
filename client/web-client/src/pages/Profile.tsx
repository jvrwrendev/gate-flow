import { useState } from 'react'
import { Save } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'

export function Profile() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const admin = data.admins[0]
  const [name, setName] = useState(admin?.name || 'Adrian Velasco')
  const [email, setEmail] = useState(admin?.email || 'adrian.velasco@gatevision.ph')
  const [phone, setPhone] = useState('+63 917 000 0000')
  const save = () => { setData(prev => ({ ...prev, admins: prev.admins.map((a, i) => i === 0 ? { ...a, name, email } : a) })); audit('Updated profile','Profile','Current administrator profile'); toast('Profile updated','success') }
  return <div className="space-y-5">
    <PageHeader title="Profile" description="Manage the current administrator profile. Authentication is not implemented." />
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card><CardContent className="flex flex-col items-center p-6 text-center"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">AV</div><h2 className="mt-4 font-display text-xl font-bold text-slate-950">{name}</h2><p className="text-sm text-slate-500">{admin?.role}</p><p className="mt-1 text-xs text-slate-400">Last login: {admin ? new Date(admin.lastLogin).toLocaleString('en-PH',{timeZone:'Asia/Manila'}) : '—'}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Profile Information</CardTitle></CardHeader><CardContent className="space-y-4">
        <Field label="Full Name"><Input value={name} onChange={e=>setName(e.target.value)} /></Field>
        <Field label="Email"><Input value={email} onChange={e=>setEmail(e.target.value)} type="email" /></Field>
        <Field label="Phone"><Input value={phone} onChange={e=>setPhone(e.target.value)} /></Field>
        <Field label="Role"><Input value={admin?.role || 'Super Admin'} disabled /></Field>
        <Field label="New Password (simulated)"><Input type="password" placeholder="••••••••" /></Field>
        <div className="flex justify-end"><Button onClick={save}><Save className="h-4 w-4" />Save Profile</Button></div>
      </CardContent></Card>
    </div>
  </div>
}
