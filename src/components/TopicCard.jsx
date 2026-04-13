import { useState, useCallback, useRef, useEffect } from 'react';
import { useLang, topicText } from '../i18n';

const HIGHLIGHT_COLORS = [
  null,
  '#facc15', // yellow
  '#4ade80', // green
  '#60a5fa', // blue
  '#f472b6', // pink
  '#fb923c', // orange
  '#c084fc', // purple
];

export default function TopicCard({ topic, mastered, onToggle, color, annotation = {}, onAnnotation }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [memoOpen, setMemoOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [memoText, setMemoText] = useState(annotation.memo || '');
  const cardRef = useRef(null);

  const txt = topicText(topic, lang);

  const hl = annotation.highlight || null;
  const isBold = annotation.bold || false;

  useEffect(() => { setMemoText(annotation.memo || ''); }, [annotation.memo]);

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    if (!mastered) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
    onToggle(topic.id);
  }, [mastered, onToggle, topic.id]);

  const saveMemo = () => {
    onAnnotation({ memo: memoText.trim() || undefined });
  };

  // keyboard shortcut: N to toggle memo when card is hovered
  useEffect(() => {
    if (!hovered) return;
    const handler = (e) => {
      if (e.key === 'n' || e.key === 'N') {
        // don't trigger if typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setMemoOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hovered]);

  const cardBg = hl ? `${hl}14` : mastered ? `${color}08` : 'var(--bg-secondary)';
  const cardBorder = hl ? `1.5px solid ${hl}44` : mastered ? `1.5px solid ${color}44` : '1px solid var(--border-primary)';

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 'var(--radius-md)',
        border: cardBorder,
        background: cardBg,
        padding: '14px 16px',
        transition: 'all var(--transition-normal)',
        opacity: mastered ? 0.65 : 1,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {animating && <ConfettiParticles color={color} />}

      {/* Left highlight strip */}
      {hl && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: hl, borderRadius: '4px 0 0 4px',
        }} />
      )}

      {/* ── Floating quick-action toolbar (visible on hover) ── */}
      <div style={{
        position: 'absolute',
        top: -1,
        right: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        padding: '3px 6px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-secondary)',
        borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
        boxShadow: '0 2px 8px rgba(0,0,0,.1)',
        opacity: hovered ? 1 : 0,
        pointerEvents: hovered ? 'auto' : 'none',
        transform: hovered ? 'translateY(0)' : 'translateY(-4px)',
        transition: 'opacity .15s ease, transform .15s ease',
        zIndex: 5,
      }}>
        {HIGHLIGHT_COLORS.map((c, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onAnnotation({ highlight: c || undefined }); }}
            title={!c ? (lang === 'en' ? 'Clear highlight' : '清除高亮') : ''}
            style={{
              width: 14, height: 14, borderRadius: '50%',
              background: c || 'var(--bg-tertiary)',
              border: (hl === c || (!hl && !c)) ? '2px solid var(--text-primary)' : '1px solid var(--border-primary)',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {!c && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: 'var(--text-tertiary)' }}>✕</span>}
          </button>
        ))}
        <div style={{ width: 1, height: 12, background: 'var(--border-primary)', margin: '0 2px' }} />
        <button
          onClick={(e) => { e.stopPropagation(); onAnnotation({ bold: !isBold }); }}
          title={lang === 'en' ? 'Bold' : '加粗'}
          style={{
            width: 18, height: 18, borderRadius: 3, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            fontSize: 11, fontWeight: 800, cursor: 'pointer',
            color: isBold ? 'var(--text-primary)' : 'var(--text-tertiary)',
            background: isBold ? 'var(--bg-hover)' : 'transparent',
          }}
        >B</button>
        <button
          onClick={(e) => { e.stopPropagation(); setMemoOpen((v) => !v); }}
          title={lang === 'en' ? 'Memo (N)' : '備忘錄 (N)'}
          style={{
            width: 18, height: 18, borderRadius: 3, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            fontSize: 11, cursor: 'pointer',
            color: annotation.memo ? 'var(--accent-gold)' : 'var(--text-tertiary)',
            background: memoOpen ? 'var(--bg-hover)' : 'transparent',
          }}
        >N</button>
      </div>

      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          style={{
            width: 22, height: 22, minWidth: 22, borderRadius: 6,
            border: mastered ? `2px solid ${color}` : '1.5px solid var(--border-secondary)',
            background: mastered ? color : 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 1, transition: 'all var(--transition-fast)', position: 'relative',
          }}
        >
          {mastered && (
            <svg width="13" height="13" viewBox="0 0 12 12" style={{ animation: 'popIn .3s ease' }}>
              <path d="M2.5 6L5 8.5L9.5 3.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 'checkmark .35s ease forwards' }} />
            </svg>
          )}
          {animating && (
            <span style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              border: `2px solid ${color}`, animation: 'pulse-ring .5s ease forwards', pointerEvents: 'none',
            }} />
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13.5,
            fontWeight: isBold ? 700 : 500,
            color: hl || 'var(--text-primary)',
            lineHeight: 1.4,
            textDecoration: mastered ? 'line-through' : 'none',
            textDecorationColor: `${color}40`,
          }}>{txt.name}</div>
          {txt.subtitle && <div style={{ fontSize: 12.5, color, fontWeight: 500, marginTop: 2 }}>{txt.subtitle}</div>}
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.55, fontWeight: isBold ? 600 : 400 }}>{txt.desc}</div>
        </div>

        {txt.details?.length > 0 && (
          <span style={{
            fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3,
            transition: 'transform var(--transition-fast)',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block',
          }}>▶</span>
        )}
      </div>

      {/* Memo editor */}
      {memoOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 10, paddingTop: 10, paddingLeft: 32,
            borderTop: '1px solid var(--border-primary)',
            animation: 'fadeIn .2s ease',
          }}
        >
          <textarea
            autoFocus
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            onBlur={saveMemo}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { saveMemo(); setMemoOpen(false); }
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { saveMemo(); setMemoOpen(false); }
            }}
            placeholder={lang === 'en' ? 'Add a personal note... (Cmd+Enter to save, Esc to close)' : '添加個人筆記… (Cmd+Enter 保存, Esc 關閉)'}
            style={{
              width: '100%', minHeight: 60, fontSize: 12.5, lineHeight: 1.6,
              color: 'var(--text-primary)', background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)',
              padding: '8px 10px', resize: 'vertical', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
            <button
              onClick={() => { setMemoText(''); onAnnotation({ memo: undefined }); setMemoOpen(false); }}
              style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '3px 8px' }}
            >{lang === 'en' ? 'Clear' : '清除'}</button>
            <button
              onClick={() => { saveMemo(); setMemoOpen(false); }}
              style={{
                fontSize: 11, fontWeight: 500, padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-gold)', color: '#000',
              }}
            >{lang === 'en' ? 'Save' : '保存'}</button>
          </div>
        </div>
      )}

      {/* Saved memo display */}
      {!memoOpen && annotation.memo && (
        <div
          onClick={(e) => { e.stopPropagation(); setMemoOpen(true); }}
          style={{ marginTop: 8, paddingLeft: 32, cursor: 'pointer' }}
        >
          <div style={{
            fontSize: 12, color: 'var(--accent-gold)', lineHeight: 1.55,
            padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(212,168,67,.06)', border: '1px solid rgba(212,168,67,.15)',
            whiteSpace: 'pre-wrap',
          }}>
            <span style={{ fontSize: 10, marginRight: 4, opacity: 0.7 }}>N</span>
            {annotation.memo}
          </div>
        </div>
      )}

      {/* Details */}
      {open && txt.details?.length > 0 && (
        <div style={{
          marginTop: 10, paddingTop: 10, paddingLeft: 32,
          borderTop: '1px solid var(--border-primary)',
          animation: 'fadeIn .25s ease',
        }}>
          {txt.details.map((d, i) => (
            <div key={i} style={{
              fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.65,
              padding: '3px 0', paddingLeft: d.startsWith('  ') ? 16 : 0,
            }}>
              <span style={{ color, marginRight: 7, fontSize: 7, verticalAlign: 'middle' }}>●</span>
              {d.trim()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Tiny confetti burst */
function ConfettiParticles({ color }) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const dist = 18 + Math.random() * 12;
    const x = Math.cos((angle * Math.PI) / 180) * dist;
    const y = Math.sin((angle * Math.PI) / 180) * dist;
    const colors = [color, 'var(--accent-gold)', 'var(--accent-green)', '#ef6c6c'];
    return { x, y, color: colors[i % colors.length], size: 3 + Math.random() * 2, delay: i * 0.02 };
  });

  return (
    <div style={{ position: 'absolute', left: 27, top: 22, pointerEvents: 'none', zIndex: 2 }}>
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            animation: `confetti-fall .55s ease forwards`,
            animationDelay: `${p.delay}s`,
            transform: `translate(${p.x}px, ${p.y}px)`,
          }}
        />
      ))}
    </div>
  );
}
