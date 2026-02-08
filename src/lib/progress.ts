export type ConceptId = 'graph-traversal' | 'growth-rates' | 'hashing-collisions' | 'subsets';

export interface ProgressData {
  milestones: string[];
  lastVisited: number;
}

const STORAGE_KEY = 'discrete-math-progress';

function getAllProgress(): Record<string, ProgressData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllProgress(data: Record<string, ProgressData>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getProgress(conceptId: ConceptId): ProgressData {
  const all = getAllProgress();
  return all[conceptId] ?? { milestones: [], lastVisited: 0 };
}

export function setProgress(conceptId: ConceptId, data: ProgressData) {
  const all = getAllProgress();
  all[conceptId] = data;
  saveAllProgress(all);
}

export function getCompletionPercent(conceptId: ConceptId, totalMilestones: number): number {
  const p = getProgress(conceptId);
  if (totalMilestones === 0) return 0;
  return Math.round((p.milestones.length / totalMilestones) * 100);
}
