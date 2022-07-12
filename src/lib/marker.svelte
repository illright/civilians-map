<script lang="ts">
	import { getContext, onMount, SvelteComponentTyped, type ComponentType } from 'svelte';
	import { mapCtx, type MapContext } from './map.svelte';

	import './marker.css';

	export let position: [number, number];
	export let iconUrl: string;
	export let popup: ComponentType | undefined = undefined;
	export let popupProps: Record<string, unknown> = {};

	const context = getContext<MapContext>(mapCtx);

	onMount(async () => {
		const leaflet = await import('leaflet');
		return context.cluster.subscribe((cluster) => {
			const marker = leaflet.marker(position, {
				icon: leaflet.icon({
					iconUrl,
					iconSize: [40, 40],
					className: 'marker-image'
				})
			});

			// Credit: https://imfeld.dev/writing/leaflet_with_svelte#popups
			if (popup !== undefined) {
				let popupComponent: SvelteComponentTyped | undefined = undefined;

				marker.bindPopup(() => {
					let container = leaflet.DomUtil.create('div');
					popupComponent = new popup!({ target: container, props: popupProps });
					return container;
				}, { offset: [0, -20] });

				marker.on('popupclose', () => {
					if (popupComponent !== undefined) {
						let old = popupComponent;
						popupComponent = undefined;
						setTimeout(() => old.$destroy(), 500);
					}
				});
			}

			cluster?.addLayer(marker);
		});
	});
</script>
