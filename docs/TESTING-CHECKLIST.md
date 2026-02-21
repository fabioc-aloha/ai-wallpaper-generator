# Testing Checklist

**Purpose**: Comprehensive QA checklist for iPhone 16 Pro wallpaper generator
**Device**: iPhone 16 Pro (1179×2556, iOS 26.4 beta)
**Testing Time**: ~4-6 hours

---

## 📋 Pre-Deployment Testing

### ✅ Development Environment

- [ ] `npm run dev` starts without errors
- [ ] No TypeScript compilation errors
- [ ] All environment variables loaded correctly
- [ ] Azure Function runs locally (`func start`)
- [ ] Storage emulator accessible (or remote connection works)

---

## 🔧 Backend API Testing

### POST /api/generate

**Test 1: Successful Generation**
```bash
# Using curl
curl -X POST https://wallpaper-func-2026.azurewebsites.net/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Abstract blue gradient with geometric patterns",
    "model": "flux-1.1-pro",
    "style": "minimalist"
  }'
```

- [ ] Returns 202 Accepted status
- [ ] Response includes `job_id`
- [ ] Response time < 500ms

**Test 2: Invalid Prompt**
```bash
curl -X POST https://wallpaper-func-2026.azurewebsites.net/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "", "model": "flux-1.1-pro"}'
```

- [ ] Returns 400 Bad Request
- [ ] Error message: "Prompt is required"

**Test 3: Long Prompt (>500 chars)**
```bash
curl -X POST https://wallpaper-func-2026.azurewebsites.net/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$(printf 'a%.0s' {1..600})\", \"model\": \"flux-1.1-pro\"}"
```

- [ ] Returns 400 Bad Request
- [ ] Error message: "Prompt too long"

### GET /api/status/:jobId

**Test 4: Job Status Polling**
```bash
# Replace JOB_ID with actual ID from Test 1
curl https://wallpaper-func-2026.azurewebsites.net/api/status/JOB_ID
```

- [ ] Returns `{"status": "processing"}` initially
- [ ] Eventually returns `{"status": "completed", "url": "..."}`
- [ ] Image URL is accessible
- [ ] Response time < 200ms

**Test 5: Non-Existent Job**
```bash
curl https://wallpaper-func-2026.azurewebsites.net/api/status/fake-job-id
```

- [ ] Returns 404 Not Found
- [ ] Error message: "Job not found"

### GET /api/history

**Test 6: Generation History**
```bash
curl https://wallpaper-func-2026.azurewebsites.net/api/history
```

- [ ] Returns array of previous generations
- [ ] Each item includes: `id`, `prompt`, `url`, `timestamp`
- [ ] Sorted by most recent first
- [ ] Response time < 300ms

---

## 📱 iPhone 16 Pro Testing

### Device Specifications

- [ ] Device: iPhone 16 Pro
- [ ] iOS Version: 26.4 beta (or later)
- [ ] Safari Version: Latest
- [ ] Screen Resolution: 1179×2556 verified

### PWA Installation

**Test 7: Add to Home Screen**
1. Open Safari on iPhone 16 Pro
2. Navigate to `https://wallpaper-app-2026.azurestaticapps.net`
3. Tap Share button → "Add to Home Screen"

- [ ] PWA icon appears on home screen
- [ ] Icon uses correct logo (512×512 PNG)
- [ ] App name: "AI Wallpaper Generator" displays correctly
- [ ] No Safari UI chrome when opened from home screen
- [ ] Splash screen appears during launch
- [ ] Theme color matches design (#1a1a1a or your choice)

### Viewport & Safe Areas

**Test 8: Dynamic Island Compatibility**
1. Open PWA from home screen
2. Check top safe area (Status Bar + Dynamic Island)

- [ ] No UI elements obscured by Dynamic Island (59px from top)
- [ ] Header/nav respects safe area
- [ ] CSS: `padding-top: env(safe-area-inset-top)` applied

**Test 9: Home Indicator Clearance**
1. Scroll to bottom of page

- [ ] No UI elements obscured by home indicator (34px from bottom)
- [ ] Bottom nav/buttons respect safe area
- [ ] CSS: `padding-bottom: env(safe-area-inset-bottom)` applied

### Image Generation

**Test 10: Prompt Input**
1. Tap prompt input field

- [ ] Keyboard appears smoothly
- [ ] Input field scrolls into view (not hidden by keyboard)
- [ ] Character counter visible
- [ ] 500-character limit enforced

**Test 11: Generate Wallpaper**
1. Enter prompt: "Sunset over mountains, vibrant colors"
2. Tap "Generate" button

- [ ] Button shows loading state (spinner + "Generating...")
- [ ] Loading indicator appears
- [ ] Estimated time displayed (15-25 seconds)
- [ ] Progress updates (if using polling)
- [ ] Generation completes successfully
- [ ] Image appears in viewport

**Test 12: Image Quality**
1. View generated wallpaper

- [ ] Image resolution: Exactly 1179×2556 (verify in Files app)
- [ ] Image format: PNG or JPEG
- [ ] File size: < 2MB (ideally < 1MB)
- [ ] No pixelation when viewed at 100%
- [ ] Colors accurate (not washed out)

**Test 13: Set as Wallpaper**
1. Tap generated image
2. Tap Share → "Use as Wallpaper"

- [ ] iOS wallpaper picker opens
- [ ] Image fits perfectly (no cropping needed)
- [ ] Safe areas respected (time/widgets not obscured)
- [ ] Image looks crisp on home screen
- [ ] Image looks crisp on lock screen

---

## 🌐 Offline Mode Testing

### Service Worker Installation

**Test 14: SW Registration**
1. Open Developer Tools (Safari on Mac → Develop → iPhone Pro)
2. Navigate to PWA

- [ ] Service Worker registered successfully
- [ ] Console: "Service Worker installed"
- [ ] No SW registration errors

**Test 15: Cache Population**
1. Generate 2-3 wallpapers
2. Check Application tab → Cache Storage

- [ ] `wallpaper-cache-v1` exists
- [ ] Cached resources include: index.html, app.js, app.css
- [ ] Generated wallpapers NOT cached (too large)

### Offline Functionality

**Test 16: Airplane Mode**
1. Enable Airplane Mode
2. Open PWA from home screen

- [ ] App loads successfully
- [ ] UI appears (from Service Worker cache)
- [ ] "Offline Mode" indicator visible
- [ ] Previous wallpapers visible (from LocalStorage)
- [ ] "Generate" button disabled with message: "Connect to internet"

**Test 17: Reconnection**
1. Disable Airplane Mode
2. Wait 5 seconds

- [ ] "Offline Mode" indicator disappears
- [ ] "Generate" button re-enabled
- [ ] Can generate new wallpapers

**Test 18: Background Sync (iOS 26.4+)**
1. Generate wallpaper
2. Enable Airplane Mode immediately
3. Disable Airplane Mode after 30 seconds

- [ ] Background Sync API queues request (if supported)
- [ ] Generation completes when online
- [ ] User notified of completion

---

## ⚡ Performance Testing

### Page Load Performance

**Test 19: Initial Load**
1. Clear Safari cache
2. Navigate to PWA URL
3. Open Web Inspector → Timelines

- [ ] First Contentful Paint (FCP): < 1.5s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Time to Interactive (TTI): < 3s
- [ ] Total page size: < 500KB (before images)

**Test 20: Subsequent Loads**
1. Refresh page (Cmd+R)

- [ ] Page loads from Service Worker cache
- [ ] Load time: < 500ms
- [ ] No network requests for cached resources

### API Performance

**Test 21: Generation Speed**
1. Generate wallpaper with prompt: "Simple blue gradient"
2. Measure time from button click to image display

- [ ] Total time: 15-30 seconds
- [ ] API response (202): < 500ms
- [ ] Status polling interval: 2 seconds
- [ ] Image download: < 3 seconds

**Test 22: Cold Start (Azure Functions)**
1. Wait 20 minutes (Functions scales to zero)
2. Generate wallpaper

- [ ] First request: 3-5 seconds (cold start)
- [ ] Second request: < 1 second (warm start)
- [ ] No timeout errors

### Memory Usage

**Test 23: Safari Memory**
1. Open Settings → Safari → Advanced → Web Inspector
2. Monitor memory while generating 10 wallpapers

- [ ] Memory usage: < 200MB
- [ ] No memory leaks (memory released after use)
- [ ] No Safari crashes or reloads

---

## 💰 Cost Tracking

### Replicate API

**Test 24: Generation Cost**
1. Generate 1 wallpaper
2. Check Replicate dashboard (https://replicate.com/account/usage)

- [ ] Cost per generation: ~$0.0045 (flux-1.1-pro)
- [ ] Actual cost matches estimate
- [ ] No unexpected charges

**Test 25: Monthly Cost Projection**
1Create 50 test wallpapers
2. Calculate: 50 × $0.0045 = $0.225

- [ ] Matches Replicate dashboard
- [ ] Projected 200 wallpapers/month = $0.90

### Azure Costs

**Test 26: Azure Cost Analysis**
1. Open Azure Portal → Cost Management
2. Filter by Resource Group: `wallpaper-rg`
3. View past 30 days

- [ ] Storage: < $0.05/month
- [ ] Functions: < $0.30/month
- [ ] Total Azure: < $0.50/month
- [ ] Combined with Replicate: < $1.50/month (MVP target met)

**Test 27: Budget Alert**
1. Check email for budget alert

- [ ] No alert received (cost under $4 threshold)
- [ ] Alert configuration active in Azure

---

## 🔒 Security Testing

### API Security

**Test 28: CORS Validation**
```bash
curl -X POST https://wallpaper-func-2026.azurewebsites.net/api/generate \
  -H "Origin: https://evil-site.com" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

- [ ] Returns 403 Forbidden or blocks request
- [ ] CORS headers only allow Static Web App origin

**Test 29: Key Vault Security**
1. Check Function App logs
2. Verify API keys not exposed

- [ ] Replicate API key never logged
- [ ] Key retrieved from Key Vault (not environment variable)
- [ ] No secrets in client-side code

**Test 30: Input Sanitization**
```bash
curl -X POST https://wallpaper-func-2026.azurewebsites.net/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "<script>alert(\"XSS\")</script>"}'
```

- [ ] Prompt sanitized before sending to Replicate
- [ ] No code execution
- [ ] Returns 400 if malicious content detected

---

## 📊 Application Insights

### Telemetry Verification

**Test 31: Request Tracking**
1. Generate 3 wallpapers
2. Open Azure Portal → Application Insights → Transactions

- [ ] 3 POST /api/generate requests logged
- [ ] Response times recorded
- [ ] Success/failure status tracked

**Test 32: Custom Events**
1. Check Application Insights → Events

- [ ] Custom event: `wallpaper_generated`
- [ ] Properties include: `prompt_length`, `model`, `generation_time`
- [ ] Client-side events tracked (page views, button clicks)

**Test 33: Failure Tracking**
1. Intentionally cause error (invalid API key)
2. Check Application Insights → Failures

- [ ] Exception logged
- [ ] Stack trace captured
- [ ] User notified with friendly error message

---

## ♿ Accessibility Testing

**Test 34: VoiceOver (iOS Screen Reader)**
1. Enable VoiceOver (Settings → Accessibility)
2. Navigate PWA

- [ ] All buttons have descriptive labels
- [ ] Image alt text reads generated prompt
- [ ] Form inputs have associated labels
- [ ] Navigation order logical

**Test 35: Dynamic Type**
1. Increase text size (Settings → Display & Brightness → Text Size)

- [ ] Text scales appropriately
- [ ] No overlapping UI elements
- [ ] Buttons remain tappable

**Test 36: Color Contrast**
1. Use browser tools to check contrast ratios

- [ ] Text: 4.5:1 ratio minimum (WCAG AA)
- [ ] Buttons: 3:1 ratio minimum
- [ ] No color-only information (use icons too)

---

## 🧪 Edge Case Testing

**Test 37: Rapid Generation**
1. Tap "Generate" button 5 times rapidly

- [ ] Only 1 request sent (button disabled)
- [ ] No duplicate jobs created
- [ ] UI shows "Generation in progress"

**Test 38: Network Interruption**
1. Start generation
2. Enable Airplane Mode mid-generation
3. Disable Airplane Mode

- [ ] App handles gracefully
- [ ] Shows "Network error" message
- [ ] Allows retry

**Test 39: Low Battery Mode**
1. Enable Low Battery Mode
2. Generate wallpaper

- [ ] Generation completes (may be slower)
- [ ] No crashes or timeouts

**Test 40: Storage Full**
1. Fill device storage to < 100MB
2. Generate wallpaper

- [ ] Error message: "Insufficient storage"
- [ ] Does not crash app

---

## ✅ Final Checklist

### Pre-Launch

- [ ] All 40 tests passed
- [ ] No critical bugs
- [ ] Performance targets met (< 2s load, < 25s generation)
- [ ] Cost under $1.50/month (MVP)
- [ ] PWA installable on iPhone 16 Pro
- [ ] Images perfectly fit 1179×2556 resolution
- [ ] Offline mode functional
- [ ] Security tests passed
- [ ] Accessibility compliant

### Documentation

- [ ] README.md updated
- [ ] ARCHITECTURE.md reflects reality
- [ ] Troubleshooting guide complete
- [ ] User guide created

### Monitoring

- [ ] Application Insights configured
- [ ] Budget alerts enabled
- [ ] Error tracking active
- [ ] Cost dashboard bookmarked

---

## 🐛 Bug Reporting Template

When filing a bug:
```markdown
**Test ID**: (e.g., Test 11: Generate Wallpaper)
**Device**: iPhone 16 Pro, iOS 26.4
**Expected**: Image displays after 15-25 seconds
**Actual**: Timeout error after 30 seconds
**Steps to Reproduce**:
1. Enter prompt: "..."
2. Tap Generate
3. Wait 30 seconds

**Logs**: (attach Application Insights trace ID)
**Screenshot**: (if applicable)
```

---

## 📈 Post-Launch Monitoring

**Week 1**:
- [ ] Check Application Insights daily
- [ ] Monitor costs (Azure + Replicate)
- [ ] Review user feedback
- [ ] Track failure rate (target: < 1%)

**Week 2-4**:
- [ ] Weekly cost review
- [ ] Performance regression testing
- [ ] Re-run Tests 19-22 (performance)
- [ ] Update documentation with learnings

---

**Document Version**: 1.0
**Last Updated**: February 20, 2026
**Total Test Cases**: 40
**Estimated Testing Time**: 4-6 hours
