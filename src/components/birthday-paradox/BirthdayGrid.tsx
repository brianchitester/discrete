import { MONTH_DAYS, MONTH_NAMES, DAYS_IN_YEAR } from '../../lib/birthday';

interface Props {
  days: number;
  occupied: Set<number>;
  collisionDay: number | null;
  showCelebration: boolean;
  mode: 'calendar' | 'hash';
}

// ── Calendar Grid (365 days as 12 month rows) ───────────────────────────────

function CalendarGrid({ occupied, collisionDay, showCelebration }: {
  occupied: Set<number>;
  collisionDay: number | null;
  showCelebration: boolean;
}) {
  let dayOffset = 0;

  return (
    <div className="space-y-1">
      {MONTH_NAMES.map((month, mi) => {
        const startDay = dayOffset;
        const count = MONTH_DAYS[mi];
        dayOffset += count;

        return (
          <div key={month} className="flex items-center gap-1">
            <span className="w-8 text-[10px] font-mono text-text-muted dark:text-text-dark-muted shrink-0">
              {month}
            </span>
            <div className="flex gap-[2px] flex-wrap">
              {Array.from({ length: count }, (_, d) => {
                const dayNum = startDay + d;
                const isOccupied = occupied.has(dayNum);
                const isCollision = collisionDay === dayNum;

                return (
                  <div
                    key={dayNum}
                    title={`${month} ${d + 1} (Day ${dayNum + 1})`}
                    className={`
                      w-[9px] h-[9px] rounded-[2px] transition-all duration-150
                      ${isCollision && showCelebration
                        ? 'bg-accent-red ring-2 ring-accent-red ring-offset-1 scale-150 z-10'
                        : isCollision
                          ? 'bg-accent-red'
                          : isOccupied
                            ? 'bg-primary'
                            : 'bg-border/40 dark:bg-border-dark/60'
                      }
                    `}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Small Hash Grid (for spaces <= 256) ──────────────────────────────────────

function SmallHashGrid({ days, occupied, collisionDay, showCelebration }: {
  days: number;
  occupied: Set<number>;
  collisionDay: number | null;
  showCelebration: boolean;
}) {
  const cols = Math.min(32, Math.ceil(Math.sqrt(days)));

  return (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: days }, (_, i) => {
        const isOccupied = occupied.has(i);
        const isCollision = collisionDay === i;

        return (
          <div
            key={i}
            title={`Slot ${i} (0x${i.toString(16).toUpperCase()})`}
            className={`
              aspect-square rounded-[2px] transition-all duration-150 min-w-[4px]
              ${isCollision && showCelebration
                ? 'bg-accent-red ring-2 ring-accent-red scale-125 z-10'
                : isCollision
                  ? 'bg-accent-red'
                  : isOccupied
                    ? 'bg-primary'
                    : 'bg-border/30 dark:bg-border-dark/50'
              }
            `}
          />
        );
      })}
    </div>
  );
}

// ── Large Hash Meter (for spaces > 256) ──────────────────────────────────────

function LargeHashMeter({ days, occupied, collisionDay, showCelebration }: {
  days: number;
  occupied: Set<number>;
  collisionDay: number | null;
  showCelebration: boolean;
}) {
  const fillPct = Math.min(100, (occupied.size / days) * 100);
  const hasCollision = collisionDay !== null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-dark-muted">
        <span>Hash space: {days.toLocaleString()} slots</span>
        <span>{occupied.size.toLocaleString()} occupied ({fillPct < 0.01 && occupied.size > 0 ? '<0.01' : fillPct.toFixed(2)}%)</span>
      </div>
      <div className="relative w-full h-8 bg-surface-alt dark:bg-surface-dark-alt rounded-lg border border-border dark:border-border-dark overflow-hidden">
        <div
          className={`
            h-full rounded-lg transition-all duration-300
            ${hasCollision ? 'bg-accent-red' : 'bg-primary'}
          `}
          style={{ width: `${Math.max(fillPct, occupied.size > 0 ? 1 : 0)}%` }}
        />
        {hasCollision && showCelebration && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-accent-red/90 px-3 py-1 rounded-full animate-pulse">
              COLLISION!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function BirthdayGrid({ days, occupied, collisionDay, showCelebration, mode }: Props) {
  if (mode === 'calendar' && days === DAYS_IN_YEAR) {
    return (
      <CalendarGrid
        occupied={occupied}
        collisionDay={collisionDay}
        showCelebration={showCelebration}
      />
    );
  }

  if (days <= 256) {
    return (
      <SmallHashGrid
        days={days}
        occupied={occupied}
        collisionDay={collisionDay}
        showCelebration={showCelebration}
      />
    );
  }

  return (
    <LargeHashMeter
      days={days}
      occupied={occupied}
      collisionDay={collisionDay}
      showCelebration={showCelebration}
    />
  );
}
