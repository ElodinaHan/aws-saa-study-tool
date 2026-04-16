import { useState, useMemo, useRef, useEffect } from 'react';
import { DOMAINS, CROSS_CUTTING } from '../data/domains';
import { useLang, topicText, domainText } from '../i18n';

/* ── Build flat keyword index from all topics ── */
function buildIndex(domains, crossCutting) {
  const entries = []; // { keyword, topicId, topic, domainId, domainColor, domainTitle, domainTitleZh }

  domains.forEach((d) =>
    d.sections.forEach((s) =>
      s.topics.forEach((t) => {
        const kws = t.keywords || [];
        // Always include the term itself
        const set = new Set(kws.map((k) => k));
        set.add(t.term);
        set.forEach((kw) => {
          entries.push({
            keyword: kw,
            topicId: t.id,
            topic: t,
            domainId: d.id,
            domainColor: d.color,
            domainTitle: d.title,
            domainTitleZh: d.titleZh,
          });
        });
      })
    )
  );

  crossCutting.forEach((c) => {
    const kws = c.keywords || [];
    const set = new Set(kws.map((k) => k));
    set.add(c.term);
    set.forEach((kw) => {
      entries.push({
        keyword: kw,
        topicId: c.id,
        topic: c,
        domainId: 'cc',
        domainColor: '#9ca3af',
        domainTitle: 'Cross-cutting',
        domainTitleZh: '貫穿全域',
      });
    });
  });

  return entries;
}

/* ── Group entries by first letter ── */
function groupByLetter(entries) {
  const groups = {};
  entries.forEach((e) => {
    const first = e.keyword.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : '#';
    if (!groups[letter]) groups[letter] = [];
    // Deduplicate: same keyword + same topicId
    if (!groups[letter].find((x) => x.keyword === e.keyword && x.topicId === e.topicId)) {
      groups[letter].push(e);
    }
  });
  // Sort within each group
  Object.values(groups).forEach((arr) =>
    arr.sort((a, b) => a.keyword.localeCompare(b.keyword))
  );
  return groups;
}

export default function Glossary({ mastered }) {
  const { lang, t } = useLang();
  const [search, setSearch] = useState('');
  const [activeDomain, setActiveDomain] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const sectionRefs = useRef({});

  const allEntries = useMemo(() => buildIndex(DOMAINS, CROSS_CUTTING), []);

  const filtered = useMemo(() => {
    let pool = allEntries;
    if (activeDomain) {
      pool = pool.filter((e) => e.domainId === activeDomain);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (e) =>
          e.keyword.toLowerCase().includes(q) ||
          e.topic.zh.includes(q) ||
          e.topic.term.toLowerCase().includes(q)
      );
    }
    return pool;
  }, [allEntries, search, activeDomain]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);
  const letters = Object.keys(grouped).sort();

  const scrollToLetter = (letter) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Unique keywords count
  const uniqueKeywords = useMemo(() => {
    const set = new Set(filtered.map((e) => e.keyword.toLowerCase()));
    return set.size;
  }, [filtered]);

  const zh = lang === 'zh';

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>
          {zh ? '關鍵詞索引' : 'Keyword Index'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {zh
            ? `所有 AWS 服務、概念和縮寫的完整索引 — ${uniqueKeywords} 個關鍵詞`
            : `Complete index of all AWS services, concepts and acronyms — ${uniqueKeywords} keywords`}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" />
        </svg>
        <input
          type="text"
          placeholder={zh ? '搜索關鍵詞、服務名、縮寫…' : 'Search keywords, services, acronyms…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '11px 14px 11px 40px',
            fontSize: 14,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            transition: 'border var(--transition-fast)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-primary)')}
        />
      </div>

      {/* Domain filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveDomain(null)}
          style={{
            padding: '6px 14px', fontSize: 12, fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            border: !activeDomain ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-primary)',
            background: !activeDomain ? 'rgba(212,168,67,.12)' : 'transparent',
            color: !activeDomain ? 'var(--accent-gold)' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {zh ? '全部' : 'All'}
        </button>
        {DOMAINS.map((d) => {
          const active = activeDomain === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDomain(active ? null : d.id)}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                border: active ? `1.5px solid ${d.color}` : '1px solid var(--border-primary)',
                background: active ? `${d.color}18` : 'transparent',
                color: active ? d.color : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {zh ? d.titleZh : d.title}
            </button>
          );
        })}
        <button
          onClick={() => setActiveDomain(activeDomain === 'cc' ? null : 'cc')}
          style={{
            padding: '6px 14px', fontSize: 12, fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            border: activeDomain === 'cc' ? '1.5px solid #9ca3af' : '1px solid var(--border-primary)',
            background: activeDomain === 'cc' ? '#9ca3af18' : 'transparent',
            color: activeDomain === 'cc' ? '#9ca3af' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {zh ? '貫穿全域' : 'Cross-cutting'}
        </button>
      </div>

      {/* Letter navigation bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 20,
        padding: '10px 14px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
      }}>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').map((letter) => {
          const hasEntries = !!grouped[letter];
          return (
            <button
              key={letter}
              onClick={() => hasEntries && scrollToLetter(letter)}
              disabled={!hasEntries}
              style={{
                width: 28, height: 28,
                fontSize: 12, fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: hasEntries ? 'transparent' : 'transparent',
                color: hasEntries ? 'var(--accent-gold)' : 'var(--text-tertiary)',
                opacity: hasEntries ? 1 : 0.3,
                cursor: hasEntries ? 'pointer' : 'default',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => { if (hasEntries) e.target.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Keyword listing */}
      {letters.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>🔍</div>
          {zh ? '沒有匹配的關鍵詞' : 'No matching keywords found'}
        </div>
      ) : (
        letters.map((letter) => (
          <div
            key={letter}
            ref={(el) => (sectionRefs.current[letter] = el)}
            style={{ marginBottom: 24 }}
          >
            {/* Letter header */}
            <div style={{
              fontSize: 20, fontWeight: 700,
              color: 'var(--accent-gold)',
              padding: '8px 0',
              borderBottom: '2px solid var(--border-primary)',
              marginBottom: 10,
              position: 'sticky',
              top: 0,
              background: 'var(--bg-primary)',
              zIndex: 5,
            }}>
              {letter}
            </div>

            {/* Keyword entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {grouped[letter].map((entry, idx) => {
                const txt = topicText(entry.topic, lang);
                const isExpanded = expandedTopic === `${entry.keyword}-${entry.topicId}`;
                const isMastered = mastered[entry.topicId];
                const tip = lang === 'en' ? entry.topic.examTipEn : entry.topic.examTip;

                return (
                  <div
                    key={`${entry.keyword}-${entry.topicId}-${idx}`}
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-primary)',
                      overflow: 'hidden',
                      transition: 'border var(--transition-fast)',
                    }}
                  >
                    <button
                      onClick={() => setExpandedTopic(isExpanded ? null : `${entry.keyword}-${entry.topicId}`)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: isMastered ? `${entry.domainColor}06` : 'transparent',
                        textAlign: 'left',
                      }}
                    >
                      {/* Domain color dot */}
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: entry.domainColor, flexShrink: 0,
                      }} />

                      {/* Keyword */}
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: 'var(--text-primary)',
                        minWidth: 0,
                      }}>
                        {entry.keyword}
                      </span>

                      {/* Separator & topic name if different from keyword */}
                      {entry.keyword !== entry.topic.term && (
                        <>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>→</span>
                          <span style={{
                            fontSize: 12, color: 'var(--text-secondary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            flex: 1, minWidth: 0,
                          }}>
                            {entry.topic.term}
                          </span>
                        </>
                      )}

                      {/* Chinese subtitle */}
                      {zh && entry.topic.zh && (
                        <span style={{
                          fontSize: 12, color: entry.domainColor,
                          fontWeight: 500, flexShrink: 0,
                        }}>
                          {entry.topic.zh}
                        </span>
                      )}

                      {/* Mastered badge */}
                      {isMastered && (
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: 'var(--accent-green)', flexShrink: 0,
                        }}>✓</span>
                      )}

                      {/* Expand arrow */}
                      <span style={{
                        fontSize: 10, color: 'var(--text-tertiary)',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                        transition: 'transform var(--transition-fast)',
                        flexShrink: 0,
                      }}>▶</span>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{
                        padding: '12px 16px 14px 32px',
                        borderTop: '1px solid var(--border-primary)',
                        background: 'var(--bg-secondary)',
                      }}>
                        {/* Description */}
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.6 }}>
                          {txt.desc}
                        </div>

                        {/* Details */}
                        {txt.details && txt.details.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            {txt.details.map((d, i) => (
                              <div key={i} style={{
                                fontSize: 12, color: 'var(--text-secondary)',
                                lineHeight: 1.7, padding: '2px 0',
                                paddingLeft: d.startsWith('  ') ? 16 : 0,
                              }}>
                                <span style={{ color: entry.domainColor, marginRight: 6, fontSize: 7 }}>●</span>
                                {d.trim()}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Exam Tip */}
                        {tip && (
                          <div style={{
                            marginTop: 8,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(212,168,67,.08)',
                            border: '1px solid rgba(212,168,67,.2)',
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-gold)', marginBottom: 3 }}>
                              💡 {zh ? '考試提示' : 'Exam Tip'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {tip}
                            </div>
                          </div>
                        )}

                        {/* Related topics */}
                        {entry.topic.related && entry.topic.related.length > 0 && (
                          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginRight: 4 }}>
                              {zh ? '相關：' : 'Related:'}
                            </span>
                            {entry.topic.related.map((rid) => {
                              const relatedEntry = allEntries.find((e) => e.topicId === rid);
                              if (!relatedEntry) return null;
                              return (
                                <button
                                  key={rid}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Search for the related term
                                    setSearch(relatedEntry.topic.term.split(' — ')[0].split(' / ')[0]);
                                    setExpandedTopic(null);
                                  }}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: 11,
                                    borderRadius: 'var(--radius-sm)',
                                    border: `1px solid ${relatedEntry.domainColor}44`,
                                    background: `${relatedEntry.domainColor}0a`,
                                    color: relatedEntry.domainColor,
                                    fontWeight: 500,
                                    transition: 'all var(--transition-fast)',
                                  }}
                                >
                                  {relatedEntry.topic.zh || relatedEntry.topic.term.split(' — ')[0]}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Domain tag */}
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            padding: '2px 8px', fontSize: 10, fontWeight: 500,
                            borderRadius: 10,
                            background: `${entry.domainColor}15`,
                            color: entry.domainColor,
                          }}>
                            {zh ? entry.domainTitleZh : entry.domainTitle}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
