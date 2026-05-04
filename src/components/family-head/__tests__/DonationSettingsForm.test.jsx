import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { DonationSettingsForm } from '../DonationSettingsForm.jsx'
import { useFamilyHeadStore } from '../../../stores/familyHeadStore.js'

beforeEach(() => {
  useFamilyHeadStore.setState({
    settingsLoading: false,
    settingsError: null,
    updateSettings: vi.fn().mockResolvedValue({ ok: true }),
  })
})

describe('DonationSettingsForm', () => {
  it('renders three wall-mode options', () => {
    render(<DonationSettingsForm memorialId="m1" initial={{ wall_mode: 'full' }} />)
    expect(screen.getByText('Full')).toBeInTheDocument()
    expect(screen.getByText('Names only')).toBeInTheDocument()
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('seeds the form from initial values', () => {
    render(
      <DonationSettingsForm
        memorialId="m1"
        initial={{ wall_mode: 'names_only', goal_amount_pesewas: 5000000, paused: true }}
      />
    )
    const namesOnlyRadio = screen.getByLabelText(/names only/i, { exact: false })
    expect(namesOnlyRadio.checked).toBe(true)
    expect(screen.getByLabelText(/donation goal/i).value).toBe('50000')
    expect(screen.getByLabelText(/pause donations/i, { exact: false }).checked).toBe(true)
  })

  it('calls updateSettings on submit with correct body', async () => {
    const updateSettings = vi.fn().mockResolvedValue({ ok: true })
    useFamilyHeadStore.setState({ updateSettings })
    render(<DonationSettingsForm memorialId="mem_abc" initial={{ wall_mode: 'full' }} />)
    fireEvent.change(screen.getByLabelText(/donation goal/i), { target: { value: '500' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await new Promise((r) => setTimeout(r, 0))
    expect(updateSettings).toHaveBeenCalledWith('mem_abc', {
      wall_mode: 'full',
      goal_amount_pesewas: 50000,
      paused: false,
    })
  })

  it('shows saving state while loading', () => {
    useFamilyHeadStore.setState({ settingsLoading: true })
    render(<DonationSettingsForm memorialId="m1" initial={{ wall_mode: 'full' }} />)
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('shows error when settingsError is set', () => {
    useFamilyHeadStore.setState({ settingsError: 'Something went wrong' })
    render(<DonationSettingsForm memorialId="m1" initial={{ wall_mode: 'full' }} />)
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
