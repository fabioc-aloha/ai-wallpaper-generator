/// &lt;reference types="@sveltejs/kit" /&gt;
/// &lt;reference no-default-lib="true"/&gt;
/// &lt;reference lib="esnext" /&gt;
/// &lt;reference lib="webworker" /&gt;

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = `wallpaper-cache-${version}`;
const WALLPAPER_CACHE = 'wallpaper-images-v1';

// Files to cache on install
const STATIC_ASSETS = [...build, ...files];

// Install event
sw.addEventListener('install', (event) =&gt; {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) =&gt; cache.addAll(STATIC_ASSETS))
	);
	sw.skipWaiting();
});

// Activate event
sw.addEventListener('activate', (event) =&gt; {
	event.waitUntil(
		caches.keys().then(async (keys) =&gt; {
			// Delete old caches
			for (const key of keys) {
				if (key !== CACHE_NAME &amp;&amp; key !== WALLPAPER_CACHE) {
					await caches.delete(key);
				}
			}
			sw.clients.claim();
		})
	);
});

// Fetch event
sw.addEventListener('fetch', (event) =&gt; {
	const { request } = event;
	const url = new URL(request.url);

	// API requests - network first, then cache
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(
			fetch(request)
				.then(async (response) =&gt; {
					// Cache successful responses
					if (response.ok) {
						const cache = await caches.open(WALLPAPER_CACHE);
						cache.put(request, response.clone());
					}
					return response;
				})
				.catch(async () =&gt; {
					// Fallback to cache on network failure
					const cached = await caches.match(request);
					if (cached) return cached;
					return new Response('Offline', { status: 503 });
				})
		);
		return;
	}

	// Static assets - cache first, then network
	event.respondWith(
		caches.match(request).then((cached) =&gt; {
			if (cached) return cached;
			return fetch(request).then((response) =&gt; {
				if (response.ok) {
					const cache = caches.open(CACHE_NAME);
					cache.then((c) =&gt; c.put(request, response.clone()));
				}
				return response;
			});
		})
	);
});
