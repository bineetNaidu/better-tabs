import { Tab } from './types';

export const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const fuzzy = (value: string, token: string) => {
  if (token.length < 4) return false;
  let cursor = 0;
  for (const char of value) {
    if (char === token[cursor]) cursor += 1;
    if (cursor === token.length) return true;
  }
  return false;
};

export function rankTabs(tabs: Tab[], query: string) {
  const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return tabs;
  return tabs
    .map((tab, index) => {
      const title = tab.title.toLocaleLowerCase();
      const domain = host(tab.url).toLocaleLowerCase();
      const url = tab.url.toLocaleLowerCase();
      let score = 0;
      for (const token of tokens) {
        const value =
          title === token
            ? 1000
            : title.startsWith(token)
              ? 850
              : title.includes(token)
                ? 700
                : domain === token
                  ? 650
                  : domain.startsWith(token)
                    ? 550
                    : domain.includes(token)
                      ? 500
                      : url.includes(token)
                        ? 350
                        : fuzzy(title, token) || fuzzy(domain, token)
                          ? 120
                          : 0;
        if (!value) return null;
        score += value;
      }
      return { tab, score: score / tokens.length, index };
    })
    .filter((item): item is { tab: Tab; score: number; index: number } => Boolean(item))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.tab);
}
