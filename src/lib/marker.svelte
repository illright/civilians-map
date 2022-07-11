<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { mapCtx, type MapContext } from './map.svelte';

	export let position: [number, number];
	export let iconUrl: string;
	const context = getContext<MapContext>(mapCtx);

	onMount(async () => {
		const leaflet = await import('leaflet');
		return context.cluster.subscribe((cluster) => {
			cluster?.addLayer(
				leaflet.marker(position, {
					icon: leaflet.icon({
						iconUrl,
						iconSize: [48, 48]
					})
				})
			);
		});
	});
</script>
