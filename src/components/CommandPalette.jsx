import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTopics } from '../data/domains';
import { useLang, topicText } from '../i18n';

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { lang, t } = useLang();

  const allTopics = useMemo(() => getAllTopics(lang), [lang]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allTopics.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.zh.includes(q) ||
        (t.desc || '').toLowerCase().includes(q) ||
        (t.descEn || '').toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query, allTopics]);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 100,
        animation: 'fadeIn .15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-secondary)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeInScale .2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', gap: 10, borderBottom: '1px solid var(--border-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('cmd.placeholder')}
            style={{
              flex: 1,
              fontSize: 15,
              color: 'var(--text-primary)',
              background: 'transparent',
            }}
          />
          <kbd style={{
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'var(--bg-tertiary)',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border-primary)',
          }}>ESC</kbd>
        </div>

        {results.length > 0 && (
          <div style={{ maxHeight: 360, overflowY: 'auto', padding: '6px' }}>
            {results.map((t) => (
              <button
                key={t.id}
                onClick={() => { navigate('/'); onClose(); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{topicText(t, lang).name}</div>
                <div style={{ fontSize: 12, color: t.domainColor, marginTop: 2 }}>{topicText(t, lang).desc}</div>
              </button>
            ))}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            {t('cmd.noResult')}
          </div>
        )}
      </div>
    </div>
  );
}
