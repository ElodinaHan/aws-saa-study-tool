import { useState, useRef, useMemo } from 'react';
import { getAllTopics, DOMAINS } from '../data/domains';
import { exportData, importData } from '../hooks/useStorage';
import { useLang, domainText } from '../i18n';
import ProgressRing from '../components/ProgressRing';

export default function Settings({ mastered, setMastered }) {
  const { lang, setLang, t } = useLang();
  const allTopics = useMemo(() => getAllTopics(lang), [lang]);
  const [importStatus, setImportStatus] = useState(null); // null | 'success' | 'error'
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const totalTopics = allTopics.length;
  const masteredCount = allTopics.filter((t) => mastered[t.id]).length;
  const pct = totalTopics ? Math.round((masteredCount / totalTopics) * 100) : 0;

  const domainStats = DOMAINS.map((d) => {
    let total = 0, done = 0;
    d.sections.forEach((s) => {
      s.topics.forEach((t) => { total++; if (mastered[t.id]) done++; });
    });
    return { ...d, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  const handleImport = async (file) => {
    try {
      const count = await importData(file);
      setImportStatus('success');
      // Reload mastered state from storage
      try {
        const raw = localStorage.getItem('aws-saa-mastered');
        if (raw) setMastered(JSON.parse(raw));
      } catch {}
      setTimeout(() => setImportStatus(null), 3000);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) handleImport(file);
  };

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
    e.target.value = '';
  };

  const resetProgress = () => {
    if (window.confirm(t('settings.confirmReset'))) {
      setMastered({});
    }
  };

  return (
    <div className="animate-in">
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>
        {t('settings.title')}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32 }}>
        {t('settings.subtitle')}
      </div>

      {/* ── Language ── */}
      <Section title={t('settings.language')}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'zh', label: '中文' },
            { key: 'en', label: 'English' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setLang(opt.key)}
              style={{
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                border: lang === opt.key ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-primary)',
                background: lang === opt.key ? 'rgba(212,168,67,.12)' : 'transparent',
                color: lang === opt.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Progress Dashboard ── */}
      <Section title={t('settings.progress')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
          <ProgressRing pct={pct} size={100} strokeWidth={7} />
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{masteredCount}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('settings.masteredOf', { total: totalTopics })}</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>{totalTopics - masteredCount} {t('settings.toReview')}</div>
          </div>
        </div>

        {/* Domain heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {domainStats.map((d) => (
            <div key={d.id} style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${d.color}33`,
              background: `${d.color}08`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: d.color }}>{domainText(d, lang).title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.done}/{d.total}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--border-primary)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${d.pct}%`,
                  background: d.color, borderRadius: 3,
                  transition: 'width .4s ease',
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, textAlign: 'right' }}>{d.pct}%</div>
            </div>
          ))}
        </div>

        {/* Heatmap grid — contribution style */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{t('settings.heatmap')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {allTopics.map((t) => (
              <div
                key={t.id}
                title={`${t.term} ${mastered[t.id] ? '✓' : '○'}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: mastered[t.id] ? t.domainColor : 'var(--border-primary)',
                  opacity: mastered[t.id] ? 0.85 : 0.3,
                  transition: 'all var(--transition-fast)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 10, color: 'var(--text-tertiary)', alignItems: 'center' }}>
            <span>{t('settings.notMastered')}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {[0.2, 0.4, 0.6, 0.85].map((op, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-gold)', opacity: op }} />
              ))}
            </div>
            <span>{t('hub.mastered')}</span>
          </div>
        </div>
      </Section>

      {/* ── Data Backup ── */}
      <Section title={t('settings.backup')}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            onClick={exportData}
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gold)',
              color: '#000',
              transition: 'all var(--transition-fast)',
            }}
          >
            {t('settings.export')}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-secondary)',
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {t('settings.import')}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={onFileSelect} style={{ display: 'none' }} />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            border: `2px dashed ${dragging ? 'var(--accent-gold)' : 'var(--border-primary)'}`,
            background: dragging ? 'rgba(212,168,67,.06)' : 'transparent',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: 13,
            transition: 'all var(--transition-fast)',
          }}
        >
          {importStatus === 'success' ? (
            <span style={{ color: 'var(--accent-green)' }}>✓ {t('settings.importSuccess')}</span>
          ) : importStatus === 'error' ? (
            <span style={{ color: 'var(--accent-red)' }}>✗ {t('settings.importError')}</span>
          ) : (
            t('settings.dropzone')
          )}
        </div>
      </Section>

      {/* ── Danger zone ── */}
      <Section title={t('settings.danger')}>
        <button
          onClick={resetProgress}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)',
            background: 'transparent',
            transition: 'all var(--transition-fast)',
          }}
        >
          {t('settings.reset')}
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-primary)',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}
