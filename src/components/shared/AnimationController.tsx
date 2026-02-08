import type { AnimationState, AnimationControls } from '../../hooks/useAnimationController';

interface Props {
  state: AnimationState;
  controls: AnimationControls;
}

export default function AnimationController({ state, controls }: Props) {
  const { currentStep, isPlaying, speed, totalSteps } = state;
  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={controls.reset}
          className="px-2 py-1 rounded bg-surface-alt dark:bg-surface-dark-alt hover:bg-border dark:hover:bg-border-dark transition-colors text-sm"
          title="Reset"
        >
          &#x23EE;
        </button>
        <button
          onClick={controls.stepBackward}
          className="px-2 py-1 rounded bg-surface-alt dark:bg-surface-dark-alt hover:bg-border dark:hover:bg-border-dark transition-colors text-sm"
          title="Step back"
        >
          &#x23EA;
        </button>
        <button
          onClick={isPlaying ? controls.pause : controls.play}
          className="px-3 py-1 rounded bg-primary text-white hover:bg-primary-dark transition-colors text-sm font-medium"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={controls.stepForward}
          className="px-2 py-1 rounded bg-surface-alt dark:bg-surface-dark-alt hover:bg-border dark:hover:bg-border-dark transition-colors text-sm"
          title="Step forward"
        >
          &#x23E9;
        </button>
        <span className="text-sm text-text-muted dark:text-text-dark-muted ml-2">
          Step {currentStep + 1} / {totalSteps}
        </span>
        <label className="flex items-center gap-1 ml-auto text-sm text-text-muted dark:text-text-dark-muted">
          Speed:
          <select
            value={speed}
            onChange={e => controls.setSpeed(Number(e.target.value))}
            className="bg-surface-alt dark:bg-surface-dark-alt border border-border dark:border-border-dark rounded px-1 py-0.5 text-sm"
          >
            <option value={500}>Slow</option>
            <option value={200}>Normal</option>
            <option value={80}>Fast</option>
            <option value={30}>Turbo</option>
          </select>
        </label>
      </div>
      <div className="w-full bg-surface-alt dark:bg-surface-dark-alt rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
