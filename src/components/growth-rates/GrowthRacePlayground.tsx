import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { complexityClasses, computeValues, computeRange } from '../../lib/growth';
import { useAnimationController } from '../../hooks/useAnimationController';
import { useProgress } from '../../hooks/useProgress';
import RaceChart from './RaceChart';
import RaceControls from './RaceControls';
import ComplexityTable from './ComplexityTable';
import Legend from '../shared/Legend';
import InfoPanel from '../shared/InfoPanel';

const MAX_N = 100;
const allIds = new Set(complexityClasses.map(c => c.id));

export default function GrowthRacePlayground() {
  const [n, setN] = useState(10);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(new Set(allIds));
  const [logScale, setLogScale] = useState(false);
  const [viewMode, setViewMode] = useState<'bar' | 'line'>('bar');

  const { progress, markMilestone } = useProgress('growth-rates');

  const { state: animState, controls: animControls } = useAnimationController(MAX_N, 80);
  const isAnimating = animState.isPlaying;

  // Sync animation step to N
  useEffect(() => {
    if (isAnimating) {
      setN(animState.currentStep + 1);
    }
  }, [animState.currentStep, isAnimating]);

  const handleAnimateN = useCallback(() => {
    if (isAnimating) {
      animControls.pause();
    } else {
      animControls.reset();
      animControls.play();
    }
  }, [isAnimating, animControls]);

  const handleNChange = useCallback((val: number) => {
    if (isAnimating) animControls.pause();
    setN(val);
  }, [isAnimating, animControls]);

  const toggleId = useCallback((id: string) => {
    setEnabledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleLogScale = useCallback(() => {
    setLogScale(prev => !prev);
    markMilestone('tried-log-scale');
  }, [markMilestone]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'bar' ? 'line' : 'bar'));
  }, []);

  // Track milestones
  const tracked50 = useRef(false);
  const trackedExplode = useRef(false);

  useEffect(() => {
    if (n >= 50 && !tracked50.current) {
      tracked50.current = true;
      markMilestone('explored-n-50');
    }
    if (n >= 30 && enabledIds.has('exponential') && !trackedExplode.current) {
      trackedExplode.current = true;
      markMilestone('saw-exponential-explode');
    }
  }, [n, enabledIds, markMilestone]);

  const values = useMemo(() => computeValues(n, enabledIds), [n, enabledIds]);
  const rangeValues = useMemo(() => computeRange(n, enabledIds), [n, enabledIds]);

  const maxValue = useMemo(() => {
    let max = 1;
    for (const v of values.values()) {
      if (v > max) max = v;
    }
    return max;
  }, [values]);

  const legendItems = complexityClasses
    .filter(c => enabledIds.has(c.id))
    .map(c => ({ color: c.color, label: `${c.notation} ${c.label}` }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      <RaceControls
        n={n}
        onNChange={handleNChange}
        enabledIds={enabledIds}
        onToggleId={toggleId}
        logScale={logScale}
        onToggleLogScale={toggleLogScale}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
        onAnimateN={handleAnimateN}
        isAnimating={isAnimating}
      />

      <div className="border border-border dark:border-border-dark rounded-lg p-4 bg-surface-alt/50 dark:bg-surface-dark-alt/50">
        <RaceChart
          values={values}
          maxValue={maxValue}
          logScale={logScale}
          viewMode={viewMode}
          n={n}
          rangeValues={rangeValues}
        />
      </div>

      <Legend items={legendItems} />

      <ComplexityTable n={n} enabledIds={enabledIds} />

      <InfoPanel title="What is Big-O Notation?">
        <div className="flex flex-col gap-3">
          <p>
            <strong>Big-O notation</strong> describes how an algorithm's running time or space
            grows as the input size <em>n</em> increases. It captures the <strong>worst-case
            upper bound</strong>, ignoring constant factors.
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li><strong>O(1)</strong> -- Constant: doesn't depend on n at all (hash lookup).</li>
            <li><strong>O(log n)</strong> -- Logarithmic: halves the problem each step (binary search).</li>
            <li><strong>O(n)</strong> -- Linear: touches every element once (scanning a list).</li>
            <li><strong>O(n log n)</strong> -- Linearithmic: optimal comparison sorting (merge sort).</li>
            <li><strong>O(n^2)</strong> -- Quadratic: nested loops over the data (bubble sort).</li>
            <li><strong>O(2^n)</strong> -- Exponential: doubles with each added element (brute-force subsets).</li>
          </ul>
          <p>
            Try increasing <em>N</em> and watch how quickly the exponential class dwarfs everything else.
            Toggle <strong>Log Scale</strong> to see all classes on the same chart when values diverge wildly.
          </p>
        </div>
      </InfoPanel>
    </div>
  );
}
