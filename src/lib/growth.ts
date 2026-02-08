export interface ComplexityClass {
  id: string;
  label: string;
  notation: string;
  color: string;
  fn: (n: number) => number;
}

export const complexityClasses: ComplexityClass[] = [
  {
    id: 'constant',
    label: 'Constant',
    notation: 'O(1)',
    color: '#22c55e', // green
    fn: () => 1,
  },
  {
    id: 'logarithmic',
    label: 'Logarithmic',
    notation: 'O(log n)',
    color: '#3b82f6', // blue
    fn: (n) => Math.max(1, Math.log2(n)),
  },
  {
    id: 'linear',
    label: 'Linear',
    notation: 'O(n)',
    color: '#a855f7', // purple
    fn: (n) => n,
  },
  {
    id: 'linearithmic',
    label: 'Linearithmic',
    notation: 'O(n log n)',
    color: '#f97316', // orange
    fn: (n) => n * Math.max(1, Math.log2(n)),
  },
  {
    id: 'quadratic',
    label: 'Quadratic',
    notation: 'O(n²)',
    color: '#ef4444', // red
    fn: (n) => n * n,
  },
  {
    id: 'exponential',
    label: 'Exponential',
    notation: 'O(2ⁿ)',
    color: '#eab308', // yellow
    fn: (n) => Math.pow(2, n),
  },
];

export function computeValues(n: number, enabledIds: Set<string>): Map<string, number> {
  const result = new Map<string, number>();
  for (const cls of complexityClasses) {
    if (enabledIds.has(cls.id)) {
      result.set(cls.id, cls.fn(n));
    }
  }
  return result;
}

// Compute values for a range [1, maxN], clamped to prevent Infinity
export function computeRange(
  maxN: number,
  enabledIds: Set<string>,
  clampMax = 1e12
): Map<string, number[]> {
  const result = new Map<string, number[]>();
  for (const cls of complexityClasses) {
    if (enabledIds.has(cls.id)) {
      const values: number[] = [];
      for (let n = 1; n <= maxN; n++) {
        values.push(Math.min(cls.fn(n), clampMax));
      }
      result.set(cls.id, values);
    }
  }
  return result;
}

export function formatNumber(n: number): string {
  if (n >= 1e12) return '> 1T';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  if (n >= 100) return Math.round(n).toString();
  if (n >= 1) return n.toFixed(1);
  return n.toFixed(2);
}
