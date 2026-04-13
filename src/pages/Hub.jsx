import { useState, useMemo } from 'react';
import { DOMAINS, CROSS_CUTTING, getAllTopics } from '../data/domains';
import { useLang, topicText, domainText } from '../i18n';
import TopicCard from '../components/TopicCard';
import ProgressRing from '../components/ProgressRing';

export default function Hub({ mastered, toggleMastered, annotations, updateAnnotation }) {
  const { lang, t } = useLang();
  const [search, setSearch] = useState('');
  const [activeDomain, setActiveDomain] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const allTopics = useMemo(() => getAllTopics(lang), [lang]);
  const totalTopics = allTopics.length;
  const masteredCount = allTopics.filter((tp) => mastered[tp.id]).length;

  const filteredDomains = useMemo(() => {
    if (!search.trim()) return DOMAINS;
    const q = search.toLowerCase();
    return DOMAINS.map((d) => ({
      ...d,
      sections: d.sections
        .map((s) => ({
          ...s,
          topics: s.topics.filter(
            (tp) =>
              tp.term.toLowerCase().includes(q) ||
              tp.zh.includes(q) ||
              tp.desc.includes(q) ||
              (tp.descEn && tp.descEn.toLowerCase().includes(q)) ||
              (tp.details && tp.details.some((dd) => dd.toLowerCase().includes(q))) ||
              (tp.detailsEn && tp.detailsEn.some((dd) => dd.toLowerCase().includes(q)))
          ),
        }))
        .filter((s) => s.topics.length > 0),
    })).filter((d) => d.sections.length > 0);
  }, [search]);

  const displayDomains =
    activeDomain != null
      ? filteredDomains.filter((d) => d.id === activeDomain)
      : filteredDomains;

  const toggleSection = (id) =>
    setExpandedSections((p) => ({ ...p, [id]: !p[id] }));

  // Heatmap data: per-domain mastered count
  const domainStats = DOMAINS.map((d) => {
    let total = 0, done = 0;
    d.sections.forEach((s) => {
      s.topics.forEach((t) => { total++; if (mastered[t.id]) done++; });
    });
    return { id: d.id, title: domainText(d, lang).title, color: d.color, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  return (
    <div className="animate-in">
      {/* ── Header stats ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 32 }}>
        <ProgressRing pct={totalTopics ? Math.round((masteredCount / totalTopics) * 100) : 0} size={80} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {t('hub.title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {masteredCount} / {totalTopics} {t('hub.mastered')}
          </div>
          {/* Mini domain bars */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {domainStats.map((ds) => (
              <div key={ds.id} title={`${ds.title}: ${ds.done}/${ds.total}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 40, height: 4, borderRadius: 2,
                  background: 'var(--border-primary)',
                  overflow: 'hidden',
                }}>
                  <div style={{ height: '100%', width: `${ds.pct}%`, background: ds.color, borderRadius: 2, transition: 'width .4s ease' }} />
                </div>
                <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{ds.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" />
        </svg>
        <input
          type="text"
          placeholder={t('hub.searchPlaceholder')}
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

      {/* ── Domain filter pills ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveDomain(null)}
          style={{
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            border: activeDomain === null
              ? '1.5px solid var(--accent-gold)'
              : '1px solid var(--border-primary)',
            background: activeDomain === null ? 'rgba(212,168,67,.12)' : 'transparent',
            color: activeDomain === null ? 'var(--accent-gold)' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {t('hub.all')}
        </button>
        {DOMAINS.map((d) => {
          const active = activeDomain === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDomain(active ? null : d.id)}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                border: active ? `1.5px solid ${d.color}` : '1px solid var(--border-primary)',
                background: active ? `${d.color}18` : 'transparent',
                color: active ? d.color : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {domainText(d, lang).title} {d.weight}%
            </button>
          );
        })}
      </div>

      {/* ── Domain sections ── */}
      {displayDomains.map((domain) => (
        <div key={domain.id} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: domain.color, flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: domain.color }}>{domainText(domain, lang).title}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 14, paddingLeft: 14 }}>
            {lang === 'zh'
              ? `${domain.title} — ${t('hub.examWeight')} ${domain.weight}%`
              : `${t('hub.examWeight')} ${domain.weight}%`}
          </div>

          {domain.sections.map((section) => {
            const isExpanded = search.trim() !== '' || expandedSections[section.id];
            const secMastered = section.topics.filter((t) => mastered[t.id]).length;
            return (
              <div
                key={section.id}
                style={{
                  marginBottom: 10,
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'border var(--transition-fast)',
                }}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-secondary)',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{section.title}</span>
                    {lang === 'zh' && <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 8 }}>{section.titleZh}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      color: secMastered === section.topics.length ? 'var(--accent-green)' : 'var(--text-tertiary)',
                    }}>
                      {secMastered}/{section.topics.length}
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: 'var(--text-tertiary)',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform var(--transition-fast)',
                      display: 'inline-block',
                    }}>▶</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="stagger" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {section.topics.map((t) => (
                      <TopicCard
                        key={t.id}
                        topic={t}
                        mastered={!!mastered[t.id]}
                        onToggle={toggleMastered}
                        color={domain.color}
                        annotation={annotations[t.id] || {}}
                        onAnnotation={(patch) => updateAnnotation(t.id, patch)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* ── Cross-cutting ── */}
      <div style={{ marginTop: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>
          {t('hub.crossCutting')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CROSS_CUTTING.filter(
            (c) =>
              !search.trim() ||
              c.term.toLowerCase().includes(search.toLowerCase()) ||
              c.zh.includes(search) ||
              c.desc.includes(search) ||
              (c.descEn && c.descEn.toLowerCase().includes(search.toLowerCase()))
          ).map((c) => (
            <div
              key={c.id}
              style={{
                padding: '11px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.term}</span>
              {lang === 'zh' && <><span style={{ color: 'var(--text-tertiary)', margin: '0 6px' }}>—</span><span style={{ color: 'var(--text-secondary)' }}>{c.zh}</span></>}
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{lang === 'en' ? (c.descEn || c.desc) : c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
