&lt;script lang="ts"&gt;
	import { onMount } from 'svelte';
	import { wallpaperStore } from '$stores/wallpaper';
	import type { Wallpaper } from '$lib/types';

	let prompt = '';
	let isGenerating = false;
	let error = '';
	let currentWallpaper: Wallpaper | null = null;
	let isOnline = true;

	onMount(() => {
		// Check online status
		isOnline = navigator.onLine;
		window.addEventListener('online', () => (isOnline = true));
		window.addEventListener('offline', () => (isOnline = false));

		// Load cached wallpapers
		wallpaperStore.loadFromStorage();
	});

	async function generateWallpaper() {
		if (!prompt.trim()) {
			error = 'Please enter a prompt';
			return;
		}

		if (!isOnline) {
			error = 'No internet connection. View cached wallpapers below.';
			return;
		}

		isGenerating = true;
		error = '';

		try {
			// Sanitize input
			const sanitizedPrompt = prompt.trim()
				.replace(/[<>]/g, '') // Remove HTML chars
				.slice(0, 500); // Enforce max length

			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: sanitizedPrompt,
					aspectRatio: '9:16'
				})
			});

			if (!response.ok) {
				throw new Error(`Generation failed: ${response.statusText}`);
			}

			const data = await response.json();
			currentWallpaper = {
				id: crypto.randomUUID(),
				prompt: sanitizedPrompt,
				imageUrl: data.imageUrl,
				createdAt: new Date().toISOString()
			};

			// Save to store
			wallpaperStore.add(currentWallpaper);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate wallpaper';
		} finally {
			isGenerating = false;
		}
	}

	function downloadWallpaper(url: string, filename: string) {
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
	}
&lt;/script&gt;

&lt;svelte:head&gt;
	&lt;title&gt;AI Wallpaper Generator&lt;/title&gt;
	&lt;meta name="description" content="Generate beautiful AI wallpapers for iPhone" /&gt;
	&lt;meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /&gt;
	&lt;meta name="theme-color" content="#0969DA" /&gt;
&lt;/svelte:head&gt;

&lt;main&gt;
	&lt;div class="container"&gt;
		&lt;header&gt;
			&lt;h1&gt;🎨 AI Wallpaper Generator&lt;/h1&gt;
			&lt;p&gt;Create beautiful wallpapers for iPhone 16 Pro&lt;/p&gt;
			{#if !isOnline}
				&lt;div class="offline-badge"&gt;📵 Offline Mode&lt;/div&gt;
			{/if}
		&lt;/header&gt;

		&lt;section class="generator"&gt;
			&lt;div class="input-group"&gt;
				&lt;input
					type="text"
					bind:value={prompt}
					placeholder="e.g., neon city at night, minimalist mountains..."
					disabled={isGenerating}
					on:keydown={(e) =&gt; e.key === 'Enter' &amp;&amp; generateWallpaper()}
				/&gt;
				&lt;button on:click={generateWallpaper} disabled={isGenerating || !isOnline}&gt;
					{isGenerating ? '⏳ Generating...' : '✨ Generate'}
				&lt;/button&gt;
			&lt;/div&gt;

			{#if error}
				&lt;div class="error"&gt;❌ {error}&lt;/div&gt;
			{/if}

			{#if isGenerating}
				&lt;div class="progress"&gt;
					&lt;p&gt;🎨 Creating your wallpaper...&lt;/p&gt;
					&lt;p class="subtitle"&gt;This takes 15-25 seconds&lt;/p&gt;
				&lt;/div&gt;
			{/if}

			{#if currentWallpaper}
				&lt;div class="wallpaper-preview"&gt;
					&lt;img src={currentWallpaper.imageUrl} alt={currentWallpaper.prompt} /&gt;
					&lt;button
						class="download-btn"
						on:click={() =&gt;
							downloadWallpaper(
								currentWallpaper.imageUrl,
								`wallpaper-${Date.now()}.png`
							)}&gt;
						📥 Download to Photos
					&lt;/button&gt;
				&lt;/div&gt;
			{/if}
		&lt;/section&gt;

		&lt;section class="history"&gt;
			&lt;h2&gt;Recent Wallpapers&lt;/h2&gt;
			{#if $wallpaperStore.length === 0}
				&lt;p class="empty"&gt;No wallpapers yet. Generate your first one! 👆&lt;/p&gt;
			{:else}
				&lt;div class="grid"&gt;
					{#each $wallpaperStore as wallpaper}
						&lt;div class="wallpaper-card"&gt;
							&lt;img src={wallpaper.imageUrl} alt={wallpaper.prompt} /&gt;
							&lt;p class="prompt"&gt;{wallpaper.prompt}&lt;/p&gt;
							&lt;button
								on:click={() =&gt;
									downloadWallpaper(wallpaper.imageUrl, `wallpaper-${wallpaper.id}.png`)}&gt;
								📥 Download
							&lt;/button&gt;
						&lt;/div&gt;
					{/each}
				&lt;/div&gt;
			{/if}
		&lt;/section&gt;
	&lt;/div&gt;
&lt;/main&gt;

&lt;style&gt;
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		color: #1f2328;
	}

	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		padding-bottom: env(safe-area-inset-bottom);
	}

	header {
		text-align: center;
		color: white;
		margin-bottom: 30px;
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 10px 0;
	}

	header p {
		margin: 0;
		opacity: 0.9;
	}

	.offline-badge {
		background: #fb8500;
		color: white;
		padding: 8px 16px;
		border-radius: 20px;
		display: inline-block;
		margin-top: 10px;
		font-size: 0.9rem;
	}

	.generator,
	.history {
		background: white;
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.input-group {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
	}

	input {
		flex: 1;
		padding: 14px 16px;
		border: 2px solid #d0d7de;
		border-radius: 8px;
		font-size: 1rem;
		outline: none;
	}

	input:focus {
		border-color: #0969da;
	}

	button {
		padding: 14px 24px;
		background: #0969da;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover:not(:disabled) {
		background: #0550ae;
	}

	button:disabled {
		background: #6e7781;
		cursor: not-allowed;
	}

	.error {
		padding: 12px;
		background: #ffebe9;
		border: 1px solid #cf222e;
		border-radius: 8px;
		color: #cf222e;
		margin-bottom: 16px;
	}

	.progress {
		text-align: center;
		padding: 24px;
		color: #57606a;
	}

	.progress p {
		margin: 8px 0;
	}

	.subtitle {
		font-size: 0.9rem;
		opacity: 0.7;
	}

	.wallpaper-preview {
		text-align: center;
	}

	.wallpaper-preview img {
		max-width: 100%;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		margin-bottom: 16px;
	}

	.download-btn {
		background: #1a7f37;
	}

	.download-btn:hover {
		background: #116329;
	}

	h2 {
		margin: 0 0 20px 0;
		font-size: 1.5rem;
	}

	.empty {
		text-align: center;
		color: #57606a;
		padding: 40px 20px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 16px;
	}

	.wallpaper-card {
		border: 2px solid #d0d7de;
		border-radius: 8px;
		padding: 12px;
		text-align: center;
	}

	.wallpaper-card img {
		width: 100%;
		border-radius: 6px;
		margin-bottom: 8px;
	}

	.prompt {
		font-size: 0.85rem;
		color: #57606a;
		margin: 0 0 8px 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.wallpaper-card button {
		width: 100%;
		padding: 8px;
		font-size: 0.85rem;
	}
&lt;/style&gt;
