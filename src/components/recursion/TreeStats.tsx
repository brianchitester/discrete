interface Props {
  depth: number;
  nodeCount: number;
  totalWork: number;
  complexity: string;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt">
      <span className="text-xs text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="text-lg font-bold font-mono">{value}</span>
    </div>
  );
}

export default function TreeStats({ depth, nodeCount, totalWork, complexity }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Depth" value={`${depth} level${depth !== 1 ? 's' : ''}`} />
      <StatCard label="Nodes" value={nodeCount.toLocaleString()} />
      <StatCard label="Total Work" value={totalWork.toLocaleString()} />
      <StatCard label="Complexity" value={complexity} />
    </div>
  );
}
