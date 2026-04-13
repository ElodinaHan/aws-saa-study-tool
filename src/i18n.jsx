import { createContext, useContext, useCallback } from 'react';
import { useLocalState } from './hooks/useStorage';

const LangContext = createContext({ lang: 'zh', setLang: () => {}, t: (k) => k });

const dict = {
  // ── Sidebar / Nav ──
  'nav.hub': { en: 'Knowledge Hub', zh: '知識庫' },
  'nav.flashcards': { en: 'Flashcards', zh: '閃卡複習' },
  'nav.quiz': { en: 'Quizzes', zh: '模擬測驗' },
  'nav.settings': { en: 'Settings', zh: '設定' },
  'sidebar.subtitle': { en: 'SAA-C03 Study Platform', zh: 'SAA-C03 學習平台' },
  'sidebar.lightMode': { en: 'Light Mode', zh: '亮色模式' },
  'sidebar.darkMode': { en: 'Dark Mode', zh: '暗色模式' },
  'sidebar.collapse': { en: 'Collapse', zh: '收起' },
  'sidebar.switchLight': { en: 'Switch to Light Mode', zh: '切換亮色模式' },
  'sidebar.switchDark': { en: 'Switch to Dark Mode', zh: '切換暗色模式' },
  'sidebar.expand': { en: 'Expand Sidebar', zh: '展開側邊欄' },
  'sidebar.collapseSidebar': { en: 'Collapse Sidebar', zh: '收起側邊欄' },

  // ── Hub page ──
  'hub.title': { en: 'Knowledge Hub', zh: '知識庫' },
  'hub.mastered': { en: 'Mastered', zh: '已掌握' },
  'hub.searchPlaceholder': { en: 'Search concepts, services, acronyms… (⌘K)', zh: '搜索概念、服務名、縮寫… (⌘K)' },
  'hub.all': { en: 'All', zh: '全部' },
  'hub.examWeight': { en: 'Exam weight', zh: '佔考試' },
  'hub.crossCutting': { en: 'Cross-cutting Services', zh: '貫穿全域服務' },

  // ── Flashcards ──
  'fc.title': { en: 'Flashcard Review', zh: '閃卡複習' },
  'fc.subtitle': { en: 'Immersive review — Use ← → to navigate, Space to flip', zh: '沉浸式記憶模式 — 鍵盤 ← → 翻頁，空格翻轉卡片' },
  'fc.unmastered': { en: 'Unmastered', zh: '未掌握' },
  'fc.cardsToReview': { en: 'cards to review', zh: '張卡待複習' },
  'fc.startReview': { en: 'Start Review', zh: '進入複習' },
  'fc.exit': { en: 'Exit', zh: '退出' },
  'fc.prev': { en: '← Previous', zh: '← 上一張' },
  'fc.next': { en: 'Next →', zh: '下一張 →' },
  'fc.shuffle': { en: '🔀 Shuffle', zh: '🔀 隨機' },
  'fc.markMastered': { en: '○ Mark Mastered', zh: '○ 標記掌握' },
  'fc.alreadyMastered': { en: '✓ Mastered', zh: '✓ 已掌握' },
  'fc.clickToFlip': { en: 'Click to flip →', zh: '點擊翻轉 →' },

  // ── Quiz ──
  'quiz.title': { en: 'Practice Quiz', zh: '模擬測驗' },
  'quiz.subtitle': { en: 'Randomly generate multiple-choice questions from the knowledge base', zh: '從知識庫中隨機生成選擇題，模擬考試環境' },
  'quiz.source': { en: 'QUESTION SOURCE', zh: '題目來源' },
  'quiz.count': { en: 'NUMBER OF QUESTIONS', zh: '題目數量' },
  'quiz.available': { en: 'Available questions', zh: '可用題目' },
  'quiz.start': { en: 'Start Quiz', zh: '開始測驗' },
  'quiz.minTopics': { en: 'At least 4 concepts required to generate a quiz', zh: '至少需要 4 個概念才能生成測驗' },
  'quiz.results': { en: 'Quiz Results', zh: '測驗結果' },
  'quiz.score': { en: 'Score', zh: '得分' },
  'quiz.restart': { en: 'New Quiz', zh: '重新測驗' },
  'quiz.end': { en: 'End', zh: '結束' },
  'quiz.prev': { en: '← Previous', zh: '← 上一題' },
  'quiz.next': { en: 'Next →', zh: '下一題 →' },
  'quiz.submit': { en: 'Submit', zh: '提交' },
  'quiz.tryAgain': { en: 'Try Again', zh: '再考一次' },
  'quiz.questionOf': { en: 'of', zh: '/' },
  'quiz.questionPrefix': { en: 'What is the description of', zh: '「' },
  'quiz.questionSuffix': { en: '?', zh: '」的描述是？' },
  'quiz.correct': { en: '✓ Correct', zh: '✓ 正確' },
  'quiz.wrong': { en: '✗ Incorrect', zh: '✗ 錯誤' },
  'quiz.correctAnswer': { en: 'Correct answer', zh: '正確答案' },
  'quiz.explanation': { en: 'Explanation', zh: '解析' },
  'quiz.keyPoints': { en: 'Key Points', zh: '要點' },

  // ── Settings ──
  'settings.title': { en: 'Data & Settings', zh: '數據與設定' },
  'settings.subtitle': { en: 'Manage progress, backup & restore', zh: '管理學習進度、備份與恢復' },
  'settings.progress': { en: 'PROGRESS DASHBOARD', zh: '學習進度儀表板' },
  'settings.masteredOf': { en: 'Mastered / {total} total concepts', zh: '已掌握 / {total} 總概念' },
  'settings.toReview': { en: 'To review', zh: '待複習' },
  'settings.heatmap': { en: 'Knowledge Mastery Heatmap', zh: '知識點掌握熱力圖' },
  'settings.notMastered': { en: 'Not mastered', zh: '未掌握' },
  'settings.backup': { en: 'DATA BACKUP', zh: '數據備份' },
  'settings.export': { en: '📦 Export Backup (JSON)', zh: '📦 導出備份 (JSON)' },
  'settings.import': { en: '📂 Import Backup', zh: '📂 導入備份' },
  'settings.dropzone': { en: 'Drop .json backup file here to restore progress', zh: '拖拽 .json 備份文件到此處恢復進度' },
  'settings.importSuccess': { en: 'Import successful! Data updated', zh: '導入成功！頁面數據已更新' },
  'settings.importError': { en: 'Import failed, please check file format', zh: '導入失敗，請確認文件格式' },
  'settings.danger': { en: 'DANGER ZONE', zh: '危險操作' },
  'settings.reset': { en: '🗑 Reset All Progress', zh: '🗑 重置所有學習進度' },
  'settings.confirmReset': { en: 'Are you sure you want to reset all progress? This cannot be undone.', zh: '確定要重置所有學習進度嗎？此操作不可撤銷。' },
  'settings.language': { en: 'INTERFACE LANGUAGE', zh: '界面語言' },

  // ── Command Palette ──
  'cmd.placeholder': { en: 'Search AWS concepts…', zh: '搜索 AWS 概念…' },
  'cmd.noResult': { en: 'No matching concepts found', zh: '找不到匹配的概念' },
};

export function LangProvider({ children }) {
  const [lang, setLang] = useLocalState('lang', 'zh');

  const t = useCallback((key, params) => {
    const entry = dict[key];
    if (!entry) return key;
    let text = entry[lang] || entry.zh || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/**
 * Get display text for a topic based on current language.
 * Returns { name, subtitle, desc, details }
 */
export function topicText(topic, lang) {
  if (lang === 'en') {
    return {
      name: topic.term,
      subtitle: null,
      desc: topic.descEn || topic.desc,
      details: topic.detailsEn || topic.details,
    };
  }
  return {
    name: topic.term,
    subtitle: topic.zh,
    desc: topic.desc,
    details: topic.details,
  };
}

/**
 * Get display text for a domain based on current language.
 */
export function domainText(domain, lang) {
  if (lang === 'en') {
    return { title: domain.title, subtitle: null };
  }
  return { title: domain.titleZh, subtitle: domain.title };
}

/**
 * Get section display text.
 */
export function sectionText(section, lang) {
  if (lang === 'en') {
    return { title: section.title, subtitle: null };
  }
  return { title: section.title, subtitle: section.titleZh };
}
