import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sendVerifyEmail,
  sendPinResetEmail,
  sendPinChangedEmail,
} from '../utils/authEmails.js'

function envWith(key = 'rs_test_fake') {
  return key ? { RESEND_API_KEY: key } : {}
}

describe('authEmails — common contract', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('all three return {ok:false} without sending when RESEND_API_KEY is missing', async () => {
    const env = envWith(null)
    expect(await sendVerifyEmail(env, { to: 'x@y.com', name: 'X', verifyLink: 'l' })).toEqual({
      ok: false, error: 'resend_not_configured',
    })
    expect(await sendPinResetEmail(env, { to: 'x@y.com', name: 'X', resetLink: 'l' })).toEqual({
      ok: false, error: 'resend_not_configured',
    })
    expect(await sendPinChangedEmail(env, { to: 'x@y.com', name: 'X', ipAddress: '1.2.3.4' })).toEqual({
      ok: false, error: 'resend_not_configured',
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns {ok:false, error: "resend_<status>"} on Resend non-2xx', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 422, text: async () => 'rate' })
    const out = await sendVerifyEmail(envWith(), { to: 'x@y.com', name: 'X', verifyLink: 'l' })
    expect(out).toEqual({ ok: false, error: 'resend_422' })
  })

  it('returns {ok:false} on network throw, never propagates', async () => {
    global.fetch.mockRejectedValueOnce(new Error('boom'))
    const out = await sendVerifyEmail(envWith(), { to: 'x@y.com', name: 'X', verifyLink: 'l' })
    expect(out.ok).toBe(false)
    expect(out.error).toBe('boom')
  })

  it('returns {ok:true} on Resend 2xx', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, text: async () => 'ok' })
    const out = await sendVerifyEmail(envWith(), { to: 'x@y.com', name: 'X', verifyLink: 'l' })
    expect(out).toEqual({ ok: true })
  })
})

describe('sendVerifyEmail body', () => {
  it('includes the verify link in both text and html, plus a 24h expiry hint', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
    await sendVerifyEmail(envWith(), {
      to: 'akua@example.com',
      name: 'Akua Mensah',
      verifyLink: 'https://funeralpress.org/auth/verify-email?token=abc',
    })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.subject).toMatch(/verify/i)
    expect(body.to).toEqual(['akua@example.com'])
    expect(body.text).toContain('Akua')
    expect(body.text).toContain('https://funeralpress.org/auth/verify-email?token=abc')
    expect(body.text).toMatch(/24 hours/)
    expect(body.html).toContain('https://funeralpress.org/auth/verify-email?token=abc')
  })

  it('falls back to email-prefix when name is missing', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
    await sendVerifyEmail(envWith(), {
      to: 'foo@bar.com',
      name: '',
      verifyLink: 'l',
    })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.text).toContain('Hi foo')
  })
})

describe('sendPinResetEmail body', () => {
  it('includes reset link, 30min expiry, and "ignore if not you" copy', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
    await sendPinResetEmail(envWith(), {
      to: 'a@b.com', name: 'Akua', resetLink: 'https://funeralpress.org/auth/reset-pin?token=xyz',
    })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.subject).toMatch(/reset.*pin/i)
    expect(body.text).toContain('https://funeralpress.org/auth/reset-pin?token=xyz')
    expect(body.text).toMatch(/30 minutes/)
    expect(body.text).toMatch(/didn't request/i)
  })
})

describe('sendPinChangedEmail body', () => {
  it('includes timestamp + IP + support contact', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
    await sendPinChangedEmail(envWith(), {
      to: 'a@b.com', name: 'Akua', ipAddress: '1.2.3.4',
    })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.subject).toMatch(/pin.*changed/i)
    expect(body.text).toContain('IP 1.2.3.4')
    expect(body.text).toContain('support@funeralpress.org')
    expect(body.text).toMatch(/UTC/)
  })

  it('omits the IP line when no ipAddress is given', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
    await sendPinChangedEmail(envWith(), {
      to: 'a@b.com', name: 'Akua',
    })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.text).not.toContain('from IP')
  })
})
