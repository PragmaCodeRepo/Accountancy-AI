import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedState } from '../data/seed.js';

const STORAGE_KEY = 'zephyr-accounting-demo-v1';
const AppContext = createContext(null);

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createSeedState();
    const parsed = JSON.parse(saved);
    const seed = createSeedState();
    const arrays = ['clients', 'accounts', 'transactions', 'schedules', 'engagements', 'reviewFindings', 'gstChecks', 'activity'];
    if (!parsed || arrays.some((key) => !Array.isArray(parsed[key])) || !parsed.draft || typeof parsed.draft !== 'object' || typeof parsed.draft.sections !== 'object' || !parsed.settings || typeof parsed.settings !== 'object') return seed;
    return { ...seed, ...parsed, settings: { ...seed.settings, ...parsed.settings } };
  } catch (error) {
    console.warn('Unable to load saved demo data; using fictional seed data.', error);
    return createSeedState();
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadInitialState);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastUpdated: new Date().toISOString() }));
    } catch (error) {
      console.error('Unable to save demo data to local storage.', error);
      setToast({ message: 'Could not save locally. Check browser storage settings.', tone: 'error' });
    }
  }, [state]);
  const notify = (message, tone = 'success') => setToast({ message, tone });
  const log = (action, record = 'eng-2026-01', by = 'Morgan Lee') => ({
    id: `act-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    at: new Date().toISOString(), by, action, record,
  });
  const update = (updater, activity) => setState((current) => {
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    return activity ? { ...next, activity: [log(activity.action, activity.record, activity.by), ...next.activity] } : next;
  });
  const value = useMemo(() => ({
    state, update, notify, toast, setToast,
    reset: () => { setState(createSeedState()); notify('Demo data restored to the fictional seed set.'); },
  }), [state, toast]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}
