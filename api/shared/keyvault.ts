import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

let cachedApiKey: string | null = null;

export async function getReplicateApiKey(): Promise&lt;string&gt; {
	// Return cached key if available
	if (cachedApiKey) {
		return cachedApiKey;
	}

	// Get Key Vault name from environment
	const keyVaultName = process.env.KEY_VAULT_NAME;
	if (!keyVaultName) {
		throw new Error('KEY_VAULT_NAME environment variable not set');
	}

	try {
		// Use Managed Identity for authentication
		const credential = new DefaultAzureCredential();
		const vaultUrl = `https://${keyVaultName}.vault.azure.net`;
		const client = new SecretClient(vaultUrl, credential);

		// Get secret
		const secret = await client.getSecret('REPLICATE-API-KEY');
		if (!secret.value) {
			throw new Error('Replicate API key not found in Key Vault');
		}

		// Cache the key
		cachedApiKey = secret.value;
		return cachedApiKey;
	} catch (error) {
		console.error('Failed to retrieve API key from Key Vault:', error);
		throw new Error('Failed to authenticate with Key Vault');
	}
}
