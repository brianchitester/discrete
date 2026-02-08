export interface HashFunction {
  id: string;
  name: string;
  description: string;
  formula: string;
  fn: (input: string, bucketCount: number) => number;
}

export const hashFunctions: HashFunction[] = [
  {
    id: 'length',
    name: 'Bad: Length',
    description: 'Uses only the string length — many collisions for same-length inputs',
    formula: 'length(s) % k',
    fn: (input, k) => input.length % k,
  },
  {
    id: 'charsum',
    name: 'Decent: Char Sum',
    description: 'Sums ASCII codes — better spread, but anagrams collide',
    formula: 'Σ charCode(s[i]) % k',
    fn: (input, k) => {
      let sum = 0;
      for (let i = 0; i < input.length; i++) {
        sum += input.charCodeAt(i);
      }
      return sum % k;
    },
  },
  {
    id: 'djb2',
    name: 'Good: DJB2',
    description: 'Classic hash — bit shifting produces excellent distribution',
    formula: 'hash = hash * 33 + c',
    fn: (input, k) => {
      let hash = 5381;
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
      }
      return hash % k;
    },
  },
];

export const defaultItems = [
  'apple', 'banana', 'cherry', 'date', 'elderberry',
  'fig', 'grape', 'honeydew', 'kiwi', 'lemon',
  'mango', 'nectarine', 'orange', 'papaya', 'quince',
  'raspberry', 'strawberry', 'tangerine', 'watermelon', 'blueberry',
];

export interface BucketState {
  items: string[];
}

export function hashItem(
  item: string,
  hashFn: HashFunction,
  bucketCount: number
): number {
  return hashFn.fn(item, bucketCount);
}

export function computeBuckets(
  items: string[],
  hashFn: HashFunction,
  bucketCount: number
): BucketState[] {
  const buckets: BucketState[] = Array.from({ length: bucketCount }, () => ({ items: [] }));
  for (const item of items) {
    const idx = hashItem(item, hashFn, bucketCount);
    buckets[idx].items.push(item);
  }
  return buckets;
}

export interface HashMetrics {
  totalItems: number;
  bucketCount: number;
  collisions: number;
  maxBucketSize: number;
  emptyBuckets: number;
  loadFactor: number;
}

export function computeMetrics(buckets: BucketState[]): HashMetrics {
  let collisions = 0;
  let maxBucketSize = 0;
  let emptyBuckets = 0;
  let totalItems = 0;

  for (const bucket of buckets) {
    totalItems += bucket.items.length;
    if (bucket.items.length > 1) {
      collisions += bucket.items.length - 1;
    }
    if (bucket.items.length === 0) {
      emptyBuckets++;
    }
    maxBucketSize = Math.max(maxBucketSize, bucket.items.length);
  }

  return {
    totalItems,
    bucketCount: buckets.length,
    collisions,
    maxBucketSize,
    emptyBuckets,
    loadFactor: totalItems / buckets.length,
  };
}
