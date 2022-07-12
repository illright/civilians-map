import { lookUpPlace } from '$lib/nominatim';
import { cachePersonData, getPeople } from '$lib/notion';
import { getPictureByUsername } from '$lib/telegram';
import type { RequestEvent } from '@sveltejs/kit';

/** @type {import('./__types/index').RequestHandler} */
export async function get({ url }: RequestEvent) {
	if (url.searchParams.get('secret') !== import.meta.env.VITE_SECRET) {
		return {
			status: 401,
			body: {
				markers: [],
			}
		}
	}
	const people = await getPeople(
		url.searchParams.get('db')!,
		url.searchParams.getAll('loc_field'),
		url.searchParams.get('tg_field')!,
		url.searchParams.get('cache_field')!,
	);

	const markers = [];
	for (const person of people) {
		const { location, telegram, cached } = person;
		if (location !== null) {
			const [coordinates, pictureUrl] = await Promise.all([
				cached.cachedLocation === location ? cached.coordinates : lookUpPlace(location),
				cached.cachedTelegram === telegram
					? cached.pictureUrl
					: telegram && getPictureByUsername(telegram)
			]);

			if (cached.coordinates !== coordinates || cached.pictureUrl !== pictureUrl) {
				await cachePersonData(
					person,
					url.searchParams.get('cache_field')!,
					coordinates,
					pictureUrl
				);
			}

			markers.push([coordinates, pictureUrl, person]);
		}
	}

	return {
		status: 200,
		headers: {
			'access-control-allow-origin': '*'
		},
		body: {
			markers
		}
	};
}
