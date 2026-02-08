import type { RuneElement } from '../../lib/permutations';

interface Props {
  pool: RuneElement[];
  activeIds: Set<number>;
  onToggle: (element: RuneElement) => void;
}

export default function RunePool({ pool, activeIds, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {pool.map((el) => {
        const active = activeIds.has(el.id);
        return (
          <button
            key={el.id}
            onClick={() => onToggle(el)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${active
                ? 'bg-primary text-white shadow-sm scale-105'
                : 'border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt hover:bg-border/30 dark:hover:bg-border-dark/30 text-text dark:text-text-dark'
              }
            `}
          >
            <span className="mr-1">{el.emoji}</span>
            {el.label}
          </button>
        );
      })}
    </div>
  );
}
