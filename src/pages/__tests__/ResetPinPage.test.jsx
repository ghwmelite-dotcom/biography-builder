import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ResetPinPage from '../ResetPinPage'

vi.mock('../../utils/phonePinApi.js', () => ({
  phonePinApi: { reset: vi.fn() },
}))

const notifyMock = vi.fn()
vi.mock('../../components/ui/notification.jsx', () => ({
  useNotification: () => ({ notify: notifyMock }),
}))

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

import { phonePinApi } from '../../utils/phonePinApi.js'

function fillPin(getByLabelText, label, digits) {
  for (let i = 0; i < digits.length; i++) {
    fireEvent.change(getByLabelText(`${label} digit ${i + 1}`), {
      target: { value: digits[i] },
    })
  }
}

function renderWith(searchParams = '') {
  return render(
    <MemoryRouter initialEntries={[`/auth/reset-pin${searchParams}`]}>
      <ResetPinPage />
    </MemoryRouter>,
  )
}

describe('ResetPinPage', () => {
  beforeEach(() => {
    phonePinApi.reset.mockReset()
    notifyMock.mockReset()
    navigateMock.mockReset()
  })

  it('shows error when token is missing', () => {
    const { getByText } = renderWith('')
    expect(getByText(/Reset link is missing or invalid/)).toBeTruthy()
  })

  it('renders form when token is present', () => {
    const { getByLabelText, getByText } = renderWith('?token=abc')
    expect(getByLabelText('New PIN digit 1')).toBeTruthy()
    expect(getByLabelText('Confirm new PIN digit 1')).toBeTruthy()
    expect(getByText('Reset PIN').closest('button').disabled).toBe(true)
  })

  it('shows mismatch error when PINs differ', async () => {
    const { getByLabelText, getByText, findByText } = renderWith('?token=abc')
    fillPin(getByLabelText, 'New PIN', '1111')
    fillPin(getByLabelText, 'Confirm new PIN', '2222')
    fireEvent.click(getByText('Reset PIN'))
    expect(await findByText('PINs do not match')).toBeTruthy()
    expect(phonePinApi.reset).not.toHaveBeenCalled()
  })

  it('calls api and navigates to home on success', async () => {
    phonePinApi.reset.mockResolvedValueOnce({ message: 'ok' })
    const { getByLabelText, getByText } = renderWith('?token=abc')
    fillPin(getByLabelText, 'New PIN', '1111')
    fillPin(getByLabelText, 'Confirm new PIN', '1111')
    fireEvent.click(getByText('Reset PIN'))
    await waitFor(() =>
      expect(phonePinApi.reset).toHaveBeenCalledWith({ token: 'abc', new_pin: '1111' }),
    )
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/', { replace: true }))
    expect(notifyMock).toHaveBeenCalled()
  })

  it('shows expired error on 401', async () => {
    const err = new Error('expired')
    err.status = 401
    phonePinApi.reset.mockRejectedValueOnce(err)
    const { getByLabelText, getByText, findByText } = renderWith('?token=abc')
    fillPin(getByLabelText, 'New PIN', '1111')
    fillPin(getByLabelText, 'Confirm new PIN', '1111')
    fireEvent.click(getByText('Reset PIN'))
    expect(await findByText(/expired or is invalid/i)).toBeTruthy()
  })
})
