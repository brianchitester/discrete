import type { GridCell } from '../../lib/graph';

interface Props {
  frontier: GridCell[];
  algorithm: 'bfs' | 'dfs';
  current: GridCell | null;
}

export default function QueueStackVisualizer({ frontier, algorithm, current }: Props) {
  const title = algorithm === 'bfs' ? 'Queue (BFS)' : 'Stack (DFS)';
  const displayItems = frontier.slice(0, 20);
  const hasMore = frontier.length > 20;

  return (
    <div className="border border-border dark:border-border-dark rounded-lg p-3">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="flex gap-1 flex-wrap min-h-[32px]">
        {current && (
          <div
            className="px-1.5 py-0.5 rounded text-xs font-mono border-2 border-accent-yellow bg-accent-yellow/20"
            title="Current"
          >
            {current.row},{current.col}
          </div>
        )}
        {displayItems.map((cell, i) => (
          <div
            key={`${cell.row},${cell.col}-${i}`}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-accent-blue-light/20 border border-accent-blue-light/40"
          >
            {cell.row},{cell.col}
          </div>
        ))}
        {hasMore && (
          <span className="text-xs text-text-muted dark:text-text-dark-muted self-center">
            +{frontier.length - 20} more
          </span>
        )}
        {!current && frontier.length === 0 && (
          <span className="text-xs text-text-muted dark:text-text-dark-muted self-center italic">
            Empty
          </span>
        )}
      </div>
    </div>
  );
}
