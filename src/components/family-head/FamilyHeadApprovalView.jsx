import { useState } from 'react'
import { donationApi } from '../../utils/donationApi.js'
import { formatMinor } from '../../utils/currency.js'

// Family-head approval flow. The approval link in the invite email carries a
// signed JWT bound to phone + memorial_id with a 24h TTL — possessing the
// link is sufficient identity proof, so there is no second-factor step.
// (The OTP-via-SMS step that lived here was deprecated 2026-05-07 along with
// the rest of the SMS infrastructure.)
export function FamilyHeadApprovalView({ memorial, token }) {
  const [stage, setStage] = useState('decision') // decision | rejecting | done
  const [error, setError] = useState(null)
  const [reason, setReason] = useState('')
  const [outcome, setOutcome] = useState(null)
  const [busy, setBusy] = useState(false)

  const approve = async () => {
    setError(null)
    setBusy(true)
    try {
      await donationApi.approve(memorial.id, {
        token,
        phone: memorial.family_head_phone,
      })
      setOutcome('approved')
      setStage('done')
    } catch (e) {
      setError(e.message || 'Approval failed')
    } finally {
      setBusy(false)
    }
  }

  const reject = async () => {
    setError(null)
    setBusy(true)
    try {
      await donationApi.reject(memorial.id, {
        token,
        phone: memorial.family_head_phone,
        reason,
      })
      setOutcome('rejected')
      setStage('done')
    } catch (e) {
      setError(e.message || 'Reject failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <p className="text-muted-foreground">Hello {memorial.family_head_name?.split(' ')[0]},</p>
      <p className="text-foreground">You've been named the family head for the memorial of:</p>
      <div className="bg-muted border border-border rounded-2xl p-4 text-center">
        <p className="text-xl font-semibold text-foreground">{memorial.deceased_name}</p>
        <p className="text-muted-foreground text-sm">{memorial.dates}</p>
      </div>
      <p className="text-muted-foreground">This memorial was created by {memorial.creator_name}.</p>

      <div className="border border-border rounded-lg p-4 space-y-2 text-sm text-foreground">
        <p>✓ Public memorial page on funeralpress.org</p>
        <p>✓ Donations to {memorial.donation?.payout_momo_provider?.toUpperCase()} MoMo: ****{memorial.donation?.payout_momo_number?.slice(-3)}</p>
        <p>✓ Account: {memorial.donation?.payout_account_name}</p>
        {memorial.donation?.goal_amount_pesewas && (
          <p>✓ Donation goal: {formatMinor(memorial.donation.goal_amount_pesewas, 'GHS')}</p>
        )}
        <p>✓ Wall mode: {memorial.donation?.wall_mode}</p>
      </div>

      {stage === 'decision' && (
        <div className="flex gap-3">
          <button
            onClick={() => setStage('rejecting')}
            disabled={busy}
            className="flex-1 py-3 border border-destructive text-destructive rounded-lg disabled:opacity-50 hover:bg-destructive/10 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={approve}
            disabled={busy}
            className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {busy ? 'Approving…' : 'Approve'}
          </button>
        </div>
      )}

      {stage === 'rejecting' && (
        <>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            placeholder="Reason (optional)"
            className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setStage('decision')}
              disabled={busy}
              className="flex-1 py-3 border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={reject}
              disabled={busy}
              className="flex-1 py-3 bg-destructive text-primary-foreground font-medium rounded-lg disabled:opacity-50"
            >
              {busy ? 'Rejecting…' : 'Confirm reject'}
            </button>
          </div>
        </>
      )}

      {stage === 'done' && (
        <div className="text-center py-6">
          <p className="text-2xl font-semibold text-foreground">
            {outcome === 'approved' ? '✓ Approved' : '✗ Rejected'}
          </p>
          <p className="text-muted-foreground mt-2">Thank you for your decision.</p>
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
