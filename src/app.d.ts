/// <reference types="@sveltejs/kit" />
import type { MarkerClusterGroup, MarkerClusterGroupOptions } from 'leaflet';

declare module 'leaflet.markercluster' {
	const MarkerClusterGroup: {
		new (options?: MarkerClusterGroupOptions): MarkerClusterGroup;
	};
	export { MarkerClusterGroup };
}
