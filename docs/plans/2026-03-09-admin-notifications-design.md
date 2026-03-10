# Admin Activity Notifications — Design

**Date:** 2026-03-09
**Admin email:** oh84dev@funeralpress.org
**Email service:** Resend

## Architecture

Two systems working together:

1. **In-app notification feed** — `admin_notifications` D1 table, queried by admin endpoint, displayed as notification panel in admin dashboard
2. **Email alerts** — Resend API calls from Workers for high-priority events

## Data Flow

```
User action → Worker endpoint handler
  ├── Do the normal work (save design, process payment, etc.)
  ├── INSERT into admin_notifications table (always)
  └── POST to Resend API (if high-priority event)
```

## D1 Table: admin_notifications

| Column     | Type       | Purpose                          |
|------------|------------|----------------------------------|
| id         | INTEGER PK | Auto-increment                   |
| type       | TEXT       | Event type identifier            |
| title      | TEXT       | Short summary                    |
| detail     | TEXT       | JSON with context                |
| is_read    | INTEGER    | 0 or 1                           |
| created_at | TEXT       | Timestamp                        |

## Event Types & Notification Channels

### Email + In-app (high priority)
- `signup` — New user signed up
- `payment` — Payment completed
- `print_order` — Print order placed
- `partner_app` — Partner application submitted
- `guest_book_sign` — Guest book entry signed
- `memorial_created` — Memorial page created
- `live_service_created` — Live service created

### In-app only (high volume)
- `design_saved` — Design saved/synced
- `image_uploaded` — Image uploaded
- `obituary_created` — Obituary created/updated
- `gallery_created` — Gallery created/photo added
- `brochure_shared` — Brochure shared (share code generated)
- `referral_tracked` — Referral tracked

## Email Format

- **From:** notifications@funeralpress.org
- **To:** oh84dev@funeralpress.org
- **Subject:** [FuneralPress] {event type} — {summary}
- **Body:** Plain-text with key details (who, what, when, link to admin dashboard)

## Admin UI

- Notification bell icon in admin dashboard header with unread count badge
- Dropdown panel showing recent notifications (paginated)
- "Mark as read" / "Mark all read" actions
- Filter by type

## Implementation Scope

### Workers modified:
- `auth-api.js` — Notification inserts + Resend calls for: signup, payment, print order, partner app, guest book sign, design save, obituary, gallery, brochure share, referral
- `memorial-page-api.js` — Notification + email for memorial created
- `live-service-api.js` — Notification + email for live service created

### New files:
- D1 migration for `admin_notifications` table
- Admin API endpoints: `GET /admin/notifications`, `POST /admin/notifications/read`
- Admin UI notification panel component

### Resend setup:
- Add `RESEND_API_KEY` as Cloudflare Worker secret
- Verify `funeralpress.org` domain in Resend dashboard
