<script lang="ts">
	import Map from '$lib/map.svelte';
	import Marker from '$lib/marker.svelte';

	const positions: Array<[number, number]> = [
		[1, 1],
		[2, 2]
	];
</script>

<Map>
	{#each positions as position}
		<Marker
			{position}
			iconUrl="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/15035286?s=64&mask=circle&mbg=transparent&output=png"
		/>
	{/each}
</Map>
