/// <reference types="@sveltejs/kit" />
/// <reference types="unplugin-icons/types/svelte" />
import type { MarkerClusterGroup, MarkerClusterGroupOptions } from 'leaflet';

declare module 'leaflet.markercluster' {
	const MarkerClusterGroup: {
		new (options?: MarkerClusterGroupOptions): MarkerClusterGroup;
	};
	export { MarkerClusterGroup };
}
