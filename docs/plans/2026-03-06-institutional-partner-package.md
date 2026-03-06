# Institutional Partner Package Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated institutional partner package for churches and funeral homes with bulk credits, co-branding, templates, print discounts, WhatsApp templates, and support channel.

**Architecture:** Extend the existing partner system with a `partner_type` field (church/funeral_home), partner logo storage in R2, bulk credit plans in the PLANS config, print discount logic keyed to partner status, co-branded landing page variant, and denomination-specific templates in the booklet/programme editors. All changes build on existing stores, API routes, and database schema.

**Tech Stack:** React + Zustand (frontend), Cloudflare Workers + D1 + R2 (backend), Paystack (payments)

---

### Task 1: Database Migration — Add Institutional Partner Fields

**Files:**
- Create: `workers/migration-institutional-partners.sql`
- Modify: `workers/auth-api.js:507-525` (handleMakePartner)

**Step 1: Create migration SQL**

```sql
-- Add institutional partner fields to users table
ALTER TABLE users ADD COLUMN partner_type TEXT DEFAULT NULL;
-- partner_type: 'church' | 'funeral_home' | NULL (regular partner)
ALTER TABLE users ADD COLUMN partner_logo_url TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN partner_welcome_msg TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN partner_denomination TEXT DEFAULT NULL;
-- denomination: 'methodist' | 'catholic' | 'presbyterian' | 'pentecostal' | 'charismatic' | 'adventist' | 'anglican' | 'other'
ALTER TABLE users ADD COLUMN partner_commission_override REAL DEFAULT NULL;
-- If set, overrides the tier-based commission rate
```

**Step 2: Run migration**

```bash
npx wrangler d1 execute funeralpress-db --config workers/auth-api-wrangler.toml --command "ALTER TABLE users ADD COLUMN partner_type TEXT DEFAULT NULL;"
npx wrangler d1 execute funeralpress-db --config workers/auth-api-wrangler.toml --command "ALTER TABLE users ADD COLUMN partner_logo_url TEXT DEFAULT NULL;"
npx wrangler d1 execute funeralpress-db --config workers/auth-api-wrangler.toml --command "ALTER TABLE users ADD COLUMN partner_welcome_msg TEXT DEFAULT NULL;"
npx wrangler d1 execute funeralpress-db --config workers/auth-api-wrangler.toml --command "ALTER TABLE users ADD COLUMN partner_denomination TEXT DEFAULT NULL;"
npx wrangler d1 execute funeralpress-db --config workers/auth-api-wrangler.toml --command "ALTER TABLE users ADD COLUMN partner_commission_override REAL DEFAULT NULL;"
```

**Step 3: Commit**

```bash
git add workers/migration-institutional-partners.sql
git commit -m "feat: add institutional partner fields migration"
```

---

### Task 2: Backend — Bulk Credit Plans + Institutional Commission

**Files:**
- Modify: `workers/auth-api.js:186-190` (PLANS config)
- Modify: `workers/auth-api.js:597-625` (handlePaymentInitialize)
- Modify: `workers/auth-api.js:627-647` (markOrderPaid)

**Step 1: Add bulk plans to PLANS config**

Add after the existing plans at line 190:

```js
const PLANS = {
  single: { amount: 3500, credits: 1 },
  bundle: { amount: 7500, credits: 3 },
  suite:  { amount: 12000, credits: -1 },
  // Institutional bulk packs
  bulk10: { amount: 25000, credits: 10, institutional: true },
  bulk25: { amount: 50000, credits: 25, institutional: true },
  bulk50: { amount: 80000, credits: 50, institutional: true },
}
```

**Step 2: Update handlePaymentInitialize to apply institutional commission override**

In handlePaymentInitialize (~line 605-609), replace the commission logic:

```js
  // Check for referral partner (for commission tracking)
  const referral = await env.DB.prepare('SELECT partner_id FROM referrals WHERE referred_user_id = ?').bind(userId).first()
  const partnerId = referral?.partner_id || null
  let commissionRate = null
  let commissionAmount = null
  if (partnerId) {
    const partner = await env.DB.prepare('SELECT partner_commission_override FROM users WHERE id = ?').bind(partnerId).first()
    commissionRate = partner?.partner_commission_override || 0.10
    commissionAmount = Math.round(planInfo.amount * commissionRate)
  }
```

**Step 3: Commit**

```bash
git add workers/auth-api.js
git commit -m "feat: add institutional bulk credit plans and commission override"
```

---

### Task 3: Backend — Partner Profile Update API + Public Partner Page API

**Files:**
- Modify: `workers/auth-api.js` (add new handlers + routes)

**Step 1: Add handleUpdatePartnerProfile handler**

Add after handleGetPartnerReferrals:

```js
async function handleUpdatePartnerProfile(request, env, userId) {
  const user = await env.DB.prepare('SELECT id, is_partner FROM users WHERE id = ?').bind(userId).first()
  if (!user || !user.is_partner) return error('Not a partner', 403, request)

  const { partnerType, welcomeMsg, denomination } = await request.json()

  const updates = []
  const values = []
  if (partnerType && ['church', 'funeral_home'].includes(partnerType)) {
    updates.push('partner_type = ?')
    values.push(partnerType)
  }
  if (welcomeMsg !== undefined) {
    updates.push('partner_welcome_msg = ?')
    values.push(welcomeMsg.slice(0, 500))
  }
  if (denomination !== undefined) {
    updates.push('partner_denomination = ?')
    values.push(denomination)
  }

  if (updates.length > 0) {
    values.push(userId)
    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()
  }

  return json({ ok: true }, 200, request)
}
```

**Step 2: Add handlePartnerLogoUpload handler**

```js
async function handlePartnerLogoUpload(request, env, userId) {
  const user = await env.DB.prepare('SELECT id, is_partner FROM users WHERE id = ?').bind(userId).first()
  if (!user || !user.is_partner) return error('Not a partner', 403, request)

  const formData = await request.formData()
  const file = formData.get('logo')
  if (!file) return error('No file', 400, request)

  const ext = file.name?.split('.').pop()?.toLowerCase() || 'png'
  const key = `partner-logos/${userId}.${ext}`
  await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } })

  const logoUrl = `/images/${key}`
  await env.DB.prepare('UPDATE users SET partner_logo_url = ? WHERE id = ?').bind(logoUrl, userId).run()

  return json({ ok: true, logoUrl }, 200, request)
}
```

**Step 3: Add handlePublicPartnerPage handler (no auth required)**

```js
async function handlePublicPartnerPage(request, env, code) {
  const partner = await env.DB.prepare(
    'SELECT partner_name, partner_type, partner_logo_url, partner_welcome_msg, partner_denomination FROM users WHERE referral_code = ? AND is_partner = 1'
  ).bind(code.toUpperCase()).first()

  if (!partner) return error('Partner not found', 404, request)

  return json({
    name: partner.partner_name,
    type: partner.partner_type,
    logoUrl: partner.partner_logo_url,
    welcomeMsg: partner.partner_welcome_msg,
    denomination: partner.partner_denomination,
  }, 200, request)
}
```

**Step 4: Register the new routes**

In the router section (~line 1145+), add:

Public route (before auth):
```js
const partnerPageMatch = path.match(/^\/partner\/public\/([A-Za-z0-9]+)$/)
if (method === 'GET' && partnerPageMatch) return await handlePublicPartnerPage(request, env, partnerPageMatch[1])
```

Authenticated routes (after existing partner routes):
```js
if (method === 'POST' && path === '/partner/update-profile') return await handleUpdatePartnerProfile(request, env, userId)
if (method === 'POST' && path === '/partner/upload-logo') return await handlePartnerLogoUpload(request, env, userId)
```

**Step 5: Commit**

```bash
git add workers/auth-api.js
git commit -m "feat: add partner profile update, logo upload, and public partner page APIs"
```

---

### Task 4: Backend — Print Discount for Institutional Partners

**Files:**
- Modify: `workers/auth-api.js:270+` (calculatePrintPrice)
- Modify: `workers/auth-api.js` (handlePrintCalculate + handlePrintOrderCreate)

**Step 1: Add institutional discount constant**

Add after DELIVERY_FEES:

```js
const INSTITUTIONAL_PRINT_DISCOUNT = 0.15 // 15% off for institutional partners
```

**Step 2: Update calculatePrintPrice to accept discount parameter**

```js
function calculatePrintPrice(productType, quantity, paperQuality, deliveryRegion, size, institutionalDiscount = 0) {
  // ... existing logic up to final price calculation ...
  // After calculating unitPrice and before delivery:
  // Apply institutional discount
  if (institutionalDiscount > 0) {
    unitPrice = Math.round(unitPrice * (1 - institutionalDiscount))
  }
  // ... rest of function
}
```

**Step 3: Update handlePrintCalculate to check partner status**

In handlePrintCalculate, before calling calculatePrintPrice, add:

```js
  // Check if user is institutional partner for discount
  const partnerCheck = await env.DB.prepare('SELECT partner_type FROM users WHERE id = ?').bind(userId).first()
  const discount = partnerCheck?.partner_type ? INSTITUTIONAL_PRINT_DISCOUNT : 0
```

Pass `discount` as the last arg to `calculatePrintPrice`.

**Step 4: Same for handlePrintOrderCreate**

Apply the same partner check and discount in the order creation handler.

**Step 5: Commit**

```bash
git add workers/auth-api.js
git commit -m "feat: add 15% print discount for institutional partners"
```

---

### Task 5: Frontend — Partner Signup Flow with Type Selection

**Files:**
- Create: `src/components/partner/InstitutionalPartnerSignup.jsx`
- Modify: `src/stores/partnerStore.js`

**Step 1: Add API methods to partnerStore**

```js
  updateProfile: async (data) => {
    await apiFetch('/partner/update-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  uploadLogo: async (file) => {
    const formData = new FormData()
    formData.append('logo', file)
    const res = await apiFetch('/partner/upload-logo', {
      method: 'POST',
      body: formData,
      rawBody: true,
    })
    return res.logoUrl
  },

  fetchPublicPartner: async (code) => {
    const res = await apiFetch(`/partner/public/${code}`, { noAuth: true })
    return res
  },
```

**Step 2: Create InstitutionalPartnerSignup component**

A modal/dialog that appears when a partner first signs up or from the partner dashboard. Fields:
- Partner type: Church / Funeral Home (radio buttons)
- Denomination (only if church): Methodist, Catholic, Presbyterian, Pentecostal, Charismatic, Adventist, Anglican, Other
- Logo upload (drag & drop or click)
- Welcome message (textarea, max 500 chars)
- Save button

**Step 3: Commit**

```bash
git add src/components/partner/InstitutionalPartnerSignup.jsx src/stores/partnerStore.js
git commit -m "feat: add institutional partner signup flow with type selection"
```

---

### Task 6: Frontend — Co-Branded Landing Page

**Files:**
- Modify: `src/pages/LandingPage.jsx`
- Create: `src/components/landing/PartnerBanner.jsx`

**Step 1: Create PartnerBanner component**

Shows at the top of the landing page when `?partner=CODE` or `?ref=CODE` is in the URL. Displays partner name, logo, welcome message, and type badge (Church/Funeral Home).

**Step 2: Update LandingPage to detect partner code and fetch partner data**

At the top of LandingPage, check for `ref` or `partner` search param, call `fetchPublicPartner`, and render PartnerBanner above the hero.

**Step 3: Commit**

```bash
git add src/components/landing/PartnerBanner.jsx src/pages/LandingPage.jsx
git commit -m "feat: add co-branded partner landing page with logo and welcome message"
```

---

### Task 7: Frontend — Bulk Credit Plans in Checkout

**Files:**
- Modify: `src/components/editor/CheckoutDialog.jsx`

**Step 1: Add institutional plans to the PLANS array**

```js
const INSTITUTIONAL_PLANS = [
  { key: 'bulk10', name: 'Starter Pack', price: 250, credits: '10 designs', desc: 'For small churches & homes', badge: 'Save GHS 100' },
  { key: 'bulk25', name: 'Growth Pack', price: 500, credits: '25 designs', desc: 'Most popular for institutions', badge: 'Best Value' },
  { key: 'bulk50', name: 'Premium Pack', price: 800, credits: '50 designs', desc: 'High-volume partners', badge: 'Save GHS 950' },
]
```

**Step 2: Show institutional plans when user is institutional partner**

Check `useAuthStore` for `user.partnerType` and conditionally render the institutional plans section below the regular plans.

**Step 3: Commit**

```bash
git add src/components/editor/CheckoutDialog.jsx
git commit -m "feat: add institutional bulk credit plans to checkout"
```

---

### Task 8: Church Templates — Hymn Booklet Templates by Denomination

**Files:**
- Modify: `src/utils/bookletDefaultData.js`

**Step 1: Add denomination-specific booklet templates**

Add after existing templates:

```js
  methodistService: {
    name: 'Methodist Funeral Service',
    description: 'Traditional Methodist funeral liturgy with Wesley hymns',
    icon: 'Church',
    denomination: 'methodist',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Processional Hymn — "And Can It Be"' },
        { time: '9:10 AM', item: 'Opening Sentences & Collect' },
        { time: '9:20 AM', item: 'Psalm 23 (Read Responsively)' },
        { time: '9:30 AM', item: 'First Lesson — 1 Thessalonians 4:13-18' },
        { time: '9:40 AM', item: 'Hymn — "O God Our Help in Ages Past"' },
        { time: '9:50 AM', item: 'Second Lesson — John 14:1-6' },
        { time: '10:00 AM', item: 'Biography of the Deceased' },
        { time: '10:15 AM', item: 'Tributes (Family, Church, Community)' },
        { time: '10:45 AM', item: 'Hymn — "Abide With Me"' },
        { time: '10:55 AM', item: 'Sermon' },
        { time: '11:20 AM', item: 'Prayers & Commendation' },
        { time: '11:30 AM', item: 'Recessional Hymn — "Guide Me O Thou Great Jehovah"' },
      ],
      hymns: [
        { title: 'And Can It Be', number: 'MHB 371', verses: 'And can it be that I should gain\nAn interest in the Saviour\'s blood?\nDied He for me, who caused His pain—\nFor me, who Him to death pursued?\nAmazing love! How can it be,\nThat Thou, my God, shouldst die for me?' },
        { title: 'O God Our Help in Ages Past', number: 'MHB 878', verses: 'O God, our help in ages past,\nOur hope for years to come,\nOur shelter from the stormy blast,\nAnd our eternal home.' },
        { title: 'Abide With Me', number: 'MHB 948', verses: 'Abide with me; fast falls the eventide;\nThe darkness deepens; Lord with me abide.\nWhen other helpers fail and comforts flee,\nHelp of the helpless, O abide with me.' },
      ],
    },
  },
  catholicRequiem: {
    name: 'Catholic Requiem Mass',
    description: 'Full Catholic funeral mass order with readings',
    icon: 'Cross',
    denomination: 'catholic',
    data: { /* Catholic-specific liturgy */ },
  },
  presbyterianService: {
    name: 'Presbyterian Funeral Service',
    description: 'Presbyterian Church of Ghana funeral order',
    icon: 'Church',
    denomination: 'presbyterian',
    data: { /* Presbyterian-specific liturgy */ },
  },
  pentecostalCelebration: {
    name: 'Pentecostal Celebration of Life',
    description: 'Spirit-filled celebration service with praise',
    icon: 'Sparkles',
    denomination: 'pentecostal',
    data: { /* Pentecostal-specific order */ },
  },
  charismaticHomegoing: {
    name: 'Charismatic Homegoing Service',
    description: 'Charismatic homegoing celebration',
    icon: 'Sparkles',
    denomination: 'charismatic',
    data: { /* Charismatic-specific order */ },
  },
  adventistMemorial: {
    name: 'SDA Memorial Service',
    description: 'Seventh-day Adventist funeral service',
    icon: 'Church',
    denomination: 'adventist',
    data: { /* SDA-specific order */ },
  },
  anglicanBurial: {
    name: 'Anglican Burial Service',
    description: 'Anglican/Episcopal burial office',
    icon: 'Cross',
    denomination: 'anglican',
    data: { /* Anglican-specific liturgy */ },
  },
```

**Step 2: Commit**

```bash
git add src/utils/bookletDefaultData.js
git commit -m "feat: add denomination-specific hymn booklet templates"
```

---

### Task 9: Church Templates — Order of Service Programme Templates

**Files:**
- Modify: `src/pages/BookletEditorPage.jsx` or `src/pages/ProgrammePage.jsx`

**Step 1: Add denomination filter to template picker**

When user is a church partner, show a denomination filter dropdown above the template list. Filter templates by `denomination` field. Non-partner users see all templates.

**Step 2: Commit**

```bash
git add src/pages/BookletEditorPage.jsx
git commit -m "feat: add denomination filter to booklet template picker"
```

---

### Task 10: Funeral Home Branded Templates

**Files:**
- Modify: `src/utils/posterDefaultData.js`
- Modify: `src/utils/bannerDefaultData.js`

**Step 1: Add funeral-home branded poster templates**

```js
  funeralHomeBranded: {
    name: 'Funeral Home Branded',
    description: 'Professional poster with your funeral home branding',
    icon: 'Building',
    institutional: true,
    data: {
      posterTheme: 'royalBlue',
      headerTitle: 'IN LOVING MEMORY',
      funeralHomeLabel: true, // signals to render partner logo + name at footer
    },
  },
```

**Step 2: Same for banner templates**

Add a branded banner template with `institutional: true` flag.

**Step 3: Commit**

```bash
git add src/utils/posterDefaultData.js src/utils/bannerDefaultData.js
git commit -m "feat: add funeral home branded poster and banner templates"
```

---

### Task 11: Surface Receipt for Funeral Homes

**Files:**
- Modify: `src/pages/PartnerDashboardPage.jsx`

**Step 1: Add quick-access links section to partner dashboard**

For funeral_home partners, add a "Quick Tools" section with direct links to:
- `/receipt` — Receipt Generator
- `/poster` — Poster Editor
- `/banner` — Banner Editor
- `/booklet` — Booklet Editor

For church partners, show links to:
- `/booklet` — Programme Booklet
- `/editor` — Brochure Editor
- `/invitation` — Invitation Editor

**Step 2: Commit**

```bash
git add src/pages/PartnerDashboardPage.jsx
git commit -m "feat: add quick tool links for institutional partners on dashboard"
```

---

### Task 12: WhatsApp Broadcast Templates

**Files:**
- Create: `src/components/partner/WhatsAppTemplates.jsx`
- Modify: `src/pages/PartnerDashboardPage.jsx`

**Step 1: Create WhatsAppTemplates component**

Pre-written messages for partners to copy and send to families. Include:

For churches:
- "Our church now offers beautiful funeral brochures and programmes through FuneralPress..."
- "Planning a funeral service? Let us help with professionally designed materials..."
- "Memorial booklets, posters, and invitations — created in minutes..."

For funeral homes:
- "We now offer premium memorial brochures, obituary posters, and more..."
- "Professional funeral stationery for your loved one — brochures, posters, programmes..."
- "Need funeral materials? We provide beautiful print-ready designs..."

Each with a copy button and the partner's referral link auto-appended.

**Step 2: Add WhatsAppTemplates section to PartnerDashboardPage**

Render it between the earnings calculator and the referrals list.

**Step 3: Commit**

```bash
git add src/components/partner/WhatsAppTemplates.jsx src/pages/PartnerDashboardPage.jsx
git commit -m "feat: add WhatsApp broadcast templates for institutional partners"
```

---

### Task 13: Partner Support Channel

**Files:**
- Modify: `src/pages/PartnerDashboardPage.jsx`

**Step 1: Add support section at bottom of partner dashboard**

A simple card with:
- WhatsApp group invite link (hardcoded, you provide the link)
- Email support address
- "Priority support for institutional partners" badge if partner_type is set

```jsx
<div className="mt-8 bg-card border border-border rounded-xl p-6">
  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
    <MessageCircle size={16} className="text-primary" />
    Partner Support
  </h3>
  <div className="space-y-3">
    <a href="https://chat.whatsapp.com/YOUR_GROUP_LINK" target="_blank"
       className="flex items-center gap-3 p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-lg hover:bg-emerald-600/20 transition-colors">
      <Share2 size={18} className="text-emerald-500" />
      <div>
        <p className="text-sm font-medium text-foreground">Join Partner WhatsApp Group</p>
        <p className="text-xs text-muted-foreground">Get help, share tips, connect with other partners</p>
      </div>
    </a>
    <a href="mailto:partners@funeralpress.org"
       className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
      <Mail size={18} className="text-primary" />
      <div>
        <p className="text-sm font-medium text-foreground">Email Support</p>
        <p className="text-xs text-muted-foreground">partners@funeralpress.org</p>
      </div>
    </a>
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/pages/PartnerDashboardPage.jsx
git commit -m "feat: add partner support channel section to dashboard"
```

---

### Task 14: Update Admin Panel for Institutional Partners

**Files:**
- Modify: `src/components/admin/PartnersTab.jsx`

**Step 1: Add partner_type badge and institutional filter**

Show "Church" or "Funeral Home" badge next to partner names. Add filter dropdown: All / Churches / Funeral Homes / Regular.

**Step 2: Add ability to set commission override from admin**

Add an inline commission override input for each institutional partner.

**Step 3: Commit**

```bash
git add src/components/admin/PartnersTab.jsx
git commit -m "feat: add institutional partner management to admin panel"
```

---

### Task 15: Deploy Everything

**Step 1: Deploy auth API worker**

```bash
npx wrangler deploy --config workers/auth-api-wrangler.toml
```

**Step 2: Build and deploy frontend**

```bash
npm run build
npx wrangler pages deploy dist --project-name funeral-brochure-app
```

**Step 3: Push to GitHub**

```bash
git push origin main
```

**Step 4: Verify**

- Test partner signup flow with church/funeral home selection
- Test co-branded landing page with `?ref=CODE`
- Test bulk credit purchase
- Test print discount for institutional partner
- Test WhatsApp templates copy
- Test denomination template filter
