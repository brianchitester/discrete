import AnimationController from '../shared/AnimationController';
import type { AnimationState, AnimationControls } from '../../hooks/useAnimationController';

type Algorithm = 'bfs' | 'dfs' | 'race';

interface Props {
  algorithm: Algorithm;
  onAlgorithmChange: (algo: Algorithm) => void;
  onGenerateMaze: () => void;
  onClearGrid: () => void;
  animationState: AnimationState;
  animationControls: AnimationControls;
}

const algorithms: { value: Algorithm; label: string }[] = [
  { value: 'bfs', label: 'BFS' },
  { value: 'dfs', label: 'DFS' },
  { value: 'race', label: 'Race' },
];

export default function TraversalControls({
  algorithm,
  onAlgorithmChange,
  onGenerateMaze,
  onClearGrid,
  animationState,
  animationControls,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border border-border dark:border-border-dark overflow-hidden">
          {algorithms.map(algo => (
            <button
              key={algo.value}
              onClick={() => onAlgorithmChange(algo.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                algorithm === algo.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-alt dark:bg-surface-dark-alt hover:bg-border/50 dark:hover:bg-border-dark/50'
              }`}
            >
              {algo.label}
            </button>
          ))}
        </div>
        <button
          onClick={onGenerateMaze}
          className="px-3 py-1.5 rounded-lg bg-surface-alt dark:bg-surface-dark-alt border border-border dark:border-border-dark hover:bg-border/50 dark:hover:bg-border-dark/50 transition-colors text-sm"
        >
          Generate Maze
        </button>
        <button
          onClick={onClearGrid}
          className="px-3 py-1.5 rounded-lg bg-surface-alt dark:bg-surface-dark-alt border border-border dark:border-border-dark hover:bg-border/50 dark:hover:bg-border-dark/50 transition-colors text-sm"
        >
          Clear Grid
        </button>
      </div>
      <AnimationController state={animationState} controls={animationControls} />
    </div>
  );
}
