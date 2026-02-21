# Local Development Guide

**Project**: AI Wallpaper Generator
**Last Updated**: February 21, 2026

---

## Prerequisites

- **Node.js**: v20 or later
- **npm**: v9 or later
- **Replicate API Token**: Get from [replicate.com/account](https://replicate.com/account)
- **Code Editor**: VS Code recommended

---

## Quick Start (5 Minutes)

### 1. Install Dependencies

```powershell
# Install backend dependencies (from project root)
cd api
npm install

# Install frontend dependencies
cd ..\frontend
npm install

# Return to root
cd ..
```

**Expected Output**:
- Backend: 71 packages installed
- Frontend: 425 packages installed
- No critical vulnerabilities

---

### 2. Configure Environment

#### Backend Configuration

Create `api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "REPLICATE_API_TOKEN": "your-replicate-token-here"
  }
}
```

**Important**: Replace `your-replicate-token-here` with your actual Replicate API token.

**Note**: For local development, we bypass Azure Key Vault and read directly from environment. In production, Key Vault is used.

#### Frontend Configuration

Already configured! Files exist:
- `frontend/.env.development` → Points to `http://localhost:7071/api`
- `frontend/.env.production` → Points to `/api` (Azure)

---

### 3. Modify API for Local Development

For local testing, temporarily bypass Key Vault by modifying `api/shared/keyvault.ts`:

```typescript
export async function getReplicateApiKey(): Promise<string> {
	// FOR LOCAL DEVELOPMENT ONLY
	const localKey = process.env.REPLICATE_API_TOKEN;
	if (localKey) {
		console.log('Using local Replicate API token');
		return localKey;
	}

	// Production: Use Key Vault (existing code below)
	// ... rest of file
}
```

**⚠️ Remember**: Revert this change before deploying to Azure!

---

### 4. Start Development Servers

Open **two terminals**:

#### Terminal 1: Backend (Azure Functions)

```powershell
cd api
npm start
```

**Expected Output**:
```
Azure Functions Core Tools
Core Tools Version: 4.x
Function Runtime Version: 4.x

Functions:
  generate: [POST] http://localhost:7071/api/generate

For detailed output, run func with --verbose flag.
[2026-02-21T12:00:00.000Z] Worker process started and initialized.
```

**Backend Ready**: http://localhost:7071

---

#### Terminal 2: Frontend (SvelteKit)

```powershell
cd frontend
npm run dev
```

**Expected Output**:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Frontend Ready**: http://localhost:5173

---

## Testing the App

### 1. Open in Browser

Navigate to: http://localhost:5173

### 2. Generate First Wallpaper

1. Enter prompt: `"sunset over mountains"`
2. Click **✨ Generate**
3. Wait 5-6 seconds
4. See generated wallpaper

**Expected Behavior**:
- ✅ Progress indicator shows
- ✅ Generation completes in ~5-6 seconds
- ✅ Wallpaper appears on screen
- ✅ "Download to Photos" button enabled

### 3. Test Offline Mode

1. Generate a wallpaper (so one is cached)
2. In browser DevTools: Network tab → Check "Offline"
3. Refresh page
4. Verify cached wallpaper still visible
5. Uncheck "Offline" to restore

### 4. Test Service Worker (PWA)

1. Open Chrome DevTools → Application tab
2. Service Workers section
3. Verify service worker registered
4. Check Cache Storage for cached assets

---

## Manual API Testing

Test the backend directly without the frontend:

### Using PowerShell

```powershell
# Test API endpoint
$body = @{
    prompt = "cosmic nebula in deep space"
    aspectRatio = "9:16"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:7071/api/generate" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# View result
$response | ConvertTo-Json
```

**Expected Response**:
```json
{
  "imageUrl": "http://localhost:7071/.../wallpaper-1234567890.png",
  "metadata": {
    "prompt": "cosmic nebula in deep space",
    "modelUsed": "black-forest-labs/flux-pro",
    "generationTime": 5432
  }
}
```

### Using curl (if installed)

```bash
curl -X POST http://localhost:7071/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"neon city at night","aspectRatio":"9:16"}'
```

---

## Common Issues & Solutions

### Issue: "Azure Functions Core Tools not found"

**Solution**: Install Azure Functions Core Tools

```powershell
# Using npm
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Or using Chocolatey
choco install azure-functions-core-tools-4
```

---

### Issue: Backend starts but API returns 500

**Symptoms**: Frontend shows "Failed to generate wallpaper"

**Check**:
1. Is `REPLICATE_API_TOKEN` in `local.settings.json`?
2. Is the token valid? Test at replicate.com
3. Check backend terminal for errors

**Solution**:
```powershell
# Verify environment variable loaded
cd api
func settings list
```

---

### Issue: Frontend can't connect to backend

**Symptoms**: Network error, CORS error

**Check**:
1. Is backend running on http://localhost:7071?
2. Is frontend `.env.development` correct?

**Solution**:
```powershell
# Verify frontend env
Get-Content frontend/.env.development
# Should show: PUBLIC_API_URL=http://localhost:7071/api

# Restart both servers
```

---

### Issue: TypeScript errors in VS Code

**Symptoms**: Red squiggles, "Cannot find module"

**Solution**:
```powershell
# Rebuild TypeScript
cd frontend
npm run build

cd ..\api
npm run build
```

---

### Issue: Port 7071 already in use

**Solution**:
```powershell
# Find and kill process on port 7071
Get-Process -Id (Get-NetTCPConnection -LocalPort 7071).OwningProcess | Stop-Process

# Or use different port
cd api
func start --port 7072
# Update frontend/.env.development to match
```

---

## Development Workflow

### Making Code Changes

#### Backend (API) Changes

1. Edit files in `api/`
2. Azure Functions hot-reloads automatically
3. Test changes immediately (no restart needed)

**Exception**: Changes to `local.settings.json` require restart:
```powershell
# Stop (Ctrl+C) and restart
npm start
```

---

#### Frontend Changes

1. Edit files in `frontend/src/`
2. Vite hot-reloads automatically
3. Browser updates instantly (HMR)

**Exception**: Changes to `svelte.config.js` or `vite.config.ts` require restart:
```powershell
# Stop (Ctrl+C) and restart
npm run dev
```

---

### Testing Changes

**After modifying API**:
```powershell
# Test endpoint directly
$body = @{ prompt = "test"; aspectRatio = "9:16" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:7071/api/generate" -Method Post -ContentType "application/json" -Body $body
```

**After modifying frontend**:
1. Open http://localhost:5173
2. Open DevTools Console (F12)
3. Check for errors
4. Test wallpaper generation

---

## Performance Monitoring

### Check Generation Times

**Backend logs** (Terminal 1):
```
Generating wallpaper: "sunset" (9:16)
Image generated: https://replicate.delivery/...
Wallpaper generated successfully in 5432ms
```

**Frontend timing** (DevTools Console):
```javascript
// Add this to +page.svelte temporarily
console.time('generation');
// ... generate wallpaper
console.timeEnd('generation');
```

**Expected Times**:
- API call: ~5-6 seconds
- Total (including UI): ~6-7 seconds

---

## Debugging Tips

### Enable Verbose Logging

**Backend**:
```powershell
cd api
func start --verbose
```

**Frontend** (add to `+page.svelte`):
```typescript
$: console.log('Generating:', isGenerating);
$: console.log('Error:', error);
$: console.log('Current wallpaper:', currentWallpaper);
```

### Check Network Requests

1. Open DevTools → Network tab
2. Generate wallpaper
3. Inspect POST to `/api/generate`
4. Check:
   - Request payload (prompt, aspectRatio)
   - Response body (imageUrl, metadata)
   - Response time

---

## Testing Different AI Models

Want to test `flux-1.1-pro` or `ideogram-v2` locally?

**Modify `api/generate/index.ts`**:
```typescript
// Change this line temporarily
const AI_MODEL = 'black-forest-labs/flux-1.1-pro'; // or 'ideogram-ai/ideogram-v2'
```

**Or use environment variable**:
```json
// In local.settings.json
{
  "Values": {
    "AI_MODEL": "black-forest-labs/flux-1.1-pro"
  }
}
```

**Remember**: Different models have different:
- Costs ($0.04 - $0.08 per image)
- Speeds (5-20 seconds)
- Parameter formats (check Replicate docs)

---

## Pre-Deployment Testing

Before deploying to Azure, verify locally:

### Checklist

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Can generate wallpaper successfully
- [ ] Download button works
- [ ] LocalStorage saves history
- [ ] Offline mode works (after generating 1+ wallpaper)
- [ ] PWA installs in browser
- [ ] No console errors in DevTools
- [ ] Generation completes in 5-7 seconds

### Test Script

```powershell
# Run full integration test
$testPrompts = @(
    "sunset over mountains",
    "neon city at night",
    "abstract geometric patterns"
)

foreach ($prompt in $testPrompts) {
    Write-Host "Testing: $prompt" -ForegroundColor Cyan
    $body = @{ prompt = $prompt; aspectRatio = "9:16" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:7071/api/generate" -Method Post -ContentType "application/json" -Body $body
    Write-Host "✅ Generated in $($response.metadata.generationTime)ms" -ForegroundColor Green
}
```

---

## Stopping Development

### Clean Shutdown

**Terminal 1** (Backend):
```
Ctrl+C
```

**Terminal 2** (Frontend):
```
Ctrl+C
```

### Clear Cache (Optional)

```powershell
# Clear Node cache if experiencing issues
cd api
Remove-Item -Recurse -Force node_modules, dist
npm install

cd ..\frontend
Remove-Item -Recurse -Force node_modules, .svelte-kit, build
npm install
```

---

## iPhone Testing (Local Network)

Want to test on your iPhone while developing?

### 1. Get Your PC's IP Address

```powershell
# Find your local IP
ipconfig | Select-String "IPv4"
# Example: 192.168.1.100
```

### 2. Update Frontend Config

Edit `frontend/.env.development`:
```bash
PUBLIC_API_URL=http://192.168.1.100:7071/api
```

### 3. Start with Network Exposure

```powershell
cd frontend
npm run dev -- --host
```

### 4. Open on iPhone

Safari → `http://192.168.1.100:5173`

**Note**: Both devices must be on same WiFi network.

---

## Next Steps

Once local development is working:

1. **Deploy to Azure**: See [PRE-DEPLOYMENT-CHECKLIST.md](PRE-DEPLOYMENT-CHECKLIST.md)
2. **Add Features**: See [ROADMAP.md](ROADMAP.md) for Phase 2
3. **Write Tests**: See [TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `cd api; npm start` | Start backend (port 7071) |
| `cd frontend; npm run dev` | Start frontend (port 5173) |
| `func start --verbose` | Backend with detailed logs |
| `npm run build` | Build for production |
| `git status` | Check uncommitted changes |

---

**Happy coding!** 🚀 For issues, check [docs/DEVELOPMENT-GUIDE.md](DEVELOPMENT-GUIDE.md) or open a GitHub issue.
