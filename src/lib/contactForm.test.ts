import { describe, expect, it, vi, afterEach } from 'vitest'
import { isValidEmail, sanitizePhoneInput, sendContactMessage } from './contactForm'

describe('contactForm helpers', () => {
  it('sanitizes phone to digits with optional leading +', () => {
    expect(sanitizePhoneInput('abc12-34')).toBe('1234')
    expect(sanitizePhoneInput('+20 115 408')).toBe('+20115408')
    expect(sanitizePhoneInput('++hello99')).toBe('+99')
  })

  it('requires @ and a domain with a dot', () => {
    expect(isValidEmail('name@site.com')).toBe(true)
    expect(isValidEmail('no-at-sign.com')).toBe(false)
    expect(isValidEmail('missing@domain')).toBe(false)
    expect(isValidEmail('@only.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('sendContactMessage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects invalid email before fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const result = await sendContactMessage({
      name: 'A',
      email: 'bad',
      phone: '123',
      message: 'Hi',
    })
    expect(result).toEqual({ ok: false, error: 'email' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts to FormSubmit when valid', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendContactMessage({
      name: 'Client',
      email: 'client@example.com',
      phone: '+201154085914',
      message: 'Need an edit',
    })

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('formsubmit.co/ajax/')
    expect(url).toContain(encodeURIComponent('abdelmalekmarawan123@gmail.com'))
    expect(init.method).toBe('POST')
    const body = JSON.parse(String(init.body)) as Record<string, string>
    expect(body.Name).toBe('Client')
    expect(body.Email).toBe('client@example.com')
    expect(body.Phone).toBe('+201154085914')
    expect(body.Message).toBe('Need an edit')
    expect(body._replyto).toBe('client@example.com')
    expect(body._template).toBe('table')
    expect(body._subject).toContain('Client')
  })

  it('uses a placeholder phone when empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await sendContactMessage({
      name: 'Client',
      email: 'client@example.com',
      phone: '',
      message: 'Need an edit',
    })

    const body = JSON.parse(
      String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body),
    ) as Record<string, string>
    expect(body.Phone).toBe('(not provided)')
  })
})
