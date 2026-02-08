import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DAYS_IN_YEAR,
  HASH_PRESETS,
  generateRoom,
  runMonteCarloAsync,
  birthdayBound,
  type RoomResult,
  type MonteCarloResult,
  type HashPreset,
} from '../../lib/birthday';
import { useProgress } from '../../hooks/useProgress';
import Slider from '../shared/Slider';
import InfoPanel from '../shared/InfoPanel';
import BirthdayGrid from './BirthdayGrid';
import ProbabilityPanel from './ProbabilityPanel';
import PersonFeed from './PersonFeed';

type Mode = 'calendar' | 'hash';

const SPEED_OPTIONS = [
  { label: 'Slow', ms: 200 },
  { label: 'Normal', ms: 80 },
  { label: 'Fast', ms: 30 },
  { label: 'Instant', ms: 0 },
];

export default function BirthdayPlayground() {
  // ── Mode & params ──────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('calendar');
  const [roomSize, setRoomSize] = useState(23);
  const [hashPreset, setHashPreset] = useState<HashPreset>(HASH_PRESETS[0]);
  const [speed, setSpeed] = useState(80);

  // ── Simulation state ───────────────────────────────────────────────────────
  const [room, setRoom] = useState<RoomResult | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  // ── Monte Carlo ────────────────────────────────────────────────────────────
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [mcProgress, setMcProgress] = useState<{ done: number; total: number } | null>(null);
  const [isRunningMC, setIsRunningMC] = useState(false);

  // ── Progress tracking ──────────────────────────────────────────────────────
  const { markMilestone, recordVisit } = useProgress('birthday-paradox');

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const n = mode === 'calendar' ? DAYS_IN_YEAR : hashPreset.space;
  const maxK = mode === 'calendar' ? 100 : Math.min(1000, Math.ceil(birthdayBound(n) * 3));

  // ── Occupied set for grid (derived from visible portion) ───────────────────
  const occupied = new Set<number>();
  if (room) {
    for (let i = 0; i < visibleCount; i++) {
      occupied.add(room.birthdays[i]);
    }
  }

  const collisionVisible = room?.firstCollisionIndex !== null
    && room?.firstCollisionIndex !== undefined
    && visibleCount > room.firstCollisionIndex;

  // ── Cleanup helper ─────────────────────────────────────────────────────────
  const stopSimulation = useCallback(() => {
    cancelledRef.current = true;
    if (simulationRef.current !== null) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  // ── Run simulation ─────────────────────────────────────────────────────────
  const handleSimulate = useCallback(() => {
    stopSimulation();
    setShowCelebration(false);
    setMcResult(null);
    setMcProgress(null);

    const result = generateRoom(roomSize, n);
    setRoom(result);
    setVisibleCount(0);
    cancelledRef.current = false;

    if (speed === 0) {
      // Instant mode
      setVisibleCount(roomSize);
      if (result.firstCollisionIndex !== null) {
        setShowCelebration(true);
        markMilestone('first-collision');
        // Check "surprised by 23" milestone
        if (roomSize >= 22 && roomSize <= 24 && n === DAYS_IN_YEAR) {
          markMilestone('surprised-by-23');
        }
        setTimeout(() => setShowCelebration(false), 2000);
      }
      return;
    }

    // Animated: reveal one person at a time
    setIsSimulating(true);
    let count = 0;

    simulationRef.current = setInterval(() => {
      if (cancelledRef.current) return;

      count++;
      setVisibleCount(count);

      // Check for collision moment
      if (
        result.firstCollisionIndex !== null &&
        count === result.firstCollisionIndex + 1
      ) {
        setShowCelebration(true);
        markMilestone('first-collision');
        if (roomSize >= 22 && roomSize <= 24 && n === DAYS_IN_YEAR) {
          markMilestone('surprised-by-23');
        }
        setTimeout(() => setShowCelebration(false), 2000);
      }

      if (count >= roomSize) {
        stopSimulation();
      }
    }, speed);
  }, [roomSize, n, speed, stopSimulation, markMilestone]);

  // ── Monte Carlo ────────────────────────────────────────────────────────────
  const handleMonteCarlo = useCallback(() => {
    if (isRunningMC) return;
    setIsRunningMC(true);
    setMcProgress({ done: 0, total: 10_000 });

    runMonteCarloAsync(
      roomSize,
      n,
      10_000,
      1000,
      (done, total) => setMcProgress({ done, total }),
    ).then((result) => {
      setMcResult(result);
      setIsRunningMC(false);
      setMcProgress(null);
      markMilestone('tried-monte-carlo');
      // Check "surprised by 23" milestone via MC
      if (
        roomSize >= 22 && roomSize <= 24 &&
        n === DAYS_IN_YEAR &&
        result.collisionRate >= 0.45
      ) {
        markMilestone('surprised-by-23');
      }
    });
  }, [roomSize, n, isRunningMC, markMilestone]);

  // ── Mode switch ────────────────────────────────────────────────────────────
  const handleModeChange = useCallback((newMode: Mode) => {
    stopSimulation();
    setMode(newMode);
    setRoom(null);
    setVisibleCount(0);
    setMcResult(null);
    setMcProgress(null);
    setShowCelebration(false);
    if (newMode === 'hash') {
      markMilestone('tried-hash-mode');
      setRoomSize(Math.min(roomSize, 1000));
    } else {
      setRoomSize(Math.min(roomSize, 100));
    }
  }, [stopSimulation, markMilestone, roomSize]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (simulationRef.current !== null) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Mode toggle + controls */}
      <div className="flex flex-col gap-4">
        {/* Mode tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('calendar')}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${mode === 'calendar'
                ? 'bg-primary text-white'
                : 'bg-surface-alt dark:bg-surface-dark-alt text-text-muted dark:text-text-dark-muted hover:bg-border/30 dark:hover:bg-border-dark/30 border border-border dark:border-border-dark'
              }
            `}
          >
            Calendar Year (365 days)
          </button>
          <button
            onClick={() => handleModeChange('hash')}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${mode === 'hash'
                ? 'bg-primary text-white'
                : 'bg-surface-alt dark:bg-surface-dark-alt text-text-muted dark:text-text-dark-muted hover:bg-border/30 dark:hover:bg-border-dark/30 border border-border dark:border-border-dark'
              }
            `}
          >
            Hash Bits
          </button>
        </div>

        {/* Hash preset selector */}
        {mode === 'hash' && (
          <div className="flex flex-wrap gap-2">
            {HASH_PRESETS.map((preset) => (
              <button
                key={preset.bits}
                onClick={() => {
                  setHashPreset(preset);
                  stopSimulation();
                  setRoom(null);
                  setVisibleCount(0);
                  setMcResult(null);
                  setShowCelebration(false);
                  setRoomSize(Math.min(roomSize, Math.min(1000, Math.ceil(birthdayBound(preset.space) * 3))));
                }}
                className={`
                  px-3 py-1 text-xs font-mono rounded-md transition-colors
                  ${hashPreset.bits === preset.bits
                    ? 'bg-accent-purple text-white'
                    : 'bg-surface-alt dark:bg-surface-dark-alt border border-border dark:border-border-dark hover:bg-border/30 dark:hover:bg-border-dark/30'
                  }
                `}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Controls row */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <Slider
              label="Room size (k)"
              min={1}
              max={maxK}
              value={roomSize}
              onChange={(v) => {
                setRoomSize(v);
                // Don't auto-reset sim on slider change -- user clicks Simulate
              }}
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1 text-sm text-text-muted dark:text-text-dark-muted">
              Speed:
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-surface-alt dark:bg-surface-dark-alt border border-border dark:border-border-dark rounded px-1 py-0.5 text-sm"
              >
                {SPEED_OPTIONS.map((opt) => (
                  <option key={opt.ms} value={opt.ms}>{opt.label}</option>
                ))}
              </select>
            </label>
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSimulating ? 'Simulating...' : 'Simulate'}
            </button>
            <button
              onClick={() => {
                stopSimulation();
                setRoom(null);
                setVisibleCount(0);
                setMcResult(null);
                setMcProgress(null);
                setShowCelebration(false);
              }}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border dark:border-border-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Collision banner */}
      {collisionVisible && room && room.collidingDay !== null && (
        <div
          className={`
            rounded-lg px-4 py-3 text-sm font-medium text-center transition-all
            ${showCelebration
              ? 'bg-accent-red/20 border-2 border-accent-red text-accent-red animate-pulse'
              : 'bg-accent-red/10 border border-accent-red/40 text-accent-red'
            }
          `}
        >
          Collision! Person #{room.firstCollisionIndex! + 1} and
          Person #{room.collidingWithIndex! + 1} share the same
          {mode === 'calendar' ? ' birthday' : ' hash value'} &mdash;
          only needed <strong>{room.firstCollisionIndex! + 1}</strong> people!
        </div>
      )}

      {/* Probability panel */}
      <ProbabilityPanel
        k={roomSize}
        n={n}
        monteCarloResult={mcResult}
        mcProgress={mcProgress}
        onRunMonteCarlo={handleMonteCarlo}
        isRunningMC={isRunningMC}
      />

      {/* Main area: Grid + Person Feed */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Birthday grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
            {mode === 'calendar' ? 'Calendar' : `Hash Space (${n.toLocaleString()} slots)`}
          </h3>
          <div className="p-3 rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt">
            <BirthdayGrid
              days={n}
              occupied={occupied}
              collisionDay={collisionVisible ? room!.collidingDay : null}
              showCelebration={showCelebration}
              mode={mode}
            />
          </div>
        </div>

        {/* Person feed */}
        <PersonFeed
          birthdays={room?.birthdays ?? []}
          visibleCount={visibleCount}
          firstCollisionIndex={room?.firstCollisionIndex ?? null}
          collidingWithIndex={room?.collidingWithIndex ?? null}
          collidingDay={room?.collidingDay ?? null}
          days={n}
          mode={mode}
        />
      </div>

      {/* Educational info panels */}
      <div className="space-y-3">
        <InfoPanel title="Why does this happen?" defaultOpen>
          <p className="mb-2">
            The <strong>Birthday Paradox</strong> shows that in a group of just 23 people,
            there&apos;s a &gt;50% chance two share a birthday. This feels wrong because we
            compare against one specific date, but the real question is whether <em>any</em> pair collides.
          </p>
          <p>
            With k people, there are k(k&minus;1)/2 pairs to check. At k=23, that&apos;s
            253 pairs &mdash; plenty of chances for a match among 365 days.
          </p>
        </InfoPanel>
        <InfoPanel title="Practical: Hashes, IDs & Distributed Systems">
          <p className="mb-2">
            The birthday paradox is why <strong>hash collisions</strong> happen sooner than expected.
            A 32-bit hash has ~4.3 billion values, but you only need ~77,000 items for a 50% collision chance.
          </p>
          <p className="mb-2">
            This matters for: UUID generation, database primary keys, content-addressable storage,
            hash tables, and any system that assumes &ldquo;random IDs won&apos;t collide.&rdquo;
          </p>
          <p>
            Switch to <strong>Hash Bits</strong> mode above to explore collision risk for different hash sizes!
          </p>
        </InfoPanel>
        <InfoPanel title="The Math">
          <p className="mb-2">
            The exact probability that k people all have <em>different</em> birthdays from n days:
          </p>
          <p className="font-mono text-sm bg-surface-alt dark:bg-surface-dark-alt rounded px-3 py-2 mb-2">
            P(no collision) = (n/n) &times; ((n&minus;1)/n) &times; ((n&minus;2)/n) &times; &hellip; &times; ((n&minus;k+1)/n)
          </p>
          <p className="mb-2">
            So P(at least one collision) = 1 &minus; P(no collision).
          </p>
          <p>
            The approximation &radic;(2n &middot; ln2) gives the threshold k where P crosses 50%.
            For n=365, that&apos;s &radic;(2 &times; 365 &times; 0.693) &asymp; 22.5 &mdash; rounding up to <strong>23</strong>.
          </p>
        </InfoPanel>
      </div>
    </div>
  );
}
