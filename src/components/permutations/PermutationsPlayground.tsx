import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  RUNE_POOL,
  RENDER_ALL_THRESHOLD,
  SAMPLE_SIZE,
  factorial,
  generateAllPermutations,
  samplePermutations,
  permutationIndex,
  arrangementsEqual,
  type RuneElement,
} from '../../lib/permutations';
import { useProgress } from '../../hooks/useProgress';
import RunePool from './RunePool';
import LockDisplay from './LockDisplay';
import FactorialCounter from './FactorialCounter';
import PermutationGrid from './PermutationGrid';
import GrowthComparisonChart from './GrowthComparisonChart';
import InfoPanel from '../shared/InfoPanel';

export default function PermutationsPlayground() {
  const [activeIds, setActiveIds] = useState<Set<number>>(new Set());
  const [arrangement, setArrangement] = useState<RuneElement[]>([]);
  const [selectedLockIndex, setSelectedLockIndex] = useState<number | null>(null);
  const prevCountRef = useRef(0);
  const hasSwappedRef = useRef(false);

  const { markMilestone, recordVisit } = useProgress('permutations');

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  // Keep arrangement in sync with activeIds
  useEffect(() => {
    setArrangement((prev) => {
      // Remove runes that are no longer active
      const filtered = prev.filter((r) => activeIds.has(r.id));
      // Add newly active runes to the end
      const existingIds = new Set(filtered.map((r) => r.id));
      const newRunes = RUNE_POOL.filter(
        (r) => activeIds.has(r.id) && !existingIds.has(r.id)
      );
      return [...filtered, ...newRunes];
    });
    setSelectedLockIndex(null);
  }, [activeIds]);

  const n = arrangement.length;
  const total = factorial(n);

  const sortedActive = useMemo(
    () => RUNE_POOL.filter((r) => activeIds.has(r.id)).sort((a, b) => a.id - b.id),
    [activeIds]
  );

  const permutations = useMemo(() => {
    if (n === 0) return [];
    if (n <= RENDER_ALL_THRESHOLD) {
      return generateAllPermutations(sortedActive);
    }
    const sampled = samplePermutations(sortedActive, SAMPLE_SIZE);
    // Ensure current arrangement is included
    const currentIdx = permutationIndex(arrangement, sortedActive);
    const hasCurrent = sampled.some((p) => p.index === currentIdx);
    if (!hasCurrent) {
      sampled.push({ index: currentIdx, arrangement: [...arrangement] });
      sampled.sort((a, b) => a.index - b.index);
    }
    return sampled;
  }, [sortedActive, n, arrangement]);

  const arrangementLabel = useMemo(() => {
    if (n === 0) return '';
    const idx = permutationIndex(arrangement, sortedActive);
    return `Arrangement #${(idx + 1).toLocaleString()} of ${total.toLocaleString()}`;
  }, [arrangement, sortedActive, n, total]);

  const handleToggle = useCallback((element: RuneElement) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(element.id)) {
        next.delete(element.id);
      } else {
        next.add(element.id);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback((index: number) => {
    setSelectedLockIndex((prev) => (prev === index || index < 0) ? null : index);
  }, []);

  const handleSwap = useCallback((i: number, j: number) => {
    setArrangement((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setSelectedLockIndex(null);
    hasSwappedRef.current = true;
  }, []);

  const handleReset = useCallback(() => {
    setActiveIds(new Set());
    setArrangement([]);
    setSelectedLockIndex(null);
  }, []);

  // Milestone tracking
  useEffect(() => {
    if (n === 0) {
      prevCountRef.current = 0;
      return;
    }

    if (n >= 1 && prevCountRef.current === 0) {
      markMilestone('added-first-rune');
    }

    if (n >= 3) {
      markMilestone('saw-factorial-growth');
    }

    if (n >= 4) {
      markMilestone('compared-growth');
    }

    prevCountRef.current = n;
  }, [n, markMilestone]);

  useEffect(() => {
    if (hasSwappedRef.current) {
      markMilestone('swapped-runes');
    }
  }, [arrangement, markMilestone]);

  return (
    <div className="space-y-6">
      {/* Rune Pool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
            Runes — click to add or remove ({n} of {RUNE_POOL.length} active)
          </h3>
          {n > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs font-medium rounded-lg border border-border dark:border-border-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <RunePool
          pool={RUNE_POOL}
          activeIds={activeIds}
          onToggle={handleToggle}
        />
      </div>

      {/* Lock Display */}
      <LockDisplay
        arrangement={arrangement}
        selectedIndex={selectedLockIndex}
        onSelect={handleSelect}
        onSwap={handleSwap}
        arrangementLabel={arrangementLabel}
      />

      {/* Factorial Counter */}
      <FactorialCounter n={n} total={total} />

      {/* Permutation Grid */}
      <div className="space-y-2">
        {n > 0 && (
          <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
            All Arrangements
          </h3>
        )}
        <PermutationGrid
          permutations={permutations}
          currentArrangement={arrangement}
          totalCount={total}
        />
      </div>

      {/* Growth Comparison */}
      <GrowthComparisonChart n={n} />

      {/* Info Panels */}
      <div className="space-y-3">
        <InfoPanel title="Why does adding one rune multiply by n?">
          <p>
            A new rune can be <strong>inserted into any of n positions</strong>{' '}
            in each existing arrangement — before the first rune, between any
            two runes, or after the last. That gives n choices per existing
            arrangement, so n × (n−1)! = n!.
          </p>
          <p className="mt-2">
            Try it: with 3 runes you have 6 arrangements. Add a 4th and watch
            the count jump to 24 — each of the 6 arrangements spawns 4 variants
            with the new rune in different slots.
          </p>
        </InfoPanel>
        <InfoPanel title="Permutations vs Combinations">
          <p>
            <strong>Permutations</strong> care about order: ABC, BAC, and CAB
            are three <em>different</em> permutations. <strong>Combinations</strong>{' '}
            don't: {'{'}A, B, C{'}'} is the same combination regardless of order.
          </p>
          <p className="mt-2">
            The relationship: C(n, k) = n! / (k! × (n−k)!). Combinations
            divide out the k! orderings within each group, which is why there
            are always fewer combinations than permutations.
          </p>
        </InfoPanel>
      </div>
    </div>
  );
}
