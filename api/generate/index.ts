import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import { getReplicateApiKey } from '../shared/keyvault.js';
import { uploadToBlob } from '../shared/storage.js';
import Replicate from 'replicate';

// Request validation schema
const GenerateRequestSchema = z.object({
	prompt: z.string().min(3).max(500),
	width: z.number().int().min(512).max(2048).default(1179),
	height: z.number().int().min(512).max(2048).default(2556)
});

export async function generate(
	request: HttpRequest,
	context: InvocationContext
): Promise&lt;HttpResponseInit&gt; {
	const startTime = Date.now();

	try {
		// Parse and validate request body
		const body = await request.json();
		const { prompt, width, height } = GenerateRequestSchema.parse(body);

		context.log(`Generating wallpaper: "${prompt}" (${width}x${height})`);

		// Get Replicate API key from Key Vault
		const apiKey = await getReplicateApiKey();
		const replicate = new Replicate({ auth: apiKey });

		// Run prediction
		const output = await replicate.run('black-forest-labs/flux-1.1-pro', {
			input: {
				prompt,
				width,
				height,
				output_format: 'png',
				output_quality: 100,
				safety_tolerance: 2,
				prompt_upsampling: true
			}
		}) as unknown;

		// Extract image URL from output
		const imageUrl = Array.isArray(output) ? output[0] : output;
		if (typeof imageUrl !== 'string') {
			throw new Error('Invalid response from Replicate API');
		}

		context.log(`Image generated: ${imageUrl}`);

		// Download and upload to Azure Blob Storage
		const imageResponse = await fetch(imageUrl);
		if (!imageResponse.ok) {
			throw new Error('Failed to download generated image');
		}

		const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
		const blobUrl = await uploadToBlob(imageBuffer, `wallpaper-${Date.now()}.png`);

		const generationTime = Date.now() - startTime;
		context.log(`Wallpaper generated successfully in ${generationTime}ms`);

		return {
			status: 200,
			jsonBody: {
				imageUrl: blobUrl,
				metadata: {
					prompt,
					modelUsed: 'flux-1.1-pro',
					generationTime
				}
			}
		};
	} catch (error) {
		context.error('Generation failed:', error);

		if (error instanceof z.ZodError) {
			return {
				status: 400,
				jsonBody: {
					error: 'Invalid request',
					details: error.errors
				}
			};
		}

		return {
			status: 500,
			jsonBody: {
				error: 'Failed to generate wallpaper',
				message: error instanceof Error ? error.message : 'Unknown error'
			}
		};
	}
}

app.http('generate', {
	methods: ['POST'],
	authLevel: 'anonymous',
	handler: generate
});
