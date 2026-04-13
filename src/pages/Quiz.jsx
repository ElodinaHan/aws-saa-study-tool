import { useState, useMemo, useCallback } from 'react';
import { getAllTopics, DOMAINS } from '../data/domains';
import { useLang, topicText, domainText } from '../i18n';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(topics, count, lang) {
  const pool = shuffleArray(topics).slice(0, Math.min(count, topics.length));
  return pool.map((topic) => {
    const txt = topicText(topic, lang);
    const descField = lang === 'en' ? 'descEn' : 'desc';
    const correct = topic[descField] || topic.desc;
    const others = shuffleArray(topics.filter((t) => t.id !== topic.id))
      .slice(0, 3)
      .map((t) => t[descField] || t.desc);
    const options = shuffleArray([correct, ...others]);
    const question = lang === 'en'
      ? `What is the description of ${topic.term}?`
      : `「${topic.term}」(${topic.zh}) 的描述是？`;
    return {
      id: topic.id,
      question,
      options,
      correctIndex: options.indexOf(correct),
      domainColor: topic.domainColor,
      // Explanation data
      term: txt.name,
      subtitle: txt.subtitle,
      desc: txt.desc,
      details: txt.details,
    };
  });
}

export default function Quiz({ mastered }) {
  const { lang, t } = useLang();
  const allTopics = useMemo(() => getAllTopics(lang), [lang]);
  const [filter, setFilter] = useState('unmastered');
  const [count, setCount] = useState(15);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const pool = useMemo(() => {
    if (filter === 'all') return allTopics;
    if (filter === 'unmastered') return allTopics.filter((tp) => !mastered[tp.id]);
    return allTopics.filter((tp) => tp.domainId === filter);
  }, [allTopics, filter, mastered]);

  const startQuiz = useCallback(() => {
    const qs = generateQuestions(pool, count, lang);
    setQuestions(qs);
    setAnswers({});
    setSubmitted(false);
    setCurrentQ(0);
  }, [pool, count, lang]);

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const submit = () => setSubmitted(true);

  const score = useMemo(() => {
    if (!submitted || !questions) return 0;
    return questions.filter((q, i) => answers[i] === q.correctIndex).length;
  }, [submitted, questions, answers]);

  // ── Not started ──
  if (!questions) {
    return (
      <div className="animate-in">
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>
          {t('quiz.title')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
          {t('quiz.subtitle')}
        </div>

        {/* Source filter */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>{t('quiz.source')}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: t('hub.all') },
              { key: 'unmastered', label: t('fc.unmastered') },
              ...DOMAINS.map((d) => ({ key: d.id, label: domainText(d, lang).title, color: d.color })),
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  border: filter === f.key ? `1.5px solid ${f.color || 'var(--accent-gold)'}` : '1px solid var(--border-primary)',
                  background: filter === f.key ? `${f.color || 'var(--accent-gold)'}18` : 'transparent',
                  color: filter === f.key ? (f.color || 'var(--accent-gold)') : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>{t('quiz.count')}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[10, 15, 20, 30].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                style={{
                  padding: '6px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  border: count === n ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-primary)',
                  background: count === n ? 'rgba(212,168,67,.12)' : 'transparent',
                  color: count === n ? 'var(--accent-gold)' : 'var(--text-secondary)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
          {t('quiz.available')}: {pool.length}
        </div>

        <button
          onClick={startQuiz}
          disabled={pool.length < 4}
          style={{
            padding: '12px 36px',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            background: pool.length >= 4 ? 'var(--accent-gold)' : 'var(--border-primary)',
            color: pool.length >= 4 ? '#000' : 'var(--text-tertiary)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {t('quiz.start')}
        </button>
        {pool.length < 4 && (
          <div style={{ fontSize: 12, color: 'var(--accent-red)', marginTop: 8 }}>
            {t('quiz.minTopics')}
          </div>
        )}
      </div>
    );
  }

  // ── Active quiz ──
  const q = questions[currentQ];
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {submitted ? t('quiz.results') : t('quiz.title')}
          </div>
          {submitted && (
            <div style={{ fontSize: 14, color: score / questions.length >= 0.7 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: 4 }}>
              {t('quiz.score')}: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
            </div>
          )}
        </div>
        <button
          onClick={() => setQuestions(null)}
          style={{
            padding: '6px 14px',
            fontSize: 12,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-secondary)',
          }}
        >
          {submitted ? t('quiz.restart') : t('quiz.end')}
        </button>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        {questions.map((_, i) => {
          const answered = answers[i] !== undefined;
          const isCorrect = submitted && answers[i] === questions[i].correctIndex;
          const isWrong = submitted && answered && !isCorrect;
          const isCurrent = i === currentQ;
          let bg = 'var(--border-primary)';
          if (isCorrect) bg = 'var(--accent-green)';
          else if (isWrong) bg = 'var(--accent-red)';
          else if (answered) bg = 'var(--accent-gold)';
          return (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              style={{
                width: 24, height: 24,
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                background: bg,
                color: (answered || isCurrent) ? '#000' : 'var(--text-tertiary)',
                border: isCurrent ? '2px solid var(--text-primary)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <div style={{
        padding: '28px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>
          Question {currentQ + 1} {t('quiz.questionOf')} {questions.length}
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 20 }}>
          {q.question}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, oi) => {
            const selected = answers[currentQ] === oi;
            const isCorrectOpt = submitted && oi === q.correctIndex;
            const isWrongSel = submitted && selected && oi !== q.correctIndex;

            let borderColor = 'var(--border-primary)';
            let bg = 'transparent';
            if (isCorrectOpt) { borderColor = 'var(--accent-green)'; bg = 'rgba(45,184,122,.08)'; }
            else if (isWrongSel) { borderColor = 'var(--accent-red)'; bg = 'rgba(212,74,74,.08)'; }
            else if (selected) { borderColor = 'var(--accent-gold)'; bg = 'rgba(212,168,67,.08)'; }

            return (
              <button
                key={oi}
                onClick={() => selectAnswer(currentQ, oi)}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${borderColor}`,
                  background: bg,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  transition: 'all var(--transition-fast)',
                  opacity: submitted && !isCorrectOpt && !selected ? 0.5 : 1,
                }}
              >
                <span style={{ color: 'var(--text-tertiary)', marginRight: 8, fontWeight: 600 }}>
                  {String.fromCharCode(65 + oi)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* ── Explanation (shown after submit) ── */}
        {submitted && (
          <div style={{
            marginTop: 20,
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            background: answers[currentQ] === q.correctIndex ? 'rgba(45,184,122,.06)' : 'rgba(212,74,74,.06)',
            border: `1px solid ${answers[currentQ] === q.correctIndex ? 'var(--accent-green)' : 'var(--accent-red)'}33`,
            animation: 'fadeIn .25s ease',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: answers[currentQ] === q.correctIndex ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {answers[currentQ] === q.correctIndex ? t('quiz.correct') : t('quiz.wrong')}
            </div>

            {answers[currentQ] !== q.correctIndex && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>{t('quiz.correctAnswer')}:</span>{' '}
                <span style={{ color: 'var(--accent-green)' }}>
                  {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}
                </span>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: .5, marginTop: 8, marginBottom: 6 }}>
              {t('quiz.explanation')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
              {q.term}
              {q.subtitle && <span style={{ color: q.domainColor, marginLeft: 6, fontWeight: 400 }}>{q.subtitle}</span>}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: q.details?.length ? 8 : 0 }}>
              {q.desc}
            </div>
            {q.details?.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8, marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>
                  {t('quiz.keyPoints')}
                </div>
                {q.details.map((d, i) => (
                  <div key={i} style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    padding: '2px 0',
                    paddingLeft: d.startsWith('  ') ? 14 : 0,
                  }}>
                    <span style={{ color: q.domainColor, marginRight: 6, fontSize: 6, verticalAlign: 'middle' }}>●</span>
                    {d.trim()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
          disabled={currentQ === 0}
          style={{
            padding: '8px 18px', fontSize: 13, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-primary)', color: 'var(--text-secondary)',
            opacity: currentQ === 0 ? 0.3 : 1,
          }}
        >{t('quiz.prev')}</button>

        {!submitted ? (
          currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((c) => c + 1)}
              style={{
                padding: '8px 18px', fontSize: 13, borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-gold)', color: '#000', fontWeight: 600,
              }}
            >{t('quiz.next')}</button>
          ) : (
            <button
              onClick={submit}
              disabled={totalAnswered < questions.length}
              style={{
                padding: '10px 24px', fontSize: 13, borderRadius: 'var(--radius-sm)',
                background: totalAnswered === questions.length ? 'var(--accent-green)' : 'var(--border-primary)',
                color: totalAnswered === questions.length ? '#000' : 'var(--text-tertiary)',
                fontWeight: 600,
              }}
            >
              {t('quiz.submit')} ({totalAnswered}/{questions.length})
            </button>
          )
        ) : (
          <button
            onClick={startQuiz}
            style={{
              padding: '10px 24px', fontSize: 13, borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-gold)', color: '#000', fontWeight: 600,
            }}
          >{t('quiz.tryAgain')}</button>
        )}
      </div>
    </div>
  );
}
