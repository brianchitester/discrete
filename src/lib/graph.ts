export interface GridCell {
  row: number;
  col: number;
}

export interface TraversalStep {
  current: GridCell;
  frontier: GridCell[];
  visited: Set<string>;
  path: GridCell[] | null; // non-null only when goal is found
}

export type Grid = boolean[][]; // true = wall

const key = (r: number, c: number) => `${r},${c}`;

function neighbors(row: number, col: number, rows: number, cols: number, grid: Grid): GridCell[] {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const result: GridCell[] = [];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc]) {
      result.push({ row: nr, col: nc });
    }
  }
  return result;
}

export function precomputeBFS(
  grid: Grid,
  start: GridCell,
  end: GridCell
): TraversalStep[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const steps: TraversalStep[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue: GridCell[] = [start];
  visited.add(key(start.row, start.col));

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = key(current.row, current.col);

    // Check if reached end
    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(parent, start, end);
      steps.push({
        current,
        frontier: [...queue],
        visited: new Set(visited),
        path,
      });
      break;
    }

    for (const nb of neighbors(current.row, current.col, rows, cols, grid)) {
      const nbKey = key(nb.row, nb.col);
      if (!visited.has(nbKey)) {
        visited.add(nbKey);
        parent.set(nbKey, currentKey);
        queue.push(nb);
      }
    }

    steps.push({
      current,
      frontier: [...queue],
      visited: new Set(visited),
      path: null,
    });
  }

  // If no path found, add final step
  if (steps.length === 0 || (steps.length > 0 && steps[steps.length - 1].path === null && queue.length === 0)) {
    if (steps.length === 0) {
      steps.push({
        current: start,
        frontier: [],
        visited: new Set(visited),
        path: null,
      });
    }
  }

  return steps;
}

export function precomputeDFS(
  grid: Grid,
  start: GridCell,
  end: GridCell
): TraversalStep[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const steps: TraversalStep[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const stack: GridCell[] = [start];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const currentKey = key(current.row, current.col);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    // Check if reached end
    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(parent, start, end);
      steps.push({
        current,
        frontier: [...stack],
        visited: new Set(visited),
        path,
      });
      break;
    }

    const nbs = neighbors(current.row, current.col, rows, cols, grid);
    for (const nb of nbs) {
      const nbKey = key(nb.row, nb.col);
      if (!visited.has(nbKey)) {
        parent.set(nbKey, currentKey);
        stack.push(nb);
      }
    }

    steps.push({
      current,
      frontier: [...stack],
      visited: new Set(visited),
      path: null,
    });
  }

  if (steps.length === 0) {
    steps.push({
      current: start,
      frontier: [],
      visited: new Set(visited),
      path: null,
    });
  }

  return steps;
}

function reconstructPath(
  parent: Map<string, string>,
  start: GridCell,
  end: GridCell
): GridCell[] {
  const path: GridCell[] = [];
  let current = key(end.row, end.col);
  const startKey = key(start.row, start.col);

  while (current !== startKey) {
    const [r, c] = current.split(',').map(Number);
    path.unshift({ row: r, col: c });
    const p = parent.get(current);
    if (!p) break;
    current = p;
  }
  path.unshift(start);
  return path;
}

export function generateMaze(rows: number, cols: number, wallDensity = 0.25): Grid {
  const grid: Grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() < wallDensity)
  );
  // Ensure start and end are clear
  grid[1][1] = false;
  grid[rows - 2][cols - 2] = false;
  // Clear cells around start and end
  if (rows > 2 && cols > 2) {
    grid[1][2] = false;
    grid[2][1] = false;
    grid[rows - 2][cols - 3] = false;
    grid[rows - 3][cols - 2] = false;
  }
  return grid;
}

export function createEmptyGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}
