import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { PhonePinSignupDialog } from '../PhonePinSignupDialog'

vi.mock('../../../utils/phonePinApi.js', () => ({
  phonePinApi: { signup: vi.fn() },
  PhonePinError: class PhonePinError extends Error {
    constructor(message, status, body) {
      super(message)
      this.status = status
      this.body = body || {}
    }
  },
}))

import { phonePinApi } from '../../../utils/phonePinApi.js'

function fillPin(getByLabelText, label, digits) {
  for (let i = 0; i < digits.length; i++) {
    fireEvent.change(getByLabelText(`${label} digit ${i + 1}`), {
      target: { value: digits[i] },
    })
  }
}

describe('PhonePinSignupDialog', () => {
  beforeEach(() => {
    phonePinApi.signup.mockReset()
  })
  afterEach(() => vi.clearAllTimers())

  it('does not render when open=false', () => {
    const { queryByText } = render(<PhonePinSignupDialog open={false} onOpenChange={() => {}} />)
    expect(queryByText('Create your account')).toBeNull()
  })

  it('renders all required fields when open', () => {
    const { getByText, getByLabelText } = render(
      <PhonePinSignupDialog open={true} onOpenChange={() => {}} />,
    )
    expect(getByText('Create your account')).toBeTruthy()
    expect(getByLabelText('Full name')).toBeTruthy()
    expect(getByLabelText('Email')).toBeTruthy()
    expect(getByLabelText('Phone number')).toBeTruthy()
    expect(getByLabelText('PIN digit 1')).toBeTruthy()
    expect(getByLabelText('Confirm PIN digit 1')).toBeTruthy()
  })

  it('disables submit when form is incomplete', () => {
    const { getByText } = render(<PhonePinSignupDialog open={true} onOpenChange={() => {}} />)
    const button = getByText('Create account').closest('button')
    expect(button.disabled).toBe(true)
  })

  it('shows error when PINs do not match', async () => {
    const { getByText, getByLabelText, findByText } = render(
      <PhonePinSignupDialog open={true} onOpenChange={() => {}} />,
    )
    fireEvent.change(getByLabelText('Full name'), { target: { value: 'Ama' } })
    fireEvent.change(getByLabelText('Email'), { target: { value: 'ama@test.com' } })
    fireEvent.change(getByLabelText('Phone number'), { target: { value: '241234567' } })
    fillPin(getByLabelText, 'PIN', '1111')
    fillPin(getByLabelText, 'Confirm PIN', '2222')

    fireEvent.click(getByText('Create account'))
    expect(await findByText('PINs do not match')).toBeTruthy()
    expect(phonePinApi.signup).not.toHaveBeenCalled()
  })

  it('calls api and shows success copy on happy path', async () => {
    phonePinApi.signup.mockResolvedValueOnce({ userId: 'u1', message: 'ok' })
    const onOpenChange = vi.fn()
    const { getByText, getByLabelText, findByText } = render(
      <PhonePinSignupDialog open={true} onOpenChange={onOpenChange} />,
    )
    fireEvent.change(getByLabelText('Full name'), { target: { value: 'Ama' } })
    fireEvent.change(getByLabelText('Email'), { target: { value: 'ama@test.com' } })
    fireEvent.change(getByLabelText('Phone number'), { target: { value: '241234567' } })
    fillPin(getByLabelText, 'PIN', '1111')
    fillPin(getByLabelText, 'Confirm PIN', '1111')

    fireEvent.click(getByText('Create account'))
    await waitFor(() => expect(phonePinApi.signup).toHaveBeenCalled())
    expect(await findByText(/Check your email to verify/)).toBeTruthy()
  })

  it('surfaces 409 (taken) with a friendly message', async () => {
    const err = new Error('Already taken')
    err.status = 409
    phonePinApi.signup.mockRejectedValueOnce(err)
    const { getByText, getByLabelText, findByText } = render(
      <PhonePinSignupDialog open={true} onOpenChange={() => {}} />,
    )
    fireEvent.change(getByLabelText('Full name'), { target: { value: 'Ama' } })
    fireEvent.change(getByLabelText('Email'), { target: { value: 'ama@test.com' } })
    fireEvent.change(getByLabelText('Phone number'), { target: { value: '241234567' } })
    fillPin(getByLabelText, 'PIN', '1111')
    fillPin(getByLabelText, 'Confirm PIN', '1111')

    fireEvent.click(getByText('Create account'))
    expect(await findByText(/already registered/i)).toBeTruthy()
  })
})
