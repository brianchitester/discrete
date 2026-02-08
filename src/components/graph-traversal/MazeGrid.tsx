import InteractiveGrid from '../shared/InteractiveGrid';
import type { Grid, GridCell, TraversalStep } from '../../lib/graph';

const ROWS = 21;
const COLS = 21;
const CELL_SIZE = 22;

interface Props {
  grid: Grid;
  start: GridCell;
  end: GridCell;
  traversalStep: TraversalStep | null;
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
}

const cellKey = (r: number, c: number) => `${r},${c}`;

export default function MazeGrid({ grid, start, end, traversalStep, onCellClick, onCellDrag }: Props) {
  const cells: { row: number; col: number; color: string }[] = [];

  // Walls
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r]?.[c]) {
        cells.push({ row: r, col: c, color: '#475569' });
      }
    }
  }

  // Traversal overlay
  if (traversalStep) {
    const { visited, frontier, current, path } = traversalStep;

    // Visited cells
    for (const key of visited) {
      const [r, c] = key.split(',').map(Number);
      cells.push({ row: r, col: c, color: '#3b82f6' });
    }

    // Frontier cells
    for (const cell of frontier) {
      cells.push({ row: cell.row, col: cell.col, color: '#93c5fd' });
    }

    // Path cells
    if (path) {
      for (const cell of path) {
        cells.push({ row: cell.row, col: cell.col, color: '#f59e0b' });
      }
    }

    // Current cell
    cells.push({ row: current.row, col: current.col, color: '#eab308' });
  }

  // Start and end markers (always on top)
  cells.push({ row: start.row, col: start.col, color: '#22c55e' });
  cells.push({ row: end.row, col: end.col, color: '#ef4444' });

  return (
    <InteractiveGrid
      rows={ROWS}
      cols={COLS}
      cellSize={CELL_SIZE}
      cells={cells}
      onCellClick={onCellClick}
      onCellDrag={onCellDrag}
    />
  );
}
