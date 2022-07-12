import { parse } from 'parse5';

export async function getPictureByUsername(username: string): Promise<string | undefined> {
  const tmePageResponse = await fetch(`https://telegram.me/${username.replace(/^@/, '')}`);
  const tmePage = await tmePageResponse.text();

  const document = parse(tmePage);
  const head = (document.childNodes[1] as any).childNodes.find((node: any) => node.nodeName === 'head');
  const metaOgImage = head.childNodes.find((node: any) => node.nodeName === 'meta' && node.attrs && node.attrs.find((attr: any) => attr.name === 'property' && attr.value === 'og:image'));
  return metaOgImage.attrs.find((attr: any) => attr.name === 'content')?.value;
}
