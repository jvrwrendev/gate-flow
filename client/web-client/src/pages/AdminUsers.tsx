import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Eye, KeyRound, Plus, Search, Shield, ShieldOff, UserCog } from 'lucide-react'
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
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/Sheet'
import { Field, Input, Select } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { ALL_ROLES, canAssignRole, canManageUser } from '@/auth/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import type { AdminUser, UserRole } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  contactNumber: z.string().min(9, 'Contact number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.string().min(1),
  status: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

// DataTable handles pagination. Filters/search are applied before passing data.

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function AdminUsers() {
  const navigate = useNavigate()
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const { role: actorRole, hasPermission } = usePermissions()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')

  const canManageUsers = hasPermission('users:manage')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', contactNumber: '+63 ', password: '', role: 'Viewer', status: 'Active' },
  })

  const assignableRoles = useMemo(() => ALL_ROLES.filter(role => canAssignRole(actorRole, role)), [actorRole])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.admins.filter(user =>
      (!q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.role.toLowerCase().includes(q)) &&
      (!roleFilter || user.role === roleFilter) &&
      (!statusFilter || user.status === statusFilter)
    )
  }, [data.admins, search, roleFilter, statusFilter])

  // DataTable handles pagination internally. Keep filters/search state for UX.

  const activeSuperAdmins = data.admins.filter(u => u.role === 'Super Admin' && u.status === 'Active')

  const isLastActiveSuperAdmin = (user: AdminUser) => user.role === 'Super Admin' && user.status === 'Active' && activeSuperAdmins.length <= 1

  const openAdd = () => {
    form.reset({ name: '', email: '', contactNumber: '+63 ', password: '', role: assignableRoles[assignableRoles.length - 1] || 'Viewer', status: 'Active' })
    setSelected(null)
    setModal('add')
  }

  const openEdit = (user: AdminUser) => {
    if (!canManageUser(actorRole, user.role)) {
      toast('Permission denied', 'error', 'You cannot manage this account.')
      return
    }
    setSelected(user)
    form.reset({ name: user.name, email: user.email, contactNumber: user.contactNumber, password: '', role: user.role, status: user.status })
    setModal('edit')
  }

  const onSubmit = (values: FormValues) => {
    const role = values.role as UserRole
    const status = values.status as AdminUser['status']
    const email = values.email.trim().toLowerCase()

    if (!canManageUsers) {
      toast('Permission denied', 'error', 'You are not authorized to manage users.')
      return
    }
    if (!canAssignRole(actorRole, role)) {
      toast('Permission denied', 'error', 'You cannot assign this role.')
      return
    }
    if (data.admins.some(u => u.email.toLowerCase() === email && u.id !== selected?.id)) {
      toast('Email already exists', 'error', 'Use a different email address.')
      return
    }
    if (modal === 'add' && !values.password) {
      toast('Password is required', 'error', 'Set an initial password for the new account.')
      return
    }
    if (modal === 'edit' && selected) {
      if (!canManageUser(actorRole, selected.role)) {
        toast('Permission denied', 'error', 'You cannot modify this account.')
        return
      }
      if (isLastActiveSuperAdmin(selected) && (role !== 'Super Admin' || status !== 'Active')) {
        toast('Action blocked', 'error', 'The last active Super Admin cannot be demoted or deactivated.')
        return
      }
    }

    if (modal === 'add') {
      const record: AdminUser = {
        id: `ADM-${Date.now().toString().slice(-4)}`,
        name: values.name.trim(),
        email: values.email.trim(),
        contactNumber: values.contactNumber.trim(),
        password: values.password || undefined,
        role,
        status,
        lastLogin: '—',
        createdAt: new Date().toISOString(),
      }
      setData(prev => ({ ...prev, admins: [record, ...prev.admins] }))
      audit('Created user account', 'User Management', `${record.name} (${record.role})`, 'Success', record.id)
      toast('User created', 'success', record.name)
    } else if (selected) {
      setData(prev => ({
        ...prev,
        admins: prev.admins.map(u => u.id === selected.id ? {
          ...u,
          name: values.name.trim(),
          email: values.email.trim(),
          contactNumber: values.contactNumber.trim(),
          password: values.password ? values.password : u.password,
          role,
          status,
        } : u),
      }))
      audit('Updated user account', 'User Management', `${values.name} (${role})`, 'Success', selected.id)
      toast('User updated', 'success', values.name)
    }
    setModal(null)
  }

  const toggleStatus = (user: AdminUser) => {
    if (!canManageUser(actorRole, user.role)) {
      toast('Permission denied', 'error', 'You cannot manage this account.')
      return
    }
    if (isLastActiveSuperAdmin(user)) {
      toast('Action blocked', 'error', 'The last active Super Admin cannot be deactivated.')
      return
    }
    const next = user.status === 'Active' ? 'Inactive' : 'Active'
    setData(prev => ({ ...prev, admins: prev.admins.map(u => u.id === user.id ? { ...u, status: next } : u) }))
    audit('Changed account status', 'User Management', `${user.name} set to ${next}`, 'Success', user.id)
    toast('Status updated', 'success', `${user.name} is now ${next}.`)
  }

  const confirmDelete = () => {
    if (!deleteId) return
    const user = data.admins.find(u => u.id === deleteId)
    if (!user) { setDeleteId(null); return }
    if (!canManageUser(actorRole, user.role)) {
      toast('Permission denied', 'error', 'You cannot manage this account.')
      setDeleteId(null)
      return
    }
    if (isLastActiveSuperAdmin(user)) {
      toast('Action blocked', 'error', 'The last active Super Admin cannot be removed.')
      setDeleteId(null)
      return
    }
    setData(prev => ({ ...prev, admins: prev.admins.filter(u => u.id !== deleteId) }))
    audit('Removed user account', 'User Management', user.name, 'Success', user.id)
    toast('User removed', 'success', user.name)
    setDeleteId(null)
  }

  const submitReset = () => {
    if (!resetTarget) return
    if (!canManageUser(actorRole, resetTarget.role)) {
      toast('Permission denied', 'error', 'You cannot manage this account.')
      return
    }
    if (resetPassword.length < 6) {
      toast('Invalid password', 'error', 'Password must be at least 6 characters.')
      return
    }
    if (resetPassword !== resetConfirm) {
      toast('Passwords do not match', 'error', 'Confirm the new password.')
      return
    }
    setData(prev => ({ ...prev, admins: prev.admins.map(u => u.id === resetTarget.id ? { ...u, password: resetPassword, forcePasswordChange: false } : u) }))
    audit('Reset user password', 'User Management', `${resetTarget.name} password reset (simulated)`, 'Success', resetTarget.id)
    toast('Password reset', 'success', `${resetTarget.name}'s password was updated.`)
    setResetTarget(null)
    setResetPassword('')
    setResetConfirm('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        description="Manage user accounts, roles, account status, and access levels."
        actions={canManageUsers ? <Button onClick={openAdd}><Plus className="h-4 w-4" />Add User</Button> : undefined}
      />
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, or role..." className="pl-9" />
            </div>
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} options={[{ value: '', label: 'All roles' }, ...ALL_ROLES.map(r => ({ value: r, label: r }))]} />
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={[{ value: '', label: 'All statuses' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
          </div>

          <DataTable<AdminUser>
            data={filtered}
            onRowClick={user => navigate(`/system/admins/${user.id}`)}
            columns={[
              { key: 'name', header: 'Full Name', render: user => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><UserCog className="h-4 w-4" /></div>
                  <div><p className="font-medium text-slate-900">{user.name}</p><p className="text-xs text-slate-500">{user.contactNumber}</p></div>
                </div>
              ), value: user => user.name },
              { key: 'email', header: 'Email Address', render: user => user.email, value: user => user.email },
              { key: 'role', header: 'Role', render: user => <Badge value={user.role} variant="blue" />, value: user => user.role },
              { key: 'status', header: 'Account Status', render: user => <Badge value={user.status} />, value: user => user.status },
              { key: 'lastLogin', header: 'Last Login', render: user => formatDate(user.lastLogin === '—' ? undefined : user.lastLogin), value: user => user.lastLogin },
              { key: 'createdAt', header: 'Date Created', render: user => formatDate(user.createdAt), value: user => user.createdAt },
              { key: 'actions', header: 'Actions', sortable: false, render: user => {
                const manageable = canManageUser(actorRole, user.role)
                return (
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" onClick={() => navigate(`/system/admins/${user.id}`)} aria-label="View user"><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" disabled={!manageable} onClick={() => openEdit(user)} aria-label="Edit user"><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" disabled={!manageable || isLastActiveSuperAdmin(user)} onClick={() => toggleStatus(user)} aria-label="Toggle status">
                      {user.status === 'Active' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" disabled={!manageable} onClick={() => { setResetTarget(user); setResetPassword(''); setResetConfirm('') }} aria-label="Reset password"><KeyRound className="h-4 w-4" /></Button>
                  </div>
                )
              } },
            ]}
          />
        </CardContent>
      </Card>

      <Sheet open={modal === 'add'} onOpenChange={(open) => !open && setModal(null)}>
        <SheetContent title="Add User" description="Create a new user account and assign an initial role.">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="flex-1 space-y-4 p-6">
              <Field label="Full Name" error={form.formState.errors.name?.message}><Input {...form.register('name')} placeholder="John Doe" /></Field>
              <Field label="Email" error={form.formState.errors.email?.message}><Input {...form.register('email')} type="email" placeholder="johndoe@gatevision.ph" /></Field>
              <Field label="Contact Number" error={form.formState.errors.contactNumber?.message}><Input {...form.register('contactNumber')} placeholder="+63 917 123 4567" /></Field>
              <Field label="Password" error={form.formState.errors.password?.message} hint="Minimum 6 characters. Simulated only.">
                <Input {...form.register('password')} type="password" placeholder="Enter password" />
              </Field>
              <Field label="Role">
                <Select {...form.register('role')} options={assignableRoles.map(role => ({ value: role, label: role }))} />
              </Field>
              <Field label="Status">
                <Select {...form.register('status')} options={['Active', 'Inactive'].map(v => ({ value: v, label: v }))} />
              </Field>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={modal === 'edit'} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent title="Edit User" className="max-w-xl">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 p-6">
              <Field layout="inline" label="Full Name" error={form.formState.errors.name?.message}><Input {...form.register('name')} placeholder="John Doe" /></Field>
              <Field layout="inline" label="Email" error={form.formState.errors.email?.message}><Input {...form.register('email')} type="email" placeholder="johndoe@gatevision.ph" /></Field>
              <Field layout="inline" label="Contact Number" error={form.formState.errors.contactNumber?.message}><Input {...form.register('contactNumber')} placeholder="+63 917 123 4567" /></Field>
              <Field layout="inline" label="Password" error={form.formState.errors.password?.message} hint="Leave blank to keep the current password.">
                <Input {...form.register('password')} type="password" placeholder="Leave blank to keep current password" />
              </Field>
              <Field layout="inline" label="Role">
                <Select {...form.register('role')} options={assignableRoles.map(role => ({ value: role, label: role }))} />
              </Field>
              <Field layout="inline" label="Status">
                <Select {...form.register('status')} options={['Active', 'Inactive'].map(v => ({ value: v, label: v }))} />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <DialogContent title="Reset Password" description={resetTarget ? `Set a new password for ${resetTarget.name}.` : undefined}>
          <div className="space-y-4 p-6">
            <Field label="New Password"><Input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Minimum 6 characters" /></Field>
            <Field label="Confirm Password"><Input type="password" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} placeholder="Re-enter password" /></Field>
            <p className="text-xs text-slate-500">Simulated password reset workflow. No email or secure token service is used.</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
              <Button onClick={submitReset}>Reset Password</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remove user account"
        description="This removes the simulated user account. This action cannot be undone."
        destructive
        confirmLabel="Remove"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
