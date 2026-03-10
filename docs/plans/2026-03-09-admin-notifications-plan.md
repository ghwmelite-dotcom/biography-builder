# Admin Activity Notifications — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Notify admin (oh84dev@funeralpress.org) of all user activities via in-app notifications + email alerts for high-priority events.

**Architecture:** A shared `notify()` helper inserts into `admin_notifications` D1 table on every user action, and calls Resend API for high-priority events. Admin dashboard gets a notification bell with dropdown panel. Memorial and Live Service workers get their own lightweight notify helper.

**Tech Stack:** Cloudflare Workers, D1 (SQLite), Resend API, React/Zustand

---

### Task 1: D1 Migration — admin_notifications table

**Files:**
- Create: `workers/migration-admin-notifications.sql`

**Step 1: Create migration file**

```sql
CREATE TABLE IF NOT EXISTS admin_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT DEFAULT '{}',
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_admin_notif_unread ON admin_notifications (is_read, created_at DESC);
CREATE INDEX idx_admin_notif_type ON admin_notifications (type, created_at DESC);
```

**Step 2: Run migration against remote D1**

```bash
cd workers
npx wrangler d1 execute funeralpress-db --remote --file=migration-admin-notifications.sql --config=twitter-bot-wrangler.toml
```

Expected: `Executed 3 commands` success message.

**Step 3: Verify table exists**

```bash
npx wrangler d1 execute funeralpress-db --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name='admin_notifications';" --config=twitter-bot-wrangler.toml
```

Expected: One row with `admin_notifications`.

---

### Task 2: Set Resend API key as Worker secret

**Step 1: Set secret on auth-api worker**

```bash
cd workers
echo "re_Wm9fSpxt_LAnuwF5W17Tw2YP4Rdd9tDfe" | npx wrangler secret put RESEND_API_KEY --name funeralpress-auth-api
```

**Step 2: Set secret on memorial-page worker**

```bash
echo "re_Wm9fSpxt_LAnuwF5W17Tw2YP4Rdd9tDfe" | npx wrangler secret put RESEND_API_KEY --name brochure-memorial-api
```

**Step 3: Set secret on live-service worker**

```bash
echo "re_Wm9fSpxt_LAnuwF5W17Tw2YP4Rdd9tDfe" | npx wrangler secret put RESEND_API_KEY --name brochure-live-service-api
```

**Note:** After implementation is complete, rotate this key in Resend dashboard and update via `wrangler secret put` again.

---

### Task 3: Add notify helper to auth-api.js

**Files:**
- Modify: `workers/auth-api.js`

**Step 1: Add notify helper functions after the SUPER_ADMINS constant (line ~172)**

Insert after `const SUPER_ADMINS = ['oh84dev@gmail.com']`:

```javascript
// ─── Admin notification helpers ─────────────────────────────────────────────

const ADMIN_EMAIL = 'oh84dev@funeralpress.org'

const EMAIL_EVENTS = new Set([
  'signup', 'payment', 'print_order', 'partner_app',
  'guest_book_sign', 'memorial_created', 'live_service_created',
])

async function notifyAdmin(env, type, title, detail = {}) {
  const detailJson = JSON.stringify(detail)
  // Always insert in-app notification
  try {
    await env.DB.prepare(
      `INSERT INTO admin_notifications (type, title, detail) VALUES (?, ?, ?)`
    ).bind(type, title, detailJson).run()
  } catch (e) {
    console.error('Notification insert failed:', e.message)
  }
  // Send email for high-priority events
  if (EMAIL_EVENTS.has(type) && env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FuneralPress <notifications@funeralpress.org>',
          to: [ADMIN_EMAIL],
          subject: `[FuneralPress] ${title}`,
          text: `${title}\n\nDetails:\n${Object.entries(detail).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\nTime: ${new Date().toISOString()}\n\nView dashboard: https://funeralpress.org/admin`,
        }),
      })
    } catch (e) {
      console.error('Resend email failed:', e.message)
    }
  }
}
```

**Step 2: Add notification calls to each endpoint handler**

Insert `notifyAdmin()` calls at the success points of each handler (after the main operation succeeds, before returning the response). Each call is fire-and-forget — wrapped in the handler's existing try/catch.

**In `handleGoogleLogin` (~line 293) — after user insert/update succeeds, before returning tokens:**

Find the line that returns the successful response (around where tokens are generated). Add before the return:

```javascript
// Notify admin of new signup (only for new users)
if (isNewUser) {
  notifyAdmin(env, 'signup', `New user signed up: ${payload.name}`, {
    email: payload.email,
    name: payload.name,
  })
}
```

Look for where `isNewUser` or the INSERT vs UPDATE logic is. If there's no `isNewUser` flag, add one:
- Before the INSERT, check if user exists with a SELECT
- Set `const isNewUser = !existingUser`
- Then add the notifyAdmin call

**In `handlePaymentVerify` (~line 717) — after successful payment verification:**

```javascript
notifyAdmin(env, 'payment', `Payment completed: GHS ${(amount / 100).toFixed(2)}`, {
  email: user.email,
  plan: plan,
  amount: `GHS ${(amount / 100).toFixed(2)}`,
  reference: reference,
})
```

**In `handlePaymentWebhook` (~line 751) — after successful webhook processing:**

```javascript
notifyAdmin(env, 'payment', `Payment webhook: ${event} — ${data.reference}`, {
  event: event,
  reference: data.reference,
  amount: `GHS ${(data.amount / 100).toFixed(2)}`,
})
```

**In `handlePrintOrderCreate` (~line 1073) — after order inserted:**

```javascript
notifyAdmin(env, 'print_order', `Print order placed: ${body.productType}`, {
  email: user.email,
  product: body.productType,
  quantity: body.quantity,
  region: body.deliveryRegion,
})
```

**In `handleMakePartner` (~line 514) — after partner status granted:**

```javascript
notifyAdmin(env, 'partner_app', `Partner application: ${user.name}`, {
  email: user.email,
  name: user.name,
  partnerType: body.partnerType || 'unknown',
})
```

**In `handleSignGuestBook` (~line 1263) — after guest book signed:**

```javascript
notifyAdmin(env, 'guest_book_sign', `Guest book signed: ${body.name}`, {
  guestBookSlug: slug,
  signerName: body.name,
  message: (body.message || '').slice(0, 100),
})
```

**In `handleBulkSync` (~line 462) — after designs synced (in-app only):**

```javascript
notifyAdmin(env, 'design_saved', `Designs synced: ${designs.length} design(s)`, {
  email: user.email,
  count: designs.length,
})
```

**In `handleImageUpload` (~line 484) — after image uploaded (in-app only):**

```javascript
notifyAdmin(env, 'image_uploaded', `Image uploaded by ${user.email}`, {
  email: user.email,
})
```

**In `handleCreateObituary` (~line 1287) — after obituary created (in-app only):**

```javascript
notifyAdmin(env, 'obituary_created', `Obituary created: ${body.fullName}`, {
  email: user.email,
  name: body.fullName,
  slug: slug,
})
```

**In `handleCreateGallery` (~line 1335) — after gallery created (in-app only):**

```javascript
notifyAdmin(env, 'gallery_created', `Gallery created: ${body.title}`, {
  email: user.email,
  title: body.title,
  slug: slug,
})
```

**In `handleTrackReferral` (~line 535) — after referral tracked (in-app only):**

```javascript
notifyAdmin(env, 'referral_tracked', `Referral tracked: code ${body.code}`, {
  referralCode: body.code,
  referredEmail: user?.email || 'anonymous',
})
```

**Step 3: Add admin notification API endpoints**

In the routing section of auth-api.js (around line 1432+), add two new admin routes:

```javascript
// GET /admin/notifications
if (method === 'GET' && path === '/admin/notifications') {
  const user = await authenticate(request, env)
  if (!user || !SUPER_ADMINS.includes(user.email)) return error('Forbidden', 403, request)
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const typeFilter = url.searchParams.get('type') || ''

  let query = 'SELECT * FROM admin_notifications'
  const params = []
  if (typeFilter) {
    query += ' WHERE type = ?'
    params.push(typeFilter)
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await env.DB.prepare(query).bind(...params).all()

  // Unread count
  const { results: countResult } = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = 0'
  ).all()

  return json({ notifications: results, unreadCount: countResult[0].count }, 200, request)
}

// POST /admin/notifications/read
if (method === 'POST' && path === '/admin/notifications/read') {
  const user = await authenticate(request, env)
  if (!user || !SUPER_ADMINS.includes(user.email)) return error('Forbidden', 403, request)
  const body = await request.json()

  if (body.all) {
    await env.DB.prepare('UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0').run()
  } else if (body.id) {
    await env.DB.prepare('UPDATE admin_notifications SET is_read = 1 WHERE id = ?').bind(body.id).run()
  }

  return json({ ok: true }, 200, request)
}
```

---

### Task 4: Add notify helper to memorial-page-api.js

**Files:**
- Modify: `workers/memorial-page-api.js`

**Step 1: Add lightweight notify helper before handlePost (line ~30)**

```javascript
const ADMIN_EMAIL = 'oh84dev@funeralpress.org'

async function notifyAdmin(env, type, title, detail = {}) {
  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO admin_notifications (type, title, detail) VALUES (?, ?, ?)`
      ).bind(type, title, JSON.stringify(detail)).run()
    } catch (e) {
      console.error('Notification insert failed:', e.message)
    }
  }
  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FuneralPress <notifications@funeralpress.org>',
          to: [ADMIN_EMAIL],
          subject: `[FuneralPress] ${title}`,
          text: `${title}\n\nDetails:\n${Object.entries(detail).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\nTime: ${new Date().toISOString()}\n\nView dashboard: https://funeralpress.org/admin`,
        }),
      })
    } catch (e) {
      console.error('Resend email failed:', e.message)
    }
  }
}
```

**Step 2: Add notification call in handlePost, after the KV put succeeds (line ~56, after the tweet queue block)**

```javascript
// Notify admin
notifyAdmin(env, 'memorial_created', `Memorial page created: ${body.fullName}`, {
  name: body.fullName,
  url: `https://funeralpress.org/memorial/${id}`,
})
```

---

### Task 5: Add notify helper to live-service-api.js

**Files:**
- Modify: `workers/live-service-api.js`

**Step 1: Add the same lightweight notify helper before handlePost (line ~30)**

Same code as Task 4 Step 1.

**Step 2: Add notification call in handlePost, after the KV put succeeds (line ~56, after the tweet queue block)**

```javascript
// Notify admin
notifyAdmin(env, 'live_service_created', `Live service created: ${body.fullName}`, {
  name: body.fullName,
  url: `https://funeralpress.org/live-service/${id}`,
})
```

---

### Task 6: Add admin notification store (Zustand)

**Files:**
- Create: `src/stores/notificationStore.js`

**Step 1: Create the store**

```javascript
import { create } from 'zustand'

const API = import.meta.env.VITE_API_URL || 'https://funeralpress-auth-api.ghwmelite.workers.dev'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  filter: '',

  fetchNotifications: async (limit = 50, offset = 0) => {
    const token = localStorage.getItem('fp_token')
    if (!token) return
    set({ loading: true })
    try {
      const filterParam = get().filter ? `&type=${get().filter}` : ''
      const res = await fetch(
        `${API}/admin/notifications?limit=${limit}&offset=${offset}${filterParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      set({ notifications: data.notifications, unreadCount: data.unreadCount, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  markAsRead: async (id) => {
    const token = localStorage.getItem('fp_token')
    if (!token) return
    await fetch(`${API}/admin/notifications/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    const token = localStorage.getItem('fp_token')
    if (!token) return
    await fetch(`${API}/admin/notifications/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, is_read: 1 })),
      unreadCount: 0,
    }))
  },

  setFilter: (filter) => set({ filter }),
}))

export default useNotificationStore
```

---

### Task 7: Add notification bell component

**Files:**
- Create: `src/components/admin/NotificationBell.jsx`

**Step 1: Create the component**

```jsx
import { useEffect, useState, useRef } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import useNotificationStore from '../../stores/notificationStore'

const TYPE_LABELS = {
  signup: 'Signup',
  payment: 'Payment',
  print_order: 'Print Order',
  partner_app: 'Partner',
  guest_book_sign: 'Guest Book',
  memorial_created: 'Memorial',
  live_service_created: 'Live Service',
  design_saved: 'Design',
  image_uploaded: 'Image',
  obituary_created: 'Obituary',
  gallery_created: 'Gallery',
  brochure_shared: 'Share',
  referral_tracked: 'Referral',
}

const TYPE_COLORS = {
  signup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  print_order: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  partner_app: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  guest_book_sign: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  memorial_created: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  live_service_created: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllRead, filter, setFilter } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => fetchNotifications(), 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [filter])

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const formatTime = (ts) => {
    const d = new Date(ts + 'Z')
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 max-h-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setFilter('')}
              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${!filter ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`}
            >
              All
            </button>
            {['signup', 'payment', 'print_order', 'partner_app', 'memorial_created'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-2 py-1 rounded text-xs whitespace-nowrap ${filter === t ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`p-3 border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                          {TYPE_LABELS[n.type] || n.type}
                        </span>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatTime(n.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### Task 8: Integrate NotificationBell into AdminDashboardPage

**Files:**
- Modify: `src/pages/AdminDashboardPage.jsx`

**Step 1: Add import**

Add to the imports section:
```javascript
import NotificationBell from '../components/admin/NotificationBell'
```

**Step 2: Add NotificationBell to the header bar**

Find the header area of the admin dashboard (the top bar with Shield icon, title, and UserMenu). Add `<NotificationBell />` next to the UserMenu or theme toggle button.

---

### Task 9: Deploy updated Workers

**Step 1: Deploy auth-api**

```bash
cd workers
npx wrangler deploy auth-api.js --name funeralpress-auth-api
```

**Step 2: Deploy memorial-page-api**

```bash
npx wrangler deploy memorial-page-api.js --name brochure-memorial-api
```

**Step 3: Deploy live-service-api**

```bash
npx wrangler deploy live-service-api.js --name brochure-live-service-api
```

**Step 4: Verify by checking admin notifications endpoint**

```bash
curl -H "Authorization: Bearer <admin-token>" https://funeralpress-auth-api.ghwmelite.workers.dev/admin/notifications
```

Expected: `{"notifications":[],"unreadCount":0}`

---

### Task 10: Commit

```bash
git add workers/migration-admin-notifications.sql workers/auth-api.js workers/memorial-page-api.js workers/live-service-api.js src/stores/notificationStore.js src/components/admin/NotificationBell.jsx src/pages/AdminDashboardPage.jsx docs/plans/2026-03-09-admin-notifications-design.md docs/plans/2026-03-09-admin-notifications-plan.md
git commit -m "feat: add admin activity notifications with email alerts via Resend"
```
