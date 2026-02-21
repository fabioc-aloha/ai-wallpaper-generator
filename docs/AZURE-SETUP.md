# Azure Setup Guide

**Purpose**: Step-by-step Azure infrastructure deployment
**Time**: ~2-3 hours
**Cost**: Free tier for MVP

---

## Prerequisites

```bash
# 1. Install Azure CLI
# Windows (PowerShell):
winget install Microsoft.AzureCLI

# macOS:
brew install azure-cli

# Verify installation
az --version

# 2. Login
az login
# Browser window opens → sign in with your account

# 3. Set default subscription (if you have multiple)
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

---

## Step 1: Create Resource Group

**Resource Group** = Container for all your Azure resources

```bash
# Create resource group in West US 2 (or your preferred region)
az group create \
  --name wallpaper-rg \
  --location westus2

# Verify
az group show --name wallpaper-rg --output table
```

**Expected output**:
```
Name           Location    Status
-------------  ----------  ---------
wallpaper-rg   westus2     Succeeded
```

---

## Step 2: Create Storage Account

**Storage Account** = Blob storage for generated wallpapers

```bash
# Create storage account (name must be globally unique, lowercase, no hyphens)
az storage account create \
  --name wallpaperstorage2026 \
  --resource-group wallpaper-rg \
  --location westus2 \
  --sku Standard_LRS \
  --access-tier Hot \
  --allow-blob-public-access false

# Create blob container
az storage container create \
  --name wallpapers \
  --account-name wallpaperstorage2026 \
  --public-access off

# Verify
az storage account show \
  --name wallpaperstorage2026 \
  --resource-group wallpaper-rg \
  --query "[name,location,sku.name,properties.accessTier]" \
  --output table
```

**Expected output**:
```
Column1                  Column2    Column3       Column4
-----------------------  ---------  ------------  -------
wallpaperstorage2026     westus2    Standard_LRS  Hot
```

---

## Step 3: Create Key Vault

**Key Vault** = Secure storage for API keys and secrets

```bash
# Create Key Vault (name must be globally unique)
az keyvault create \
  --name wallpaper-kv-2026 \
  --resource-group wallpaper-rg \
  --location westus2 \
  --enable-rbac-authorization false

# Store your Replicate API key
az keyvault secret set \
  --vault-name wallpaper-kv-2026 \
  --name replicate-api-key \
  --value "YOUR_REPLICATE_API_KEY_HERE"

# Verify secret stored
az keyvault secret show \
  --vault-name wallpaper-kv-2026 \
  --name replicate-api-key \
  --query "[name,id]" \
  --output table
```

**⚠️ Important**: Replace `YOUR_REPLICATE_API_KEY_HERE` with your actual key from https://replicate.com/account/api-tokens

---

## Step 4: Create Application Insights

**Application Insights** = Monitoring and telemetry

```bash
# Create Application Insights instance
az monitor app-insights component create \
  --app wallpaper-insights \
  --location westus2 \
  --resource-group wallpaper-rg \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app wallpaper-insights \
  --resource-group wallpaper-rg \
  --query "[name,instrumentationKey,connectionString]" \
  --output table
```

**Save the Connection String** - you'll need it for Functions configuration.

---

## Step 5: Create Azure Functions App (Flex Consumption)

**Azure Functions** = Serverless backend API

```bash
# Create Function App with Flex Consumption plan
az functionapp create \
  --name wallpaper-func-2026 \
  --resource-group wallpaper-rg \
  --storage-account wallpaperstorage2026 \
  --consumption-plan-location westus2 \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --os-type Linux \
  --assign-identity [system]

# Enable Application Insights
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app wallpaper-insights \
  --resource-group wallpaper-rg \
  --query instrumentationKey -o tsv)

az functionapp config appsettings set \
  --name wallpaper-func-2026 \
  --resource-group wallpaper-rg \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY"
```

---

## Step 6: Grant Function App Access to Key Vault

**Managed Identity** = Allow Function App to read secrets without storing credentials

```bash
# Get Function App's managed identity principal ID
PRINCIPAL_ID=$(az functionapp identity show \
  --name wallpaper-func-2026 \
  --resource-group wallpaper-rg \
  --query principalId -o tsv)

# Grant Key Vault access
az keyvault set-policy \
  --name wallpaper-kv-2026 \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list

# Verify

 access
az keyvault show \
  --name wallpaper-kv-2026 \
  --query "properties.accessPolicies[?objectId=='$PRINCIPAL_ID']" \
  --output table
```

---

## Step 7: Grant Function App Access to Blob Storage

```bash
# Get storage account resource ID
STORAGE_ID=$(az storage account show \
  --name wallpaperstorage2026 \
  --resource-group wallpaper-rg \
  --query id -o tsv)

# Assign Storage Blob Data Contributor role
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Storage Blob Data Contributor" \
  --scope $STORAGE_ID

# Verify
az role assignment list \
  --assignee $PRINCIPAL_ID \
  --scope $STORAGE_ID \
  --output table
```

---

## Step 8: Create Azure Static Web App

**Static Web App** = Frontend hosting with built-in CI/CD

```bash
# Create Static Web App
az staticwebapp create \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg \
  --location westus2 \
  --sku Free

# Get deployment token (needed for GitHub Actions)
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name wallpaper-app-2026 \
  --resource-group wallpaper-rg \
  --query "properties.apiKey" -o tsv)

echo "Save this deployment token: $DEPLOYMENT_TOKEN"
```

---

## Step 9: Set Budget Alerts

**Prevent unexpected charges** with email alerts

```bash
# Create budget ($5/month alert)
az consumption budget create \
  --budget-name wallpaper-budget \
  --amount 5 \
  --time-grain Monthly \
  --start-date $(date -u +"%Y-%m-01") \
  --end-date $(date -u +"%Y-12-31") \
  --resource-group wallpaper-rg \
  --notifications \
    Actual_GreaterThan_80_Percent=true \
    email-addresses=your-email@example.com

# Verify budget
az consumption budget show \
  --budget-name wallpaper-budget \
  --resource-group wallpaper-rg \
  --output table
```

**⚠️ Update**: Replace `your-email@example.com` with your actual email.

---

## Step 10: Verify All Resources

```bash
# List all resources in resource group
az resource list \
  --resource-group wallpaper-rg \
  --output table

# Should show:
# - wallpaperstorage2026 (Storage account)
# - wallpaper-kv-2026 (Key Vault)
# - wallpaper-insights (Application Insights)
# - wallpaper-func-2026 (Function App)
# - wallpaper-app-2026 (Static Web App)
```

---

## Step 11: Export Configuration

**Save these values** - you'll need them for development:

```bash
# Create .env file
cat > .env.production << EOF
# Azure Resources
RESOURCE_GROUP=wallpaper-rg
LOCATION=westus2

# Storage
STORAGE_ACCOUNT_NAME=wallpaperstorage2026
STORAGE_CONTAINER=wallpapers

# Key Vault
KEY_VAULT_NAME=wallpaper-kv-2026
KEY_VAULT_URL=https://wallpaper-kv-2026.vault.azure.net

# Functions
FUNCTION_APP_NAME=wallpaper-func-2026

# Static Web App
STATIC_WEB_APP_NAME=wallpaper-app-2026
STATIC_WEB_APP_URL=https://wallpaper-app-2026.azurestaticapps.net

# Application Insights
APP_INSIGHTS_NAME=wallpaper-insights
APP_INSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show \
  --app wallpaper-insights \
  --resource-group wallpaper-rg \
  --query connectionString -o tsv)
EOF

echo "✅ Configuration saved to .env.production"
```

---

## Infrastructure as Code (Optional)

**If you prefer Bicep** templates over CLI commands:

Create `infra/main.bicep`:
```bicep
param location string = 'westus2'
param appName string = 'wallpaper'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${appName}storage2026'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${appName}-kv-2026'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: false
  }
}

// ... add other resources
```

Deploy with:
```bash
az deployment group create \
  --resource-group wallpaper-rg \
  --template-file infra/main.bicep
```

---

## Cost Monitoring Dashboard

**View costs in Azure Portal**:

1. Navigate to https://portal.azure.com
2. Search for "Cost Management"
3. Select "Cost analysis"
4. Filter by Resource group: `wallpaper-rg`
5. View daily/monthly costs

**Expected MVP costs** (first month):
```
Resource                    Estimated Cost
--------------------------  --------------
Storage Account             $0.02
Key Vault                   $0.02
Application Insights        $0.00 (free tier)
Functions (Flex)            $0.20
Static Web App              $0.00 (free tier)
Replicate API               $1.00
--------------------------
TOTAL                       ~$1.24/month
```

---

## Cleanup (if needed)

**To delete all resources** (⚠️ irreversible):

```bash
# Delete entire resource group
az group delete \
  --name wallpaper-rg \
  --yes \
  --no-wait

# Verify deletion (wait 5-10 minutes)
az group exists --name wallpaper-rg
# Should return: false
```

---

## Troubleshooting

### Issue: "The resource name is already in use"

**Solution**: Choose a different name (must be globally unique)
```bash
# Add random suffix
SUFFIX=$(openssl rand -hex 3)
echo "wallpaper-kv-$SUFFIX"
```

### Issue: "Insufficient permissions"

**Solution**: Ensure you have Owner or Contributor role on subscription
```bash
# Check your role
az role assignment list --assignee $(az account show --query user.name -o tsv)
```

### Issue: "Location not available"

**Solution**: Choose a different region
```bash
# List available locations
az account list-locations --output table
```

---

## Next Steps

After completing infrastructure setup:

1. ✅ Update `backend/local.settings.json` with Key Vault URL
2. ✅ Update `frontend/.env` with API endpoints
3. ✅ Follow [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md) Week 2
4. ✅ Test locally before deploying

---

**Document Version**: 1.0
**Last Updated**: February 20, 2026
**Estimated Completion Time**: 2-3 hours
