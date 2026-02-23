import { useReminderStore } from '../../stores/reminderStore'
import { Bell, BellOff } from 'lucide-react'

export default function ReminderNotificationSettings() {
  const { notificationsEnabled, setNotificationsEnabled } = useReminderStore()

  const handleToggle = async () => {
    if (!notificationsEnabled) {
      // Request permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          setNotificationsEnabled(true)
        }
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  const isSupported = 'Notification' in window

  return (
    <div>
      <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4 font-medium">Notifications</h2>
      <div className="bg-card border border-border rounded-xl p-4">
        {isSupported ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? <Bell size={18} className="text-primary" /> : <BellOff size={18} className="text-muted-foreground" />}
              <div>
                <p className="text-sm text-card-foreground">Browser Notifications</p>
                <p className="text-[10px] text-muted-foreground">Get notified before upcoming anniversaries</p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Browser notifications are not supported in this browser.</p>
        )}
      </div>
    </div>
  )
}
