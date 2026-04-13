import { useState, useCallback, useEffect } from 'react';

const PREFIX = 'aws-saa-';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* quota exceeded — silently fail */ }
}

/** Persistent state backed by localStorage */
export function useLocalState(key, initial) {
  const [state, setState] = useState(() => read(key, initial));

  const set = useCallback((valOrFn) => {
    setState((prev) => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      write(key, next);
      return next;
    });
  }, [key]);

  return [state, set];
}

/** Export all app data as JSON blob */
export function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith(PREFIX)) {
      try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aws-saa-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import JSON backup and restore */
export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (typeof data !== 'object' || data === null) throw new Error('Invalid format');
        Object.entries(data).forEach(([k, v]) => {
          if (k.startsWith(PREFIX)) {
            localStorage.setItem(k, JSON.stringify(v));
          }
        });
        resolve(Object.keys(data).length);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsText(file);
  });
}

/** Theme hook */
export function useTheme() {
  const [theme, setTheme] = useLocalState('theme', 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  return { theme, toggle };
}
