import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { quadraticGrowthData } from '../../lib/pairs';

interface Props {
  currentN: number;
  maxN?: number;
}

export default function GrowthChart({ currentN, maxN = 20 }: Props) {
  const data = useMemo(() => quadraticGrowthData(maxN), [maxN]);

  const maxPairs = useMemo(
    () => Math.max(...data.map((d) => d.pairs), 1),
    [data]
  );

  const heightScale = useMemo(
    () => scaleLinear().domain([0, maxPairs]).range([0, 100]),
    [maxPairs]
  );

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
        Growth of C(n, 2) — quadratic curve
      </h3>
      <div className="flex items-end gap-px h-40 px-1">
        {data.map((point) => {
          const h = heightScale(point.pairs);
          const isCurrent = point.n === currentN;
          const isPast = point.n < currentN;
          return (
            <div
              key={point.n}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                <div className="bg-surface-dark dark:bg-surface text-text-dark dark:text-text text-xs font-mono px-2 py-1 rounded shadow whitespace-nowrap">
                  n={point.n}, pairs={point.pairs}
                </div>
              </div>
              {/* Bar */}
              <div
                className={`
                  w-full rounded-t transition-all
                  ${isCurrent
                    ? 'bg-primary dark:bg-primary-light'
                    : isPast
                      ? 'bg-primary/50 dark:bg-primary-light/50'
                      : 'bg-border dark:bg-border-dark'
                  }
                `}
                style={{ height: `${Math.max(h, 0.5)}%` }}
              />
              {/* Label (show every 5th or current) */}
              {(point.n % 5 === 0 || isCurrent) && (
                <span
                  className={`
                    text-[10px] mt-1 tabular-nums
                    ${isCurrent
                      ? 'text-primary dark:text-primary-light font-bold'
                      : 'text-text-muted dark:text-text-dark-muted'
                    }
                  `}
                >
                  {point.n}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-text-muted dark:text-text-dark-muted px-1">
        <span>n (participants)</span>
        <span>
          C({currentN}, 2) = {((currentN * (currentN - 1)) / 2).toLocaleString()} pairs
        </span>
      </div>
    </div>
  );
}
