import { parse, walk } from 'svelte/compiler';

export async function getPictureByUsername(username: string): Promise<string | undefined> {
  const tmePageResponse = await fetch(`https://telegram.me/${username.replace(/^@/, '')}`);
  const tmePage = await tmePageResponse.text();

  let profilePictureUrl: string | undefined = undefined;
  walk(parse(tmePage), {
    enter(node) {
      if (profilePictureUrl !== undefined) {
        this.skip();
      }

      if (node.type === 'Element' && node.name === 'meta' && node.attributes.find((attr: any) => attr.name === 'property' && attr.value[0].data === 'og:image')) {
        profilePictureUrl = node.attributes.find((attr: any) => attr.name === 'content')?.value[0].data;
      }
    }
  });

  return profilePictureUrl;
}
