import { useMemo, useState } from 'react';
import { getAllTopics } from '../data/domains';
import { useLang, topicText } from '../i18n';

export default function Notes({ annotations, updateAnnotation }) {
  const { lang } = useLang();
  const allTopics = useMemo(() => getAllTopics(lang), [lang]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'memo' | 'highlight' | 'bold'

  // get all annotated topics
  const annotatedTopics = useMemo(() => {
    return allTopics
      .filter((t) => {
        const a = annotations[t.id];
        if (!a) return false;
        if (filter === 'memo') return !!a.memo;
        if (filter === 'highlight') return !!a.highlight;
        if (filter === 'bold') return !!a.bold;
        return a.memo || a.highlight || a.bold;
      })
      .map((t) => ({ ...t, annotation: annotations[t.id] }));
  }, [allTopics, annotations, filter]);

  const startEdit = (topicId, currentMemo) => {
    setEditingId(topicId);
    setEditText(currentMemo || '');
  };

  const saveEdit = (topicId) => {
    updateAnnotation(topicId, { memo: editText.trim() || undefined });
    setEditingId(null);
  };

  const filters = [
    { key: 'all', en: 'All', zh: '全部' },
    { key: 'memo', en: 'With Notes', zh: '有筆記' },
    { key: 'highlight', en: 'Highlighted', zh: '已高亮' },
    { key: 'bold', en: 'Bold', zh: '加粗' },
  ];

  return (
    <div className="animate-in">
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>
        {lang === 'en' ? 'My Notes' : '我的筆記'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        {lang === 'en'
          ? 'All your annotations, highlights and memos in one place'
          : '所有標注、高亮和備忘錄集中查看'}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '5px 14px', fontSize: 12, fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-primary)',
                background: active ? 'rgba(212,168,67,.12)' : 'transparent',
                color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {lang === 'en' ? f.en : f.zh}
            </button>
          );
        })}
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', alignSelf: 'center', marginLeft: 4 }}>
          {annotatedTopics.length} {lang === 'en' ? 'items' : '項'}
        </span>
      </div>

      {annotatedTopics.length === 0 ? (
        <div style={{
          padding: '48px 0', textAlign: 'center',
          color: 'var(--text-tertiary)', fontSize: 13,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>N</div>
          {lang === 'en'
            ? 'No annotations yet. Hover over a concept card and use the toolbar to add highlights or press N for notes.'
            : '還沒有標注。將鼠標移到概念卡片上，使用工具欄添加高亮，或按 N 鍵添加筆記。'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {annotatedTopics.map((t) => {
            const txt = topicText(t, lang);
            const a = t.annotation;
            const isEditing = editingId === t.id;
            return (
              <div
                key={t.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: a.highlight ? `1.5px solid ${a.highlight}44` : '1px solid var(--border-primary)',
                  background: a.highlight ? `${a.highlight}14` : 'var(--bg-secondary)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {/* Highlight strip */}
                {a.highlight && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: a.highlight, borderRadius: '4px 0 0 4px',
                  }} />
                )}

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13.5,
                      fontWeight: a.bold ? 700 : 500,
                      color: a.highlight || 'var(--text-primary)',
                      lineHeight: 1.4,
                    }}>{txt.name}</div>
                    {txt.subtitle && <div style={{ fontSize: 12, color: t.domainColor || 'var(--text-tertiary)', marginTop: 2 }}>{txt.subtitle}</div>}
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5, fontWeight: a.bold ? 600 : 400 }}>
                      {txt.desc}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginTop: 2 }}>
                    {a.highlight && (
                      <button
                        onClick={() => updateAnnotation(t.id, { highlight: undefined })}
                        title={lang === 'en' ? 'Remove highlight' : '移除高亮'}
                        style={{
                          width: 14, height: 14, borderRadius: '50%',
                          background: a.highlight, border: 'none', cursor: 'pointer',
                          fontSize: 8, color: '#fff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >✕</button>
                    )}
                    {a.bold && (
                      <button
                        onClick={() => updateAnnotation(t.id, { bold: false })}
                        title={lang === 'en' ? 'Remove bold' : '取消加粗'}
                        style={{
                          width: 18, height: 18, borderRadius: 3,
                          background: 'var(--bg-hover)', border: 'none', cursor: 'pointer',
                          fontSize: 10, fontWeight: 800, color: 'var(--text-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >B</button>
                    )}
                  </div>
                </div>

                {/* Memo section */}
                {isEditing ? (
                  <div style={{ marginTop: 8 }}>
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingId(null);
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveEdit(t.id);
                      }}
                      placeholder={lang === 'en' ? 'Add a note...' : '添加筆記...'}
                      style={{
                        width: '100%', minHeight: 50, fontSize: 12.5, lineHeight: 1.6,
                        color: 'var(--text-primary)', background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)',
                        padding: '8px 10px', resize: 'vertical', fontFamily: 'inherit',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '3px 8px' }}
                      >{lang === 'en' ? 'Cancel' : '取消'}</button>
                      <button
                        onClick={() => saveEdit(t.id)}
                        style={{
                          fontSize: 11, fontWeight: 500, padding: '3px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--accent-gold)', color: '#000',
                        }}
                      >{lang === 'en' ? 'Save' : '保存'}</button>
                    </div>
                  </div>
                ) : a.memo ? (
                  <div
                    onClick={() => startEdit(t.id, a.memo)}
                    style={{
                      marginTop: 8, cursor: 'pointer',
                      fontSize: 12, color: 'var(--accent-gold)', lineHeight: 1.55,
                      padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(212,168,67,.06)', border: '1px solid rgba(212,168,67,.15)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <span style={{ fontSize: 10, marginRight: 4, opacity: 0.7 }}>N</span>
                    {a.memo}
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(t.id, '')}
                    style={{
                      marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)',
                      padding: '3px 0',
                    }}
                  >
                    + {lang === 'en' ? 'Add note' : '添加筆記'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
