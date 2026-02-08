import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ELEMENT_POOL,
  RENDER_ALL_THRESHOLD,
  generateAllSubsets,
  sampleSubsets,
  computeSizeDistribution,
  type SubsetElement,
} from '../../lib/subsets';
import { useProgress } from '../../hooks/useProgress';
import ElementPool from './ElementPool';
import SubsetCounter from './SubsetCounter';
import SubsetGrid from './SubsetGrid';
import SizeDistributionChart from './SizeDistributionChart';
import InfoPanel from '../shared/InfoPanel';

const SAMPLE_SIZE = 200;

export default function SubsetsPlayground() {
  const [activeIds, setActiveIds] = useState<Set<number>>(new Set());
  const [sizeFilter, setSizeFilter] = useState<number | null>(null);
  const [, setHighlightMask] = useState<number | null>(null);
  const prevCountRef = useRef(0);

  const { markMilestone, recordVisit } = useProgress('subsets');

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const activeElements = useMemo(
    () => ELEMENT_POOL.filter((el) => activeIds.has(el.id)),
    [activeIds]
  );

  const n = activeElements.length;
  const total = n === 0 ? 0 : Math.pow(2, n);

  const subsets = useMemo(() => {
    if (n === 0) return [];
    if (n <= RENDER_ALL_THRESHOLD) {
      return generateAllSubsets(activeElements);
    }
    return sampleSubsets(activeElements, SAMPLE_SIZE);
  }, [activeElements, n]);

  const distribution = useMemo(() => computeSizeDistribution(n), [n]);

  const handleToggle = useCallback(
    (element: SubsetElement) => {
      setActiveIds((prev) => {
        const next = new Set(prev);
        if (next.has(element.id)) {
          next.delete(element.id);
        } else {
          next.add(element.id);
        }
        return next;
      });
      setSizeFilter(null);
    },
    []
  );

  // Milestone tracking
  useEffect(() => {
    if (n === 0) {
      prevCountRef.current = 0;
      return;
    }

    if (n >= 1 && prevCountRef.current === 0) {
      markMilestone('added-first-element');
    }

    if (n >= 2 && prevCountRef.current >= 1) {
      markMilestone('saw-doubling');
    }

    if (n >= 5) {
      markMilestone('reached-n-5');
    }

    prevCountRef.current = n;
  }, [n, markMilestone]);

  const handleFilterChange = useCallback(
    (k: number | null) => {
      setSizeFilter(k);
      if (k !== null) {
        markMilestone('filtered-by-size');
      }
    },
    [markMilestone]
  );

  const handleReset = useCallback(() => {
    setActiveIds(new Set());
    setSizeFilter(null);
    setHighlightMask(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Element Pool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
            Elements — click to add or remove ({n} of {ELEMENT_POOL.length} active)
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
        <ElementPool
          pool={ELEMENT_POOL}
          activeIds={activeIds}
          onToggle={handleToggle}
        />
      </div>

      {/* Counter */}
      <SubsetCounter n={n} total={total} />

      {/* Subset Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
          All Subsets
        </h3>
        <SubsetGrid
          subsets={subsets}
          activeElements={activeElements}
          totalCount={total}
          sizeFilter={sizeFilter}
          onHover={setHighlightMask}
        />
      </div>

      {/* Size Distribution */}
      {n > 0 && (
        <SizeDistributionChart
          distribution={distribution}
          n={n}
          activeFilter={sizeFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Info Panels */}
      <div className="space-y-3">
        <InfoPanel title="Why does adding one element double the subsets?">
          <p>
            Every existing subset can either <strong>include</strong> or{' '}
            <strong>exclude</strong> the new element — that's two choices per
            subset. So for each of the current 2<sup>n</sup> subsets, you get a
            twin that also contains the new element, giving 2 × 2<sup>n</sup> ={' '}
            2<sup>n+1</sup> subsets total.
          </p>
          <p className="mt-2">
            Try it: with 3 elements you have 8 subsets. Add a 4th and watch the
            count jump to 16 — every row in the grid spawns a copy with the new
            dot filled in.
          </p>
        </InfoPanel>
        <InfoPanel title="Subsets and binary strings">
          <p>
            Each subset of <em>n</em> elements maps to a unique binary string of
            length <em>n</em>. A <strong>1</strong> in position <em>i</em> means
            element <em>i</em> is included; a <strong>0</strong> means it's
            excluded. Since there are exactly 2<sup>n</sup> binary strings of
            length <em>n</em>, there are exactly 2<sup>n</sup> subsets.
          </p>
          <p className="mt-2">
            The dot grid above is exactly this mapping — each row is a binary
            string, with filled dots for 1s and empty dots for 0s. The size
            distribution chart shows how many strings have exactly <em>k</em>{' '}
            ones — that's the binomial coefficient C(<em>n</em>, <em>k</em>).
          </p>
        </InfoPanel>
      </div>
    </div>
  );
}
