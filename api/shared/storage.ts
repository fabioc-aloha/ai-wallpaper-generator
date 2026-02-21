import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export async function uploadToBlob(
	data: Buffer,
	fileName: string
): Promise<string> {
	const accountName = process.env.STORAGE_ACCOUNT_NAME;
	const containerName = process.env.STORAGE_CONTAINER_NAME || 'wallpapers';

	if (!accountName) {
		throw new Error('STORAGE_ACCOUNT_NAME environment variable not set');
	}

	try {
		// Create BlobServiceClient using Managed Identity
		const credential = new DefaultAzureCredential();
		const blobServiceClient = new BlobServiceClient(
			`https://${accountName}.blob.core.windows.net`,
			credential
		);

		// Get container client
		const containerClient = blobServiceClient.getContainerClient(containerName);

		// Upload blob
		const blockBlobClient = containerClient.getBlockBlobClient(fileName);
		await blockBlobClient.upload(data, data.length, {
			blobHTTPHeaders: {
				blobContentType: 'image/png'
			}
		});

		// Return CDN URL
		return blockBlobClient.url;
	} catch (error) {
		console.error('Failed to upload to Blob Storage:', error);
		throw new Error('Failed to save generated image');
	}
}
