import type { BucketState } from '../../lib/hashing';

const ITEM_COLORS = [
  '#6366f1', '#3b82f6', '#22c55e', '#eab308', '#f97316',
  '#ef4444', '#a855f7', '#ec4899', '#14b8a6', '#84cc16',
];

function colorForItem(item: string): string {
  let hash = 0;
  for (let i = 0; i < item.length; i++) {
    hash = ((hash << 5) - hash + item.charCodeAt(i)) | 0;
  }
  return ITEM_COLORS[Math.abs(hash) % ITEM_COLORS.length];
}

interface Props {
  buckets: BucketState[];
  highlightBucket: number | null;
}

export default function BucketVisualizer({ buckets, highlightBucket }: Props) {
  const maxHeight = Math.max(4, ...buckets.map(b => b.items.length));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1.5 min-w-0" style={{ minWidth: buckets.length * 56 }}>
        {buckets.map((bucket, idx) => {
          const hasCollision = bucket.items.length > 1;
          const isEmpty = bucket.items.length === 0;
          const isHighlighted = highlightBucket === idx;

          return (
            <div
              key={idx}
              className="flex flex-col items-center flex-shrink-0"
              style={{ width: 52 }}
            >
              {/* Bucket column */}
              <div
                className={`
                  relative w-full rounded-t-md border-2 transition-all
                  flex flex-col-reverse items-center gap-0.5 p-0.5
                  ${hasCollision
                    ? 'border-accent-red dark:border-accent-red bg-accent-red/5'
                    : isEmpty
                      ? 'border-border/50 dark:border-border-dark/50 bg-surface-alt/50 dark:bg-surface-dark-alt/50'
                      : 'border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt'
                  }
                  ${isHighlighted ? 'ring-2 ring-primary ring-offset-1' : ''}
                `}
                style={{ minHeight: maxHeight * 28 + 8 }}
              >
                {bucket.items.map((item) => (
                  <div
                    key={item}
                    className="w-full rounded text-[10px] font-medium text-white text-center truncate px-1 py-1 leading-tight"
                    style={{ backgroundColor: colorForItem(item) }}
                    title={item}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Bucket index header */}
              <div
                className={`
                  w-full text-center text-xs font-mono py-0.5 rounded-b-md border-2 border-t-0 transition-colors
                  ${hasCollision
                    ? 'border-accent-red dark:border-accent-red bg-accent-red/10 text-accent-red font-bold'
                    : isEmpty
                      ? 'border-border/50 dark:border-border-dark/50 text-text-muted/50 dark:text-text-dark-muted/50'
                      : 'border-border dark:border-border-dark text-text-muted dark:text-text-dark-muted'
                  }
                `}
              >
                {idx}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
