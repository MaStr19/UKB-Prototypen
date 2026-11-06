import { TherapyTargetKey } from './types';

export const FEEDBACK_STORAGE_KEY = 'eva_ml_feedback_v1';
export const FEEDBACK_OPT_IN_KEY = 'eva_ml_feedback_opt_in';

export interface AnonymizedFeedbackEvent {
  id: string;
  timestamp: string;
  modelVersion: string;
  therapyId: TherapyTargetKey;
  action: 'accepted' | 'rejected';
  confidence: number;
  activeFeatureKeys: string[];
}

/**
 * Checks whether user has explicitly opted into local feedback logging.
 */
export function isFeedbackOptedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(FEEDBACK_OPT_IN_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Sets user feedback opt-in status.
 */
export function setFeedbackOptIn(optIn: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FEEDBACK_OPT_IN_KEY, optIn ? 'true' : 'false');
  } catch (err) {
    console.warn('Could not save feedback opt-in state to localStorage', err);
  }
}

/**
 * Returns all stored anonymized feedback events.
 */
export function getStoredFeedback(): AnonymizedFeedbackEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Logs an anonymized clinical decision event (DSGVO-konform).
 * Strictly omits any patient names, telephone numbers, and free-text anamnesis.
 */
export function logFeedbackDecision(
  event: Omit<AnonymizedFeedbackEvent, 'id' | 'timestamp'>
): boolean {
  if (!isFeedbackOptedIn()) return false;
  if (typeof window === 'undefined') return false;

  try {
    const existing = getStoredFeedback();
    const newEvent: AnonymizedFeedbackEvent = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    existing.push(newEvent);
    // Keep bounded history (last 500 decisions)
    const bounded = existing.slice(-500);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(bounded));
    return true;
  } catch (err) {
    console.warn('Failed to log feedback event', err);
    return false;
  }
}

/**
 * Clears stored feedback events.
 */
export function clearStoredFeedback(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear feedback events', err);
  }
}

/**
 * Exports feedback as a downloadable JSON file.
 */
export function exportFeedbackJson(): void {
  if (typeof window === 'undefined') return;
  const events = getStoredFeedback();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
  const anchor = document.createElement('a');
  anchor.setAttribute('href', dataStr);
  anchor.setAttribute('download', `eva_ml_feedback_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
