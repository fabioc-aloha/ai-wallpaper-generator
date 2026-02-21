# Deployment Guide

**Purpose**: Production deployment procedures for Azure Static Web Apps + Functions
**Prerequisites**: Completed [AZURE-SETUP.md](./AZURE-SETUP.md)
**Time**: ~1-2 hours (first deployment)

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passed ([TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md))
- [ ] Azure infrastructure deployed
- [ ] Replicate API key stored in Key Vault
- [ ] Git repository initialized
- [ ] GitHub account connected
- [ ] Code committed to `main` branch

---

## 🚀 Option 1: Azure Static Web Apps CLI (Recommended for First Deploy)

### Step 1: Install SWA CLI

```bash
# Install globally
npm install -g @azure/static-web-apps-cli

# Verify installation
swa --version
# Should output: @azure/static-web-apps-cli@1.x.x
```

### Step 2: Configure Build

Create `swa-cli.config.json`:
```json
{
  "configurations": {
    "wallpaper-app": {
      "appLocation": "frontend",
      "apiLocation": "backend",
      "outputLocation": "dist",
      "appBuildCommand": "npm run build",
      "apiBuildCommand": "npm run build",
      "run": "npm run dev",
      "appDevserverUrl": "http://localhost:5173"
    }
  }
}
```

### Step 3: Build Locally

```bash
# Frontend
cd frontend
npm run build

# Backend
cd ../backend
npm run build

cd ..
```

### Step 4: Test Locally with SWA Emulator

```bash
# Start SWA emulator
swa start

# Opens http://localhost:4280
# Test PWA functionality
# Test API endpoints
```

- [ ] PWA loads correctly
- [ ] API endpoints accessible at /api/...
- [ ] Service Worker registers
- [ ] No console errors

### Step 5: Deploy to Azure

```bash
# Get deployment token from Azure
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg \
  --query "properties.apiKey" -o tsv)

# Deploy
swa deploy \
  --app-location frontend \
  --api-location backend \
  --output-location dist \
  --deployment-token $DEPLOYMENT_TOKEN

# Wait 3-5 minutes for deployment
```

**Expected output**:
```
✔ Deploying front end to Azure Static Web Apps...
✔ Deploying API endpoints to Azure Functions...
✔ Deployment complete!
URL: https://wallpaper-app-2026.azurestaticapps.net
```

### Step 6: Verify Deployment

```bash
# Test deployed PWA
curl -I https://wallpaper-app-2026.azurestaticapps.net

# Should return:
# HTTP/2 200
# content-type: text/html
```

Open in Safari on iPhone 16 Pro:
- [ ] PWA loads
- [ ] Can install to home screen
- [ ] Can generate wallpaper
- [ ] Application Insights logging works

---

## 🔧 Option 2: GitHub Actions CI/CD (Recommended for Ongoing Deployments)

### Step 1: Create GitHub Repository

```bash
# Initialize Git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo
gh repo create wallpaper-generator --public --source=. --remote=origin

# Push code
git push -u origin main
```

### Step 2: Add GitHub Secret

1. Get Static Web App deployment token:
```bash
az staticwebapp secrets list \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg \
  --query "properties.apiKey" -o tsv
```

2. Add to GitHub:
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: Paste deployment token
   - Click "Add secret"

### Step 3: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    name: Build and Deploy

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: |
            frontend/package-lock.json
            backend/package-lock.json

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Install backend dependencies
        run: cd backend && npm ci

      - name: Build frontend
        run: cd frontend && npm run build

      - name: Build backend
        run: cd backend && npm run build

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: 'frontend'
          api_location: 'backend'
          output_location: 'dist'
```

### Step 4: Commit and Push

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### Step 5: Monitor Deployment

1. Go to GitHub repo → Actions tab
2. Watch workflow run (5-8 minutes)
3. Check for green checkmark ✅

**If deployment fails**:
```bash
# View logs in GitHub Actions UI
# OR check Azure deployment logs
az staticwebapp functions list \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg
```

---

## 🔐 Environment Variables Configuration

### Frontend Environment Variables

Create `frontend/.env.production`:
```bash
VITE_API_URL=https://wallpaper-func-2026.azurewebsites.net/api
VITE_APP_INSIGHTS_CONNECTION_STRING=<your-connection-string>
```

**⚠️ Important**:
- Never commit `.env.production` to Git
- Add to `.gitignore`
- Use GitHub Secrets for CI/CD

### Backend Environment Variables

Configure in Azure Functions:
```bash
# Get Key Vault URL
KEY_VAULT_URL="https://wallpaper-kv-2026.vault.azure.net"

# Set in Function App
az functionapp config appsettings set \
  --name wallpaper-func-2026 \
  --resource-group wallpaper-rg \
  --settings \
    "KEY_VAULT_URL=$KEY_VAULT_URL" \
    "STORAGE_ACCOUNT_NAME=wallpaperstorage2026" \
    "STORAGE_CONTAINER=wallpapers" \
    "NODE_ENV=production"

# Verify
az functionapp config appsettings list \
  --name wallpaper-func-2026 \
  --resource-group wallpaper-rg \
  --output table
```

---

## 🌍 Custom Domain (Optional)

### Step 1: Add Custom Domain

```bash
# Add custom domain
az staticwebapp hostname set \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg \
  --hostname wallpaper.yourdomain.com

# Get validation token
az staticwebapp hostname show \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg \
  --hostname wallpaper.yourdomain.com
```

### Step 2: Configure DNS

Add DNS records at your domain provider:
```
Type: CNAME
Name: wallpaper
Value: wallpaper-app-2026.azurestaticapps.net
TTL: 3600
```

### Step 3: Verify SSL Certificate

Wait 10-15 minutes for automatic SSL provisioning:
```bash
curl -I https://wallpaper.yourdomain.com
# Should return: HTTP/2 200
```

---

## 📊 Production Monitoring

### Application Insights Dashboard

1. Open Azure Portal → Application Insights → wallpaper-insights
2. Pin to dashboard:
   - Request rate chart
   - Response time chart
   - Failed requests chart
   - Server response time

### Cost Monitoring


```bash
# Set up cost alert
az consumption budget create \
  --budget-name wallpaper-prod-budget \
  --amount 10 \
  --time-grain Monthly \
  --resource-group wallpaper-rg \
  --notifications \
    Actual_GreaterThan_80_Percent=true \
    email=your-email@example.com
```

### Log Queries

**View recent API calls**:
```kusto
requests
| where timestamp > ago(1h)
| where name startswith "POST /api/generate"
| summarize count() by resultCode
```

**View generation times**:
```kusto
customEvents
| where name == "wallpaper_generated"
| extend generationTime = todouble(customDimensions.generation_time)
| summarize avg(generationTime), max(generationTime), min(generationTime)
```

**View errors**:
```kusto
exceptions
| where timestamp > ago(24h)
| project timestamp, type, outerMessage, operation_Name
| order by timestamp desc
```

---

## 🔄 Rollback Procedures

### Option 1: Revert Git Commit

```bash
# View deployment history
git log --oneline

# Revert to previous commit
git revert HEAD
git push origin main

# GitHub Actions automatically deploys previous version
```

### Option 2: Azure Portal Rollback

1. Open Azure Portal → Static Web Apps → wallpaper-app-2026
2. Click "Deployments" in left menu
3. Find previous successful deployment
4. Click "..." → "Promote to production"

### Option 3: Manual Redeploy

```bash
# Checkout previous working commit
git checkout <commit-hash>

# Redeploy with SWA CLI
swa deploy \
  --app-location frontend \
  --api-location backend \
  --output-location dist \
  --deployment-token $DEPLOYMENT_TOKEN
```

---

## 🧪 Staging Environment (Optional but Recommended)

### Create Staging Slot

```bash
# Create staging environment
az staticwebapp environment create \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg \
  --environment-name staging

# Staging URL: https://wallpaper-app-2026-staging.azurestaticapps.net
```

### Deploy to Staging First

Modify `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches: [main]      # → Production
  push:
    branches: [develop]   # → Staging
```

---

## 📦 Version Management

### Semantic Versioning

Follow [SemVer](https://semver.org/):
- `1.0.0` - Initial release
- `1.0.1` - Bug fixes
- `1.1.0` - New features
- `2.0.0` - Breaking changes

### Tagging Releases

```bash
# Create version tag
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# List all tags
git tag -l
```

### Changelog

Maintain `CHANGELOG.md`:
```markdown
# Changelog

## [1.0.0] - 2026-02-20
### Added
- Initial PWA release
- Flux 1.1 Pro model integration
- iPhone 16 Pro optimization
- Offline mode support

### Fixed
- None

### Changed
- None
```

---

## 🔧 Troubleshooting

### Issue: Deployment Timeout

**Symptom**: GitHub Actions exceeds 6-minute timeout

**Solution**:
```yaml
# Add timeout to workflow
jobs:
  build-and-deploy:
    timeout-minutes: 15
```

### Issue: "Failed to authenticate"

**Symptom**: Deployment fails with auth error

**Solution**:
```bash
# Regenerate deployment token
az staticwebapp secrets renew \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg

# Update GitHub secret
```

### Issue: Functions Not Deploying

**Symptom**: API endpoints return 404

**Solution**:
```bash
# Check Functions deployment
az functionapp deployment list \
  --name wallpaper-func-2026 \
  --resource-group wallpaper-rg

# Manually deploy Functions
cd backend
func azure functionapp publish wallpaper-func-2026
```

### Issue: Service Worker Not Updating

**Symptom**: Users see old version after deployment

**Solution**:
```javascript
// In service-worker.js, increment cache version
const CACHE_VERSION = 'v2'; // was 'v1'

// Add skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
```

---

## 📱 iOS App Store (Future)

If you decide to convert PWA to native app:

### Option 1: PWABuilder
1. Visit https://www.pwabuilder.com
2. Enter PWA URL
3. Download iOS package
4. Submit to App Store

### Option 2: Capacitor
```bash
npm install @capacitor/core @capacitor/ios
npx cap init
npx cap add ios
npx cap open ios
# Build in Xcode
```

---

## 📋 Post-Deployment Checklist

- [ ] Production URL accessible
- [ ] PWA installable on iPhone 16 Pro
- [ ] API endpoints responding
- [ ] Application Insights logging
- [ ] Cost alerts configured
- [ ] HTTPS/SSL working
- [ ] Custom domain (if configured)
- [ ] Staging environment (if configured)
- [ ] GitHub Actions running successfully
- [ ] Monitoring dashboard created
- [ ] Rollback procedure tested

---

## 🚨 Incident Response

### High Priority Issues

**Symptom**: Site completely down

**Response**:
1. Check Azure status dashboard: https://status.azure.com
2. Check Application Insights for errors
3. Rollback to previous version (see Rollback Procedures)
4. Notify users (if applicable)

### Medium Priority Issues

**Symptom**: Slow response times (> 5s)

**Response**:
1. Check Application Insights performance metrics
2. Scale Functions plan if needed:
```bash
az functionapp scale config set \
  --name wallpaper-func-2026 \
  --resource-group wallpaper-rg \
  --maximum-instance-count 10
```

### Low Priority Issues

**Symptom**: Occasional generation failures

**Response**:
1. Review Replicate API status
2. Check Application Insights exceptions
3. Implement retry logic in code

---

## 📞 Support Resources

- **Azure Status**: https://status.azure.com
- **Replicate Status**: https://status.replicate.com
- **Azure Support**: https://portal.azure.com → Support
- **GitHub Copilot**: Available 24/7 for debugging

---

## 📈 Scaling Considerations

### When to Scale

Monitor these metrics:
- Requests/second > 10: Consider dedicated hosting plan
- Storage > 5GB: Evaluate Blob Storage tiers
- Monthly cost > $50: Review Replicate model alternatives

### Scaling Options

**Option 1: Azure Functions Premium Plan**
```bash
# Upgrade to Premium plan
az functionapp plan create \
  --name wallpaper-premium-plan \
  --resource-group wallpaper-rg \
  --location westus2 \
  --sku EP1 \
  --is-linux
```

**Option 2: Content Delivery Network (CDN)**
```bash
# Add CDN endpoint for faster image delivery
az cdn endpoint create \
  --name wallpaper-cdn \
  --profile-name wallpaper-cdn-profile \
  --resource-group wallpaper-rg \
  --origin wallpaperstorage2026.blob.core.windows.net
```

---

**Document Version**: 1.0
**Last Updated**: February 20, 2026
**Estimated Deployment Time**: 1-2 hours (initial), 15 minutes (subsequent)
