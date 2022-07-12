const baseUrl = 'https://nominatim.openstreetmap.org/search.php?format=jsonv2';

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function lookUpPlace(location: string) {
	const url = new URL(baseUrl);
	url.searchParams.set('q', location);

	const headers = new Headers([['User-Agent', 'Civilians Map/1.0.0']]);

	const searchResults = await fetch(url.toString(), { headers }).then((res) => res.json());
	await sleep(1000);
	return [searchResults[0]?.lat, searchResults[0]?.lon] as [number, number];
}
