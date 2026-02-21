# Pre-Deployment Checklist

**Date**: February 21, 2026
**Project**: AI Wallpaper Generator
**Target**: Azure Static Web Apps + Functions

---

## ✅ Code Review Fixes Applied

All blocking issues from code review have been fixed:

### 1. API Fixes
- [x] Changed model from `flux-1.1-pro` to `flux-pro` (matches documentation)
- [x] Added 30-second timeout protection on Replicate API calls
- [x] Changed from `width/height` to `aspect_ratio` (Flux Pro native format)
- [x] Made model name configurable via environment variable
- [x] Improved error handling with context.error

### 2. Frontend Fixes
- [x] Added input sanitization (remove HTML chars, enforce max length)
- [x] Fixed localStorage quota handling (try/catch for private browsing)
- [x] Updated API call to use `aspectRatio` instead of `width/height`
- [x] Fixed TypeScript config (added `"module": "ESNext"`)

### 3. Security & Configuration
- [x] Added Content-Security-Policy header
- [x] Added explicit CORS configuration
- [x] Enhanced route configuration for API endpoints
- [x] Created `.env.example` for documentation

### 4. Documentation
- [x] Fixed cost estimates in README.md ($10.12 vs $1.02)
- [x] Ensured all costs reflect Flux Pro pricing ($0.05/wallpaper)
- [x] Created pre-deployment checklist

---

## 🔍 Pre-Deployment Tests

### Local Testing (Before Azure)

Run these tests locally to verify everything works:

```powershell
# Terminal 1: Start backend (from root)
cd api
npm start

# Terminal 2: Start frontend (from root)
cd frontend
npm run dev

# Terminal 3: Test API directly
curl -X POST http://localhost:7071/api/generate `
  -H "Content-Type: application/json" `
  -d '{"prompt":"test","aspectRatio":"9:16"}'
```

**Expected Results**:
- ✅ Backend starts on http://localhost:7071
- ✅ Frontend starts on http://localhost:5173
- ✅ Test wallpaper generates in 5-6 seconds
- ✅ Image downloads to Azure Blob Storage
- ✅ No console errors in browser

### Environment Setup

Before deploying, ensure you have:

#### Azure Resources Created
- [ ] Resource Group
- [ ] Storage Account with `wallpapers` container
- [ ] Key Vault with `REPLICATE-API-KEY` secret
- [ ] Static Web App (linked to GitHub)
- [ ] Function App (Flex Consumption FC1)
- [ ] Application Insights (optional)

#### Local Configuration
- [ ] Replicate API token in environment
- [ ] Azure CLI installed and authenticated
- [ ] Git repository linked to Azure Static Web Apps

#### Secrets Configuration
```powershell
# Verify Key Vault has Replicate key
az keyvault secret show --vault-name YOUR_VAULT_NAME --name REPLICATE-API-KEY

# Verify Function App has environment variables
az functionapp config appsettings list --name YOUR_FUNCTION_APP --resource-group YOUR_RG
```

---

## 🚀 Deployment Steps

Follow these in order:

### 1. Push to GitHub
```bash
git add .
git commit -m "Fix code review issues - ready for deployment"
git push origin main
```

### 2. Verify GitHub Actions
- [ ] Check GitHub Actions tab
- [ ] Ensure build succeeds
- [ ] Verify deployment to Azure Static Web Apps

### 3. Configure Azure Function App
```powershell
# Set environment variables
az functionapp config appsettings set `
  --name YOUR_FUNCTION_APP `
  --resource-group YOUR_RG `
  --settings `
    "KEY_VAULT_NAME=your-keyvault" `
    "STORAGE_ACCOUNT_NAME=yourstorage" `
    "STORAGE_CONTAINER_NAME=wallpapers" `
    "AI_MODEL=black-forest-labs/flux-pro"
```

### 4. Enable Managed Identity
```powershell
# Enable system-assigned identity
az functionapp identity assign `
  --name YOUR_FUNCTION_APP `
  --resource-group YOUR_RG

# Grant Key Vault access
az keyvault set-policy `
  --name YOUR_VAULT_NAME `
  --object-id FUNCTION_APP_IDENTITY `
  --secret-permissions get list

# Grant Storage access
az role assignment create `
  --assignee FUNCTION_APP_IDENTITY `
  --role "Storage Blob Data Contributor" `
  --scope /subscriptions/YOUR_SUB/resourceGroups/YOUR_RG/providers/Microsoft.Storage/storageAccounts/YOUR_STORAGE
```

### 5. Test Production Endpoint
```powershell
# Test production API
curl -X POST https://YOUR_STATIC_WEB_APP.azurestaticapps.net/api/generate `
  -H "Content-Type: application/json" `
  -d '{"prompt":"sunset over mountains","aspectRatio":"9:16"}'
```

### 6. iPhone Testing
- [ ] Open Safari on iPhone 16 Pro
- [ ] Navigate to https://YOUR_APP.azurestaticapps.net
- [ ] Generate a test wallpaper
- [ ] Verify 5-6 second generation time
- [ ] Download to Photos
- [ ] Install as PWA (Add to Home Screen)
- [ ] Test offline mode

---

## 🎯 Success Criteria

Before considering deployment complete:

- [ ] Can generate wallpaper from iPhone Safari
- [ ] Wallpaper downloads to Photos successfully
- [ ] PWA installs correctly on iPhone
- [ ] Offline mode shows cached wallpapers
- [ ] No console errors in production
- [ ] Costs appear reasonable in Azure Cost Management
- [ ] Application Insights shows successful requests

---

## ⚠️ Known Limitations (Documented)

These are **expected** and **documented** limitations:

1. **Typography**: AI models cannot render readable text (see AI-MODEL-GUIDE.md)
2. **Rate Limiting**: Basic protection via Static Web Apps (upgrade to API Management for advanced)
3. **Authentication**: MVP has anonymous access (add auth in Phase 2)
4. **Cost Protection**: No per-user quotas yet (monitor Azure Cost Management)

---

## 📊 Post-Deployment Monitoring

### First 24 Hours
- [ ] Check Application Insights for errors
- [ ] Monitor Azure Cost Management
- [ ] Verify Replicate API usage
- [ ] Test from different networks

### First Week
- [ ] Generate 10+ wallpapers
- [ ] Measure actual costs vs estimates
- [ ] Check storage growth
- [ ] Validate PWA offline behavior

---

## 🆘 Rollback Plan

If deployment fails:

```powershell
# Revert to previous deployment
az staticwebapp deployment list --name YOUR_APP

# Redeploy specific commit
git revert HEAD
git push origin main
```

---

## 📝 Next Steps After Deployment

Once MVP is live and stable:

1. **Phase 2 Planning**: Review [docs/ROADMAP.md](docs/ROADMAP.md)
2. **Add Tests**: Create basic test suite
3. **Monitor Costs**: Set up budget alerts
4. **User Feedback**: Test with 2-3 beta users
5. **Iterate**: Improve based on real usage patterns

---

**Ready to Deploy?** ✅ All fixes applied, checklist complete!
