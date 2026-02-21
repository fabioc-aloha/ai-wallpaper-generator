import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			srcDir: 'src',
			mode: 'development',
			strategies: 'injectManifest',
			filename: 'service-worker.ts',
			scope: '/',
			base: '/',
			manifest: {
				short_name: 'AI Wallpaper',
				name: 'AI Wallpaper Generator',
				description: 'Generate beautiful AI wallpapers for iPhone',
				start_url: '/',
				display: 'standalone',
				theme_color: '#0969DA',
				background_color: '#ffffff',
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}']
			},
			devOptions: {
				enabled: true,
				type: 'module',
				navigateFallback: '/'
			}
		})
	]
});
