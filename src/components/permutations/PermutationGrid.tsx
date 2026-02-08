import { useState } from 'react';
import type { RuneElement, PermutationInfo } from '../../lib/permutations';
import { arrangementsEqual } from '../../lib/permutations';

interface Props {
  permutations: PermutationInfo[];
  currentArrangement: RuneElement[];
  totalCount: number;
}

export default function PermutationGrid({
  permutations,
  currentArrangement,
  totalCount,
}: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isOverflow = permutations.length < totalCount;

  if (currentArrangement.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {isOverflow && (
        <div className="text-xs text-text-muted dark:text-text-dark-muted bg-surface-alt dark:bg-surface-dark-alt rounded px-3 py-1.5">
          Showing {permutations.length.toLocaleString()} of{' '}
          {totalCount.toLocaleString()} permutations (sampled)
        </div>
      )}

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="text-xs font-medium px-3 py-1.5 rounded bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light">
          #{hoveredIndex + 1}:{' '}
          {permutations
            .find((p) => p.index === hoveredIndex)
            ?.arrangement.map((e) => `${e.emoji} ${e.label}`)
            .join(' → ') ?? ''}
        </div>
      )}

      <div
        className="grid gap-px overflow-y-auto max-h-80 p-2 rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${currentArrangement.length * 28 + 16}px, 1fr))`,
        }}
      >
        {permutations.map((perm) => {
          const isCurrent = arrangementsEqual(perm.arrangement, currentArrangement);
          const isHovered = hoveredIndex === perm.index;
          return (
            <button
              key={perm.index}
              className={`
                flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors
                ${isCurrent
                  ? 'bg-primary/15 dark:bg-primary-light/15 ring-1 ring-primary/40 dark:ring-primary-light/40'
                  : isHovered
                    ? 'bg-border/30 dark:bg-border-dark/30'
                    : 'hover:bg-border/20 dark:hover:bg-border-dark/20'
                }
              `}
              onPointerEnter={() => setHoveredIndex(perm.index)}
              onPointerLeave={() => setHoveredIndex(null)}
            >
              {perm.arrangement.map((el, i) => (
                <span key={`${el.id}-${i}`} className="text-sm leading-none">
                  {el.emoji}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
