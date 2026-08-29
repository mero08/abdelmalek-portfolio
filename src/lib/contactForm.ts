/** Digits only; optional single leading +. */
export function sanitizePhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const wantsPlus = raw.trimStart().startsWith('+')
  return wantsPlus ? `+${digits}` : digits
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  if (!trimmed.includes('@')) return false
  // Requires local@domain.tld — blocks bare "a@" or "@b"
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

export type ContactPayload = {
  name: string
  email: string
  phone: string
  message: string
}

export type ContactSendResult =
  | { ok: true }
  | { ok: false; error: string }

const FORM_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(
  'abdelmalekmarawan123@gmail.com',
)}`

/** Sends the message to the portfolio inbox via FormSubmit. */
export async function sendContactMessage(
  payload: ContactPayload,
): Promise<ContactSendResult> {
  const name = payload.name.trim()
  const email = payload.email.trim()
  const phone = sanitizePhoneInput(payload.phone)
  const message = payload.message.trim()

  if (!name) return { ok: false, error: 'name' }
  if (!isValidEmail(email)) return { ok: false, error: 'email' }
  if (!message) return { ok: false, error: 'message' }

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone: phone || '(not provided)',
        message,
        _subject: 'Portfolio contact — Abdelmalek',
        _template: 'table',
      }),
    })

    if (!res.ok) {
      return { ok: false, error: 'send' }
    }

    const data = (await res.json().catch(() => null)) as { success?: boolean | string } | null
    if (data && data.success === false) {
      return { ok: false, error: 'send' }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: 'send' }
  }
}
