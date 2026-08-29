type SocialIconProps = {
  className?: string
}

export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.35" cy="6.65" r="1.15" fill="currentColor" />
    </svg>
  )
}

export function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M14.5 8.5V6.8c0-.9.2-1.4 1.5-1.4H17V3h-2.3C11.8 3 10.5 4.5 10.5 7.2v1.3H8.5V11h2v10h3.5V11h2.4l.4-2.5h-2.8z"
      />
    </svg>
  )
}

export function WhatsAppIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12.04 3.5c-4.6 0-8.34 3.7-8.34 8.27 0 1.46.39 2.88 1.12 4.13L3.5 20.5l4.76-1.25a8.3 8.3 0 0 0 3.78.9h.01c4.6 0 8.34-3.7 8.34-8.28 0-2.21-.87-4.29-2.45-5.85A8.3 8.3 0 0 0 12.04 3.5zm0 1.5c1.82 0 3.53.7 4.82 1.97a6.74 6.74 0 0 1 2 4.8c0 3.76-3.08 6.82-6.82 6.82a6.8 6.8 0 0 1-3.45-.94l-.25-.14-2.82.74.75-2.75-.16-.27a6.76 6.76 0 0 1-1.05-3.46c0-3.75 3.08-6.77 6.98-6.77zm-2.3 3.4c-.18-.4-.37-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.66 2.65 4.12 3.62.58.24 1.03.38 1.38.49.58.19 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.37-1.94-1.19-.72-.63-1.2-1.4-1.34-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.33-.76-1.82z"
      />
    </svg>
  )
}
