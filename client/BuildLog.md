# Echoes — Development Log

A record of the errors, bugs and solutions encountered while building Echoes, a private shared scrapbook app with real-time notifications, payments and physical book printing.

---

## Backend Setup

**Issue:** Windows port binding — Node wouldn't bind to ports via Git Bash.
**Fix:** Used VS Code's PowerShell terminal instead, hardcoded port 3007 and bound to `'0.0.0.0'`.

**Issue:** `const User` redeclared inside `registerUser`, causing a syntax conflict.
**Fix:** Renamed the local variable to `const newUser`.

**Issue:** Duplicate `async (req, res) =>` inside `loginUser`.
**Fix:** Removed the extra arrow function wrapper.

**Issue:** Error handling middleware missing the `req` parameter — `(err, reqs, next)`.
**Fix:** Corrected to `(err, req, res, next)`.

**Issue:** CORS blocked requests from Vercel frontend to Render backend.
**Fix:** Added `cors({ origin: '*', credentials: false })`.

**Issue:** `.env` accidentally pushed to GitHub, exposing secrets.
**Fix:** Ran `git rm --cached .env`, added `.gitignore`, rotated MongoDB Atlas password.

**Issue:** `PORT=3007;` in `.env` had a trailing semicolon, causing `EACCES` on `node server.js`.
**Fix:** Removed the semicolon from the `.env` value.

---

## Authentication

**Issue:** `toLowercase()` typo (should be `toLowerCase()`) crashed registration and login.
**Fix:** Corrected method name in both `registerUser` and `loginUser`.

**Issue:** Login response didn't include `profilePicture`, `isPro`, or `proExpiresAt`, so these reset on every login.
**Fix:** Added all relevant fields to the `res.status(201).json({...})` payload in `loginUser`.

---

## Image Uploads & Cloudinary

**Issue:** Cloudinary API key (a number) caused a syntax issue in `multer.js`.
**Fix:** Wrapped values correctly and validated env var types.

**Issue:** Cover image wasn't saving on scrapbook creation.
**Fix:** Found `createScrapbook({ title, description })` was missing `coverImage` in the payload — added it.

**Issue:** Scrapbook cover image overflowing on certain screen sizes (mobile/laptop), leaving white space below.
**Fix:** Added `overflow: hidden` to `footer`, constrained `.foot-img-b` with `max-height: 100%; object-fit: cover;`.

---

## Real-Time Notifications (Socket.io)

**Issue:** Circular dependency — `memoryController.js` imported `io` directly from `server.js`.
**Fix:** Created `config/socket.js` with `init()` and `getIO()` to decouple socket instance from the server file.

**Issue:** `http` was used in `server.js` before being required.
**Fix:** Added `const http = require('http')` at the top of the file, before `http.createServer(app)`.

**Issue:** Sockets disconnecting after a few minutes — caused by Render's free tier sleeping.
**Fix:** Added reconnection options (`reconnection: true`, `reconnectionAttempts`, `reconnectionDelay`) and a keep-alive ping (`setInterval` hitting the server every 5–10 minutes).

---

## Email (Nodemailer → Brevo)

**Issue:** Gmail SMTP via Nodemailer timed out on Render (`ETIMEDOUT`) — Render's free tier blocks outbound SMTP on ports 587/465.
**Fix:** Migrated to Brevo. Initially used SMTP credentials (same timeout issue), then switched to the **Brevo HTTP API**, which works over standard HTTPS and isn't blocked.

**Issue:** Brevo package import errors — `Cannot read properties of undefined (reading 'instance')`, `TransactionalEmailsApi is not a constructor`, `Brevo is not a constructor`.
**Fix:** The `@getbrevo/brevo` package structure changed over versions. Resolved by inspecting `Object.keys(require('@getbrevo/brevo'))` directly and using the correct export: `BrevoClient`.

**Issue:** `client.sendTransacEmail is not a function`.
**Fix:** Inspected the prototype methods on the client instance to find the correct method name.

**Issue:** Brevo rejected sender email — `a44e25001@smtp-brevo.com is not valid`.
**Fix:** Verified a real sender email (`echoesmemo.noreply@gmail.com`) under Brevo's **Senders & IP** settings and used that as the `sender.email`.

**Issue:** Transactional emails silently not sending (no logs, no errors).
**Fix:** Discovered Brevo's **Transactional Email** feature must be explicitly activated on the account — separate from the campaign/marketing email feature.

**Issue:** Memory creation succeeded but UI showed "Failed to add memory" toast.
**Fix:** Email-sending logic inside `createMemory` was throwing and being caught by the outer try/catch *after* the response should have sent. Wrapped email logic in its own nested `try/catch` so failures there don't affect the main response, and fixed a scoping bug where `populatedMemory` was declared inside the wrong block.

---

## Password Reset

**Issue:** `resetPasswordToken` / `resetPasswordExpire` saved as `undefined` to MongoDB.
**Fix:** Switched from mutating a fetched Mongoose document + `.save()` to using `User.findByIdAndUpdate()` directly, which reliably persisted the fields.

**Issue:** Reset link timing out (`ENETUNREACH` / connection timeout) due to Render cold starts.
**Fix:** Increased token expiry to 1 hour, added a "wake up" ping to the `ResetPassword` page on mount to pre-warm the Render server before the user submits.

---

## Pagination

**Issue:** After adding pagination, `scrapbooks.filter is not a function` — frontend expected an array but API now returned `{ scrapbooks, totalPages, currentPage }`.
**Fix:** Updated state handlers to read `data.scrapbooks` instead of `data` directly, with a backward-compatible check (`Array.isArray(data)`) during the transition.

**Issue:** Pagination not visibly changing the API response locally.
**Fix:** Local frontend was still pointing at the **live Render URL**, not localhost — so local code changes had no effect until deployed. Confirmed `baseURL` in `api.js` before debugging further.

---

## Freemium Limits & Pro Subscription

**Issue:** Paystack `currency: 'USD'` rejected — "Currency not supported by merchant" (test mode defaults to NGN).
**Fix:** Removed explicit currency, let Paystack default to NGN, converted USD display prices to NGN equivalents for the actual `amount` sent to Paystack.

**Issue:** `isPro` and `proExpiresAt` not persisting after payment — kept reading as `undefined` from MongoDB even after "successful" updates.
**Fix:** Root cause was the fields **didn't exist in the Mongoose schema at all** — `User.js` was missing `isPro` and `proExpiresAt`. Once added, `User.updateOne()` worked correctly. (Lesson: validate the schema before debugging the query logic.)

**Issue:** Mongoose deprecation warning for `{ new: true }` on `findOneAndUpdate`.
**Fix:** Migrated to `{ returnDocument: 'after' }` (then ultimately to `updateOne` for this use case).

**Issue:** Pro badge appeared after payment but vanished after logout/login.
**Fix:** `loginUser` response wasn't including `isPro`/`proExpiresAt` — same root cause as the earlier profile picture bug. Fixed by including all relevant fields in the login response.

---

## Print Feature — PDF Generation

This was the most complex and error-prone part of the build.

**Attempt 1 — PDFKit on Render directly**
**Issue:** PDF generation (especially with embedded images) timed out or took 6–10+ minutes on Render's free tier.
**Fix:** Abandoned in-process PDF generation in favor of a third-party PDF API.

**Attempt 2 — PDFShift**
**Issue:** Free tier capped documents at 2MB — image-heavy interior PDFs exceeded this immediately.
**Fix:** Considered resizing images (rejected — would hurt print quality) or upgrading the paid plan. Ultimately moved to a different provider.

**Attempt 3 — API2PDF (final choice)**
**Issue:** No fixed size limits, pay-per-conversion (~$0.001/PDF), 2GB RAM / 90s runtime per job — well suited for photo-heavy print PDFs.
**Fix:** Adopted this as the permanent PDF generation service.

**Issue:** Generated PDFs defaulted to Letter size regardless of `paperWidth`/`paperHeight` options passed to the API2PDF library wrapper.
**Fix:** Switched to calling the API2PDF REST endpoint directly via `axios` instead of the npm wrapper, and ultimately controlled page size via CSS `@page { size: ... }` combined with `preferCSSPageSize: true` in the API options — this was the setting that actually took effect.

**Issue:** Lulu rejected printed PDFs — "Book Size: PDF dimensions are X, expected Y".
**Fix:** Required exact trim-size matching per `pod_package_id`. Iterated through several incorrect dimension sets before locking in the correct width × height (in inches) per book size (small / standard / premium), passed through to the `@page` CSS rule.

**Issue:** Cover PDF separately rejected by Lulu — "file type is not a valid PDF" and later "Book Size" mismatch on the cover specifically.
**Fix:** Discovered the **cover** requires different (larger) dimensions than the interior — it must wrap the front cover, spine, and back cover as a single flat PDF. Called Lulu's `/cover-dimensions/` endpoint to fetch the exact required width/height (returned in points), converted to inches (`/72`), and passed those into the cover's `@page` CSS rule — **width before height**, since swapping the order silently produced a portrait/landscape mismatch.

**Issue:** "Insufficient funds" error from API2PDF mid-generation.
**Fix:** Topped up the API2PDF account balance (~$5 covers thousands of generations at $0.001 each).

**Issue:** Lulu rejected orders for not meeting the minimum page count (24 pages).
**Fix:** Added a minimum-memories check (22 photos) on the frontend before allowing checkout, with a clear warning message — avoided silently padding the PDF with blank pages.

---

## Lulu Integration

**Issue:** Lulu OAuth token endpoint and pod package IDs were non-obvious — initial guesses at `pod_package_id` values were rejected outright.
**Fix:** Used Lulu's public Pricing Calculator to generate the correct 27-character SKU codes for each desired trim size / paper / binding combination.

**Issue:** `shipping_address.country_code` rejected — Lulu requires ISO 3166-1 alpha-2 codes, not full country names.
**Fix:** Replaced free-text country input with a `<select>` populated from the `country-list` npm package, submitting the 2-letter code.

**Issue:** Lulu flagged "high ink coverage" warnings/rejections on Standard print quality.
**Fix:** Switched the `pod_package_id` selection to **Premium** color quality packages.

---

## Custom Domain & Deployment

**Issue:** After adding the custom domain (`echoesmemo.xyz`), password reset emails still linked to the old Vercel URL.
**Fix:** Updated the `CLIENT_URL` environment variable on Render — this was the only change needed since all `resetUrl` links were built from that variable.

**Issue:** Local testing was confusing because the frontend `api.js` `baseURL` always pointed at the live Render backend, so local server changes had no visible effect.
**Fix:** Either temporarily pointed `baseURL` at `http://localhost:3007/api` for local-only testing, or used a separate Vercel preview deployment (via a `testing` git branch) to validate changes safely before merging to `main`.

---

## Time Capsules

**Issue:** `TimeCapsule validation failed: scrapbook: Path 'scrapbook' is required.`
**Fix:** Made `scrapbook` optional (`required: false`, `default: null`) in the schema — capsules can exist standalone or linked to a scrapbook.

**Issue:** `TimeCapsule validation failed: createdBy: Path 'createdBy' is required.`
**Fix:** `createdBy` was missing entirely from the schema — added it as a required `ObjectId` ref to `User`.

**Issue:** Hourly capsule-unlock cron job (`checkAndUnlockCapsules`) threw validation errors trying to re-save legacy documents created before `createdBy` existed.
**Fix:** Added a `createdBy: { $exists: true }` filter to the query so legacy/incomplete documents are skipped instead of crashing the job.

---

## Order Tracking & Payment Integrity

**Issue:** Paystack's Pro-subscription `PaymentVerify` flow and the print-order `PaymentVerify` flow conflicted — paying for Pro sometimes redirected through the "Creating your print order" state.
**Fix:** Cleared `pendingPrintOrder` from `localStorage` at the start of any Pro-subscription payment, and had `PaymentVerify` branch its logic based on the returned `plan` field from `verifyPayment` rather than assuming order type from localStorage alone.

**Issue:** No protection against double-charging if a user's network failed mid-payment and they retried.
**Fix:** Added a check for an existing pending order within the last 30 minutes before initializing a new Paystack transaction; pending print orders are now also recorded server-side (not just in localStorage) keyed by Paystack reference, with a `completePendingOrder` step to mark them resolved after success.

**Issue:** No way to know if a Lulu print job had shipped or been delivered — Echoes only ever recorded "created".
**Fix:** Registered a Lulu webhook (`job.status_changed`) pointing at `/api/webhooks/lulu`, mapping Lulu's status names to internal order statuses and triggering a "shipped" notification email automatically.


## Lulu Print-on-Demand Webhook Integration

**Area of work:** Built out the Lulu print-on-demand webhook integration, including token-based security for incoming webhook requests and order status mapping between Lulu's order states and Echoes' internal order model.

**Issue encountered:** A middleware ordering issue was identified and fixed as part of this integration — webhook signature/token verification needs to run before the request body is parsed or acted upon, otherwise unverified requests could be processed.
Resolution: Corrected the middleware order so token verification runs first in the request pipeline, ensuring only authenticated Lulu webhook calls are processed.

## CORS and Async Syntax Errors in server.js

**Area of work:** server.js was rewritten to address CORS configuration issues and async syntax errors.
Likely root cause: CORS issues typically stem from either a missing/misconfigured origin allowlist (frontend domain not permitted) or CORS middleware being applied after routes are already defined. Async syntax errors commonly come from missing await keywords, unhandled promise rejections, or mixing callback-style and async/await patterns inconsistently.
Resolution: server.js was rewritten with corrected CORS middleware placement/configuration and consistent async/await usage throughout.
## Paystack Payment & Order System Security Audit

**Area of work:** Completed a major security audit of the Paystack payment and order system.
Typical risk areas in payment integrations: 
•Trusting client-supplied payment amounts/order data instead of verifying against Paystack's server-side transaction record
•Missing or incomplete webhook signature verification, allowing forged payment confirmation requests
•Order status updates triggered by client redirect callbacks alone, rather than confirmed server-to-server webhook events
•Lack of idempotency handling, allowing duplicate order fulfillment from repeated webhook deliveries
Resolution: Audit findings were addressed to ensure payment verification and order fulfillment rely on server-verified Paystack data rather than client-provided values.
## Email Verification Flow

**Area of work:** Ongoing fixes to the email verification flow, including a frontend update to VerifyEmail.jsx.
Typical issues in verification flows: 
•Verification tokens expiring or being single-use in ways that break legitimate retry attempts
•Frontend not properly handling token-from-URL extraction or expired/invalid token states
•Race conditions between account creation and verification email delivery
Status: This area was still being worked on at the time of this log and had a pending frontend update to VerifyEmail.jsx.
## MongoDB Database Mismatch
**Area of work:** An investigation into a MongoDB database mismatch was ongoing.
Typical causes of this class of issue: 
•Application connecting to a different database name/cluster in one environment (e.g. local) versus another (e.g. production/Render)
•Inconsistent environment variable values for the MongoDB connection string across environments
•Data written to one collection/database during testing that doesn't match what the production app reads from
Status: Investigation was ongoing at the time of this log; no confirmed root cause or resolution recorded yet.


---

## Key Lessons

1. **Validate the schema first.** Several multi-hour debugging sessions (Pro status not saving, time capsule creation failing) were ultimately caused by a missing field in the Mongoose schema — not faulty controller logic.
2. **Render's free tier has real constraints** — no long-running CPU-heavy tasks (PDF generation), and cold starts/sleep require explicit keep-alive handling for time-sensitive flows like password reset.
3. **Outbound SMTP is often blocked on free hosting tiers.** HTTP-based transactional email APIs (like Brevo's) are far more reliable than SMTP on platforms like Render.
4. **Third-party document services have hidden constraints** (file size caps, exact dimension requirements, dimension *order* sensitivity) that only surface through trial, error, and reading rejection messages carefully — Lulu's own dimension-lookup endpoint (`/cover-dimensions/`) ended up being more reliable than hardcoding values.
5. **Test in production-equivalent conditions early.** Several bugs (pagination response shape, profile picture not saving, local vs. live confusion) only appeared because local and deployed environments silently diverged.