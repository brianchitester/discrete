interface Props {
  item: string;
  onAdd: (item: string) => void;
  disabled: boolean;
  color: string;
}

export default function DraggableItem({ item, onAdd, disabled, color }: Props) {
  return (
    <button
      onClick={() => !disabled && onAdd(item)}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all
        ${disabled
          ? 'opacity-40 cursor-not-allowed bg-border/40 dark:bg-border-dark/40 text-text-muted dark:text-text-dark-muted line-through'
          : 'cursor-pointer text-white hover:scale-105 hover:shadow-md active:scale-95'
        }
      `}
      style={!disabled ? { backgroundColor: color } : undefined}
    >
      <span>{item}</span>
      {!disabled && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  );
}
