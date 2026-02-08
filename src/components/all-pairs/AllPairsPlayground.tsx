import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  NODE_POOL,
  SCENARIOS,
  pairCount,
  generateAllPairs,
  type PairNode,
} from '../../lib/pairs';
import { useProgress } from '../../hooks/useProgress';
import NodePool from './NodePool';
import PairCounter from './PairCounter';
import PairNetwork from './PairNetwork';
import GrowthChart from './GrowthChart';
import InfoPanel from '../shared/InfoPanel';

export default function AllPairsPlayground() {
  const [activeIds, setActiveIds] = useState<Set<number>>(new Set());
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const prevCountRef = useRef(0);

  const { markMilestone, recordVisit } = useProgress('all-pairs');

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId]
  );

  const activeNodes = useMemo(
    () => NODE_POOL.filter((node) => activeIds.has(node.id)),
    [activeIds]
  );

  const n = activeNodes.length;
  const total = pairCount(n);

  const pairs = useMemo(() => generateAllPairs(activeNodes), [activeNodes]);

  const handleToggle = useCallback((node: PairNode) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      return next;
    });
  }, []);

  // Milestone tracking
  useEffect(() => {
    if (n === 0) {
      prevCountRef.current = 0;
      return;
    }

    if (n >= 2 && prevCountRef.current < 2) {
      markMilestone('added-first-pair');
    }

    if (n >= 5 && prevCountRef.current >= 4) {
      markMilestone('saw-quadratic-jump');
    }

    if (n >= 10) {
      markMilestone('reached-n-10');
    }

    prevCountRef.current = n;
  }, [n, markMilestone]);

  const handleScenarioChange = useCallback(
    (id: string) => {
      setScenarioId(id);
      markMilestone('toggled-scenario');
    },
    [markMilestone]
  );

  const handleReset = useCallback(() => {
    setActiveIds(new Set());
  }, []);

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
          Scenario
        </h3>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleScenarioChange(s.id)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${s.id === scenarioId
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt hover:bg-border/30 dark:hover:bg-border-dark/30 text-text dark:text-text-dark'
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-text-muted dark:text-text-dark-muted">
          {scenario.description}
        </p>
      </div>

      {/* Node Pool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
            {scenario.nodeNoun} — click to add or remove ({n} of {NODE_POOL.length} active)
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
        <NodePool
          pool={NODE_POOL}
          activeIds={activeIds}
          onToggle={handleToggle}
        />
      </div>

      {/* Counter */}
      <PairCounter n={n} total={total} pairNoun={scenario.pairNoun} />

      {/* Network Visualization */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
          All {scenario.pairNoun} — {total.toLocaleString()} connection{total !== 1 ? 's' : ''}
        </h3>
        <div className="border border-border dark:border-border-dark rounded-lg p-4 bg-surface-alt dark:bg-surface-dark-alt">
          <PairNetwork activeNodes={activeNodes} pairs={pairs} />
        </div>
      </div>

      {/* Growth Chart */}
      {n > 0 && <GrowthChart currentN={n} />}

      {/* Info Panels */}
      <div className="space-y-3">
        <InfoPanel title="Why does each new participant add so many pairs?">
          <p>
            When a new person joins a group of <em>n</em>, they must shake hands
            with each of the existing <em>n</em> people — that's <em>n</em> new
            handshakes in one go. The total count goes from C(<em>n</em>, 2) to
            C(<em>n</em>+1, 2) = C(<em>n</em>, 2) + <em>n</em>.
          </p>
          <p className="mt-2">
            Try it: with 4 people you have 6 handshakes. Add a 5th and the count
            jumps to 10 — four new connections appeared at once. At 10 people
            you're already at 45 pairs. At 20 it's 190.
          </p>
        </InfoPanel>
        <InfoPanel title="Quadratic growth in the real world">
          <p>
            Any algorithm that checks <strong>all pairs</strong> runs in
            O(n<sup>2</sup>) time. This appears everywhere: naive duplicate
            detection, the brute-force closest-pair problem, round-robin
            tournaments, and comparing every record against every other in a
            database join.
          </p>
          <p className="mt-2">
            The exact count is <em>n</em>(<em>n</em>&minus;1)/2, which is
            roughly n<sup>2</sup>/2. The "divided by 2" feels helpful at first,
            but it's a constant factor — it doesn't change the growth rate. Double
            the input, quadruple the work.
          </p>
        </InfoPanel>
        <InfoPanel title="From pairs to combinations">
          <p>
            C(<em>n</em>, 2) is the number of ways to <strong>choose 2</strong>{' '}
            items from <em>n</em>. It's a special case of the binomial
            coefficient C(<em>n</em>, <em>k</em>) = <em>n</em>! / (<em>k</em>!
            (<em>n</em>&minus;<em>k</em>)!). For k=2, the formula simplifies to
            the elegant <em>n</em>(<em>n</em>&minus;1)/2.
          </p>
          <p className="mt-2">
            The Subsets concept explores C(<em>n</em>, <em>k</em>) for all k
            values. Here we focus on k=2, where the quadratic growth is the star
            of the show.
          </p>
        </InfoPanel>
      </div>
    </div>
  );
}
