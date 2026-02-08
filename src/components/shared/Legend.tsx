interface LegendItem {
  color: string;
  label: string;
}

interface Props {
  items: LegendItem[];
  className?: string;
}

export default function Legend({ items, className = '' }: Props) {
  return (
    <div className={`flex flex-wrap gap-3 text-sm ${className}`}>
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-text-muted dark:text-text-dark-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
