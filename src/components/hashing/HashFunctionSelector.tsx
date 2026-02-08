import type { HashFunction } from '../../lib/hashing';

interface Props {
  functions: HashFunction[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function HashFunctionSelector({ functions, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
        Hash Function
      </span>
      <div className="grid gap-2">
        {functions.map(fn => {
          const isSelected = fn.id === selectedId;
          return (
            <label
              key={fn.id}
              className={`
                flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected
                  ? 'border-primary dark:border-primary-light bg-primary/5 dark:bg-primary-light/5'
                  : 'border-border dark:border-border-dark hover:border-primary/40 dark:hover:border-primary-light/40'
                }
              `}
            >
              <input
                type="radio"
                name="hashFunction"
                value={fn.id}
                checked={isSelected}
                onChange={() => onSelect(fn.id)}
                className="mt-1 accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{fn.name}</span>
                  <code className="text-xs px-1.5 py-0.5 rounded bg-surface-alt dark:bg-surface-dark-alt font-mono">
                    {fn.formula}
                  </code>
                </div>
                <p className="text-xs text-text-muted dark:text-text-dark-muted mt-0.5">
                  {fn.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
