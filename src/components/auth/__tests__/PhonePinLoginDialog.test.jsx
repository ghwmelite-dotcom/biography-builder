import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { PhonePinLoginDialog } from '../PhonePinLoginDialog'

vi.mock('../../../utils/phonePinApi.js', () => ({
  phonePinApi: { login: vi.fn() },
  PhonePinError: class PhonePinError extends Error {
    constructor(message, status, body) {
      super(message)
      this.status = status
      this.body = body || {}
    }
  },
}))

vi.mock('../../../stores/authStore.js', () => ({
  useAuthStore: { getState: () => ({ setSession: vi.fn() }) },
}))

import { phonePinApi } from '../../../utils/phonePinApi.js'

function fillPin(getByLabelText, label, digits) {
  for (let i = 0; i < digits.length; i++) {
    fireEvent.change(getByLabelText(`${label} digit ${i + 1}`), {
      target: { value: digits[i] },
    })
  }
}

describe('PhonePinLoginDialog', () => {
  beforeEach(() => phonePinApi.login.mockReset())

  it('does not render when open=false', () => {
    const { queryByText } = render(<PhonePinLoginDialog open={false} onOpenChange={() => {}} />)
    expect(queryByText('Sign in with phone')).toBeNull()
  })

  it('renders required fields when open', () => {
    const { getByText, getByLabelText } = render(
      <PhonePinLoginDialog open={true} onOpenChange={() => {}} />,
    )
    expect(getByText('Sign in with phone')).toBeTruthy()
    expect(getByLabelText('Phone number')).toBeTruthy()
    expect(getByLabelText('PIN digit 1')).toBeTruthy()
    expect(getByText('Forgot PIN?')).toBeTruthy()
  })

  it('disables Sign in until phone + 6 digit PIN are entered', () => {
    const { getByText } = render(<PhonePinLoginDialog open={true} onOpenChange={() => {}} />)
    expect(getByText('Sign in').closest('button').disabled).toBe(true)
  })

  it('calls api on submit and closes dialog on success', async () => {
    phonePinApi.login.mockResolvedValueOnce({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: '1', email: 'a@b.c', email_verified_at: null },
    })
    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()
    const { getByText, getByLabelText } = render(
      <PhonePinLoginDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />,
    )
    fireEvent.change(getByLabelText('Phone number'), { target: { value: '241234567' } })
    fillPin(getByLabelText, 'PIN', '111111')
    fireEvent.click(getByText('Sign in'))

    await waitFor(() => expect(phonePinApi.login).toHaveBeenCalled())
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows generic error on 401', async () => {
    const err = new Error('Wrong')
    err.status = 401
    err.body = {}
    phonePinApi.login.mockRejectedValueOnce(err)
    const { getByText, getByLabelText, findByText } = render(
      <PhonePinLoginDialog open={true} onOpenChange={() => {}} />,
    )
    fireEvent.change(getByLabelText('Phone number'), { target: { value: '241234567' } })
    fillPin(getByLabelText, 'PIN', '111111')
    fireEvent.click(getByText('Sign in'))
    expect(await findByText('Wrong phone or PIN.')).toBeTruthy()
  })

  it('surfaces lockout retry-after on 423', async () => {
    const err = new Error('Locked')
    err.status = 423
    err.body = { retry_after_ms: 30 * 60 * 1000 }
    phonePinApi.login.mockRejectedValueOnce(err)
    const { getByText, getByLabelText, findByText } = render(
      <PhonePinLoginDialog open={true} onOpenChange={() => {}} />,
    )
    fireEvent.change(getByLabelText('Phone number'), { target: { value: '241234567' } })
    fillPin(getByLabelText, 'PIN', '111111')
    fireEvent.click(getByText('Sign in'))
    expect(await findByText(/locked temporarily/i)).toBeTruthy()
    expect(await findByText(/Try again in about 30 minutes/i)).toBeTruthy()
  })
})
