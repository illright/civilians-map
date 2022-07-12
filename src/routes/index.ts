import { lookUpPlace } from '$lib/nominatim';
import { cachePersonData, getPeople, type Person } from '$lib/notion';
import { getPictureByUsername } from '$lib/telegram';
import type { RequestEvent } from '@sveltejs/kit';

/** @type {import('./__types/index').RequestHandler} */
export async function get({ url }: RequestEvent) {
	if (url.searchParams.get('secret') !== import.meta.env.VITE_SECRET) {
		return {
			status: 401,
			body: {
				markers: []
			}
		};
	}
	const people = await getPeople(
		url.searchParams.get('db')!,
		url.searchParams.getAll('loc_field'),
		url.searchParams.get('tg_field')!,
		url.searchParams.get('cache_field')!
	);

	const markers = [];
	for (const person of people) {
		const { location, telegram, cached } = person;
		if (location !== null) {
			const [coordinates, pictureUrl] = await Promise.all([
				cachedLocationValid(cached, location) ? cached.coordinates : lookUpPlace(location),
				cachedTelegramValid(cached, telegram)
					? cached.pictureUrl
					: telegram && getPictureByUsername(telegram)
			]);

			if (!cachedLocationValid(cached, location) || !cachedTelegramValid(cached, telegram)) {
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

const cacheExpiration = 1000 * 60 * 60 * 24;

function cachedLocationValid(cached: Person['cached'], location: string | null) {
	const now = new Date();
	const cachedOn = new Date(cached.coordinatesCachedOn);
	return cached.cachedLocation === location && now.valueOf() - cachedOn.valueOf() < cacheExpiration;
}

function cachedTelegramValid(cached: Person['cached'], telegram: string | null) {
	const now = new Date();
	const cachedOn = new Date(cached.pictureCachedOn);
	return cached.cachedTelegram === telegram && now.valueOf() - cachedOn.valueOf() < cacheExpiration;
}
