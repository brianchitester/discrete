import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RECURRENCE_TEMPLATES,
  countNodes,
  countTotalWork,
  getDepth,
  type RecurrenceTemplate,
} from '../../lib/recursion';
import { useProgress } from '../../hooks/useProgress';
import Slider from '../shared/Slider';
import InfoPanel from '../shared/InfoPanel';
import RecurrenceTree from './RecurrenceTree';
import TreeStats from './TreeStats';

export default function RecursionPlayground() {
  const [templateId, setTemplateId] = useState(RECURRENCE_TEMPLATES[1].id); // default: merge sort
  const [nValue, setNValue] = useState(RECURRENCE_TEMPLATES[1].defaultN);
  const [exploredSet, setExploredSet] = useState<Set<string>>(new Set());

  const { markMilestone, recordVisit } = useProgress('recursion');

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const template: RecurrenceTemplate = useMemo(
    () => RECURRENCE_TEMPLATES.find((t) => t.id === templateId) ?? RECURRENCE_TEMPLATES[1],
    [templateId],
  );

  const tree = useMemo(() => template.build(nValue), [template, nValue]);
  const depth = useMemo(() => getDepth(tree), [tree]);
  const nodeCount = useMemo(() => countNodes(tree), [tree]);
  const totalWork = useMemo(() => countTotalWork(tree), [tree]);

  const handleTemplateChange = useCallback(
    (newId: string) => {
      const newTemplate = RECURRENCE_TEMPLATES.find((t) => t.id === newId);
      if (!newTemplate) return;

      setTemplateId(newId);
      setNValue(newTemplate.defaultN);

      // Track milestones
      const newExplored = new Set(exploredSet);
      newExplored.add(newId);
      setExploredSet(newExplored);

      if (newId === 'linear') markMilestone('explored-linear');
      if (newId === 'merge-sort') markMilestone('explored-divide-conquer');
      if (newId === 'binary-search') markMilestone('explored-binary-search');

      if (newExplored.size >= 3) {
        markMilestone('tried-all-templates');
      }
    },
    [exploredSet, markMilestone],
  );

  return (
    <div className="space-y-6">
      {/* Template selector tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {RECURRENCE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplateChange(t.id)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  templateId === t.id
                    ? 'bg-primary text-white'
                    : 'bg-surface-alt dark:bg-surface-dark-alt text-text-muted dark:text-text-dark-muted hover:bg-border/30 dark:hover:bg-border-dark/30 border border-border dark:border-border-dark'
                }
              `}
            >
              <span className="font-mono text-xs">{t.label}</span>
              <span className="ml-2 text-xs opacity-75">({t.description})</span>
            </button>
          ))}
        </div>

        {/* Slider for n */}
        <Slider
          label="n"
          min={1}
          max={template.maxN}
          value={nValue}
          onChange={setNValue}
        />
      </div>

      {/* Stats bar */}
      <TreeStats
        depth={depth}
        nodeCount={nodeCount}
        totalWork={totalWork}
        complexity={template.complexity}
      />

      {/* Tree visualization */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
          Recursion Tree for {template.label} with n={nValue}
        </h3>
        <div className="p-3 rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt">
          <RecurrenceTree root={tree} />
        </div>
        <p className="text-xs text-text-muted dark:text-text-dark-muted">
          Each node shows its subproblem size. Colors denote levels. Left labels show level number; right labels show total work at that level.
        </p>
      </div>

      {/* Educational info panels */}
      <div className="space-y-3">
        <InfoPanel title="Divide & Conquer = Logarithmic Levels" defaultOpen>
          <p className="mb-2">
            When you split the problem in <strong>half</strong> each time, the tree depth
            is <strong>log(n)</strong>. That&apos;s why binary search is O(log n) and merge
            sort only has log(n) levels.
          </p>
          <p>
            Compare the linear template T(n)=T(n&minus;1)+1 which shrinks by 1 each step and
            creates <strong>n levels</strong> &mdash; versus T(n)=T(n/2)+1 which halves each
            step and creates only <strong>log(n) levels</strong>.
          </p>
        </InfoPanel>
        <InfoPanel title="Node Count Explains Time Complexity">
          <p className="mb-2">
            Total work = sum of work at <em>every</em> node. For <strong>merge sort</strong>,
            each level does O(n) total work across all its nodes, and there are log(n) levels,
            giving <strong>O(n log n)</strong>.
          </p>
          <p>
            For <strong>linear recursion</strong>, each of the n nodes does O(1) work,
            totaling <strong>O(n)</strong>. The tree shape directly reveals the complexity.
          </p>
        </InfoPanel>
        <InfoPanel title="Linear vs Logarithmic Branching">
          <p className="mb-2">
            T(n&minus;1) shrinks by 1 each step &rarr; <strong>n levels</strong> deep.
            T(n/2) shrinks by half each step &rarr; <strong>log(n) levels</strong> deep.
          </p>
          <p className="mb-2">
            This is the core difference between O(n) and O(log n) algorithms. Slide <em>n</em> up
            and notice how the linear tree grows proportionally, while the binary search tree
            barely grows at all.
          </p>
          <p>
            When a problem <strong>branches</strong> (like merge sort with 2 children per node),
            total nodes multiply per level. But if each level still does O(n) combined work,
            the result is O(n log n) &mdash; not O(n&sup2;).
          </p>
        </InfoPanel>
      </div>
    </div>
  );
}
