import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './components/ui/Toast'

describe('dashboard smoke', () => {
  it('renders the dashboard and navigates to vehicles', async () => {
    localStorage.setItem('gatevision.session', JSON.stringify({
      user: { id: 'ADM-01', name: 'Adrian Velasco', email: 'adrian.velasco@gatevision.ph', role: 'Super Admin', status: 'Active' },
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }))
    render(<AppProvider><ToastProvider><App /></ToastProvider></AppProvider>)
    expect(await screen.findByRole('heading', { name: /Dashboard/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: /Registered Vehicles/i }))
    expect(await screen.findByText(/Manage registered vehicles/i)).toBeInTheDocument()
  })
})
