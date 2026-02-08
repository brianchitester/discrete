interface Cell {
  row: number;
  col: number;
  color: string;
  opacity?: number;
}

interface Props {
  rows: number;
  cols: number;
  cellSize: number;
  cells: Cell[];
  onCellClick?: (row: number, col: number) => void;
  onCellDrag?: (row: number, col: number) => void;
  gridLines?: boolean;
  className?: string;
}

export default function InteractiveGrid({
  rows,
  cols,
  cellSize,
  cells,
  onCellClick,
  onCellDrag,
  gridLines = true,
  className = '',
}: Props) {
  const width = cols * cellSize;
  const height = rows * cellSize;

  const cellMap = new Map<string, Cell>();
  for (const cell of cells) {
    cellMap.set(`${cell.row},${cell.col}`, cell);
  }

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      onCellClick?.(row, col);
    }
    if (onCellDrag) {
      svg.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onCellDrag || !(e.buttons & 1)) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      onCellDrag(row, col);
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`select-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
    >
      {/* Background */}
      <rect width={width} height={height} fill="currentColor" className="text-surface-alt dark:text-surface-dark-alt" />

      {/* Colored cells */}
      {cells.map(cell => (
        <rect
          key={`${cell.row},${cell.col}`}
          x={cell.col * cellSize}
          y={cell.row * cellSize}
          width={cellSize}
          height={cellSize}
          fill={cell.color}
          opacity={cell.opacity ?? 1}
        />
      ))}

      {/* Grid lines */}
      {gridLines && (
        <g stroke="currentColor" className="text-border dark:text-border-dark" strokeWidth="0.5">
          {Array.from({ length: rows + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * cellSize} x2={width} y2={i * cellSize} />
          ))}
          {Array.from({ length: cols + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * cellSize} y1={0} x2={i * cellSize} y2={height} />
          ))}
        </g>
      )}
    </svg>
  );
}
