import { useState, useCallback, useEffect } from 'react';
import { getProgress, setProgress, type ConceptId, type ProgressData } from '../lib/progress';

export function useProgress(conceptId: ConceptId) {
  const [progress, setProgressState] = useState<ProgressData>(() => getProgress(conceptId));

  useEffect(() => {
    setProgressState(getProgress(conceptId));
  }, [conceptId]);

  const markMilestone = useCallback((milestone: string) => {
    setProgressState(prev => {
      if (prev.milestones.includes(milestone)) return prev;
      const next: ProgressData = {
        ...prev,
        milestones: [...prev.milestones, milestone],
        lastVisited: Date.now(),
      };
      setProgress(conceptId, next);
      return next;
    });
  }, [conceptId]);

  const recordVisit = useCallback(() => {
    setProgressState(prev => {
      const next: ProgressData = {
        ...prev,
        lastVisited: Date.now(),
      };
      setProgress(conceptId, next);
      return next;
    });
  }, [conceptId]);

  return { progress, markMilestone, recordVisit };
}
