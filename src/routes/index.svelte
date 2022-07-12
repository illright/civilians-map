<script lang="ts">
	import Map from '$lib/map.svelte';
	import Marker from '$lib/marker.svelte';
	import Popup from '$lib/popup.svelte';

	export let markers: Array<[[number, number], string | null, Record<string, unknown>]>;
</script>

<Map>
	{#each markers as [position, iconUrl, person]}
		<Marker
			{position}
			iconUrl={iconUrl ?? 'https://placekitten.com/128/128'}
			popup={Popup}
			popupProps={person}
		/>
	{/each}
</Map>
