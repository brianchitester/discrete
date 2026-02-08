import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  type Grid,
  type GridCell,
  type TraversalStep,
  precomputeBFS,
  precomputeDFS,
  generateMaze,
  createEmptyGrid,
} from '../../lib/graph';
import { useAnimationController, type AnimationControls } from '../../hooks/useAnimationController';
import { useProgress } from '../../hooks/useProgress';
import MazeGrid from './MazeGrid';
import QueueStackVisualizer from './QueueStackVisualizer';
import TraversalControls from './TraversalControls';
import Legend from '../shared/Legend';
import InfoPanel from '../shared/InfoPanel';

const ROWS = 21;
const COLS = 21;

type Algorithm = 'bfs' | 'dfs' | 'race';

const START: GridCell = { row: 1, col: 1 };
const END: GridCell = { row: 19, col: 19 };

const legendItems = [
  { color: '#22c55e', label: 'Start' },
  { color: '#ef4444', label: 'End' },
  { color: '#475569', label: 'Wall' },
  { color: '#3b82f6', label: 'Visited' },
  { color: '#93c5fd', label: 'Frontier' },
  { color: '#eab308', label: 'Current' },
  { color: '#f59e0b', label: 'Path' },
];

export default function TraversalPlayground() {
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(ROWS, COLS));
  const [algorithm, setAlgorithm] = useState<Algorithm>('bfs');
  const [wallsDrawn, setWallsDrawn] = useState(false);
  const [visualizing, setVisualizing] = useState(false);
  const { markMilestone } = useProgress('graph-traversal');

  // Precompute traversal steps
  const bfsSteps = useMemo(() => precomputeBFS(grid, START, END), [grid]);
  const dfsSteps = useMemo(() => precomputeDFS(grid, START, END), [grid]);

  const activeSteps = algorithm === 'dfs' ? dfsSteps : bfsSteps;
  // For race mode, use the longer run for total steps
  const raceTotal = Math.max(bfsSteps.length, dfsSteps.length);
  const totalSteps = algorithm === 'race' ? raceTotal : activeSteps.length;

  const { state: animState, controls: animControls } = useAnimationController(totalSteps);

  // Wrap animation controls so starting the animation activates the overlay,
  // and resetting via the ⏮ button clears it.
  const wrappedControls = useMemo<AnimationControls>(() => ({
    ...animControls,
    play: () => { setVisualizing(true); animControls.play(); },
    stepForward: () => { setVisualizing(true); animControls.stepForward(); },
    stepBackward: () => { setVisualizing(true); animControls.stepBackward(); },
    jumpTo: (step: number) => { setVisualizing(true); animControls.jumpTo(step); },
    reset: () => { setVisualizing(false); animControls.reset(); },
  }), [animControls]);

  const currentStep = animState.currentStep;

  // Get current traversal step (only when actively visualizing)
  const currentTraversalStep = algorithm === 'race' || !visualizing ? null : (activeSteps[currentStep] ?? null);
  const bfsTraversalStep = visualizing ? (bfsSteps[Math.min(currentStep, bfsSteps.length - 1)] ?? null) : null;
  const dfsTraversalStep = visualizing ? (dfsSteps[Math.min(currentStep, dfsSteps.length - 1)] ?? null) : null;

  // Track milestones
  useEffect(() => {
    if (currentStep > 0 && algorithm === 'bfs') markMilestone('ran-bfs');
    if (currentStep > 0 && algorithm === 'dfs') markMilestone('ran-dfs');
    if (algorithm === 'race' && currentStep > 0) {
      markMilestone('ran-bfs');
      markMilestone('ran-dfs');
    }
  }, [currentStep, algorithm, markMilestone]);

  useEffect(() => {
    const lastStep = activeSteps[activeSteps.length - 1];
    if (lastStep?.path && currentStep === activeSteps.length - 1) {
      markMilestone('found-path');
    }
  }, [currentStep, activeSteps, markMilestone]);

  useEffect(() => {
    if (wallsDrawn) markMilestone('drew-walls');
  }, [wallsDrawn, markMilestone]);

  const handleCellClick = useCallback((row: number, col: number) => {
    // Don't toggle start or end
    if ((row === START.row && col === START.col) || (row === END.row && col === END.col)) return;
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = !next[row][col];
      return next;
    });
    setWallsDrawn(true);
    setVisualizing(false);
    animControls.reset();
  }, [animControls]);

  const handleCellDrag = useCallback((row: number, col: number) => {
    if ((row === START.row && col === START.col) || (row === END.row && col === END.col)) return;
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = true;
      return next;
    });
    setWallsDrawn(true);
    setVisualizing(false);
    animControls.reset();
  }, [animControls]);

  const handleAlgorithmChange = useCallback((algo: Algorithm) => {
    setAlgorithm(algo);
    setVisualizing(false);
    animControls.reset();
  }, [animControls]);

  const handleGenerateMaze = useCallback(() => {
    setGrid(generateMaze(ROWS, COLS));
    setWallsDrawn(true);
    setVisualizing(false);
    animControls.reset();
  }, [animControls]);

  const handleClearGrid = useCallback(() => {
    setGrid(createEmptyGrid(ROWS, COLS));
    setVisualizing(false);
    animControls.reset();
  }, [animControls]);

  return (
    <div className="flex flex-col gap-6">
      <TraversalControls
        algorithm={algorithm}
        onAlgorithmChange={handleAlgorithmChange}
        onGenerateMaze={handleGenerateMaze}
        onClearGrid={handleClearGrid}
        animationState={animState}
        animationControls={wrappedControls}
      />

      <Legend items={legendItems} />

      {algorithm === 'race' ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-sm font-medium text-center">BFS (Breadth-First)</h3>
            <div className="flex justify-center">
              <MazeGrid
                grid={grid}
                start={START}
                end={END}
                traversalStep={bfsTraversalStep}
                onCellClick={handleCellClick}
                onCellDrag={handleCellDrag}
              />
            </div>
            <QueueStackVisualizer
              frontier={bfsTraversalStep?.frontier ?? []}
              algorithm="bfs"
              current={bfsTraversalStep?.current ?? null}
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-sm font-medium text-center">DFS (Depth-First)</h3>
            <div className="flex justify-center">
              <MazeGrid
                grid={grid}
                start={START}
                end={END}
                traversalStep={dfsTraversalStep}
                onCellClick={handleCellClick}
                onCellDrag={handleCellDrag}
              />
            </div>
            <QueueStackVisualizer
              frontier={dfsTraversalStep?.frontier ?? []}
              algorithm="dfs"
              current={dfsTraversalStep?.current ?? null}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <MazeGrid
              grid={grid}
              start={START}
              end={END}
              traversalStep={currentTraversalStep}
              onCellClick={handleCellClick}
              onCellDrag={handleCellDrag}
            />
          </div>
          <QueueStackVisualizer
            frontier={currentTraversalStep?.frontier ?? []}
            algorithm={algorithm as 'bfs' | 'dfs'}
            current={currentTraversalStep?.current ?? null}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <InfoPanel title="How BFS Works" defaultOpen>
          <p className="mb-2">
            <strong>Breadth-First Search</strong> explores the grid level by level using a <strong>queue</strong> (first-in, first-out).
            It visits all neighbors at the current distance before moving further away.
          </p>
          <p>
            This guarantees finding the <strong>shortest path</strong> in an unweighted grid.
            Watch how the blue frontier expands outward like a wave from the start cell.
          </p>
        </InfoPanel>
        <InfoPanel title="How DFS Works">
          <p className="mb-2">
            <strong>Depth-First Search</strong> dives as deep as possible along one path before backtracking, using a <strong>stack</strong> (last-in, first-out).
          </p>
          <p>
            DFS does <strong>not</strong> guarantee the shortest path, but it uses less memory and can find <em>a</em> path quickly.
            Notice how it follows a single corridor before backtracking.
          </p>
        </InfoPanel>
        <InfoPanel title="Tips">
          <ul className="list-disc list-inside space-y-1">
            <li>Click or drag on the grid to draw walls, then press play.</li>
            <li>Try "Generate Maze" for a random layout.</li>
            <li>Use "Race" mode to compare BFS and DFS side by side.</li>
            <li>Step through one frame at a time to see exactly what the frontier looks like.</li>
          </ul>
        </InfoPanel>
      </div>
    </div>
  );
}
