import { useBudgetStore } from '../../stores/budgetStore'

function formatCurrency(amount, currency = 'GHS') {
  return `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function BudgetSummaryCards() {
  const store = useBudgetStore()
  const { totalEstimated, totalActual, totalContributions, balance } = store.getTotals()

  const cards = [
    { label: 'Estimated Total', value: formatCurrency(totalEstimated, store.currency), color: 'text-muted-foreground' },
    { label: 'Actual Spent', value: formatCurrency(totalActual, store.currency), color: 'text-orange-400' },
    { label: 'Contributions', value: formatCurrency(totalContributions, store.currency), color: 'text-emerald-400' },
    { label: 'Balance', value: formatCurrency(balance, store.currency), color: balance >= 0 ? 'text-emerald-400' : 'text-red-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="p-4 bg-card border border-border rounded-xl">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{card.label}</p>
          <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
