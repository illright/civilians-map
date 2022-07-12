<script lang="ts">
	import IconTelegram from '~icons/logos/telegram';
	export let name: string;
	export let url: string;
	export let telegram: string;
	export let location: string | null;

	$: telegramUsername = telegram.replace(/^@/, '');
</script>

<h1>
	<span>{@html name}</span>
	<a href="https://t.me/{telegramUsername}"
		><IconTelegram width="20" height="20" />
		<span class="sr-only">Telegram: {telegramUsername}</span>
	</a>
</h1>
{#if location !== null}
	<div class="location">{@html location}</div>
{/if}
<a class="notion" href={url}>Карточка в Notion</a>

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

	.location {
		color: gray;
	}

	.notion {
		display: block;
		text-align: center;
		padding: 0.5em 0;
		border: 1px solid gray;
		color: gray;
    border-radius: 0.25em;
    margin-top: 1em;
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
