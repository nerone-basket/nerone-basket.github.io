import { parseDocument } from 'yaml';

export function safeSlug(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

export function editYaml(source: string, patch: Record<string, unknown>): string {
  const document = parseDocument(source, { keepSourceTokens: true });
  if (document.errors.length) throw new Error(`YAML non valido: ${document.errors[0].message}`);
  if (!document.contents) throw new Error('YAML vuoto.');
  for (const [key, value] of Object.entries(patch)) document.setIn([key], value);
  return String(document);
}

export function playerSocialUrls(document: ReturnType<typeof parseDocument>): string[] {
  // YAML collections are YAMLSeq nodes, not JavaScript arrays. Convert before rendering.
  const value = (document.toJS() as Record<string, unknown> | null)?.social_urls;
  return Array.isArray(value) ? value.filter((url): url is string => typeof url === 'string') : [];
}

export type NewsDocument = { metadata: Record<string, unknown>; body: string; update: (patch: Record<string, unknown>, body: string) => string };

export function parseNews(source: string): NewsDocument {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Notizia senza front matter YAML valido.');
  const document = parseDocument(match[1], { keepSourceTokens: true });
  if (document.errors.length) throw new Error(`Metadati notizia non validi: ${document.errors[0].message}`);
  const metadata = document.toJS() as Record<string, unknown>;
  return { metadata, body: match[2], update(patch, body) {
    for (const [key, value] of Object.entries(patch)) document.setIn([key], value);
    return `---\n${String(document).trimEnd()}\n---\n${body}`;
  } };
}
