import i18n from './config';
import { useTranslation } from 'react-i18next';
import en from './locales/en.json';

function flatten(value: object, prefix = ''): [string, string][] {
  return Object.entries(value).flatMap(([key, entry]) => typeof entry === 'string'
    ? [[prefix + key, entry] as [string, string]] : flatten(entry, `${prefix}${key}.`));
}
const keys = new Map(flatten(en).map(([key, value]) => [value, key]));

/** For existing screen copy; resolves to the same checked catalog as t(). */
export function uiText(english: string, values: Record<string, unknown> = {}): string {
  const key = keys.get(english);
  return key ? String(i18n.t(key, values)) : english;
}
export function useUiLanguage(): void {
  useTranslation();
}
