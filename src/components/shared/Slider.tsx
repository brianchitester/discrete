interface Props {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  showValue?: boolean;
}

export default function Slider({ label, min, max, value, onChange, step = 1, showValue = true }: Props) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-text-muted dark:text-text-dark-muted whitespace-nowrap">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-primary h-2 cursor-pointer"
      />
      {showValue && (
        <span className="w-10 text-right font-mono text-sm">{value}</span>
      )}
    </label>
  );
}
