import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { growthComparison } from '../../lib/permutations';

interface Props {
  n: number;
}

export default function GrowthComparisonChart({ n }: Props) {
  const data = useMemo(() => growthComparison(n), [n]);

  const maxVal = useMemo(
    () => Math.max(data.factorial, data.power2, data.combinations, 1),
    [data]
  );

  const widthScale = useMemo(
    () => scaleLinear().domain([0, maxVal]).range([0, 100]),
    [maxVal]
  );

  if (n < 2) return null;

  const bars = [
    {
      label: `${n}!`,
      value: data.factorial,
      color: 'bg-primary dark:bg-primary-light',
    },
    {
      label: `2^${n}`,
      value: data.power2,
      color: 'bg-blue-500 dark:bg-blue-400',
    },
    {
      label: `C(${n},2)`,
      value: data.combinations,
      color: 'bg-purple-500 dark:bg-purple-400',
    },
  ];

  const ratio = data.factorial > data.power2
    ? Math.round(data.factorial / data.power2)
    : 0;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
        Growth Comparison
      </h3>
      <div className="space-y-1.5">
        {bars.map((bar) => {
          const pct = widthScale(bar.value);
          return (
            <div key={bar.label} className="flex items-center gap-2">
              <span className="text-xs font-mono w-14 text-right text-text-muted dark:text-text-dark-muted shrink-0">
                {bar.label}
              </span>
              <div className="flex-1 h-5 relative">
                <div
                  className={`h-full rounded transition-all ${bar.color}`}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
              <span className="text-xs font-mono w-20 text-right tabular-nums text-text-muted dark:text-text-dark-muted shrink-0">
                {bar.value > 1e9
                  ? bar.value.toExponential(1)
                  : bar.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
      {ratio > 1 && n >= 4 && (
        <p className="text-xs text-text-muted dark:text-text-dark-muted">
          Factorial is <strong className="text-primary dark:text-primary-light">{ratio}×</strong> larger
          than exponential at n={n}
        </p>
      )}
    </div>
  );
}
