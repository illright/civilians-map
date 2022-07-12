<script lang="ts">
	import Map from '$lib/map.svelte';
	import Marker from '$lib/marker.svelte';
	import Popup from '$lib/popup.svelte';

	export let markers: Array<[[number, number], string | null]>;
</script>

<Map>
	{#each markers as [position, iconUrl]}
		<Marker
			{position}
			iconUrl={iconUrl ?? 'https://placekitten.com/128/128'}
			popup={Popup}
			popupProps={{
				name: 'Александра',
				telegram: '@ivanov_ivan',
				location: 'Москва, ул. Пушкина, д. 1',
				hobbies: 'Программирование, плавание, прогулки',
				workInterests: 'Программирование, плавание, прогулки'
			}}
		/>
	{/each}
</Map>
