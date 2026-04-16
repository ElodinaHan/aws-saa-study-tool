/* ═══════════════════════════════════════════
   Keyword Index Builder
   Generates an inverted keyword→topic(s) index
   from DOMAINS and CROSS_CUTTING data.
   ═══════════════════════════════════════════ */

import { DOMAINS, CROSS_CUTTING } from './domains';

/**
 * Build a flat list of all topics (from DOMAINS + CROSS_CUTTING).
 */
function flattenAllTopics() {
  const topics = [];
  DOMAINS.forEach((d) =>
    d.sections.forEach((s) =>
      s.topics.forEach((t) =>
        topics.push({
          ...t,
          domainId: d.id,
          domainColor: d.color,
          domainTitle: d.title,
          domainTitleZh: d.titleZh,
          sectionTitle: s.title,
          sectionTitleZh: s.titleZh,
        })
      )
    )
  );
  CROSS_CUTTING.forEach((c) =>
    topics.push({
      ...c,
      domainId: 'cc',
      domainColor: '#9ca3af',
      domainTitle: 'Cross-cutting Services',
      domainTitleZh: '貫穿全域服務',
      sectionTitle: 'Cross-cutting',
      sectionTitleZh: '貫穿全域',
    })
  );
  return topics;
}

/**
 * Extract keywords from a topic's fields.
 * Combines explicit `keywords` with terms parsed from `term`, `zh`, etc.
 */
function extractKeywords(topic) {
  const kws = new Set();

  // Explicit keywords
  if (topic.keywords) {
    topic.keywords.forEach((k) => kws.add(k));
  }

  // Add the term itself
  if (topic.term) kws.add(topic.term);

  // Extract individual service names / acronyms from term
  const termParts = topic.term
    .split(/[\s—/,()]+/)
    .filter((p) => p.length >= 2 && p !== 'vs' && p !== 'and');
  termParts.forEach((p) => kws.add(p));

  return [...kws];
}

/**
 * Build the inverted index: keyword(lowercase) → [{ keyword(display), topicId, topic }]
 * Returns: { entries: Map<string, Array>, letters: string[] }
 */
export function buildKeywordIndex() {
  const topics = flattenAllTopics();
  const indexMap = new Map(); // lowercase keyword → [{ display, topicId, topic }]

  topics.forEach((topic) => {
    const keywords = extractKeywords(topic);
    keywords.forEach((kw) => {
      const key = kw.toLowerCase();
      if (!indexMap.has(key)) indexMap.set(key, []);
      // Avoid duplicate topic for same keyword
      const existing = indexMap.get(key);
      if (!existing.find((e) => e.topicId === topic.id)) {
        existing.push({ display: kw, topicId: topic.id, topic });
      }
    });
  });

  // Sort entries alphabetically
  const sorted = new Map([...indexMap.entries()].sort((a, b) => a[0].localeCompare(b[0])));

  // Extract unique first letters
  const letters = [...new Set([...sorted.keys()].map((k) => {
    const first = k.charAt(0).toUpperCase();
    return /[A-Z]/.test(first) ? first : '#';
  }))].sort();

  return { entries: sorted, letters, allTopics: topics };
}

/**
 * Search the keyword index.
 */
export function searchKeywords(index, query) {
  if (!query.trim()) return [...index.entries()];
  const q = query.toLowerCase();
  return [...index.entries()].filter(([key]) => key.includes(q));
}
