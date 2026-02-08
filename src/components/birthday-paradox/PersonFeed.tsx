import { useEffect, useRef } from 'react';
import { dayToDate, dayToHex, DAYS_IN_YEAR } from '../../lib/birthday';

interface Props {
  birthdays: number[];
  visibleCount: number;
  firstCollisionIndex: number | null;
  collidingWithIndex: number | null;
  collidingDay: number | null;
  days: number;
  mode: 'calendar' | 'hash';
}

export default function PersonFeed({
  birthdays,
  visibleCount,
  firstCollisionIndex,
  collidingWithIndex,
  collidingDay,
  days,
  mode,
}: Props) {
  const feedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new people are added
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const formatDay = (day: number): string => {
    if (mode === 'calendar' && days === DAYS_IN_YEAR) {
      return dayToDate(day);
    }
    if (days <= 256) {
      return dayToHex(day);
    }
    return `#${day.toLocaleString()}`;
  };

  const visible = birthdays.slice(0, visibleCount);

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
        People ({visibleCount} of {birthdays.length})
      </h3>
      <div
        ref={feedRef}
        className="max-h-[260px] overflow-y-auto rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt p-2 space-y-0.5"
      >
        {visible.length === 0 && (
          <p className="text-xs text-text-muted dark:text-text-dark-muted text-center py-4">
            Click &ldquo;Simulate&rdquo; to add people...
          </p>
        )}
        {visible.map((day, i) => {
          const isCollisionPerson = firstCollisionIndex !== null && i === firstCollisionIndex;
          const isOriginalPerson = collidingWithIndex !== null && i === collidingWithIndex && firstCollisionIndex !== null && visibleCount > firstCollisionIndex;

          return (
            <div
              key={i}
              className={`
                flex items-center gap-2 px-2 py-1 rounded text-xs transition-all duration-200
                ${isCollisionPerson
                  ? 'bg-accent-red/15 border border-accent-red/40 font-semibold'
                  : isOriginalPerson
                    ? 'bg-accent-yellow/15 border border-accent-yellow/40'
                    : 'hover:bg-border/20 dark:hover:bg-border-dark/20'
                }
              `}
            >
              <span className="w-6 text-right font-mono text-text-muted dark:text-text-dark-muted shrink-0">
                {i + 1}
              </span>
              <span className={`font-mono ${isCollisionPerson ? 'text-accent-red' : isOriginalPerson ? 'text-accent-yellow' : ''}`}>
                {formatDay(day)}
              </span>
              {isCollisionPerson && collidingWithIndex !== null && (
                <span className="ml-auto text-accent-red text-[10px] font-bold uppercase tracking-wide">
                  Collision with #{collidingWithIndex + 1}!
                </span>
              )}
              {isOriginalPerson && (
                <span className="ml-auto text-accent-yellow text-[10px] font-medium">
                  (matches #{firstCollisionIndex! + 1})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
