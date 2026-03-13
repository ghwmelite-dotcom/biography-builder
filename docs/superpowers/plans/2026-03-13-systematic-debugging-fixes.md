# Systematic Debugging Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical, high, and medium severity bugs identified by the systematic debugging audit of the Funeral Press codebase.

**Architecture:** Six independent fix categories targeting: (1) credit deduction race conditions in auth-api worker, (2) image upload key sanitization, (3) CORS restriction on write endpoints, (4) parseInt validation for admin date filters, (5) ESLint error cleanup across stores and components, (6) useless try/catch removal in purchaseStore.

**Tech Stack:** Cloudflare Workers (vanilla JS), React 19, Zustand, Vite, ESLint

---

## Chunk 1: Backend Security & Data Integrity Fixes

### Task 1: Fix credit deduction race condition (CRITICAL)

**Files:**
- Modify: `workers/auth-api.js:847-877` (handleUnlockDesign)
- Modify: `workers/auth-api.js:1294-1314` (handleCreateGuestBook)
- Modify: `workers/auth-api.js:1351-1372` (handleCreateObituary)
- Modify: `workers/auth-api.js:1401-1422` (handleCreateGallery)

**Problem:** SELECT credits → check → UPDATE is not atomic. Concurrent requests can double-decrement.

**Fix pattern:** Use atomic `UPDATE ... WHERE credits_remaining > 0` and check `meta.changes` to verify the row was actually updated before proceeding.

- [ ] **Step 1: Fix handleUnlockDesign (lines 847-877)**

Replace the non-atomic read-check-write with:
```javascript
async function handleUnlockDesign(request, env, userId) {
  const { designId, productType } = await request.json()
  if (!designId || !productType) return error('Missing designId or productType', 400, request)

  // Check if already unlocked (idempotent)
  const existing = await env.DB.prepare('SELECT id FROM unlocked_designs WHERE user_id = ? AND design_id = ?').bind(userId, designId).first()
  if (existing) {
    const purchaseData = await getUserPurchaseData(env, userId)
    return json({ unlocked: true, ...purchaseData }, 200, request)
  }

  // Atomic credit check + decrement (skip decrement for unlimited users with -1)
  const user = await env.DB.prepare('SELECT credits_remaining FROM users WHERE id = ?').bind(userId).first()
  const credits = user?.credits_remaining ?? 0
  if (credits === 0) return error('No credits remaining', 402, request)

  if (credits > 0) {
    const result = await env.DB.prepare('UPDATE users SET credits_remaining = credits_remaining - 1 WHERE id = ? AND credits_remaining > 0').bind(userId).run()
    if (!result.meta.changes) return error('No credits remaining', 402, request)
  }

  // Find most recent successful order for this user
  const order = await env.DB.prepare("SELECT id FROM orders WHERE user_id = ? AND status = 'success' ORDER BY paid_at DESC LIMIT 1").bind(userId).first()
  if (!order) return error('No valid order found', 402, request)

  await env.DB.prepare('INSERT INTO unlocked_designs (id, user_id, order_id, design_id, product_type) VALUES (?, ?, ?, ?, ?)')
    .bind(generateId(), userId, order.id, designId, productType).run()

  const purchaseData = await getUserPurchaseData(env, userId)
  return json({ unlocked: true, ...purchaseData }, 200, request)
}
```

- [ ] **Step 2: Fix handleCreateGuestBook (lines 1294-1314)**

Replace non-atomic pattern. Change:
```javascript
const credits = user?.credits_remaining ?? 0
if (credits === 0) return error(...)
// ... insert ...
if (credits !== -1) {
  await env.DB.prepare('UPDATE users SET credits_remaining = credits_remaining - 1 WHERE id = ?').bind(userId).run()
}
```

To:
```javascript
const credits = user?.credits_remaining ?? 0
if (credits === 0) return error(...)
if (credits > 0) {
  const result = await env.DB.prepare('UPDATE users SET credits_remaining = credits_remaining - 1 WHERE id = ? AND credits_remaining > 0').bind(userId).run()
  if (!result.meta.changes) return error('No credits remaining', 403, request)
}
// ... then insert ...
```

- [ ] **Step 3: Fix handleCreateObituary (lines 1351-1372)**

Same pattern as Step 2. Move credit decrement BEFORE the INSERT and add atomic guard.

- [ ] **Step 4: Fix handleCreateGallery (lines 1401-1422)**

Same pattern as Step 2. Move credit decrement BEFORE the INSERT and add atomic guard.

- [ ] **Step 5: Verify build still compiles**

Run: `npx vite build`
Expected: Clean build, no errors

---

### Task 2: Sanitize image upload/serve keys

**Files:**
- Modify: `workers/auth-api.js:532-561` (handleImageUpload + handleImageServe)

**Problem:** Image key goes directly to R2 without sanitization. Path traversal risk.

- [ ] **Step 1: Add key sanitization to handleImageServe**

Add validation that key doesn't contain `..` or start with `/`:
```javascript
async function handleImageServe(request, env, key) {
  if (key.includes('..') || key.startsWith('/')) return new Response('Invalid key', { status: 400, headers: corsHeaders(request) })
  const object = await env.IMAGES.get(key)
  // ... rest unchanged
}
```

- [ ] **Step 2: Add file size limit to handleImageUpload**

Add validation before R2 put:
```javascript
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
if (file.size > MAX_IMAGE_SIZE) return error('File too large (max 10MB)', 413, request)
```

---

### Task 3: Restrict CORS on write endpoints

**Files:**
- Modify: `workers/share-api.js:15-19`
- Modify: `workers/memorial-page-api.js:16-20`
- Modify: `workers/live-service-api.js:16-20`

**Problem:** `Access-Control-Allow-Origin: *` allows any domain to POST.

**Fix:** Use origin-checking CORS like auth-api.js does. For GET requests (public data), keep `*`. For POST/PUT, restrict to funeralpress.org origins.

- [ ] **Step 1: Update share-api.js CORS**

Replace static corsHeaders with a function that checks origin for write methods:
```javascript
const ALLOWED_ORIGINS = [
  'https://funeral-brochure-app.pages.dev',
  'https://funeralpress.org',
  'https://www.funeralpress.org',
  'http://localhost:5173',
  'http://localhost:4173',
]

function getCorsOrigin(request) {
  const origin = request.headers.get('Origin') || ''
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.funeral-brochure-app.pages.dev')) {
    return origin
  }
  return ALLOWED_ORIGINS[0]
}

function corsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": request ? getCorsOrigin(request) : '*',
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  }
}
```
Then update all Response constructors to pass `request` to `corsHeaders()`.

- [ ] **Step 2: Update memorial-page-api.js CORS (same pattern)**
- [ ] **Step 3: Update live-service-api.js CORS (same pattern)**

---

### Task 4: Validate parseInt for days filter

**Files:**
- Modify: `workers/auth-api.js:1000-1002`

**Problem:** `parseInt(days)` can return NaN, producing invalid SQL.

- [ ] **Step 1: Add NaN guard**

Change:
```javascript
if (days !== 'all') {
  where += ` AND o.created_at >= datetime('now', '-${parseInt(days)} days')`
}
```
To:
```javascript
if (days !== 'all') {
  const daysInt = parseInt(days)
  if (isNaN(daysInt) || daysInt < 0) return error('Invalid days filter', 400, request)
  where += ` AND o.created_at >= datetime('now', '-${daysInt} days')`
}
```

---

### Task 5: Add bulk sync validation

**Files:**
- Modify: `workers/auth-api.js:507-528`

**Problem:** No limit on design count in bulk sync. Potential DoS.

- [ ] **Step 1: Add array length limit**

After `if (!Array.isArray(designs))` check, add:
```javascript
if (designs.length > 100) return error('Too many designs (max 100)', 400, request)
```

---

## Chunk 2: Frontend ESLint & Code Quality Fixes

### Task 6: Fix store extractData unused variables

**Files:**
- Modify: `src/stores/posterStore.js`
- Modify: `src/stores/thankYouStore.js`
- Modify: `src/stores/bannerStore.js`
- Modify: `src/stores/bookletStore.js`
- Modify: `src/stores/invitationStore.js`
- Modify: `src/stores/oneWeekStore.js`
- Modify: `src/stores/collageStore.js`
- Modify: `src/stores/brochureStore.js`

**Problem:** `extractData()` destructures ~30 variables just to exclude them via `...rest`. ESLint reports them all as unused.

**Fix:** Use `Object.keys()` filtering instead of destructuring. This is cleaner and eliminates all the unused var warnings.

- [ ] **Step 1: Create a shared utility for extractData pattern**

Don't create a new file - instead fix each store's `extractData` to use a filtering approach. Replace the destructuring with:
```javascript
function extractData(state) {
  const exclude = new Set([
    'currentId', 'isDirty', 'history', 'historyIndex', 'postersList',
    'editCountSinceLastSave', 'lastAutoSaveAt', 'snapshots',
    '_pushHistory', 'updateField', 'updateNested',
    // ... all method names for that store
    'undo', 'redo', 'canUndo', 'canRedo',
    'savePoster', 'loadPoster', 'deletePoster', 'newPoster',
    'loadFromCloudData', 'loadTemplate',
    'exportJSON', 'importJSON', 'applyImport',
    'createSnapshot', 'restoreSnapshot', 'deleteSnapshot',
    'getSmartFilename',
  ])
  return Object.fromEntries(Object.entries(state).filter(([k]) => !exclude.has(k)))
}
```

Apply this pattern to each store, adjusting the exclusion list per store.

- [ ] **Step 2-8: Apply to each store** (one per store file)

---

### Task 7: Fix component-level ESLint errors

**Files:**
- Modify: `src/components/admin/OverviewTab.jsx:22` (unused `Icon` import)
- Modify: `src/components/auth/UserMenu.jsx:38,103` (unused `Icon`)
- Modify: `src/components/collage/CollageCanvas.jsx:1,26` (unused `useRef`, `isSpecialShape`)
- Modify: `src/components/collage/CollageExport.jsx:22` (unused `err`)
- Modify: `src/components/editor/HymnCatalogDialog.jsx:4` (unused `hymns`)
- Modify: `src/components/editor/PrintMaterialsForm.jsx:227` (unused `coverPhoto`)
- Modify: `src/components/editor/ScriptureForm.jsx:4` (unused `getAllScriptures`)
- Modify: `src/components/layout/BannerEditorLayout.jsx:203` (unused `Component`)
- Modify: `src/components/layout/BookletEditorLayout.jsx:218` (unused `Component`)
- Modify: `src/components/layout/EditorLayout.jsx:1,189` (unused `useCallback`, `Component`)
- Modify: `src/components/layout/InvitationEditorLayout.jsx:212` (unused `Component`)
- Modify: `src/components/layout/LoadSharedDialog.jsx:26` (unused `sharedAt`, `updatedAt`)
- Modify: `src/components/layout/OneWeekEditorLayout.jsx:200` (unused `Component`)
- Modify: `src/components/layout/PageTransition.jsx:2` (unused `useRef`)
- Modify: `src/stores/printOrderStore.js:114` (unused `err`)

- [ ] **Steps 1-15: Remove each unused import/variable**

---

### Task 8: Fix purchaseStore useless try/catch

**Files:**
- Modify: `src/stores/purchaseStore.js:70-87,89-106`

**Problem:** `catch (err) { throw err }` adds no value.

- [ ] **Step 1: Remove useless try/catch wrappers**

Change `handlePaymentSuccess` and `unlockDesign` to not wrap in try/catch since they just re-throw.

---

### Task 9: Final verification

- [ ] **Step 1: Run ESLint and confirm error count is dramatically reduced**
- [ ] **Step 2: Run production build and confirm it succeeds**
- [ ] **Step 3: Commit all fixes**
