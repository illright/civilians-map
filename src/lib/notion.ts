import { Client } from '@notionhq/client';

const notion = new Client({
	auth: import.meta.env.VITE_NOTION_INTERNAL_INTEGRATION_TOKEN
});

function richTextToHTML(richTextBits: Array<RichTextItemResponse | undefined>) {
	return richTextBits
		.map((bit) => {
			if (bit === undefined) {
				return undefined;
			}

			if (bit.type !== 'text') {
				return null;
			}

			let content = bit.plain_text;
			if (bit.href !== null) {
				content = `<a href="${bit.href}">${content}</a>`;
			}
			if (bit.annotations.bold) {
				content = `<b>${content}</b>`;
			}
			if (bit.annotations.italic) {
				content = `<i>${content}</i>`;
			}
			if (bit.annotations.strikethrough) {
				content = `<s>${content}</s>`;
			}
			if (bit.annotations.underline) {
				content = `<u>${content}</u>`;
			}
			if (bit.annotations.code) {
				content = `<code>${content}</code>`;
			}
			if (bit.annotations.color !== 'default') {
				if (/_background/.test(bit.annotations.color)) {
					content = `<span style="background-color: ${bit.annotations.color.replace(
						'_background',
						''
					)}">${content}</span>`;
				} else {
					content = `<span style="color: ${bit.annotations.color}">${content}</span>`;
				}
			}

			return content;
		})
		.filter(Boolean)
		.join('');
}

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

	async getText(propertyName: string): Promise<string | undefined> {
		const apiResponse = await this.retrieve(propertyName);

		if (apiResponse !== undefined && 'results' in apiResponse) {
			return richTextToHTML(
				apiResponse.results.map((propertyItem) =>
					propertyItem.type === 'rich_text' ? propertyItem.rich_text : undefined
				) as Array<RichTextItemResponse | undefined>
			);
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

	async getTitle(): Promise<string> {
		const apiResponse = await notion.pages.properties.retrieve({
			page_id: this.pageId,
			property_id: 'title'
		});

		if (apiResponse !== undefined && 'results' in apiResponse) {
			return richTextToHTML(
				apiResponse.results.map((propertyItem) =>
					propertyItem.type === 'title' ? propertyItem.title : undefined
				) as Array<RichTextItemResponse | undefined>
			);
		} else {
			throw new Error('Malformed API response for the title');
		}
	}
}

export interface Person {
	id: string;
	name: string;
	url: string;
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

			const location = (await Promise.all(locationFields.map((field) => properties.getText(field))))
				.filter(Boolean)
				.join(', ');

			result.push({
				id: page.id,
				name: await properties.getTitle(),
				url: page.url,
				location: location.length === 0 ? null : location,
				telegram: (await properties.getEmail(telegramField)) ?? null,
				cached: JSON.parse((await properties.getText(cacheField)) ?? '{}'),
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

// Comes from Notion's source code
// Export your stinkin' types, Notion!
// Didn't bother handling mentions or equations for obvious reasons
type RichTextItemResponse = {
	type: 'text';
	text: {
		content: string;
		link: {
			url: string;
		} | null;
	};
	annotations: {
		bold: boolean;
		italic: boolean;
		strikethrough: boolean;
		underline: boolean;
		code: boolean;
		color:
			| 'default'
			| 'gray'
			| 'brown'
			| 'orange'
			| 'yellow'
			| 'green'
			| 'blue'
			| 'purple'
			| 'pink'
			| 'red'
			| 'gray_background'
			| 'brown_background'
			| 'orange_background'
			| 'yellow_background'
			| 'green_background'
			| 'blue_background'
			| 'purple_background'
			| 'pink_background'
			| 'red_background';
	};
	plain_text: string;
	href: string | null;
};
