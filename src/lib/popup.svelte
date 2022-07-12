<script lang="ts">
	import IconTelegram from '~icons/logos/telegram';
	export let name: string;
	export let telegram: string;
	export let location: string | null;
	export let hobbies: string;
	export let workInterests: string;

	$: telegramUsername = telegram.replace(/^@/, '');
</script>

<h1>
	<span>{name}</span>
	<a href="https://t.me/{telegramUsername}"
		><IconTelegram width="20" height="20" />
		<span class="sr-only">Telegram: {telegramUsername}</span>
	</a>
</h1>
<div class="location">{location}</div>
<h2>Увлечения</h2>
<p>{hobbies}</p>
<h2>Рабочие интересы</h2>
<p>{workInterests}</p>

<style>
	h1 {
		font-size: 1.3em;
		margin: 1em 0 0.25em;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	h1 :global(svg) {
		display: block;
	}

	h2 {
		font-size: 1.1em;
		margin: 0.75em 0 0.25em;
	}

	p {
		margin: 0 0 0.5em;
	}

	.location {
		color: gray;
	}

	/* Credit: https://stackoverflow.com/a/42665456/5726823 */
	.sr-only {
		border: 0 !important;
		clip: rect(1px, 1px, 1px, 1px) !important;
		-webkit-clip-path: inset(50%) !important;
		clip-path: inset(50%) !important;
		height: 1px !important;
		margin: -1px !important;
		overflow: hidden !important;
		padding: 0 !important;
		position: absolute !important;
		width: 1px !important;
		white-space: nowrap !important;
	}
</style>
