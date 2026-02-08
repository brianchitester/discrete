// ── Types ──────────────────────────────────────────────────────────────────────

export interface TreeNode {
  id: number;
  n: number;        // subproblem size at this node
  work: number;     // local work done (the "+1" or "+n" term)
  depth: number;
  children: TreeNode[];
}

export interface RecurrenceTemplate {
  id: string;
  label: string;       // e.g. "T(n) = 2T(n/2) + n"
  description: string; // e.g. "Merge Sort"
  complexity: string;  // Big-O class
  build: (n: number) => TreeNode;
  maxN: number;
  defaultN: number;
}

// ── Tree builders ──────────────────────────────────────────────────────────────

let nextId = 0;

function resetId() {
  nextId = 0;
}

/**
 * T(n) = T(n-1) + 1   (linear recursion, e.g. factorial / linear scan)
 * Base case: n <= 0
 */
function buildLinear(n: number, depth = 0): TreeNode {
  const node: TreeNode = {
    id: nextId++,
    n,
    work: 1,
    depth,
    children: [],
  };
  if (n > 0) {
    node.children.push(buildLinear(n - 1, depth + 1));
  }
  return node;
}

/**
 * T(n) = 2T(n/2) + n   (merge sort style)
 * Base case: n <= 1
 */
function buildMergeSort(n: number, depth = 0): TreeNode {
  const node: TreeNode = {
    id: nextId++,
    n,
    work: n,
    depth,
    children: [],
  };
  if (n > 1) {
    const half = Math.floor(n / 2);
    const otherHalf = n - half;
    node.children.push(buildMergeSort(half, depth + 1));
    node.children.push(buildMergeSort(otherHalf, depth + 1));
  }
  return node;
}

/**
 * T(n) = T(n/2) + 1   (binary search style)
 * Base case: n <= 1
 */
function buildBinarySearch(n: number, depth = 0): TreeNode {
  const node: TreeNode = {
    id: nextId++,
    n,
    work: 1,
    depth,
    children: [],
  };
  if (n > 1) {
    node.children.push(buildBinarySearch(Math.floor(n / 2), depth + 1));
  }
  return node;
}

// ── Templates ──────────────────────────────────────────────────────────────────

export const RECURRENCE_TEMPLATES: RecurrenceTemplate[] = [
  {
    id: 'linear',
    label: 'T(n) = T(n−1) + 1',
    description: 'Linear Recursion',
    complexity: 'O(n)',
    build(n: number) {
      resetId();
      return buildLinear(n);
    },
    maxN: 10,
    defaultN: 5,
  },
  {
    id: 'merge-sort',
    label: 'T(n) = 2T(n/2) + n',
    description: 'Merge Sort',
    complexity: 'O(n log n)',
    build(n: number) {
      resetId();
      return buildMergeSort(n);
    },
    maxN: 64,
    defaultN: 8,
  },
  {
    id: 'binary-search',
    label: 'T(n) = T(n/2) + 1',
    description: 'Binary Search',
    complexity: 'O(log n)',
    build(n: number) {
      resetId();
      return buildBinarySearch(n);
    },
    maxN: 128,
    defaultN: 16,
  },
];

// ── Stat helpers ───────────────────────────────────────────────────────────────

export function countNodes(node: TreeNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
}

export function countTotalWork(node: TreeNode): number {
  let total = node.work;
  for (const child of node.children) {
    total += countTotalWork(child);
  }
  return total;
}

export function getDepth(node: TreeNode): number {
  if (node.children.length === 0) return 0;
  let maxChild = 0;
  for (const child of node.children) {
    maxChild = Math.max(maxChild, getDepth(child));
  }
  return 1 + maxChild;
}

/** Returns an array where index = level, value = number of nodes at that level. */
export function getNodesPerLevel(root: TreeNode): number[] {
  const levels: number[] = [];
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    levels.push(levelSize);
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      for (const child of node.children) {
        queue.push(child);
      }
    }
  }
  return levels;
}

/** Returns an array where index = level, value = total work at that level. */
export function getWorkPerLevel(root: TreeNode): number[] {
  const levels: number[] = [];
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    let levelWork = 0;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      levelWork += node.work;
      for (const child of node.children) {
        queue.push(child);
      }
    }
    levels.push(levelWork);
  }
  return levels;
}

/** Flatten tree into an array of { node, x, y } positions for rendering. */
export interface LayoutNode {
  node: TreeNode;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

/**
 * Lay out the tree for SVG rendering.
 * Returns positioned nodes and the total width/height needed.
 */
export function layoutTree(
  root: TreeNode,
  nodeRadius: number = 24,
  levelHeight: number = 72,
  minNodeSpacing: number = 12,
): { nodes: LayoutNode[]; width: number; height: number } {
  const result: LayoutNode[] = [];

  // First pass: assign x positions using a simple recursive algorithm
  // that ensures no overlaps.
  let nextX = 0;

  function assignPositions(
    node: TreeNode,
    parentX?: number,
    parentY?: number,
  ): { x: number; y: number } {
    const y = node.depth * levelHeight + nodeRadius + 10;

    if (node.children.length === 0) {
      // Leaf node: place at next available x position
      const x = nextX * (nodeRadius * 2 + minNodeSpacing) + nodeRadius + 10;
      nextX++;
      result.push({ node, x, y, parentX, parentY });
      return { x, y };
    }

    // Recursively position children
    const childPositions = node.children.map((child) =>
      assignPositions(child, undefined, undefined),
    );

    // Center parent above children
    const minChildX = Math.min(...childPositions.map((p) => p.x));
    const maxChildX = Math.max(...childPositions.map((p) => p.x));
    const x = (minChildX + maxChildX) / 2;

    // Update children's parent references
    for (const layoutNode of result) {
      if (
        node.children.some((c) => c.id === layoutNode.node.id)
      ) {
        layoutNode.parentX = x;
        layoutNode.parentY = y;
      }
    }

    result.push({ node, x, y, parentX, parentY });
    return { x, y };
  }

  assignPositions(root);

  const allX = result.map((r) => r.x);
  const allY = result.map((r) => r.y);
  const width = Math.max(...allX) + nodeRadius + 20;
  const height = Math.max(...allY) + nodeRadius + 20;

  return { nodes: result, width, height };
}
