import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { usePosterStore } from '../../stores/posterStore'
import { Trash2, RotateCcw } from 'lucide-react'

export default function PosterVersionsDialog({ open, onOpenChange }) {
  const snapshots = usePosterStore(s => s.snapshots)
  const restoreSnapshot = usePosterStore(s => s.restoreSnapshot)
  const deleteSnapshot = usePosterStore(s => s.deleteSnapshot)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>Restore a previous version of your poster.</DialogDescription>
        </DialogHeader>
        {(!snapshots || snapshots.length === 0) ? (
          <p className="text-sm text-zinc-500 text-center py-4">No saved versions yet. Versions are created automatically before imports.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {snapshots.map((snap) => (
              <div key={snap.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div>
                  <p className="text-sm text-zinc-300">{snap.label}</p>
                  <p className="text-[10px] text-zinc-500">{new Date(snap.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { restoreSnapshot(snap.id); onOpenChange(false) }} className="p-1.5 text-zinc-400 hover:text-amber-400 transition-colors" title="Restore">
                    <RotateCcw size={14} />
                  </button>
                  <button onClick={() => deleteSnapshot(snap.id)} className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
