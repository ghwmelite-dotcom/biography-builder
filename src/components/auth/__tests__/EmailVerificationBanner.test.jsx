import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { EmailVerificationBanner } from '../EmailVerificationBanner'
import { useAuthStore } from '../../../stores/authStore'

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null })
  })

  it('renders nothing when user is anonymous', () => {
    const { container } = render(<EmailVerificationBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when email is verified', () => {
    useAuthStore.setState({
      user: { id: '1', email_verified_at: '2026-01-01T00:00:00Z' },
    })
    const { container } = render(<EmailVerificationBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('renders banner when user is logged in but unverified', () => {
    useAuthStore.setState({ user: { id: '1', email_verified_at: null } })
    const { getByText } = render(<EmailVerificationBanner />)
    expect(getByText(/verify your email/i)).toBeTruthy()
    expect(getByText('Resend verification email')).toBeTruthy()
  })

  it('hides itself after dismiss is clicked', () => {
    useAuthStore.setState({ user: { id: '1', email_verified_at: null } })
    const { getByLabelText, queryByText } = render(<EmailVerificationBanner />)
    fireEvent.click(getByLabelText('Dismiss'))
    expect(queryByText('Resend verification email')).toBeNull()
  })

  it('warns to console when resend is clicked (endpoint not yet wired)', () => {
    useAuthStore.setState({ user: { id: '1', email_verified_at: null } })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { getByText } = render(<EmailVerificationBanner />)
    fireEvent.click(getByText('Resend verification email'))
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
