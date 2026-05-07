import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'

const MEMORIAL = {
  id: 'mem_abc',
  family_head_name: 'Akosua Mensah',
  family_head_phone: '+233244111222',
  deceased_name: 'Akua Mensah',
  dates: '1948 — 2025',
  creator_name: 'Kwame B.',
  donation: {
    payout_momo_provider: 'mtn',
    payout_momo_number: '+233244111222',
    payout_account_name: 'Akosua Mensah',
    goal_amount_pesewas: 5000000,
    wall_mode: 'full',
  },
}

afterEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
})

describe('FamilyHeadApprovalView (post-OTP-removal — token is the gate)', () => {
  it('renders memorial details and decision buttons immediately (no OTP step)', async () => {
    const { FamilyHeadApprovalView: View } = await import('../FamilyHeadApprovalView.jsx')
    render(<View memorial={MEMORIAL} token="tok_xyz" />)
    expect(screen.getByText('Akua Mensah')).toBeInTheDocument()
    expect(screen.getByText(/MTN MoMo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^approve$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^reject$/i })).toBeInTheDocument()
    // OTP UI is gone
    expect(screen.queryByText(/SMS code/i)).toBeNull()
    expect(screen.queryByText(/code sent to/i)).toBeNull()
  })

  it('approves with token + phone (no otp_code)', async () => {
    const approve = vi.fn().mockResolvedValue({ ok: true })
    vi.doMock('../../../utils/donationApi.js', () => ({
      donationApi: { approve, reject: vi.fn() },
    }))
    const { FamilyHeadApprovalView: View } = await import('../FamilyHeadApprovalView.jsx')
    render(<View memorial={MEMORIAL} token="tok_xyz" />)
    fireEvent.click(screen.getByRole('button', { name: /^approve$/i }))
    await waitFor(() => {
      expect(approve).toHaveBeenCalledWith('mem_abc', {
        token: 'tok_xyz',
        phone: '+233244111222',
      })
      expect(screen.getByText(/^✓ Approved$/)).toBeInTheDocument()
    })
  })

  it('rejects with token + phone + reason (no otp_code)', async () => {
    const reject = vi.fn().mockResolvedValue({ ok: true })
    vi.doMock('../../../utils/donationApi.js', () => ({
      donationApi: { approve: vi.fn(), reject },
    }))
    const { FamilyHeadApprovalView: View } = await import('../FamilyHeadApprovalView.jsx')
    render(<View memorial={MEMORIAL} token="tok_xyz" />)
    fireEvent.click(screen.getByRole('button', { name: /^reject$/i }))
    fireEvent.change(screen.getByPlaceholderText(/reason/i), {
      target: { value: 'Not the right family head' },
    })
    fireEvent.click(screen.getByRole('button', { name: /confirm reject/i }))
    await waitFor(() => {
      expect(reject).toHaveBeenCalledWith('mem_abc', {
        token: 'tok_xyz',
        phone: '+233244111222',
        reason: 'Not the right family head',
      })
      expect(screen.getByText(/^✗ Rejected$/)).toBeInTheDocument()
    })
  })

  it('surfaces backend error message when approve fails', async () => {
    const approve = vi.fn().mockRejectedValue(new Error('Approval link expired'))
    vi.doMock('../../../utils/donationApi.js', () => ({
      donationApi: { approve, reject: vi.fn() },
    }))
    const { FamilyHeadApprovalView: View } = await import('../FamilyHeadApprovalView.jsx')
    render(<View memorial={MEMORIAL} token="tok_xyz" />)
    fireEvent.click(screen.getByRole('button', { name: /^approve$/i }))
    await waitFor(() => {
      expect(screen.getByText(/approval link expired/i)).toBeInTheDocument()
    })
  })

  it('Cancel from rejecting stage returns to decision', async () => {
    const { FamilyHeadApprovalView: View } = await import('../FamilyHeadApprovalView.jsx')
    render(<View memorial={MEMORIAL} token="tok_xyz" />)
    fireEvent.click(screen.getByRole('button', { name: /^reject$/i }))
    expect(screen.getByPlaceholderText(/reason/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.queryByPlaceholderText(/reason/i)).toBeNull()
    expect(screen.getByRole('button', { name: /^approve$/i })).toBeInTheDocument()
  })
})
