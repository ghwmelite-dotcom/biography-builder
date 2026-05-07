import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VerifyEmailPage from '../VerifyEmailPage'

vi.mock('../../utils/phonePinApi.js', () => ({
  phonePinApi: { verifyEmail: vi.fn() },
}))

import { phonePinApi } from '../../utils/phonePinApi.js'

function renderWith(searchParams = '') {
  return render(
    <MemoryRouter initialEntries={[`/auth/verify-email${searchParams}`]}>
      <VerifyEmailPage />
    </MemoryRouter>,
  )
}

describe('VerifyEmailPage', () => {
  beforeEach(() => phonePinApi.verifyEmail.mockReset())

  it('shows error when token is missing', () => {
    const { getByText } = renderWith('')
    expect(getByText(/Verification failed/)).toBeTruthy()
    expect(getByText(/missing/i)).toBeTruthy()
  })

  it('shows loading state, then success on 200', async () => {
    let resolve
    phonePinApi.verifyEmail.mockReturnValueOnce(new Promise((r) => { resolve = r }))
    const { getByText, findByText } = renderWith('?token=abc')
    expect(getByText(/Verifying your email/i)).toBeTruthy()
    resolve({ message: 'ok' })
    expect(await findByText(/Email verified/)).toBeTruthy()
  })

  it('shows expired-link error on 401', async () => {
    const err = new Error('expired'); err.status = 401
    phonePinApi.verifyEmail.mockRejectedValueOnce(err)
    const { findByText } = renderWith('?token=bad')
    expect(await findByText(/expired or is invalid/i)).toBeTruthy()
  })

  it('calls verifyEmail with the URL token', async () => {
    phonePinApi.verifyEmail.mockResolvedValueOnce({})
    renderWith('?token=tkn')
    await waitFor(() =>
      expect(phonePinApi.verifyEmail).toHaveBeenCalledWith({ token: 'tkn' }),
    )
  })
})
