# Decision Guide - AI Wallpaper App

**Purpose**: Help you make informed decisions before starting development
**Target Device**: iPhone 16 Pro (iOS 26.4 beta)
**Updated**: February 20, 2026

---

## Critical Decisions Before You Start

### Decision 1: Frontend Framework

**You need to choose**: SvelteKit vs React

| Factor | SvelteKit ⭐ | React + Vite |
|--------|-------------|--------------|
| **Bundle Size** | ~25 KB | ~130 KB |
| **Mobile Performance** | Excellent | Good |
| **Your Familiarity** | ? | ? |
| **Ecosystem** | Smaller, growing | Large, mature |
| **PWA Support** | @vite-pwa/sveltekit | vite-plugin-pwa |
| **Learning Curve** | Moderate (if new) | Easy (if you know React) |
| **Development Speed** | Faster (less boilerplate) | Standard |
| **Future Hiring** (Phase 3) | Harder | Easier |

**Recommendation**:
- ✅ **SvelteKit** if you're starting fresh or want best mobile performance
- ✅ **React** if you already know it well or plan to hire developers later

**Decision**: `[ ] SvelteKit` or `[ ] React + Vite`

---

### Decision 2: MVP Scope - What to Build First

**Full Feature List** (from architecture):

| Feature | Phase 1 MVP | Phase 2 Enhanced | Phase 3 Commercial |
|---------|-------------|------------------|-------------------|
| Text prompt input | ✅ | ✅ | ✅ |
| Generate wallpaper | ✅ | ✅ | ✅ |
| Download to Photos | ✅ | ✅ | ✅ |
| PWA installable | ✅ | ✅ | ✅ |
| Offline mode (last 5) | ✅ | ✅ | ✅ |
| Style templates | ❌ | ✅ | ✅ |
| Generation history | ❌ | ✅ | ✅ |
| Favorites system | ❌ | ✅ | ✅ |
| User authentication | ❌ | ❌ | ✅ |
| Payment system | ❌ | ❌ | ✅ |
| Push notifications | ❌ | ❌ | ✅ |

**MVP Scope Question**: Do you want to add **style templates** to Phase 1?

**Trade-off**:
- ✅ **Add now**: Better UX, easier to create good wallpapers, +1 week dev time
- ✅ **Wait**: Ship faster, prove concept first, add based on feedback

**Decision**: `[ ] Minimal MVP (3-4 weeks)` or `[ ] MVP + Style Templates (4-5 weeks)`

---

### Decision 3: AI Model Selection

**Your Replicate subscription** can use multiple models.

**✅ Validated Through Testing** (February 21, 2026)

| Model | Speed | Quality | Cost/Image | Best For | Typography |
|-------|-------|---------|------------|----------|------------|
| **flux-1.1-pro** | 9-10s | ⭐⭐⭐⭐⭐ | $0.04 | Photorealistic scenes | ❌ Poor |
| **flux-pro** | 5-6s | ⭐⭐⭐⭐⭐ | $0.05 | Best photorealism | ❌ Poor |
| **ideogram-v2** | 15-20s | ⭐⭐⭐⭐ | $0.08 | Text + graphics | ✅ Excellent |
| **nano-banana-pro** | ~15s | ⭐⭐⭐⭐ | $0.025 | Face consistency | 🟡 Moderate |

**🔬 Critical Finding: Typography Limitation**

All Flux models (including Pro and 1.1 Pro) **struggle with readable text**, even with detailed specifications.

**Impact on Wallpaper Strategy**:
- ✅ **DO**: Generate pure visual content (landscapes, abstract art, patterns)
- ❌ **AVOID**: Text overlays, typography-heavy designs
- 🎯 **Hybrid Approach**: Generate background, add text in post-processing if needed

**Recommendation for Production**:
- ✅ **Flux Pro** ($0.05) - Best photorealistic quality for wallpapers WITHOUT text
- ✅ **Ideogram v2** ($0.08) - ONLY when text is absolutely critical (rare for wallpapers)
- 🎯 **Keep prompts focused on visual elements**: "neon cityscape", "abstract waves", "cosmic nebula" (NO "text saying...")

**Decision**: `[✓] flux-pro` (recommended for wallpapers)

---

### Decision 4: Database - Do You Need One for MVP?

**Question**: Should Phase 1 MVP use a database?

**Option A: No Database** (recommended for MVP)
```
Storage: Browser LocalStorage only
History: Last 10 prompts saved locally
Cost: $0
Setup time: 0 minutes
```

**Option B: Azure Table Storage**
```
Storage: Azure Table Storage
History: All wallpapers + metadata stored
Cost: ~$0.10/month
Setup time: 1-2 hours
```

**Trade-off**:
- ✅ **No Database**: Simpler, faster to build, still works great for personal use
- ✅ **With Database**: Better for analytics, history persists across devices

**Recommendation**: **No database for MVP**. Add in Phase 2 when you need:
- Multi-device sync
- Analytics (which prompts work best)
- History beyond 10 items

**Decision**: `[ ] No database (LocalStorage only)` or `[ ] Azure Table Storage`

---

### Decision 5: Development Timeline

**How much time can you commit?**

| Scenario | Hours/Week | Phase 1 Duration | Start to First Wallpaper |
|----------|------------|------------------|--------------------------|
| **Full-time focus** | 30-40 hrs | 2-3 weeks | ~4-5 days |
| **Part-time (evenings)** | 10-15 hrs | 4-6 weeks | ~1 week |
| **Weekend warrior** | 8-10 hrs | 6-8 weeks | ~2 weeks |

**Decision**: My available time: `[ ] Full-time` `[ ] Part-time` `[ ] Weekends`

**Adjusted Timeline**:
- Week 1: Azure setup + Frontend scaffold → `___ days`
- Week 2: Backend API + Replicate integration → `___ days`
- Week 3: PWA features + Testing → `___ days`
- Week 4: Polish + Deploy → `___ days`

---

### Decision 6: Budget Constraints

**Monthly Cost Estimates**:

| Phase | Monthly Budget | What You Get |
|-------|----------------|--------------|
| **MVP** | $1-2 | 200 wallpapers/month, personal use |
| **Enhanced** | $3-5 | 500 wallpapers/month, all features except auth |
| **Pre-Commercial** | $50-100 | Testing with friends, 2000 wallpapers/month |
| **Commercial** | $200-300 | 100 paying users, 5000 wallpapers/month |

**Alert Thresholds** (recommended):
```
Daily: $0.50 → Email alert
Weekly: $2.00 → Email alert
Monthly: $5.00 → Pause function app + email
```

**Decision**:
- Phase 1 budget limit: `$___/month`
- Alert threshold: `$___/day`

---

### Decision 7: Deployment Strategy

**Option A: Manual Deployment** (easiest)
```bash
# Deploy when ready
npx swa deploy --env production
```
- ✅ Simple, you control timing
- ❌ Manual process each time

**Option B: GitHub Actions CI/CD** (recommended)
```yaml
# Auto-deploy on git push to main
on: push to main → build → deploy
```
- ✅ Automatic deployment
- ✅ Staging environment for testing
- ❌ Requires GitHub repository

**Decision**: `[ ] Manual` or `[ ] GitHub Actions CI/CD`

---

### Decision 8: iOS 26.4 Beta Features - Use or Wait?

**iOS 26.4 is in beta** - features may change before public release.

| Feature | Use Now? | Why/Why Not |
|---------|----------|-------------|
| **Background Sync** | 🟡 Optional | Great UX, but may change. Use progressive enhancement. |
| **Badging API** | 🟢 Yes | Low risk, adds polish, easy to remove if changed |
| **Enhanced Push** | 🔴 No | Complex setup, may change significantly |
| **File System Access** | 🔴 No | Experimental, likely to change |

**Recommendation**:
- ✅ Implement **Badging API** (show new wallpaper count on icon)
- 🟡 Implement **Background Sync** with feature detection
- ❌ Skip push notifications and file system access for MVP

**Decision**: iOS 26.4 beta features to use:
- `[ ]` Badge count on app icon
- `[ ]` Background sync for offline queue
- `[ ]` Enhanced push notifications (skip for MVP)
- `[ ]` File system access (skip for MVP)

---

## Quick Start Decision Matrix

**Answer these 4 questions**:

1. **Framework**: `[ ] SvelteKit` or `[ ] React`
2. **Database**: `[ ] None (LocalStorage)` or `[ ] Azure Table Storage`
3. **Timeline**: `[ ] 3-4 weeks (minimal)` or `[ ] 4-5 weeks (+ style templates)`
4. **Budget Alert**: `$___ per day`

**Recommended for fastest MVP**:
- ✅ SvelteKit (lighter, faster)
- ✅ No database (LocalStorage only)
- ✅ 3-4 weeks minimal scope
- ✅ $0.50/day budget alert

---

## Feature Prioritization Exercise

**Rank these features** (1 = most important, 10 = least important):

```
[ ] Text prompt input (required for MVP)
[ ] One-click download to Photos
[ ] Offline caching (last 5 wallpapers)
[ ] Style templates (Nature, Abstract, etc.)
[ ] Generation history beyond 10 items
[ ] Dark mode UI
[ ] Share to Instagram/Twitter
[ ] App icon badge count
[ ] Regenerate with variations
[ ] Cost tracking per wallpaper
```

**Top 3 Features** (above the MVP line):
1. ______________________________
2. ______________________________
3. ______________________________

**Nice-to-Have** (Phase 2):
4. ______________________________
5. ______________________________

---

## Risk Tolerance Assessment

**How do you feel about these risks?**

| Risk | Comfort Level |
|------|---------------|
| **iOS beta bugs** | `[ ] High` `[ ] Medium` `[ ] Low` |
| **Replicate API changes** | `[ ] High` `[ ] Medium` `[ ] Low` |
| **Spending over budget** | `[ ] High` `[ ] Medium` `[ ] Low` |
| **Learning new framework** | `[ ] High` `[ ] Medium` `[ ] Low` |
| **4+ week project timeline** | `[ ] High` `[ ] Medium` `[ ] Low` |

**If you marked 3+ as "Low"**, consider:
- Start with **React** (familiar) instead of SvelteKit
- Set **strict budget alerts** ($0.25/day)
- Skip **iOS 26.4 beta features** for MVP
- Add **2 weeks buffer** to timeline

---

## My Decisions (Fill This Out)

**Date**: _______________

### Core Choices
- **Framework**: _______________
- **Database**: _______________
- **Timeline**: _______________
- **Budget**: $_____/month, alert at $_____/day

### MVP Scope
- **Core Features** (must-have):
  - [ ] Text prompt → generate wallpaper
  - [ ] Download to Photos
  - [ ] PWA installable
  - [ ] _______________________
  - [ ] _______________________

- **Deferred to Phase 2**:
  - [ ] _______________________
  - [ ] _______________________

### Beta Features
- **Using iOS 26.4 beta features**:
  - [ ] Badge count
  - [ ] Background sync
  - [ ] Other: _______________

### Deployment
- **Strategy**: _______________
- **Repository**: _______________
- **CI/CD**: [ ] Yes [ ] No

---

## Next Steps After Decisions

Once you've filled out the "My Decisions" section:

1. ✅ Review **ROADMAP.md** for phased implementation plan
2. ✅ Follow **DEVELOPMENT-GUIDE.md** for week-by-week tasks
3. ✅ Use **AZURE-SETUP.md** to provision infrastructure
4. ✅ Reference **ARCHITECTURE.md** for technical details
5. ✅ Check **TESTING-CHECKLIST.md** before deploying

---

## Decision Change Log

Track major decision changes here:

| Date | Decision Changed | From | To | Reason |
|------|------------------|------|-----|--------|
| | | | | |
| | | | | |

---

**Document Version**: 1.0
**Last Updated**: February 20, 2026
**Next Review**: After MVP completion
