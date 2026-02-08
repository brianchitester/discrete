import type { HashMetrics } from '../../lib/hashing';

interface Props {
  metrics: HashMetrics;
}

export default function CollisionCounter({ metrics }: Props) {
  const { totalItems, collisions, maxBucketSize, emptyBuckets, bucketCount, loadFactor } = metrics;
  const goodDistribution = collisions === 0 && totalItems > 0;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      <StatBox label="Items" value={totalItems} />
      <StatBox
        label="Collisions"
        value={collisions}
        color={collisions > 0 ? 'text-accent-red' : undefined}
      />
      <StatBox label="Max Depth" value={maxBucketSize} />
      <StatBox label="Empty" value={emptyBuckets} />
      <StatBox
        label="Load"
        value={loadFactor.toFixed(2)}
      />
      <div
        className={`
          flex flex-col items-center justify-center rounded-lg border px-2 py-1.5
          ${goodDistribution
            ? 'border-accent-green/50 bg-accent-green/10 text-accent-green'
            : collisions > 0
              ? 'border-accent-red/50 bg-accent-red/10 text-accent-red'
              : 'border-border dark:border-border-dark text-text-muted dark:text-text-dark-muted'
          }
        `}
      >
        <span className="text-[10px] uppercase tracking-wide opacity-70">Spread</span>
        <span className="text-xs font-bold">
          {totalItems === 0 ? '--' : goodDistribution ? 'Perfect' : collisions > 2 ? 'Poor' : 'OK'}
        </span>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border dark:border-border-dark px-2 py-1.5">
      <span className="text-[10px] uppercase tracking-wide text-text-muted dark:text-text-dark-muted">
        {label}
      </span>
      <span className={`text-sm font-bold font-mono ${color ?? ''}`}>{value}</span>
    </div>
  );
}
