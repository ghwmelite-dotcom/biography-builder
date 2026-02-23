import { Link } from 'react-router-dom'
import { Bell, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'
import { useBrochureStore } from '../stores/brochureStore'
import AnniversaryTimeline from '../components/reminder/AnniversaryTimeline'
import CustomReminderForm from '../components/reminder/CustomReminderForm'
import ReminderNotificationSettings from '../components/reminder/ReminderNotificationSettings'

export default function ReminderPage() {
  const { theme, toggleTheme } = useThemeStore()
  const fullName = useBrochureStore(s => s.fullName)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="h-12 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
        <Link to="/" className="flex items-center gap-2 text-card-foreground hover:text-foreground transition-colors">
          <Bell size={18} className="text-primary" />
          <span className="text-sm font-semibold tracking-wide">Anniversary Reminders</span>
        </Link>
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Memorial Anniversaries
          </h1>
          {fullName ? (
            <p className="text-sm text-muted-foreground">Remembering <span className="text-primary">{fullName}</span></p>
          ) : (
            <p className="text-sm text-muted-foreground">Load a brochure first to see computed dates, or add custom reminders below.</p>
          )}
        </div>

        <div className="space-y-8">
          <AnniversaryTimeline />
          <CustomReminderForm />
          <ReminderNotificationSettings />
        </div>
      </div>
    </div>
  )
}
