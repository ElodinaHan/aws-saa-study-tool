import { useState, useCallback } from 'react';
import { useLang, topicText } from '../i18n';

export default function TopicCard({ topic, mastered, onToggle, color }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  const txt = topicText(topic, lang);

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    if (!mastered) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
    onToggle(topic.id);
  }, [mastered, onToggle, topic.id]);

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        border: mastered ? `1.5px solid ${color}44` : '1px solid var(--border-primary)',
        background: mastered ? `${color}08` : 'var(--bg-secondary)',
        padding: '14px 16px',
        transition: 'all var(--transition-normal)',
        opacity: mastered ? 0.65 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Confetti particles on check */}
      {animating && <ConfettiParticles color={color} />}

      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          style={{
            width: 22,
            height: 22,
            minWidth: 22,
            borderRadius: 6,
            border: mastered ? `2px solid ${color}` : '1.5px solid var(--border-secondary)',
            background: mastered ? color : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
            transition: 'all var(--transition-fast)',
            position: 'relative',
          }}
        >
          {mastered && (
            <svg width="13" height="13" viewBox="0 0 12 12" style={{ animation: 'popIn .3s ease' }}>
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 24,
                  strokeDashoffset: 0,
                  animation: 'checkmark .35s ease forwards',
                }}
              />
            </svg>
          )}
          {animating && (
            <span style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              animation: 'pulse-ring .5s ease forwards',
              pointerEvents: 'none',
            }} />
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13.5,
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            textDecoration: mastered ? 'line-through' : 'none',
            textDecorationColor: `${color}40`,
          }}>{txt.name}</div>
          {txt.subtitle && <div style={{ fontSize: 12.5, color, fontWeight: 500, marginTop: 2 }}>{txt.subtitle}</div>}
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.55 }}>{txt.desc}</div>
        </div>

        {txt.details?.length > 0 && (
          <span style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            marginTop: 3,
            transition: 'transform var(--transition-fast)',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            display: 'inline-block',
          }}>▶</span>
        )}
      </div>

      {/* Details */}
      {open && txt.details?.length > 0 && (
        <div style={{
          marginTop: 10,
          paddingTop: 10,
          paddingLeft: 32,
          borderTop: '1px solid var(--border-primary)',
          animation: 'fadeIn .25s ease',
        }}>
          {txt.details.map((d, i) => (
            <div
              key={i}
              style={{
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                padding: '3px 0',
                paddingLeft: d.startsWith('  ') ? 16 : 0,
              }}
            >
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
