import type { RuneElement } from '../../lib/permutations';

interface Props {
  arrangement: RuneElement[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onSwap: (i: number, j: number) => void;
  arrangementLabel: string;
}

export default function LockDisplay({
  arrangement,
  selectedIndex,
  onSelect,
  onSwap,
  arrangementLabel,
}: Props) {
  const handleClick = (index: number) => {
    if (selectedIndex === null) {
      onSelect(index);
    } else if (selectedIndex === index) {
      onSelect(-1); // deselect via parent
    } else {
      onSwap(selectedIndex, index);
    }
  };

  if (arrangement.length === 0) {
    return (
      <div className="p-6 text-center text-text-muted dark:text-text-dark-muted rounded-lg border-2 border-dashed border-border dark:border-border-dark">
        <p className="text-lg">Add runes above to build your lock</p>
        <p className="text-sm mt-1">Each rune you add multiplies the arrangements by n</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1 p-4 rounded-lg border-2 border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt">
        {/* Left lock bracket */}
        <div className="text-2xl text-text-muted dark:text-text-dark-muted select-none mr-1">
          🔐
        </div>

        {arrangement.map((rune, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={`${rune.id}-${i}`}
              onClick={() => handleClick(i)}
              className={`
                flex flex-col items-center justify-center w-14 h-16 sm:w-16 sm:h-18 rounded-lg
                transition-all duration-200 cursor-pointer select-none
                ${isSelected
                  ? 'ring-2 ring-primary dark:ring-primary-light bg-primary/15 dark:bg-primary-light/15 scale-110'
                  : 'border border-border dark:border-border-dark hover:bg-border/20 dark:hover:bg-border-dark/20'
                }
              `}
            >
              <span className="text-2xl">{rune.emoji}</span>
              <span className="text-[10px] text-text-muted dark:text-text-dark-muted mt-0.5">
                {rune.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-text-muted dark:text-text-dark-muted">
        {arrangementLabel}
        {selectedIndex !== null && (
          <span className="ml-2 text-primary dark:text-primary-light">
            — click another rune to swap
          </span>
        )}
      </p>
    </div>
  );
}
