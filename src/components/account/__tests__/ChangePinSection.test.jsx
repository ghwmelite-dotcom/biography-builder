import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import ChangePinSection from '../ChangePinSection'

vi.mock('../../../utils/phonePinApi.js', () => ({
  phonePinApi: { changePin: vi.fn() },
}))

import { phonePinApi } from '../../../utils/phonePinApi.js'

function fillPin(getByLabelText, label, digits) {
  for (let i = 0; i < digits.length; i++) {
    fireEvent.change(getByLabelText(`${label} digit ${i + 1}`), {
      target: { value: digits[i] },
    })
  }
}

describe('ChangePinSection', () => {
  beforeEach(() => phonePinApi.changePin.mockReset())

  it('renders the three PIN inputs', () => {
    const { getByLabelText, getByText } = render(<ChangePinSection />)
    expect(getByText('Change your PIN')).toBeTruthy()
    expect(getByLabelText('Current PIN digit 1')).toBeTruthy()
    expect(getByLabelText('New PIN digit 1')).toBeTruthy()
    expect(getByLabelText('Confirm new PIN digit 1')).toBeTruthy()
  })

  it('disables submit when fields are incomplete', () => {
    const { getByText } = render(<ChangePinSection />)
    expect(getByText('Save new PIN').closest('button').disabled).toBe(true)
  })

  it('errors when new PINs do not match', async () => {
    const { getByLabelText, getByText, findByText } = render(<ChangePinSection />)
    fillPin(getByLabelText, 'Current PIN', '1111')
    fillPin(getByLabelText, 'New PIN', '2222')
    fillPin(getByLabelText, 'Confirm new PIN', '3333')
    fireEvent.click(getByText('Save new PIN'))
    expect(await findByText('New PINs do not match')).toBeTruthy()
    expect(phonePinApi.changePin).not.toHaveBeenCalled()
  })

  it('errors when new PIN equals current PIN', async () => {
    const { getByLabelText, getByText, findByText } = render(<ChangePinSection />)
    fillPin(getByLabelText, 'Current PIN', '1111')
    fillPin(getByLabelText, 'New PIN', '1111')
    fillPin(getByLabelText, 'Confirm new PIN', '1111')
    fireEvent.click(getByText('Save new PIN'))
    expect(await findByText(/must differ/i)).toBeTruthy()
  })

  it('calls api with current and new PINs on success', async () => {
    phonePinApi.changePin.mockResolvedValueOnce({ message: 'ok' })
    const { getByLabelText, getByText, findByText } = render(<ChangePinSection />)
    fillPin(getByLabelText, 'Current PIN', '1111')
    fillPin(getByLabelText, 'New PIN', '2222')
    fillPin(getByLabelText, 'Confirm new PIN', '2222')
    fireEvent.click(getByText('Save new PIN'))
    await waitFor(() =>
      expect(phonePinApi.changePin).toHaveBeenCalledWith({
        current_pin: '1111',
        new_pin: '2222',
      }),
    )
    expect(await findByText(/PIN updated/i)).toBeTruthy()
  })

  it('surfaces 401 (wrong current PIN) error', async () => {
    const err = new Error('Wrong')
    err.status = 401
    phonePinApi.changePin.mockRejectedValueOnce(err)
    const { getByLabelText, getByText, findByText } = render(<ChangePinSection />)
    fillPin(getByLabelText, 'Current PIN', '1111')
    fillPin(getByLabelText, 'New PIN', '2222')
    fillPin(getByLabelText, 'Confirm new PIN', '2222')
    fireEvent.click(getByText('Save new PIN'))
    expect(await findByText('Current PIN is incorrect.')).toBeTruthy()
  })
})
