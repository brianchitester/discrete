import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';

interface Props {
  distribution: number[];
  n: number;
  activeFilter: number | null;
  onFilterChange: (k: number | null) => void;
}

export default function SizeDistributionChart({
  distribution,
  n,
  activeFilter,
  onFilterChange,
}: Props) {
  const maxVal = useMemo(
    () => Math.max(...distribution, 1),
    [distribution]
  );

  const widthScale = useMemo(
    () => scaleLinear().domain([0, maxVal]).range([0, 100]),
    [maxVal]
  );

  if (n === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
        Size Distribution — C(n, k)
      </h3>
      <div className="space-y-1">
        {distribution.map((count, k) => {
          const isActive = activeFilter === k;
          const pct = widthScale(count);
          return (
            <button
              key={k}
              onClick={() => onFilterChange(isActive ? null : k)}
              className={`
                w-full flex items-center gap-2 px-2 py-0.5 rounded transition-colors text-left
                ${isActive
                  ? 'bg-primary/10 dark:bg-primary-light/10'
                  : 'hover:bg-surface-alt dark:hover:bg-surface-dark-alt'
                }
              `}
            >
              <span className="text-xs font-mono w-8 text-right text-text-muted dark:text-text-dark-muted shrink-0">
                k={k}
              </span>
              <div className="flex-1 h-5 relative">
                <div
                  className={`h-full rounded transition-all ${
                    isActive
                      ? 'bg-primary dark:bg-primary-light'
                      : 'bg-primary/40 dark:bg-primary-light/40'
                  }`}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
              <span className="text-xs font-mono w-14 text-right tabular-nums text-text-muted dark:text-text-dark-muted shrink-0">
                {count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
