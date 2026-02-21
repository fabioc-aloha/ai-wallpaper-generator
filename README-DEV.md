# AI Wallpaper Generator - Development

This is the scaffolded MVP project using **SvelteKit** (frontend) + **Azure Functions** (backend).

## 📁 Project Structure

```
AlexWallpapers/
├── frontend/              # SvelteKit PWA
│   ├── src/
│   │   ├── routes/        # Pages (+page.svelte)
│   │   ├── lib/           # Shared utilities & types
│   │   ├── stores/        # Svelte stores (wallpaper cache)
│   │   ├── service-worker.ts  # PWA offline support
│   │   └── app.html       # HTML template
│   ├── static/            # Static assets (icons, favicon)
│   ├── vite.config.ts     # Vite + PWA config
│   └── package.json
├── api/                   # Azure Functions
│   ├── generate/          # POST /api/generate endpoint
│   ├── shared/            # Key Vault & Blob Storage utilities
│   ├── host.json          # Functions runtime config
│   └── package.json
├── docs/                  # Planning documentation
├── staticwebapp.config.json  # Azure SWA config
└── README-DEV.md          # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Frontend
cd frontend
npm install

# API
cd ../api
npm install
```

### 2. Configure Local Settings

Edit `api/local.settings.json`:
```json
{
  "Values": {
    "KEY_VAULT_NAME": "your-keyvault-name",
    "STORAGE_ACCOUNT_NAME": "your-storage-account",
    "STORAGE_CONTAINER_NAME": "wallpapers"
  }
}
```

### 3. Run Development Servers

**Terminal 1 - Frontend**:
```powershell
cd frontend
npm run dev
```
Opens at http://localhost:5173

**Terminal 2 - API**:
```powershell
cd api
npm start
```
Runs at http://localhost:7071

### 4. Test on iPhone

1. Get your local IP: `ipconfig` (look for IPv4)
2. Update `frontend/.env.development`:
   ```
   PUBLIC_API_URL=http://YOUR-IP:7071/api
   ```
3. Open iPhone Safari: `http://YOUR-IP:5173`
4. Add to Home Screen for PWA mode

## 🔧 Development Workflow

### Frontend Development
```powershell
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Type checking
```

### API Development
```powershell
cd api
npm start            # Start Functions runtime
npm run build        # Compile TypeScript
npm run watch        # Watch mode for TS
```

## 📝 Key Features Implemented

✅ **Frontend (SvelteKit)**
- ✅ Text prompt input with validation
- ✅ Generate button with loading state
- ✅ Wallpaper preview & download
- ✅ Recent wallpapers grid (last 10)
- ✅ LocalStorage persistence
- ✅ Offline mode detection
- ✅ Service Worker caching
- ✅ PWA manifest (installable)
- ✅ iPhone-optimized UI (safe areas)

✅ **Backend (Azure Functions)**
- ✅ POST /api/generate endpoint
- ✅ Zod request validation
- ✅ Replicate API integration (flux-1.1-pro)
- ✅ Key Vault secret retrieval
- ✅ Blob Storage upload
- ✅ Error handling & logging
- ✅ Managed Identity support

✅ **Infrastructure**
- ✅ TypeScript throughout
- ✅ Environment configuration
- ✅ Static Web App routing
- ✅ CORS & security headers

## 🔐 Azure Setup Required

Before deploying, you need:

1. **Azure Static Web App** (Free tier)
2. **Azure Functions** Flex Consumption FC1
3. **Storage Account** (Hot tier) with `wallpapers` container
4. **Key Vault** with `REPLICATE-API-KEY` secret
5. **Application Insights** (optional, for telemetry)

See `docs/AZURE-SETUP.md` for step-by-step instructions.

## 🧪 Testing Checklist

- [ ] Generate wallpaper with simple prompt
- [ ] Download to iPhone Photos
- [ ] Set as wallpaper (lock/home screen)
- [ ] Test offline mode (airplane mode)
- [ ] View cached wallpapers offline
- [ ] Add to Home Screen (PWA install)
- [ ] Test with long prompts (500 chars)
- [ ] Test error handling (network failure)
- [ ] Check iPhone safe area rendering
- [ ] Verify HTTPS in production

## 📊 Cost Tracking

**MVP Target**: $1.02/month for 200 wallpapers

Current setup:
- Static Web Apps: **Free tier** ✅
- Functions FC1: ~$0.08/month (200 executions)
- Blob Storage: ~$0.02/month (10 wallpapers)
- Key Vault: ~$0.02/month (secret storage)
- Replicate: ~$0.90/month (200 × 20s × $0.000225/s)

**Total**: ~$1.02/month

Monitor in Azure Portal → Cost Management.

## 🐛 Troubleshooting

**Frontend won't start**:
```powershell
rm -r node_modules, package-lock.json
npm install
```

**API 500 errors**:
- Check `api/local.settings.json` has correct values
- Verify Azure resources exist (Key Vault, Storage)
- Check API key is in Key Vault as `REPLICATE-API-KEY`
- Review Function logs: `http://localhost:7071/admin/functions/generate`

**PWA not installing**:
- Must use HTTPS (production only)
- Check manifest at `/manifest.webmanifest`
- Verify service worker registered (DevTools → Application)

**iPhone connection issues**:
- Ensure same WiFi network
- Use IP address, not `localhost`
- Check Windows Firewall allows port 5173 & 7071

## 📚 Next Steps

1. ✅ **Week 1**: Complete Azure infrastructure setup
2. ⏳ **Week 2**: Deploy to Azure Static Web Apps
3. ⏳ **Week 3**: Test on iPhone, polish UI
4. ⏳ **Week 4**: Add style templates (optional)

See `docs/DEVELOPMENT-GUIDE.md` for detailed weekly plan.

## 🎯 MVP Scope

This scaffold includes **only** Phase 1 MVP features:
- Generate wallpaper from text prompt
- Download to Photos
- Last 10 wallpapers cached
- Offline viewing
- PWA installable

**Not included** (Phase 2/3):
- User authentication
- Payment system
- Style templates
- Generation history database
- Push notifications

Keep it simple, ship fast! 🚀

---

**Ready to start?** Run `npm install` in both `frontend/` and `api/`, then see Quick Start above.
