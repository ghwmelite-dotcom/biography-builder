import { useEffect } from 'react'
import { DonationSettingsForm } from './DonationSettingsForm.jsx'
import { ShareDonationDialog } from '../donation/ShareDonationDialog.jsx'
import { DonorWall } from '../donation/DonorWall.jsx'
import { useDonationStore } from '../../stores/donationStore.js'
import { formatMinor } from '../../utils/currency.js'

const PHONE_AUTH_ENABLED = import.meta.env.VITE_PHONE_AUTH_ENABLED === 'true'

export function FamilyHeadDashboard({ memorial }) {
  const loadWall = useDonationStore((s) => s.loadWall)
  const walls = useDonationStore((s) => s.walls)
  const wall = walls[memorial.id]

  useEffect(() => {
    if (memorial?.id) loadWall(memorial.id)
  }, [memorial?.id, loadWall])

  const totalRaised = wall?.total_raised_pesewas ?? memorial.donation?.total_raised_pesewas ?? 0
  const donorCount = wall?.total_donor_count ?? memorial.donation?.total_donor_count ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <p className="text-muted-foreground text-sm">Family head dashboard</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
          {memorial.deceased_name}
        </h1>
        {memorial.dates && (
          <p className="text-muted-foreground mt-1">{memorial.dates}</p>
        )}
        {memorial.donation?.approval_status === 'pending' && (
          <div className="mt-3 inline-flex items-center gap-2 text-xs bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full">
            ⏳ Awaiting your approval — check the SMS link sent to you
          </div>
        )}
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-muted-foreground text-xs">Total raised</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatMinor(totalRaised, 'GHS')}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-muted-foreground text-xs">Donors</p>
          <p className="text-2xl font-bold text-foreground mt-1">{donorCount}</p>
        </div>
      </section>

      {/* Share */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Share with friends and family</h2>
        <ShareDonationDialog memorial={memorial} />
      </section>

      {/* Settings */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
        <DonationSettingsForm
          memorialId={memorial.id}
          initial={memorial.donation}
        />
      </section>

      {/* Payout — Hubtel-gated */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Payout details</h2>
        <p className="text-muted-foreground text-sm mb-3">
          Donations are paid out to:
          <br />
          <span className="font-medium text-foreground">
            {memorial.donation?.payout_momo_provider?.toUpperCase()} MoMo · ****
            {memorial.donation?.payout_momo_number?.slice(-3)}
          </span>
          <br />
          Account: {memorial.donation?.payout_account_name}
        </p>
        {!PHONE_AUTH_ENABLED ? (
          <div className="text-sm bg-amber-500/10 text-amber-700 rounded p-3">
            ⚠ Changing payout details requires phone verification by SMS, which is
            temporarily unavailable. To update your payout MoMo, contact{' '}
            <a className="underline" href="mailto:support@funeralpress.org">
              support@funeralpress.org
            </a>
            .
          </div>
        ) : (
          <button
            disabled
            className="px-6 py-2 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
          >
            Update payout details (coming soon)
          </button>
        )}
      </section>

      {/* Recent donations */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent donations</h2>
        {wall && wall.donations?.length > 0 ? (
          <DonorWall memorialId={memorial.id} />
        ) : (
          <p className="text-muted-foreground text-sm">
            No donations yet. Share your memorial link to get started.
          </p>
        )}
      </section>
    </div>
  )
}
