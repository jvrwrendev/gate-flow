import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Card, CardContent } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { REMEMBER_KEY, setSession } from '@/auth/session'
import logo from '@/assets/logo.png'

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <img src={logo} alt="GATEGUARD logo" className="mx-auto h-12 w-auto object-contain" />
          <p className="mt-4 text-sm font-medium tracking-wide text-slate-500">GATEGUARD Administration</p>
        </div>

        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Welcome Back</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-[15px]">
                Sign in to your GATEGUARD account.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Field label="Email" error={form.formState.errors.email?.message} htmlFor="login-email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...form.register('email')}
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="h-11 pl-10 text-[15px]"
                  />
                </div>
              </Field>

              <Field label="Password" error={form.formState.errors.password?.message} htmlFor="login-password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...form.register('password')}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-11 pl-10 pr-11 text-[15px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(value => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <Checkbox
                    checked={Boolean(form.watch('remember'))}
                    onCheckedChange={(checked) => form.setValue('remember', checked === true)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast('Password reset', 'info', 'Contact an administrator to reset your password.')}
                  className="text-left text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 sm:text-right"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" loading={form.formState.isSubmitting} className="h-11 w-full text-[15px]">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} GATEGUARD. All rights reserved.
        </p>
      </div>
    </div>
  )
}