import { useState, useMemo, useEffect, useCallback } from 'react';
import { getAllTopics, DOMAINS } from '../data/domains';
import { useLang, topicText, domainText } from '../i18n';

export default function Flashcards({ mastered, toggleMastered }) {
  const { lang, t } = useLang();
  const allTopics = useMemo(() => getAllTopics(lang), [lang]);
  const [filter, setFilter] = useState('all'); // all | unmastered | domain-id
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [active, setActive] = useState(false); // immersive mode

  const deck = useMemo(() => {
    let pool = allTopics;
    if (filter === 'unmastered') pool = pool.filter((t) => !mastered[t.id]);
    else if (filter.startsWith('d')) pool = pool.filter((t) => t.domainId === filter);
    return pool;
  }, [allTopics, filter, mastered]);

  const card = deck[index] || null;

  const goNext = useCallback(() => {
    setFlipped(false);
    setIndex((i) => (i + 1) % Math.max(deck.length, 1));
  }, [deck.length]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setIndex((i) => (i - 1 + deck.length) % Math.max(deck.length, 1));
  }, [deck.length]);

  const shuffle = useCallback(() => {
    setFlipped(false);
    setIndex(Math.floor(Math.random() * deck.length));
  }, [deck.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      else if (e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); }
      else if (e.key === 'Escape') setActive(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, goNext, goPrev]);

  if (!active) {
    return (
      <div className="animate-in">
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>
          {t('fc.title')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
          {t('fc.subtitle')}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: t('hub.all') },
            { key: 'unmastered', label: t('fc.unmastered') },
            ...DOMAINS.map((d) => ({ key: d.id, label: domainText(d, lang).title, color: d.color })),
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setIndex(0); }}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                border: filter === f.key
                  ? `1.5px solid ${f.color || 'var(--accent-gold)'}`
                  : '1px solid var(--border-primary)',
                background: filter === f.key ? `${f.color || 'var(--accent-gold)'}18` : 'transparent',
                color: filter === f.key ? (f.color || 'var(--accent-gold)') : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🃏</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6 }}>
            {deck.length} {t('fc.cardsToReview')}
          </div>
          <button
            onClick={() => { setActive(true); setIndex(0); setFlipped(false); }}
            disabled={deck.length === 0}
            style={{
              marginTop: 16,
              padding: '12px 36px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gold)',
              color: '#000',
              opacity: deck.length === 0 ? 0.3 : 1,
              transition: 'all var(--transition-fast)',
            }}
          >
            {t('fc.startReview')}
          </button>
        </div>
      </div>
    );
  }

  // ── Immersive mode ──
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        animation: 'fadeIn .3s ease',
      }}
    >
      {/* Close */}
      <button
        onClick={() => setActive(false)}
        style={{ position: 'absolute', top: 24, right: 28, color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <kbd style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)' }}>ESC</kbd>
        {t('fc.exit')}
      </button>

      {/* Progress */}
      <div style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>
        {index + 1} / {deck.length}
      </div>

      {/* Card */}
      {card && (() => {
        const ct = topicText(card, lang);
        return (
        <div
          onClick={() => setFlipped((f) => !f)}
          style={{
            width: '100%',
            maxWidth: 520,
            minHeight: 300,
            perspective: 1000,
            cursor: 'pointer',
            animation: 'fadeInScale .25s ease',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: 300,
              transition: 'transform .5s cubic-bezier(.4,0,.2,1)',
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
            }}
          >
            {/* Front */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: `1px solid ${card.domainColor}33`,
              padding: '40px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: card.domainColor, fontWeight: 500, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                {card.domainTitle}
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{ct.name}</div>
              {ct.subtitle && <div style={{ fontSize: 15, color: card.domainColor, marginTop: 8, fontWeight: 500 }}>{ct.subtitle}</div>}
              <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-tertiary)' }}>{t('fc.clickToFlip')}</div>
            </div>

            {/* Back */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: `1px solid ${card.domainColor}33`,
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflow: 'auto',
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>{ct.name}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>{ct.desc}</div>
              {ct.details?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 12 }}>
                  {ct.details.map((d, i) => (
                    <div key={i} style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      padding: '3px 0',
                      paddingLeft: d.startsWith('  ') ? 16 : 0,
                    }}>
                      <span style={{ color: card.domainColor, marginRight: 7, fontSize: 7, verticalAlign: 'middle' }}>●</span>
                      {d.trim()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        <button onClick={goPrev} style={btnStyle}>
          {t('fc.prev')}
        </button>
        <button onClick={shuffle} style={{ ...btnStyle, color: 'var(--accent-gold)' }}>
          {t('fc.shuffle')}
        </button>
        <button
          onClick={() => card && toggleMastered(card.id)}
          style={{
            ...btnStyle,
            color: card && mastered[card.id] ? 'var(--accent-green)' : 'var(--text-tertiary)',
          }}
        >
          {card && mastered[card.id] ? t('fc.alreadyMastered') : t('fc.markMastered')}
        </button>
        <button onClick={goNext} style={btnStyle}>
          {t('fc.next')}
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '8px 18px',
  fontSize: 13,
  borderRadius: 'var(--radius-sm)',
  background: 'rgba(255,255,255,.06)',
  color: 'var(--text-secondary)',
  border: '1px solid rgba(255,255,255,.08)',
  transition: 'all var(--transition-fast)',
};
