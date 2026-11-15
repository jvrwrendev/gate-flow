import { useState } from 'react'
import { LogOut, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'

export function Logout() {
  const navigate = useNavigate(); const { audit } = useApp(); const { toast } = useToast()
  const [ended, setEnded] = useState(false)
  const confirm = () => { audit('Logout','System','Administrator signed out (simulated)'); toast('Session ended','info'); setEnded(true) }
  if (ended) return <div className="flex min-h-[60vh] items-center justify-center"><Card className="max-w-md"><CardContent className="p-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600"><LogOut className="h-6 w-6" /></div><h1 className="mt-4 font-display text-2xl font-extrabold text-slate-950">Session Ended</h1><p className="mt-2 text-sm text-slate-500">This is a simulated logout. No authentication provider was used. You can return to the dashboard at any time.</p><Button className="mt-5" onClick={()=>{setEnded(false);navigate('/dashboard')}}><RotateCcw className="h-4 w-4" />Return to Dashboard</Button></CardContent></Card></div>
  return <div className="space-y-5">
    <PageHeader title="Logout" description="Simulated session termination. No authentication integration is implemented." />
    <Card><CardContent className="max-w-lg p-6"><p className="text-sm text-slate-600">Signing out will end the simulated administrator session and record an audit entry. All dashboard data remains stored locally.</p><div className="mt-5 flex gap-2"><Button variant="destructive" onClick={confirm}><LogOut className="h-4 w-4" />Confirm Logout</Button><Button variant="outline" onClick={()=>navigate('/dashboard')}>Cancel</Button></div></CardContent></Card>
  </div>
}
export function NotFound() { return <div className="flex min-h-[60vh] items-center justify-center"><Card className="max-w-md"><CardContent className="p-8 text-center"><h1 className="font-display text-3xl font-extrabold text-slate-950">404</h1><p className="mt-2 text-sm text-slate-500">The requested page could not be found.</p><Button className="mt-5" onClick={()=>window.location.href='/dashboard'}>Go to Dashboard</Button></CardContent></Card></div> }
