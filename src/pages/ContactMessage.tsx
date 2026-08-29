import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../content/site'
import { useLocale } from '../i18n/useLocale'
import {
  isValidEmail,
  sanitizePhoneInput,
  sendContactMessage,
} from '../lib/contactForm'
import styles from './ContactMessage.module.css'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function ContactMessage() {
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const emailOk = isValidEmail(email)
    setEmailError(!emailOk)
    if (!emailOk || !name.trim() || !message.trim()) return

    setStatus('sending')
    const result = await sendContactMessage({ name, email, phone, message })
    if (result.ok) {
      setStatus('sent')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
      setEmailError(false)
    } else {
      setStatus('error')
    }
  }

  return (
    <main className={styles.page}>
      <Link to="/#contact" className={styles.back}>
        {t({ en: '← Back to contact', ar: '← العودة للتواصل' })}
      </Link>

      <p className={styles.kicker}>{t({ en: 'Connect', ar: 'تواصل' })}</p>
      <h1 className={styles.title}>{t({ en: 'Write a message', ar: 'اكتب رسالة' })}</h1>
      <p className={styles.lede}>
        {t({
          en: 'Your note goes straight to',
          ar: 'رسالتك تصل مباشرة إلى',
        })}{' '}
        <strong>{site.email}</strong>.
      </p>

      {status === 'sent' ? (
        <p className={styles.success} role="status">
          {t({
            en: 'Sent. I’ll read it soon.',
            ar: 'تم الإرسال. سأقرأها قريباً.',
          })}
        </p>
      ) : null}

      {status === 'error' ? (
        <p className={styles.error} role="alert">
          {t({
            en: 'Could not send. Check your connection and try again.',
            ar: 'تعذّر الإرسال. تحقق من الاتصال وحاول مرة أخرى.',
          })}
        </p>
      ) : null}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="contact-name">{t({ en: 'Your name', ar: 'اسمك' })}</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t({ en: 'Name', ar: 'الاسم' })}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email">{t({ en: 'Your email', ar: 'بريدك' })}</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            aria-invalid={emailError}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError(!isValidEmail(e.target.value))
            }}
            onBlur={() => setEmailError(email.length > 0 && !isValidEmail(email))}
            placeholder="you@example.com"
          />
          {emailError ? (
            <p className={styles.fieldError} role="alert">
              {t({
                en: 'Enter a valid email that includes @ (e.g. name@site.com).',
                ar: 'أدخل بريداً صالحاً يحتوي على @ (مثل name@site.com).',
              })}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-phone">{t({ en: 'Your phone', ar: 'هاتفك' })}</label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            pattern="^\+?[0-9]*$"
            value={phone}
            onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
            placeholder="+20…"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-message">{t({ en: 'Message', ar: 'الرسالة' })}</label>
          <textarea
            id="contact-message"
            name="message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t({
              en: 'What do you want to work on?',
              ar: 'بماذا تريد أن نعمل؟',
            })}
          />
        </div>

        <button className={styles.submit} type="submit" disabled={status === 'sending'}>
          {status === 'sending'
            ? t({ en: 'Sending…', ar: 'جارٍ الإرسال…' })
            : t({ en: 'Submit', ar: 'إرسال' })}
        </button>
      </form>
    </main>
  )
}
