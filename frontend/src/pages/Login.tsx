import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { REMEMBER_KEY, setSession } from '@/auth/session'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const rememberedEmail = typeof window !== 'undefined' ? localStorage.getItem(REMEMBER_KEY) : null

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: rememberedEmail || '',
      password: '',
      remember: Boolean(rememberedEmail),
    },
  })

  const onSubmit = async (values: FormValues) => {
    await new Promise(resolve => window.setTimeout(resolve, 500))
    const email = values.email.trim().toLowerCase()
    const user = data.admins.find(a => a.email.toLowerCase() === email)

    if (!user || (user.password && user.password !== values.password)) {
      audit('Failed login attempt', 'Authentication', `Failed login for ${values.email}`, 'Failed')
      toast('Invalid credentials', 'error', 'Check your email and password.')
      return
    }

    if (user.status !== 'Active') {
      audit('Blocked login (inactive account)', 'Authentication', `${user.email} attempted login`, 'Failed', user.id)
      toast('Account inactive', 'error', 'Contact an administrator to activate your account.')
      return
    }

    const now = new Date().toISOString()
    setData(prev => ({
      ...prev,
      admins: prev.admins.map(a => a.id === user.id ? { ...a, lastLogin: now } : a),
    }))

    setSession({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }, values.remember)

    if (values.remember) localStorage.setItem(REMEMBER_KEY, user.email)
    else localStorage.removeItem(REMEMBER_KEY)

    audit('Successful login', 'Authentication', `${user.name} signed in`, 'Success', user.id)
    toast('Welcome back', 'success', `${user.name} signed in successfully.`)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-slate-900 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-tight">GateVision</p>
                <p className="text-xs text-slate-300">Barrier Gate Console</p>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <h1 className="font-display text-4xl font-extrabold tracking-tight">
                Secure access to your barrier gate operations.
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Monitor cameras, review recognition events, manage vehicles, and simulate gate controls from one professional dashboard.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Mock authentication</p>
              <p className="mt-2 text-sm text-slate-300">
                Sign in with a user account from User Management. Frontend-only RBAC is enabled for this environment.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Simulated authentication only. No backend, identity provider, or secure session is used.
            </p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold tracking-tight text-slate-950">GateVision</p>
                  <p className="text-xs text-slate-500">Barrier Gate Console</p>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-950">Sign in</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter your administrator credentials to access the dashboard.
                  </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <Field label="Email" error={form.formState.errors.email?.message}>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        {...form.register('email')}
                        type="email"
                        autoComplete="email"
                        placeholder="johndoe@gatevision.ph"
                        className="pl-9"
                      />
                    </div>
                  </Field>

                  <Field label="Password" error={form.formState.errors.password?.message}>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        {...form.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="pl-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(value => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        {...form.register('remember')}
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => toast('Password reset simulated', 'info', 'Contact an administrator to reset your password.')}
                      className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                    Sign in
                  </Button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-500">
                  Simulated login for the admin dashboard. No real authentication is performed.
                </p>
              </CardContent>
            </Card>

            <div className="mt-4 flex justify-center">
              <Badge value="Mock RBAC" variant="secondary" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
