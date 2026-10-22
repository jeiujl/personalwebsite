// English lives at the root (/work), Chinese under /zh (/zh/work). Every page
// works out its language from the URL, so components can call getLang(Astro.url)
// without it being passed down.

export const languages = {
  en: { label: 'EN', name: 'English', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_CA' },
  zh: { label: '中文', name: '简体中文', htmlLang: 'zh-CN', hreflang: 'zh-Hans', ogLocale: 'zh_CN' },
} as const;

export type Lang = keyof typeof languages;

export function getLang(url: URL): Lang {
  return /^\/zh(\/|$)/.test(url.pathname) ? 'zh' : 'en';
}

/** Prefix an internal link with /zh on Chinese pages. External links pass through. */
export function localizePath(path: string, lang: Lang): string {
  if (lang === 'en' || !path.startsWith('/') || path.startsWith('//')) return path;
  return path === '/' ? '/zh/' : `/zh${path}`;
}

/** The same page in the other language. */
export function switchLangPath(pathname: string, to: Lang): string {
  const base = pathname.replace(/^\/zh(?=\/|$)/, '') || '/';
  return localizePath(base, to);
}

/** Pick the English or Chinese version of a value. */
export const pick = <T>(lang: Lang, values: { en: T; zh: T }): T => values[lang];

/**
 * Content entries keep their Chinese text in an optional `zh` object next to
 * the English fields. On Chinese pages those fields replace the English ones.
 */
export function localized<T extends { zh?: object }>(data: T, lang: Lang): T {
  return lang === 'zh' && data.zh ? { ...data, ...(data.zh as Partial<T>) } : data;
}
