<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
	let notion = [[1, 1], [2, 2]];

	import { onMount } from 'svelte';
	import { browser } from '$app/env';

	onMount(async () => {
		if (browser) {
			const leaflet = (window.L = await import('leaflet'));
			await import('leaflet.markercluster');

			const map = leaflet.map('map').setView([0, 0], 1);

			leaflet
				.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
					attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
	        &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
					subdomains: 'abcd',
					maxZoom: 14
				})
				.addTo(map);

			const markerCluster = leaflet.markerClusterGroup();
			for (const [x, y] of notion) {
				markerCluster.addLayer(
					leaflet.marker([x, y], {
						icon: leaflet.icon({
							iconUrl:
								'https://images.weserv.nl/?url=avatars.githubusercontent.com/u/15035286?s=64&mask=circle&mbg=transparent&output=png',
							iconSize: [48, 48],
							iconRetinaUrl:
								'https://images.weserv.nl/?url=avatars.githubusercontent.com/u/15035286?s=128&mask=circle&mbg=transparent&output=png'
						})
					}).bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
				);
			}
			map.addLayer(markerCluster);
		}
	});
</script>

<pre>
  {JSON.stringify(notion, null, 2)}
</pre>

<div id="map" />

<style>
	#map {
		height: 400px;
		width: 600px;
	}
</style>
