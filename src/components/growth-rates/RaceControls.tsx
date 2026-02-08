import Slider from '../shared/Slider';
import { complexityClasses } from '../../lib/growth';

interface Props {
  n: number;
  onNChange: (n: number) => void;
  enabledIds: Set<string>;
  onToggleId: (id: string) => void;
  logScale: boolean;
  onToggleLogScale: () => void;
  viewMode: 'bar' | 'line';
  onToggleViewMode: () => void;
  onAnimateN: () => void;
  isAnimating: boolean;
}

export default function RaceControls({
  n,
  onNChange,
  enabledIds,
  onToggleId,
  logScale,
  onToggleLogScale,
  viewMode,
  onToggleViewMode,
  onAnimateN,
  isAnimating,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Slider label="N" min={1} max={100} value={n} onChange={onNChange} />

      <div className="flex flex-wrap gap-3">
        {complexityClasses.map(cls => (
          <label key={cls.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={enabledIds.has(cls.id)}
              onChange={() => onToggleId(cls.id)}
              className="accent-primary"
            />
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: cls.color }}
            />
            <span className="text-text-muted dark:text-text-dark-muted">{cls.notation}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={onToggleLogScale}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            logScale
              ? 'bg-primary text-white'
              : 'bg-surface-alt dark:bg-surface-dark-alt hover:bg-border dark:hover:bg-border-dark'
          }`}
        >
          {logScale ? 'Log Scale' : 'Linear Scale'}
        </button>

        <button
          onClick={onToggleViewMode}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            viewMode === 'line'
              ? 'bg-primary text-white'
              : 'bg-surface-alt dark:bg-surface-dark-alt hover:bg-border dark:hover:bg-border-dark'
          }`}
        >
          {viewMode === 'bar' ? 'Bar View' : 'Line View'}
        </button>

        <button
          onClick={onAnimateN}
          className="px-3 py-1 rounded text-sm font-medium bg-accent-green text-white hover:opacity-90 transition-opacity"
        >
          {isAnimating ? 'Stop' : 'Animate N'}
        </button>
      </div>
    </div>
  );
}
