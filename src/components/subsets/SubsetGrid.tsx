import { useState } from 'react';
import type { SubsetElement, SubsetInfo } from '../../lib/subsets';

interface Props {
  subsets: SubsetInfo[];
  activeElements: SubsetElement[];
  totalCount: number;
  sizeFilter: number | null;
  onHover: (mask: number | null) => void;
}

export default function SubsetGrid({
  subsets,
  activeElements,
  totalCount,
  sizeFilter,
  onHover,
}: Props) {
  const [hoveredMask, setHoveredMask] = useState<number | null>(null);

  const filtered =
    sizeFilter !== null
      ? subsets.filter((s) => s.size === sizeFilter)
      : subsets;

  const isOverflow = filtered.length < totalCount && sizeFilter === null;
  const filteredCount =
    sizeFilter !== null
      ? subsets.filter((s) => s.size === sizeFilter).length
      : totalCount;

  const handleHover = (mask: number | null) => {
    setHoveredMask(mask);
    onHover(mask);
  };

  if (activeElements.length === 0) {
    return (
      <div className="p-6 text-center text-text-muted dark:text-text-dark-muted rounded-lg border border-dashed border-border dark:border-border-dark">
        <p className="text-lg">Add elements above to see their subsets</p>
        <p className="text-sm mt-1">Each element you add doubles the number of subsets</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isOverflow && (
        <div className="text-xs text-text-muted dark:text-text-dark-muted bg-surface-alt dark:bg-surface-dark-alt rounded px-3 py-1.5">
          Showing {filtered.length.toLocaleString()} of{' '}
          {totalCount.toLocaleString()} subsets
        </div>
      )}
      {sizeFilter !== null && (
        <div className="text-xs text-text-muted dark:text-text-dark-muted bg-surface-alt dark:bg-surface-dark-alt rounded px-3 py-1.5">
          Showing subsets of size {sizeFilter} ({filteredCount.toLocaleString()}{' '}
          total)
        </div>
      )}

      {/* Tooltip */}
      {hoveredMask !== null && (
        <div className="text-xs font-medium px-3 py-1.5 rounded bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light">
          {'{ '}
          {subsets
            .find((s) => s.mask === hoveredMask)
            ?.elements.map((e) => `${e.emoji} ${e.label}`)
            .join(', ') || '∅ empty set'}
          {' }'}
        </div>
      )}

      {/* Grid of dot-rows */}
      <div
        className="grid gap-px overflow-y-auto max-h-80 p-2 rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${activeElements.length * 18 + 16}px, 1fr))`,
        }}
      >
        {filtered.map((subset) => (
          <button
            key={subset.mask}
            className={`
              flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors
              ${hoveredMask === subset.mask
                ? 'bg-primary/15 dark:bg-primary-light/15'
                : 'hover:bg-border/20 dark:hover:bg-border-dark/20'
              }
            `}
            onPointerEnter={() => handleHover(subset.mask)}
            onPointerLeave={() => handleHover(null)}
          >
            {activeElements.map((el) => {
              const included = subset.elements.some((e) => e.id === el.id);
              return (
                <span
                  key={el.id}
                  className={`inline-block w-3 h-3 rounded-full border transition-colors ${
                    included
                      ? 'bg-primary dark:bg-primary-light border-primary dark:border-primary-light'
                      : 'border-border dark:border-border-dark bg-transparent'
                  }`}
                />
              );
            })}
          </button>
        ))}
      </div>
    </div>
  );
}
