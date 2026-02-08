export interface RuneElement {
  id: number;
  emoji: string;
  label: string;
}

export interface PermutationInfo {
  index: number;
  arrangement: RuneElement[];
}

export const RUNE_POOL: RuneElement[] = [
  { id: 0, emoji: '🔮', label: 'Crystal' },
  { id: 1, emoji: '📜', label: 'Scroll' },
  { id: 2, emoji: '🧪', label: 'Potion' },
  { id: 3, emoji: '🪄', label: 'Wand' },
  { id: 4, emoji: '🛡️', label: 'Shield' },
  { id: 5, emoji: '🐉', label: 'Dragon' },
  { id: 6, emoji: '🦄', label: 'Unicorn' },
  { id: 7, emoji: '🦅', label: 'Eagle' },
  { id: 8, emoji: '⚔️', label: 'Swords' },
  { id: 9, emoji: '🏆', label: 'Trophy' },
];

export const RENDER_ALL_THRESHOLD = 7;
export const MAX_RUNES = 10;
export const SAMPLE_SIZE = 200;

const factorialCache: number[] = [1, 1];

export function factorial(n: number): number {
  if (n < 0) return 0;
  if (n > 170) return Infinity;
  if (factorialCache[n] !== undefined) return factorialCache[n];
  for (let i = factorialCache.length; i <= n; i++) {
    factorialCache[i] = factorialCache[i - 1] * i;
  }
  return factorialCache[n];
}

export function generateAllPermutations(elements: RuneElement[]): PermutationInfo[] {
  const n = elements.length;
  if (n === 0) return [];
  if (n === 1) return [{ index: 0, arrangement: [...elements] }];

  const sorted = [...elements].sort((a, b) => a.id - b.id);
  const results: RuneElement[][] = [];

  // Heap's algorithm
  const arr = [...sorted];
  const c = new Array(n).fill(0);
  results.push([...arr]);

  let i = 0;
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 === 0) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
      } else {
        [arr[c[i]], arr[i]] = [arr[i], arr[c[i]]];
      }
      results.push([...arr]);
      c[i]++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }

  // Sort lexicographically by id sequence
  results.sort((a, b) => {
    for (let j = 0; j < a.length; j++) {
      if (a[j].id !== b[j].id) return a[j].id - b[j].id;
    }
    return 0;
  });

  return results.map((arr, idx) => ({ index: idx, arrangement: arr }));
}

export function samplePermutations(
  elements: RuneElement[],
  sampleSize: number
): PermutationInfo[] {
  const n = elements.length;
  const total = factorial(n);

  if (total <= sampleSize) {
    return generateAllPermutations(elements);
  }

  const sorted = [...elements].sort((a, b) => a.id - b.id);
  const seen = new Set<string>();
  const results: PermutationInfo[] = [];

  const key = (arr: RuneElement[]) => arr.map((e) => e.id).join(',');

  // Always include identity (sorted order)
  const identity = [...sorted];
  seen.add(key(identity));
  results.push({ index: 0, arrangement: identity });

  // Always include reverse
  const reversed = [...sorted].reverse();
  const revKey = key(reversed);
  if (!seen.has(revKey)) {
    seen.add(revKey);
    results.push({
      index: permutationIndex(reversed, sorted),
      arrangement: reversed,
    });
  }

  // Fisher-Yates shuffle to fill remaining
  while (results.length < sampleSize) {
    const shuffled = [...sorted];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const k = key(shuffled);
    if (!seen.has(k)) {
      seen.add(k);
      results.push({
        index: permutationIndex(shuffled, sorted),
        arrangement: shuffled,
      });
    }
  }

  results.sort((a, b) => a.index - b.index);
  return results;
}

export function permutationIndex(
  arrangement: RuneElement[],
  sortedElements: RuneElement[]
): number {
  const n = arrangement.length;
  if (n <= 1) return 0;

  const available = sortedElements.map((e) => e.id);
  let index = 0;

  for (let i = 0; i < n; i++) {
    const currentId = arrangement[i].id;
    const rank = available.indexOf(currentId);
    index += rank * factorial(n - 1 - i);
    available.splice(rank, 1);
  }

  return index;
}

export function arrangementsEqual(a: RuneElement[], b: RuneElement[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((el, i) => el.id === b[i].id);
}

export function growthComparison(n: number): {
  factorial: number;
  power2: number;
  combinations: number;
} {
  return {
    factorial: factorial(n),
    power2: Math.pow(2, n),
    combinations: n >= 2 ? (n * (n - 1)) / 2 : n,
  };
}

export function humanFactorialComparison(count: number): string {
  if (count <= 1) return '';
  if (count === 2) return '2 — left or right, that\'s it';
  if (count === 6) return '6 — about the legs on an insect';
  if (count === 24) return '24 — the hours in a day';
  if (count === 120) return '120 — about the crayons in a big box';
  if (count <= 720) return `${count.toLocaleString()} — more than days in a year`;
  if (count <= 5_040) return `${count.toLocaleString()} — more than movies on Netflix`;
  if (count <= 40_320) return `${count.toLocaleString()} — more than people in a small town`;
  if (count <= 362_880) return `${count.toLocaleString()} — more than seats in a stadium`;
  if (count <= 3_628_800) return `${count.toLocaleString()} — more than books in most libraries`;
  return `${count.toLocaleString()} — an astronomical number`;
}
