import { useBookletStore } from '../../stores/bookletStore'
import { hymns, hymnCategories } from '../../utils/hymnCatalog'

export default function BookletHymnsForm() {
  const store = useBookletStore()

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-muted-foreground/60">Select hymns to include in the programme booklet.</p>
      {Object.entries(hymnCategories).map(([cat, label]) => {
        const catHymns = hymns.filter(h => h.category === cat)
        return (
          <div key={cat}>
            <h4 className="text-xs font-medium text-card-foreground mb-2">{label}</h4>
            <div className="space-y-1">
              {catHymns.map(h => (
                <label key={h.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={store.selectedHymns.includes(h.id)}
                    onChange={() => store.toggleHymn(h.id)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-foreground">{h.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5">&mdash; {h.author}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )
      })}
      {store.selectedHymns.length > 0 && (
        <p className="text-[10px] text-primary">{store.selectedHymns.length} hymn{store.selectedHymns.length !== 1 ? 's' : ''} selected</p>
      )}
    </div>
  )
}
