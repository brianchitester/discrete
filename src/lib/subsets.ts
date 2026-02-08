export interface SubsetElement {
  id: number;
  emoji: string;
  label: string;
}

export interface SubsetInfo {
  mask: number;
  elements: SubsetElement[];
  size: number;
}

export const ELEMENT_POOL: SubsetElement[] = [
  { id: 0, emoji: '⭐', label: 'Star' },
  { id: 1, emoji: '❤️', label: 'Heart' },
  { id: 2, emoji: '🌙', label: 'Moon' },
  { id: 3, emoji: '☀️', label: 'Sun' },
  { id: 4, emoji: '⚡', label: 'Bolt' },
  { id: 5, emoji: '💎', label: 'Gem' },
  { id: 6, emoji: '🍃', label: 'Leaf' },
  { id: 7, emoji: '🔥', label: 'Flame' },
  { id: 8, emoji: '💧', label: 'Drop' },
  { id: 9, emoji: '❄️', label: 'Snow' },
  { id: 10, emoji: '🎵', label: 'Music' },
  { id: 11, emoji: '👑', label: 'Crown' },
  { id: 12, emoji: '🔑', label: 'Key' },
  { id: 13, emoji: '🎲', label: 'Dice' },
  { id: 14, emoji: '🐚', label: 'Shell' },
  { id: 15, emoji: '👁️', label: 'Eye' },
  { id: 16, emoji: '🔔', label: 'Bell' },
  { id: 17, emoji: '🍀', label: 'Clover' },
  { id: 18, emoji: '🐟', label: 'Fish' },
  { id: 19, emoji: '🍒', label: 'Cherry' },
];

export const RENDER_ALL_THRESHOLD = 10;
export const MAX_ELEMENTS = 20;

export function generateAllSubsets(elements: SubsetElement[]): SubsetInfo[] {
  const n = elements.length;
  const total = 1 << n;
  const subsets: SubsetInfo[] = [];

  for (let mask = 0; mask < total; mask++) {
    const included: SubsetElement[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        included.push(elements[i]);
      }
    }
    subsets.push({ mask, elements: included, size: included.length });
  }

  return subsets;
}

export function sampleSubsets(
  elements: SubsetElement[],
  sampleSize: number
): SubsetInfo[] {
  const n = elements.length;
  const total = 1 << n;

  if (total <= sampleSize) {
    return generateAllSubsets(elements);
  }

  const seen = new Set<number>();
  const subsets: SubsetInfo[] = [];

  // Always include empty set (mask=0) and full set (mask=total-1)
  const addMask = (mask: number) => {
    if (seen.has(mask)) return;
    seen.add(mask);
    const included: SubsetElement[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        included.push(elements[i]);
      }
    }
    subsets.push({ mask, elements: included, size: included.length });
  };

  addMask(0);
  addMask(total - 1);

  while (subsets.length < sampleSize) {
    const mask = Math.floor(Math.random() * total);
    addMask(mask);
  }

  subsets.sort((a, b) => a.mask - b.mask);
  return subsets;
}

export function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

export function computeSizeDistribution(n: number): number[] {
  const dist: number[] = [];
  for (let k = 0; k <= n; k++) {
    dist.push(binomial(n, k));
  }
  return dist;
}

export function humanScaleComparison(count: number): string {
  if (count <= 1) return '';
  if (count === 2) return 'Just 2 — the empty set and the full set';
  if (count <= 8) return `Only ${count} subsets — still manageable`;
  if (count <= 32) return `${count} subsets — about as many as days in a month`;
  if (count <= 64) return `${count} subsets — more than a deck of cards`;
  if (count <= 128) return `${count} subsets — more than keys on a keyboard`;
  if (count <= 256) return `${count} subsets — more than ASCII characters`;
  if (count <= 1024) return `${count.toLocaleString()} subsets — over a thousand!`;
  if (count <= 4096) return `${count.toLocaleString()} subsets — more than pixels across your screen`;
  if (count <= 32768) return `${count.toLocaleString()} subsets — more than words in a short novel`;
  if (count <= 65536) return `${count.toLocaleString()} subsets — more than a zip code's population`;
  if (count <= 262144) return `${count.toLocaleString()} subsets — more than the words in War and Peace`;
  if (count <= 524288) return `${count.toLocaleString()} subsets — approaching a million`;
  return `${count.toLocaleString()} subsets — more than a million!`;
}
