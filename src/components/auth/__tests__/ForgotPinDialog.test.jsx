import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { ForgotPinDialog } from '../ForgotPinDialog'

vi.mock('../../../utils/phonePinApi.js', () => ({
  phonePinApi: { forgot: vi.fn() },
}))

import { phonePinApi } from '../../../utils/phonePinApi.js'

describe('ForgotPinDialog', () => {
  beforeEach(() => phonePinApi.forgot.mockReset())

  it('renders phone input when open', () => {
    const { getByText, getByLabelText } = render(
      <ForgotPinDialog open={true} onOpenChange={() => {}} />,
    )
    expect(getByText('Reset your PIN')).toBeTruthy()
    expect(getByLabelText('Phone number')).toBeTruthy()
  })

  it('disables submit when phone is empty', () => {
    const { getByText } = render(<ForgotPinDialog open={true} onOpenChange={() => {}} />)
    expect(getByText('Send reset link').closest('button').disabled).toBe(true)
  })

  it('shows enumeration-safe success copy on success', async () => {
    phonePinApi.forgot.mockResolvedValueOnce({})
    const { getByText, getByLabelText, findByText } = render(
      <ForgotPinDialog open={true} onOpenChange={() => {}} />,
    )
    fireEvent.change(getByLabelText('Phone number'), { target: { value: '241234567' } })
    fireEvent.click(getByText('Send reset link'))
    await waitFor(() => expect(phonePinApi.forgot).toHaveBeenCalled())
    expect(await findByText(/If an account matches/i)).toBeTruthy()
  })

  it('shows the same enumeration-safe success copy on error', async () => {
    const err = new Error('Not found')
    err.status = 404
    phonePinApi.forgot.mockRejectedValueOnce(err)
    const { getByText, getByLabelText, findByText } = render(
      <ForgotPinDialog open={true} onOpenChange={() => {}} />,
    )
    fireEvent.change(getByLabelText('Phone number'), { target: { value: '241234567' } })
    fireEvent.click(getByText('Send reset link'))
    expect(await findByText(/If an account matches/i)).toBeTruthy()
  })
})
