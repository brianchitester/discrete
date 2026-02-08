export interface PairNode {
  id: number;
  emoji: string;
  label: string;
}

export interface PairInfo {
  a: PairNode;
  b: PairNode;
}

export interface Scenario {
  id: string;
  label: string;
  nodeNoun: string;
  pairNoun: string;
  description: string;
}

export const NODE_POOL: PairNode[] = [
  { id: 0, emoji: '🧑', label: 'Alex' },
  { id: 1, emoji: '👩', label: 'Blair' },
  { id: 2, emoji: '🧔', label: 'Casey' },
  { id: 3, emoji: '👧', label: 'Dana' },
  { id: 4, emoji: '🧓', label: 'Ellis' },
  { id: 5, emoji: '👦', label: 'Finley' },
  { id: 6, emoji: '👵', label: 'Gray' },
  { id: 7, emoji: '👨', label: 'Harper' },
  { id: 8, emoji: '👩‍🦰', label: 'Indigo' },
  { id: 9, emoji: '🧒', label: 'Jordan' },
  { id: 10, emoji: '👴', label: 'Kenji' },
  { id: 11, emoji: '👱', label: 'Luz' },
  { id: 12, emoji: '👮', label: 'Morgan' },
  { id: 13, emoji: '🧑‍🎓', label: 'Noor' },
  { id: 14, emoji: '👷', label: 'Oakley' },
  { id: 15, emoji: '🧑‍🔬', label: 'Parker' },
  { id: 16, emoji: '🧑‍🍳', label: 'Quinn' },
  { id: 17, emoji: '🧑‍🎨', label: 'Reese' },
  { id: 18, emoji: '🧑‍🚀', label: 'Sage' },
  { id: 19, emoji: '🧑‍⚕️', label: 'Tatum' },
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'handshakes',
    label: 'Handshakes',
    nodeNoun: 'people',
    pairNoun: 'handshakes',
    description: 'Everyone shakes hands with everyone else at a party.',
  },
  {
    id: 'round-robin',
    label: 'Round Robin',
    nodeNoun: 'teams',
    pairNoun: 'games',
    description: 'Every team plays every other team exactly once.',
  },
  {
    id: 'network',
    label: 'Network Pings',
    nodeNoun: 'servers',
    pairNoun: 'connections',
    description: 'Every server must be able to reach every other server.',
  },
];

export function pairCount(n: number): number {
  return (n * (n - 1)) / 2;
}

export function generateAllPairs(nodes: PairNode[]): PairInfo[] {
  const pairs: PairInfo[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      pairs.push({ a: nodes[i], b: nodes[j] });
    }
  }
  return pairs;
}

export interface GrowthPoint {
  n: number;
  pairs: number;
}

export function quadraticGrowthData(maxN: number): GrowthPoint[] {
  const data: GrowthPoint[] = [];
  for (let n = 0; n <= maxN; n++) {
    data.push({ n, pairs: pairCount(n) });
  }
  return data;
}

export function humanPairComparison(count: number, pairNoun: string): string {
  if (count === 0) return '';
  if (count === 1) return `Just 1 ${pairNoun.slice(0, -1)} — the simplest case`;
  if (count <= 3) return `Only ${count} ${pairNoun} — still easy to count`;
  if (count <= 10) return `${count} ${pairNoun} — manageable, but growing`;
  if (count <= 28) return `${count} ${pairNoun} — about as many as days in February`;
  if (count <= 45) return `${count} ${pairNoun} — like a full round-robin league`;
  if (count <= 66) return `${count} ${pairNoun} — more than cards in a deck`;
  if (count <= 105) return `${count} ${pairNoun} — over a hundred!`;
  if (count <= 190) return `${count} ${pairNoun} — approaching two hundred`;
  return `${count.toLocaleString()} ${pairNoun} — quadratic growth hits hard`;
}
