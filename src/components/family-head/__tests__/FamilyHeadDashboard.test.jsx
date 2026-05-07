import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FamilyHeadDashboard } from '../FamilyHeadDashboard.jsx'
import { useDonationStore } from '../../../stores/donationStore.js'

const MEMORIAL = {
  id: 'mem_abc',
  slug: 'akua-mensah',
  deceased_name: 'Akua Mensah',
  dates: '1948 — 2025',
  donation: {
    enabled: true,
    approval_status: 'approved',
    wall_mode: 'full',
    payout_momo_provider: 'mtn',
    payout_momo_number: '+233244111222',
    payout_account_name: 'Akosua Mensah',
    total_raised_pesewas: 50000,
    total_donor_count: 7,
  },
}

beforeEach(() => {
  useDonationStore.setState({ walls: {} })
})

describe('FamilyHeadDashboard', () => {
  it('renders memorial name and dates', () => {
    render(
      <MemoryRouter>
        <FamilyHeadDashboard memorial={MEMORIAL} />
      </MemoryRouter>
    )
    expect(screen.getByText('Akua Mensah')).toBeInTheDocument()
    expect(screen.getByText('1948 — 2025')).toBeInTheDocument()
  })

  it('renders total raised + donor count from memorial fallback values', () => {
    render(
      <MemoryRouter>
        <FamilyHeadDashboard memorial={MEMORIAL} />
      </MemoryRouter>
    )
    expect(screen.getByText(/total raised/i)).toBeInTheDocument()
    // 7 donors
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('shows masked payout info', () => {
    render(
      <MemoryRouter>
        <FamilyHeadDashboard memorial={MEMORIAL} />
      </MemoryRouter>
    )
    expect(screen.getByText(/MTN MoMo/i)).toBeInTheDocument()
    expect(screen.getByText(/\*\*\*\*222/)).toBeInTheDocument()
  })

  it('directs payout-edit requests to support email (self-service editing on roadmap)', () => {
    render(
      <MemoryRouter>
        <FamilyHeadDashboard memorial={MEMORIAL} />
      </MemoryRouter>
    )
    expect(screen.getByText(/support@funeralpress\.org/i)).toBeInTheDocument()
    expect(screen.getByText(/self-service editing.*roadmap/i)).toBeInTheDocument()
  })

  it('shows pending-approval pill when approval_status is pending', () => {
    render(
      <MemoryRouter>
        <FamilyHeadDashboard memorial={{ ...MEMORIAL, donation: { ...MEMORIAL.donation, approval_status: 'pending' } }} />
      </MemoryRouter>
    )
    expect(screen.getByText(/awaiting your approval/i)).toBeInTheDocument()
  })

  it('shows empty-state message when no donations', () => {
    render(
      <MemoryRouter>
        <FamilyHeadDashboard memorial={MEMORIAL} />
      </MemoryRouter>
    )
    expect(screen.getByText(/no donations yet/i)).toBeInTheDocument()
  })
})
