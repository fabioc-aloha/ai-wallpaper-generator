import { writable } from 'svelte/store';
import type { Wallpaper } from '$lib/types';

const STORAGE_KEY = 'wallpapers';
const MAX_STORED = 10;

function createWallpaperStore() {
	const { subscribe, set, update } = writable&lt;Wallpaper[]&gt;([]);

	return {
		subscribe,
		add: (wallpaper: Wallpaper) =&gt; {
			update((wallpapers) =&gt; {
				const updated = [wallpaper, ...wallpapers].slice(0, MAX_STORED);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			});
		},
		loadFromStorage: () =&gt; {
			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) {
					set(JSON.parse(stored));
				}
			} catch (error) {
				console.error('Failed to load wallpapers from storage:', error);
			}
		},
		clear: () =&gt; {
			localStorage.removeItem(STORAGE_KEY);
			set([]);
		}
	};
}

export const wallpaperStore = createWallpaperStore();
