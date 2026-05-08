import { useRef, useEffect } from 'react'

/**
 * Six-digit PIN input. Six discrete boxes, paste-aware, numeric-only,
 * masked so the PIN is not shoulder-surfable. Use for sign-up, login,
 * change, and reset flows.
 *
 * Props:
 *   value          — current PIN string (digits only)
 *   onChange       — (next: string) => void
 *   length         — defaults to 6
 *   autoFocus      — focuses the first box on mount when true
 *   disabled       — disables every input
 *   ariaLabel      — group label, applied to each box as "<label> digit N"
 */
export function PinInput({
  value = '',
  onChange,
  length = 4,
  autoFocus = false,
  disabled = false,
  ariaLabel = 'PIN',
}) {
  const refs = useRef([])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  const handleChange = (i, raw) => {
    const digit = raw.slice(-1).replace(/[^\d]/g, '')
    const padded = value.padEnd(length, ' ').split('')
    padded[i] = digit || ' '
    const next = padded.join('').trimEnd()
    onChange?.(next)
    if (digit && i < length - 1) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/[^\d]/g, '').slice(0, length)
    if (pasted.length === length) {
      onChange?.(pasted)
      refs.current[length - 1]?.focus()
      e.preventDefault()
    }
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-12 h-14 text-2xl text-center border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          aria-label={`${ariaLabel} digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

export default PinInput
