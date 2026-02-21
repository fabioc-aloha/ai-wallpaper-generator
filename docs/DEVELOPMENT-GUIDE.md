# Development Guide - Week by Week

**Project**: AI Wallpaper Generator
**Target**: iPhone 16 Pro (iOS 26.4 beta)
**Timeline**: 3-4 weeks to MVP

---

## Prerequisites

Before starting Week 1, ensure you have:

```
Tools:
[ ] Node.js 20+ installed
[ ] VS Code or preferred editor
[ ] Azure CLI installed
[ ] Git installed
[ ] iPhone 16 Pro with iOS 26.4 beta

Accounts:
[ ] Azure subscription (free tier works)
[

 Replicate account with API key
[ ] GitHub account (for CI/CD, optional)

Knowledge:
[ ] Basic TypeScript/JavaScript
[ ] Basic command line usage
[ ] Basic understanding of REST APIs
```

---

## Week 1: Foundation & Setup

### Day 1: Project Setup & Decisions

**Morning (2-3 hours)**:

1. **Fill out** [DECISIONS.md](./DECISIONS.md):
   ```
   - Choose framework: SvelteKit or React
   - Choose database: None or Azure Table Storage
   - Set budget alert: $___ per day
   ```

2. **Create project folder**:
   ```bash
   mkdir wallpaper-app
   cd wallpaper-app
   git init
   ```

3. **Create README**:
   ```markdown
   # AI Wallpaper Generator

   Generate beautiful AI wallpapers for iPhone 16 Pro.

   ## Tech Stack
   - Frontend: [Your choice]
   - Backend: Azure Functions (Node.js 20)
   - AI: Replicate API (flux-1.1-pro)
   - Hosting: Azure Static Web Apps
   ```

**Afternoon (2-3 hours)**:

4. **Review architecture**:
   - Read [ARCHITECTURE.md](../ARCHITECTURE.md) sections 1-3
   - Understand data flow diagrams
   - Note API design patterns

5. **Plan your week**:
   - Block calendar time for development
   - Set up daily goals
   - Prepare workspace

**✅ Day 1 Complete**: Decisions made, project initialized

---

### Days 2-3: Azure Infrastructure

**Follow** [AZURE-SETUP.md](./AZURE-SETUP.md) **for detailed instructions**.

**Quick Setup Commands**:

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name wallpaper-rg \
  --location westus2

# Create storage account
az storage account create \
  --name wallpaperstorage \
  --resource-group wallpaper-rg \
  --sku Standard_LRS \
  --access-tier Hot

# Create Key Vault
az keyvault create \
  --name wallpaper-kv \
  --resource-group wallpaper-rg \
  --location westus2

# Store Replicate API key
az keyvault secret set \
  --vault-name wallpaper-kv \
  --name replicate-api-key \
  --value "YOUR_REPLICATE_API_KEY"

# Create Application Insights
az monitor app-insights component create \
  --app wallpaper-insights \
  --location westus2 \
  --resource-group wallpaper-rg \
  --application-type web
```

**Verify infrastructure**:
```bash
# List all resources
az resource list \
  --resource-group wallpaper-rg \
  --output table
```

**Expected output**:
```
Name                    Type
----------------------  ----------------------------------
wallpaper-kv            Microsoft.KeyVault/vaults
wallpaperstorage        Microsoft.Storage/storageAccounts
wallpaper-insights      Microsoft.Insights/components
```

**✅ Days 2-3 Complete**: Azure resources provisioned

---

### Days 4-5: Frontend Scaffold

**Option A: SvelteKit** (Recommended)

```bash
# Create SvelteKit app
npm create svelte@latest frontend
# Choose:
# - Skeleton project
# - TypeScript
# - ESLint, Prettier

cd frontend
npm install

# Add PWA support
npm install -D @vite-pwa/sveltekit
npm install -D vite-plugin-pwa
```

**Option B: React + Vite**

```bash
# Create React app
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Add PWA support
npm install -D vite-plugin-pwa
npm install workbox-window
```

**Configure PWA** (both options):

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite'; // or React plugin
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    sveltekit(), // or react()
    SvelteKitPWA({
      manifest: {
        name: 'AI Wallpaper Generator',
        short_name: 'Wallpapers',
        description: 'Generate beautiful AI wallpapers',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.blob\.core\.windows\.net\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wallpaper-images',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 7 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ]
});
```

**Create basic layout** (`src/routes/+page.svelte` or `src/App.tsx`):

```svelte
<!-- SvelteKit version -->
<script lang="ts">
  let prompt = '';
  let isGenerating = false;

  async function generateWallpaper() {
    isGenerating = true;
    // Will implement API call next week
    setTimeout(() => {
      isGenerating = false;
    }, 2000);
  }
</script>

<main class="container">
  <h1>AI Wallpaper Generator</h1>

  <textarea
    bind:value={prompt}
    placeholder="Describe your perfect wallpaper..."
    disabled={isGenerating}
  />

  <button on:click={generateWallpaper} disabled={isGenerating}>
    {isGenerating ? 'Generating...' : 'Generate Wallpaper'}
  </button>

  <div class="preview">
    <!-- Wallpaper will appear here -->
  </div>
</main>

<style>
  .container {
    max-width: 430px; /* iPhone 16 Pro Max width */
    margin: 0 auto;
    padding: 20px;
    padding-top: 59px; /* Safe area top */
    padding-bottom: 34px; /* Safe area bottom */
  }

  textarea {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
  }

  button {
    width: 100%;
    padding: 16px;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    margin-top: 16px;
  }

  button:disabled {
    opacity: 0.5;
  }
</style>
```

**Add viewport meta tags** (`app.html` or `index.html`):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

**Test on iPhone**:
1. Run dev server: `npm run dev -- --host`
2. Note IP address (e.g., `http://192.168.1.100:5173`)
3. Open on iPhone 16 Pro
4. Tap Share → Add to Home Screen
5. Verify app installs and opens fullscreen

**✅ Days 4-5 Complete**: PWA scaffold working, installable on iPhone

---

### Days 6-7: Azure Functions Setup

```bash
# Create backend folder
mkdir backend
cd backend

# Initialize Functions project
func init . --typescript --model V4

# Create HTTP trigger function
func new --name GenerateWallpaper --template "HTTP trigger" --authlevel function
```

**Install dependencies**:
```bash
npm install replicate
npm install @azure/storage-blob
npm install @azure/identity
npm install @azure/keyvault-secrets
npm install zod
```

**Configure** `host.json`:
```json
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 5
      }
    }
  },
  "functionTimeout": "00:05:00"
}
```

**Create** `local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "KEY_VAULT_URL": "https://wallpaper-kv.vault.azure.net",
    "STORAGE_ACCOUNT_NAME": "wallpaperstorage"
  }
}
```

**✅ Week 1 Complete**: Infrastructure ready, frontend scaffold, backend initialized

---

## Week 2: Core Functionality

### Days 8-10: Backend Implementation

**Create Key Vault service** (`src/services/keyVaultService.ts`):
```typescript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const keyVaultUrl = process.env.KEY_VAULT_URL!;
const credential = new DefaultAzureCredential();
const client = new SecretClient(keyVaultUrl, credential);

export async function getSecret(name: string): Promise<string> {
  const secret = await client.getSecret(name);
  return secret.value!;
}
```

**Create Replicate service** (`src/services/replicateService.ts`):
```typescript
import Replicate from "replicate";
import { getSecret } from "./keyVaultService";

let replicateClient: Replicate | null = null;

async function getReplicateClient(): Promise<Replicate> {
  if (!replicateClient) {
    const apiKey = await getSecret("replicate-api-key");
    replicateClient = new Replicate({ auth: apiKey });
  }
  return replicateClient;
}

export interface GenerateWallpaperInput {
  prompt: string;
  width: number;
  height: number;
}

export async function generateWallpaper(input: GenerateWallpaperInput) {
  const replicate = await getReplicateClient();

  const output = await replicate.run(
    "black-forest-labs/flux-1.1-pro",
    {
      input: {
        prompt: input.prompt,
        width: input.width,
        height: input.height,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        output_format: "png",
        output_quality: 95
      }
    }
  );

  return output;
}
```

**Implement generate endpoint** (`src/functions/generateWallpaper.ts`):
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { generateWallpaper } from "../services/replicateService";
import { uploadImageBlob } from "../services/storageService";
import { z } from "zod";

const RequestSchema = z.object({
  prompt: z.string().min(10).max(500),
  resolution: z.enum(["1179x2556", "1290x2796", "1320x2868"]).default("1179x2556")
});

export async function generateWallpaperHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const { prompt, resolution } = RequestSchema.parse(body);

    const [width, height] = resolution.split('x').map(Number);

    context.log(`Generating wallpaper: "${prompt}" at ${width}x${height}`);

    const startTime = Date.now();

    // Generate with Replicate
    const output = await generateWallpaper({ prompt, width, height });
    const imageUrl = Array.isArray(output) ? output[0] : output;

    // Upload to Blob Storage
    const blobUrl = await uploadImageBlob(imageUrl as string, prompt);

    const processingTime = Date.now() - startTime;

    return {
      status: 200,
      jsonBody: {
        id: crypto.randomUUID(),
        status: "succeeded",
        imageUrl: blobUrl,
        metadata: {
          prompt,
          resolution,
          model: "flux-1.1-pro",
          generatedAt: new Date().toISOString(),
          processingTimeMs: processingTime
        }
      }
    };

  } catch (error) {
    context.error('Generation failed:', error);

    return {
      status: 500,
      jsonBody: {
        error: {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    };
  }
}

app.http('generateWallpaper', {
  methods: ['POST'],
  authLevel: 'function',
  handler: generateWallpaperHandler
});
```

**Create storage service** (`src/services/storageService.ts`):
```typescript
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const accountName = process.env.STORAGE_ACCOUNT_NAME!;
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new DefaultAzureCredential()
);

const containerName = "wallpapers";

export async function uploadImageBlob(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Download image from Replicate
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();

  // Generate unique blob name
  const timestamp = Date.now();
  const sanitizedPrompt = prompt.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 50);
  const blobName = `${timestamp}-${sanitizedPrompt}.png`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: "image/png"
    }
  });

  return blockBlobClient.url;
}
```

**Test locally**:
```bash
# Start Functions runtime
func start

# Test with curl
curl -X POST http://localhost:7071/api/generateWallpaper \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Serene ocean sunset, vibrant colors", "resolution": "1179x2556"}'
```

**✅ Days 8-10 Complete**: Backend API working locally

---

### Days 11-14: Frontend Integration

**Create API client** (`src/lib/api.ts`):
```typescript
const API_BASE = import.meta.env.PROD
  ? 'https://yourapp.azurestaticapps.net/api'
  : 'http://localhost:7071/api';

export interface GenerateRequest {
  prompt: string;
  resolution?: string;
}

export interface GenerateResponse {
  id: string;
  status: string;
  imageUrl?: string;
  metadata: {
    prompt: string;
    resolution: string;
    model: string;
    generatedAt: string;
    processingTimeMs: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function generateWallpaper(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/generateWallpaper`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

**Update page component**:
```svelte
<script lang="ts">
  import { generateWallpaper } from '$lib/api';

  let prompt = '';
  let isGenerating = false;
  let currentWallpaper: string | null = null;
  let error: string | null = null;

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;

    isGenerating = true;
    error = null;

    try {
      const result = await generateWallpaper({
        prompt,
        resolution: '1179x2556'
      });

      currentWallpaper = result.imageUrl!;
      saveToHistory(prompt, result.imageUrl!);

    } catch (err) {
      error = err instanceof Error ? err.message : 'Generation failed';
    } finally {
      isGenerating = false;
    }
  }

  function saveToHistory(prompt: string, url: string) {
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    history.unshift({ prompt, url, createdAt: new Date().toISOString() });
    localStorage.setItem('history', JSON.stringify(history.slice(0, 10)));
  }

  function downloadWallpaper() {
    if (!currentWallpaper) return;

    const a = document.createElement('a');
    a.href = currentWallpaper;
    a.download = `wallpaper-${Date.now()}.png`;
    a.click();
  }
</script>

<main>
  <h1>AI Wallpaper Generator</h1>

  <textarea
    bind:value={prompt}
    placeholder="Describe your perfect wallpaper...&#10;&#10;Example: Serene mountain landscape at golden hour, vibrant colors, ultra detailed"
    disabled={isGenerating}
  />

  <button on:click={handleGenerate} disabled={isGenerating || !prompt.trim()}>
    {isGenerating ? 'Generating...' : 'Generate Wallpaper'}
  </button>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if currentWallpaper}
    <div class="preview">
      <img src={currentWallpaper} alt="Generated wallpaper" />
      <button on:click={downloadWallpaper}>Download to Photos</button>
    </div>
  {/if}
</main>
```

**✅ Week 2 Complete**: Full end-to-end flow working

---

## Week 3: PWA Features & Testing

### Days 15-17: Offline Mode

**Implement Service Worker caching**:
Already handled by vite-plugin-pwa, but customize behavior:

**Create** `src/lib/offline.ts`:
```typescript
export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnlineStatusChange(callback: (online: boolean) => void) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}

export interface CachedWallpaper {
  prompt: string;
  url: string;
  createdAt: string;
}

export function getCachedWallpapers(): CachedWallpaper[] {
  const history = localStorage.getItem('history');
  return history ? JSON.parse(history) : [];
}
```

**Add offline indicator to UI**:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { isOnline, onOnlineStatusChange } from '$lib/offline';

  let online = true;

  onMount(() => {
    online = isOnline();
    onOnlineStatusChange((status) => {
      online = status;
    });
  });
</script>

{#if !online}
  <div class="offline-banner">
    📵 You're offline. Showing cached wallpapers.
  </div>
{/if}
```

**✅ Days 15-17 Complete**: Offline mode working

---

### Days 18-21: Polish & Testing

**Follow** [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md)

**Key tests on iPhone 16 Pro**:
- [ ] Install PWA from Safari
- [ ] Generate wallpaper (test 5 different prompts)
- [ ] Download to Photos
- [ ] Set as Lock Screen wallpaper
- [ ] Turn on Airplane mode → verify cached wallpapers show
- [ ] Force close app → reopen → verify state persists
- [ ] Test with slow 3G connection
- [ ] Verify Dynamic Island doesn't obscure UI

**✅ Week 3 Complete**: App polished and tested

---

## Week 4: Deployment

### Days 22-23: Pre-Deployment

**Set up Static Web App**:
```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Initialize from project root
npx swa init --yes

# Configure swa-cli.config.json
```

**Example config**:
```json
{
  "configurations": {
    "wallpaper-app": {
      "appLocation": "frontend",
      "api Location": "backend",
      "outputLocation": "build",
      "appBuildCommand": "npm run build",
      "apiBuildCommand": "npm run build",
      "run": "npm run dev",
      "appDevserverUrl": "http://localhost:5173"
    }
  }
}
```

**✅ Days 22-23 Complete**: Deployment configured

---

### Days 24-28: Deploy & Iterate

**Deploy to Azure**:
```bash
# Login
az login

# Deploy
npx swa deploy --env production
```

**Monitor with Application Insights**:
```bash
# View logs
az monitor app-insights metrics show \
  --app wallpaper-insights \
  --resource-group wallpaper-rg \
  --metric requests/count
```

**✅ MVP COMPLETE! 🎉**

---

##Troubleshooting Guide

### Common Issues

**Issue**: CORS error when calling API
```bash
# Fix in host.json
{
  "extensions": {
    "http": {
      "cors": {
        "allowedOrigins": ["https://yourapp.azurestaticapps.net"]
      }
    }
  }
}
```

**Issue**: Key Vault access denied
```bash
# Grant Function App access
az keyvault set-policy \
  --name wallpaper-kv \
  --object-id $(az functionapp identity show \
    --name wallpaper-func \
    --resource-group wallpaper-rg \
    --query principalId -o tsv) \
  --secret-permissions get list
```

**Issue**: Slow first request (cold start)
- Normal for Flex Consumption plan
- Upgrade to Premium EP1 if needed

---

**Document Version**: 1.0
**Last Updated**: February 20, 2026
