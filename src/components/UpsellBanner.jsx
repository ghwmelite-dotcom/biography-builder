import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { usePurchaseStore } from '../stores/purchaseStore'

const DISMISS_KEY = 'fp-upsell-dismissed'

const MESSAGES = {
  free_export: {
    title: 'Remove the watermark',
    body: 'Get clean exports for GHS 35 or upgrade to Pro for 15 designs/month.',
    cta: 'View Plans',
  },
  frequent_designer: {
    title: 'You design a lot!',
    body: 'Pro gives you 15 designs per month plus unlimited AI writing.',
    cta: 'View Pro Plans',
  },
  print_order: {
    title: 'Pro members get priority printing',
    body: 'Skip the queue with a Pro subscription.',
    cta: 'Learn More',
  },
  ai_writer: {
    title: 'Unlock unlimited AI tributes',
    body: 'Pro subscribers get unlimited AI-generated tributes, biographies, and more.',
    cta: 'Upgrade',
  },
}

export default function UpsellBanner({ context = 'free_export', onUpgrade }) {
  const hasActiveSubscription = usePurchaseStore(s => s.hasActiveSubscription)
  const isUnlimited = usePurchaseStore(s => s.isUnlimited)
  const [dismissed, setDismissed] = useState(() => {
    try {
      const raw = sessionStorage.getItem(DISMISS_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  })

  // Don't show to subscribers or unlimited users
  if (hasActiveSubscription?.() || isUnlimited) return null
  if (dismissed[context]) return null

  const msg = MESSAGES[context]
  if (!msg) return null

  const handleDismiss = () => {
    const updated = { ...dismissed, [context]: true }
    setDismissed(updated)
    try { sessionStorage.setItem(DISMISS_KEY, JSON.stringify(updated)) } catch {}
  }

  return (
    <div className="relative flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
      <Sparkles size={18} className="text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{msg.title}</p>
        <p className="text-xs text-muted-foreground">{msg.body}</p>
      </div>
      <button
        onClick={onUpgrade}
        className="shrink-0 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-md transition-colors"
      >
        {msg.cta}
      </button>
      <button onClick={handleDismiss} className="shrink-0 p-1 text-muted-foreground hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  )
}
