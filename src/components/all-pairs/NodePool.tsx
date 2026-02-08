import type { PairNode } from '../../lib/pairs';

interface Props {
  pool: PairNode[];
  activeIds: Set<number>;
  onToggle: (node: PairNode) => void;
}

export default function NodePool({ pool, activeIds, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {pool.map((node) => {
        const active = activeIds.has(node.id);
        return (
          <button
            key={node.id}
            onClick={() => onToggle(node)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${active
                ? 'bg-primary text-white shadow-sm scale-105'
                : 'border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt hover:bg-border/30 dark:hover:bg-border-dark/30 text-text dark:text-text-dark'
              }
            `}
          >
            <span className="mr-1">{node.emoji}</span>
            {node.label}
          </button>
        );
      })}
    </div>
  );
}
