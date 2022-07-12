import { Client } from '@notionhq/client';

const notion = new Client({
	auth: import.meta.env.VITE_NOTION_INTERNAL_INTEGRATION_TOKEN
});

class NotionProperties {
	private pageId: string;
	private propertyMap: Map<string, string>;

	constructor(pageId: string, rawProperties: Record<string, { id: string }>) {
		this.pageId = pageId;
		this.propertyMap = new Map();
		for (const [key, value] of Object.entries(rawProperties)) {
			this.propertyMap.set(key, value.id);
		}
	}

	private async retrieve(propertyName: string) {
		const propertyId = this.propertyMap.get(propertyName);
		if (propertyId === undefined) {
			return undefined;
		}

		return await notion.pages.properties.retrieve({
			page_id: this.pageId,
			property_id: propertyId
		});
	}

	async getNumeric(propertyName: string): Promise<number | null | undefined> {
		const apiResponse = await this.retrieve(propertyName);

		if (apiResponse !== undefined && 'number' in apiResponse) {
			return apiResponse.number;
		} else {
			return undefined;
		}
	}

	async getText(propertyName: string): Promise<string | null | undefined> {
		const apiResponse = await this.retrieve(propertyName);

		if (
			apiResponse !== undefined &&
			'results' in apiResponse &&
			apiResponse.results.length > 0 &&
			'rich_text' in apiResponse.results[0]
		) {
			return apiResponse.results[0].rich_text.plain_text;
		} else {
			return undefined;
		}
	}

	async getEmail(propertyName: string): Promise<string | null | undefined> {
		const apiResponse = await this.retrieve(propertyName);

		if (apiResponse !== undefined && 'email' in apiResponse) {
			return apiResponse.email;
		} else {
			return undefined;
		}
	}
}

interface Person {
	id: string;
	location: string | null;
	telegram: string | null;
	cached: {
		cachedLocation: string | null;
		cachedTelegram: string | null;
		coordinates: [number, number];
		pictureUrl: string | null;
	};
}

export async function getPeople(
	databaseId: string,
	locationFields: string[],
	telegramField: string,
	cacheField: string
) {
	const pages = await notion.databases.query({ database_id: databaseId });

	const result: Person[] = [];
	for (const page of pages.results) {
		if ('properties' in page) {
			const properties = new NotionProperties(page.id, page.properties);

			const cached = JSON.parse((await properties.getText(cacheField)) ?? '{}');
			const location = (await Promise.all(locationFields.map((field) => properties.getText(field))))
				.filter(Boolean)
				.join(', ');
			const telegram = (await properties.getEmail(telegramField)) ?? null;
			result.push({
				id: page.id,
				location: location.length === 0 ? null : location,
				telegram,
				cached,
			});
		}
	}

	return result;
}

export async function cachePersonData(
	person: Person,
	cacheField: string,
	coordinates: [number, number],
	pictureUrl: string | null | undefined
) {
	await notion.pages.update({
		page_id: person.id,
		properties: {
			[cacheField]: {
				rich_text: [
					{
						type: 'text',
						text: {
							content: JSON.stringify({
								cachedLocation: person.location,
								cachedTelegram: person.telegram,
								coordinates,
								pictureUrl: pictureUrl ?? null
							})
						}
					}
				]
			}
		}
	});
}
