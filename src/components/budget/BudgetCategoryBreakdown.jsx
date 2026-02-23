import { useBudgetStore } from '../../stores/budgetStore'

export default function BudgetCategoryBreakdown() {
  const store = useBudgetStore()
  const breakdown = store.getCategoryBreakdown()
  const { totalEstimated } = store.getTotals()

  const categories = Object.entries(breakdown).filter(([, data]) => data.count > 0)

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Add expenses to see the category breakdown.</p>
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4">Category Breakdown</h3>
      <div className="space-y-3">
        {categories.map(([cat, data]) => {
          const pct = totalEstimated > 0 ? (data.estimated / totalEstimated) * 100 : 0
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-card-foreground">{cat}</span>
                <span className="text-xs text-muted-foreground">
                  {store.currency} {data.estimated.toLocaleString()} est. / {store.currency} {data.actual.toLocaleString()} actual
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{data.count} item{data.count !== 1 ? 's' : ''} · {pct.toFixed(1)}% of budget</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
