// ── Types ────────────────────────────────────────────────────────────────────

export interface RoomResult {
  birthdays: number[];
  firstCollisionIndex: number | null;
  collidingDay: number | null;
  collidingWithIndex: number | null;
}

export interface MonteCarloResult {
  collisionRate: number;
  avgFirstCollision: number;
  trials: number;
}

export interface HashPreset {
  label: string;
  bits: number;
  space: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const DAYS_IN_YEAR = 365;

export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const HASH_PRESETS: HashPreset[] = [
  { label: '2\u2078 (256)', bits: 8, space: 256 },
  { label: '2\u00B9\u2076 (65 536)', bits: 16, space: 65_536 },
  { label: '2\u00B3\u00B2 (~4.3B)', bits: 32, space: 4_294_967_296 },
  { label: '2\u2076\u2074', bits: 64, space: Number.MAX_SAFE_INTEGER }, // approximate for display
];

// ── Probability Math ─────────────────────────────────────────────────────────

/**
 * Exact probability of at least one collision when k items are placed
 * uniformly into n slots.
 *
 * P(collision) = 1 - Product_{i=0}^{k-1} (n - i) / n
 *
 * Uses log-space for large n to avoid floating-point underflow.
 */
export function exactCollisionProbability(k: number, n: number): number {
  if (k <= 1) return 0;
  if (k > n) return 1;

  // For small n, direct product is fine; for large n use logs
  if (n <= 100_000) {
    let pNoCollision = 1;
    for (let i = 0; i < k; i++) {
      pNoCollision *= (n - i) / n;
      if (pNoCollision <= 0) return 1; // underflow guard
    }
    return 1 - pNoCollision;
  }

  // Log-space computation for large n
  let logPNoCollision = 0;
  for (let i = 0; i < k; i++) {
    logPNoCollision += Math.log(1 - i / n);
  }
  return 1 - Math.exp(logPNoCollision);
}

/**
 * Approximate k needed for 50% collision probability.
 * k ≈ sqrt(2 * n * ln(2))
 */
export function birthdayBound(n: number): number {
  return Math.ceil(Math.sqrt(2 * n * Math.LN2));
}

// ── Day ↔ Date Helpers ───────────────────────────────────────────────────────

/**
 * Convert a day-of-year (0-based) to a month/day label.
 */
export function dayToDate(day: number): string {
  let remaining = day;
  for (let m = 0; m < 12; m++) {
    if (remaining < MONTH_DAYS[m]) {
      return `${MONTH_NAMES[m]} ${remaining + 1}`;
    }
    remaining -= MONTH_DAYS[m];
  }
  return `Day ${day + 1}`;
}

/**
 * Convert a day number to a hex string (for hash mode).
 */
export function dayToHex(day: number): string {
  return '0x' + day.toString(16).toUpperCase().padStart(4, '0');
}

// ── Room Simulation ──────────────────────────────────────────────────────────

/**
 * Generate a room of k people with random birthdays from n possible days.
 * Returns the list of birthdays and info about the first collision.
 */
export function generateRoom(k: number, n: number): RoomResult {
  const birthdays: number[] = [];
  const seen = new Map<number, number>(); // day -> first person index
  let firstCollisionIndex: number | null = null;
  let collidingDay: number | null = null;
  let collidingWithIndex: number | null = null;

  for (let i = 0; i < k; i++) {
    const day = Math.floor(Math.random() * n);
    birthdays.push(day);

    if (firstCollisionIndex === null && seen.has(day)) {
      firstCollisionIndex = i;
      collidingDay = day;
      collidingWithIndex = seen.get(day)!;
    }

    if (!seen.has(day)) {
      seen.set(day, i);
    }
  }

  return { birthdays, firstCollisionIndex, collidingDay, collidingWithIndex };
}

// ── Monte Carlo ──────────────────────────────────────────────────────────────

/**
 * Run a single trial: generate k random values in [0, n), return the index
 * of the first collision or -1 if none.
 */
function singleTrial(k: number, n: number): number {
  const seen = new Set<number>();
  for (let i = 0; i < k; i++) {
    const val = Math.floor(Math.random() * n);
    if (seen.has(val)) return i;
    seen.add(val);
  }
  return -1;
}

/**
 * Run Monte Carlo simulation: `trials` independent experiments.
 * Returns the fraction that had at least one collision, and the
 * average index of the first collision (among trials that collided).
 */
export function runMonteCarlo(k: number, n: number, trials: number = 10_000): MonteCarloResult {
  let collisions = 0;
  let totalFirstCollision = 0;

  for (let t = 0; t < trials; t++) {
    const idx = singleTrial(k, n);
    if (idx >= 0) {
      collisions++;
      totalFirstCollision += idx;
    }
  }

  return {
    collisionRate: collisions / trials,
    avgFirstCollision: collisions > 0 ? totalFirstCollision / collisions : k,
    trials,
  };
}

/**
 * Run Monte Carlo in batches, calling onProgress between batches.
 * Returns a promise that resolves with the final result.
 * This keeps the UI responsive for large trial counts.
 */
export function runMonteCarloAsync(
  k: number,
  n: number,
  trials: number,
  batchSize: number,
  onProgress: (done: number, total: number) => void,
): Promise<MonteCarloResult> {
  return new Promise((resolve) => {
    let collisions = 0;
    let totalFirstCollision = 0;
    let done = 0;

    function runBatch() {
      const end = Math.min(done + batchSize, trials);
      for (let t = done; t < end; t++) {
        const idx = singleTrial(k, n);
        if (idx >= 0) {
          collisions++;
          totalFirstCollision += idx;
        }
      }
      done = end;
      onProgress(done, trials);

      if (done < trials) {
        setTimeout(runBatch, 0);
      } else {
        resolve({
          collisionRate: collisions / trials,
          avgFirstCollision: collisions > 0 ? totalFirstCollision / collisions : k,
          trials,
        });
      }
    }

    runBatch();
  });
}
