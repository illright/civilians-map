<script lang="ts" context="module">
	import type { Writable } from 'svelte/store';
	import type { Map, MarkerClusterGroup } from 'leaflet';

	// Basemap provided by CartoDB
	//   See https://github.com/CartoDB/basemap-styles
	const basemap = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
	const basemapRetina =
		'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}@2x.png';

	const copyrightNotice =
		'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>';

	export const mapCtx = {};
	export interface MapContext {
		map: Writable<Map | undefined>;
		cluster: Writable<MarkerClusterGroup | undefined>;
	}
</script>

<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	import 'leaflet/dist/leaflet.css';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

	const contextValue: MapContext = {
		map: writable(undefined),
		cluster: writable(undefined)
	};
	setContext(mapCtx, contextValue);

	onMount(async () => {
		const leaflet = await import('leaflet');
		const { MarkerClusterGroup } = await import('leaflet.markercluster');

		const map = leaflet.map('map').setView([0, 0], 1);
		const cluster = new MarkerClusterGroup();

		leaflet
			.tileLayer(leaflet.Browser.retina ? basemapRetina : basemap, {
				attribution: copyrightNotice,
				subdomains: 'abcd',
				maxZoom: 14
			})
			.addTo(map);
		map.addLayer(cluster);

		contextValue.map.set(map);
		contextValue.cluster.set(cluster);
	});
</script>

<div id="map" />
<slot />

<style>
	#map {
		height: 100vh;
		width: 100vw;
	}
</style>
