import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import { getReplicateApiKey } from '../shared/keyvault.js';
import { uploadToBlob } from '../shared/storage.js';
import Replicate from 'replicate';

// Request validation schema
const GenerateRequestSchema = z.object({
	prompt: z.string().min(3).max(500),
	aspectRatio: z.enum(['9:16', '16:9', '1:1']).default('9:16')
});

// AI Model configuration
const AI_MODEL = process.env.AI_MODEL || 'black-forest-labs/flux-pro';
const GENERATION_TIMEOUT = 30000; // 30 seconds

export async function generate(
	request: HttpRequest,
	context: InvocationContext
): Promise<HttpResponseInit> {
	const startTime = Date.now();

	try {
		// Parse and validate request body
		const body = await request.json();
		const { prompt, aspectRatio } = GenerateRequestSchema.parse(body);

		context.log(`Generating wallpaper: "${prompt}" (${aspectRatio})`);

		// Get Replicate API key from Key Vault
		const apiKey = await getReplicateApiKey();
		const replicate = new Replicate({ auth: apiKey });

		// Run prediction with timeout protection
		const output = await Promise.race([
			replicate.run(AI_MODEL as `${string}/${string}`, {
				input: {
					prompt,
					aspect_ratio: aspectRatio,
					output_format: 'png',
					guidance: 3,
					steps: 25,
					safety_tolerance: 2
				}
			}),
			new Promise((_, reject) =>
				setTimeout(() => reject(new Error('Generation timeout after 30s')), GENERATION_TIMEOUT)
			)
		]) as unknown;

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
					modelUsed: AI_MODEL,
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
