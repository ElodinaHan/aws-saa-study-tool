import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useTheme, useLocalState } from './hooks/useStorage';
import { useLang } from './i18n';
import Hub from './pages/Hub';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import CommandPalette from './components/CommandPalette';

const NAV = [
  { to: '/', icon: Icons.grid, key: 'nav.hub' },
  { to: '/flashcards', icon: Icons.cards, key: 'nav.flashcards' },
  { to: '/quiz', icon: Icons.quiz, key: 'nav.quiz' },
  { to: '/notes', icon: Icons.notes, key: 'nav.notes' },
  { to: '/settings', icon: Icons.settings, key: 'nav.settings' },
];

function Icons() { return null; }
Icons.grid = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" />
  </svg>
);
Icons.cards = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="14" height="12" rx="2" /><path d="M6 1h8" opacity=".4" /><path d="M5 2.5h10" opacity=".6" />
  </svg>
);
Icons.quiz = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8" /><path d="M7.5 8.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" /><circle cx="10" cy="14.5" r=".5" fill="currentColor" />
  </svg>
);
Icons.settings = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="2.5" /><path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.22 4.22l1.42 1.42m8.72 8.72 1.42 1.42m0-12.72-1.42 1.42M5.64 14.36l-1.42 1.42" />
  </svg>
);
Icons.notes = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M7 7h6M7 10h6M7 13h3" />
  </svg>
);

const SunIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="9" r="3.5" /><path d="M9 1v2m0 12v2M1 9h2m12 0h2M3.64 3.64l1.41 1.41m7.9 7.9 1.41 1.41m0-12.72-1.41 1.41M5.05 12.95l-1.41 1.41" />
  </svg>
);
const MoonIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 9.8A6.5 6.5 0 0 1 8.2 2.5 7 7 0 1 0 15.5 9.8Z" />
  </svg>
);

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [mastered, setMastered] = useLocalState('mastered', {});
  const [annotations, setAnnotations] = useLocalState('annotations', {});
  const [collapsed, setCollapsed] = useLocalState('sidebar-collapsed', false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();

  const updateAnnotation = useCallback((topicId, patch) => {
    setAnnotations((prev) => ({
      ...prev,
      [topicId]: { ...(prev[topicId] || {}), ...patch },
    }));
  }, [setAnnotations]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleMastered = (id) => {
    setMastered((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: collapsed ? 64 : 260,
          minWidth: collapsed ? 64 : 260,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal), min-width var(--transition-normal)',
          overflow: 'hidden',
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? '20px 0' : '20px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid var(--border-primary)',
            minHeight: 65,
          }}
        >
          <span style={{ fontSize: 22 }}>☁️</span>
          {!collapsed && (
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                AWS SAA Tracker
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{t('sidebar.subtitle')}</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => {
            const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            const isHome = item.to === '/' && location.pathname === '/';
            const isActive = item.to === '/' ? isHome : active;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{t(item.key)}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '8px 0' : '8px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              transition: 'all var(--transition-fast)',
            }}
            title={lang === 'zh' ? 'Switch to English' : '切換中文'}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>🌐</span>
            {!collapsed && <span>{lang === 'zh' ? 'English' : '中文'}</span>}
          </button>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '8px 0' : '8px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              transition: 'all var(--transition-fast)',
            }}
            title={theme === 'dark' ? t('sidebar.switchLight') : t('sidebar.switchDark')}
          >
            {theme === 'dark' ? SunIcon : MoonIcon}
            {!collapsed && <span>{theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')}</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '8px 0' : '8px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-tertiary)',
              fontSize: 13,
            }}
            title={collapsed ? t('sidebar.expand') : t('sidebar.collapseSidebar')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }}>
              <path d="M10 3L5 8l5 5" />
            </svg>
            {!collapsed && <span>{t('sidebar.collapse')}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 40px 80px' }}>
          <Routes>
            <Route path="/" element={<Hub mastered={mastered} toggleMastered={toggleMastered} annotations={annotations} updateAnnotation={updateAnnotation} />} />
            <Route path="/flashcards" element={<Flashcards mastered={mastered} toggleMastered={toggleMastered} />} />
            <Route path="/quiz" element={<Quiz mastered={mastered} />} />
            <Route path="/notes" element={<Notes annotations={annotations} updateAnnotation={updateAnnotation} />} />
            <Route path="/settings" element={<Settings mastered={mastered} setMastered={setMastered} />} />
          </Routes>
        </div>
        {/* ── Footer ── */}
        <footer style={{
          padding: '24px 40px',
          borderTop: '1px solid var(--border-primary)',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-tertiary)',
          lineHeight: 1.8,
        }}>
          <div>© {new Date().getFullYear()} Created by <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>ElodinaHan</span></div>
          <div>
            View more →{' '}
            <a
              href="https://ElodinaHan.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--accent-gold)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              ElodinaHan.com
            </a>
          </div>
        </footer>
      </main>

      {/* ── Command Palette (Cmd+K) ── */}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  );
}
