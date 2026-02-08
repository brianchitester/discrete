import type { ScenarioState, TwoPointerState, StackParensState, HeapState } from '../../lib/invariants';

interface Props {
  state: ScenarioState;
  invariantHolds: boolean;
}

// ── Two-Pointer View ─────────────────────────────────────────────────────────

function TwoPointerView({ state, invariantHolds }: { state: TwoPointerState; invariantHolds: boolean }) {
  const { array, left, right, target, found } = state;
  const maxVal = Math.max(...array);
  const barWidth = 36;
  const gap = 4;
  const svgWidth = array.length * (barWidth + gap) + gap;
  const maxBarHeight = 120;
  const svgHeight = maxBarHeight + 60; // extra space for labels + pointers

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm text-text-muted dark:text-text-dark-muted">
        Target sum: <span className="font-bold text-text dark:text-text-dark">{target}</span>
        {found && <span className="ml-2 text-accent-green font-semibold">Found!</span>}
      </div>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width={svgWidth}
        height={svgHeight}
        className="max-w-full"
      >
        {array.map((val, i) => {
          const x = gap + i * (barWidth + gap);
          const barH = (val / maxVal) * maxBarHeight;
          const y = maxBarHeight - barH;

          let fill = 'var(--color-accent-blue)';
          if (i === left && i === right) fill = 'var(--color-accent-purple)';
          else if (i === left) fill = 'var(--color-accent-green)';
          else if (i === right) fill = 'var(--color-accent-red)';
          else if (i > left && i < right) fill = 'var(--color-accent-blue-light)';

          const outOfRange = left > right ? true : (i < left || i > right);
          const opacity = outOfRange ? 0.3 : 1;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={3}
                fill={fill}
                opacity={opacity}
              />
              <text
                x={x + barWidth / 2}
                y={maxBarHeight + 14}
                textAnchor="middle"
                className="text-[10px] fill-text-muted dark:fill-text-dark-muted"
              >
                {val}
              </text>
            </g>
          );
        })}
        {/* Left pointer arrow */}
        {left >= 0 && left < array.length && (
          <g>
            <text
              x={gap + left * (barWidth + gap) + barWidth / 2}
              y={maxBarHeight + 32}
              textAnchor="middle"
              className="text-[10px] font-bold fill-accent-green"
            >
              L
            </text>
            <polygon
              points={`${gap + left * (barWidth + gap) + barWidth / 2 - 4},${maxBarHeight + 22} ${gap + left * (barWidth + gap) + barWidth / 2 + 4},${maxBarHeight + 22} ${gap + left * (barWidth + gap) + barWidth / 2},${maxBarHeight + 17}`}
              className="fill-accent-green"
            />
          </g>
        )}
        {/* Right pointer arrow */}
        {right >= 0 && right < array.length && (
          <g>
            <text
              x={gap + right * (barWidth + gap) + barWidth / 2}
              y={maxBarHeight + 48}
              textAnchor="middle"
              className="text-[10px] font-bold fill-accent-red"
            >
              R
            </text>
            <polygon
              points={`${gap + right * (barWidth + gap) + barWidth / 2 - 4},${maxBarHeight + 38} ${gap + right * (barWidth + gap) + barWidth / 2 + 4},${maxBarHeight + 38} ${gap + right * (barWidth + gap) + barWidth / 2},${maxBarHeight + 33}`}
              className="fill-accent-red"
            />
          </g>
        )}
        {/* Out-of-range left pointer (beyond array) */}
        {left >= array.length && (
          <text
            x={svgWidth - 10}
            y={maxBarHeight + 32}
            textAnchor="end"
            className="text-[10px] font-bold fill-accent-red"
          >
            L={left} (out of bounds!)
          </text>
        )}
        {/* Invariant violation indicator */}
        {!invariantHolds && (
          <rect
            x={0}
            y={0}
            width={svgWidth}
            height={svgHeight}
            fill="none"
            stroke="var(--color-accent-red)"
            strokeWidth={3}
            strokeDasharray="6,4"
            rx={6}
          />
        )}
      </svg>
    </div>
  );
}

// ── Stack Parentheses View ───────────────────────────────────────────────────

function StackParensView({ state, invariantHolds }: { state: StackParensState; invariantHolds: boolean }) {
  const { input, cursor, stack } = state;
  const openers = new Set(['(', '[', '{']);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      {/* Input string */}
      <div className="flex-1">
        <div className="text-xs font-semibold text-text-muted dark:text-text-dark-muted mb-1.5 uppercase tracking-wider">
          Input
        </div>
        <div className="flex flex-wrap gap-0.5 font-mono text-lg">
          {input.split('').map((ch, i) => {
            let bg = '';
            let textColor = 'text-text dark:text-text-dark';
            if (i === cursor) {
              bg = 'bg-accent-yellow/30 dark:bg-accent-yellow/20';
              textColor = 'text-accent-yellow font-bold';
            } else if (i < cursor) {
              textColor = 'text-text-muted dark:text-text-dark-muted';
            }
            return (
              <span
                key={i}
                className={`inline-flex items-center justify-center w-7 h-8 rounded ${bg} ${textColor} transition-colors`}
              >
                {ch}
              </span>
            );
          })}
        </div>
        {cursor >= 0 && cursor < input.length && (
          <div className="text-xs text-text-muted dark:text-text-dark-muted mt-1">
            Position {cursor}: <span className="font-mono font-bold">{input[cursor]}</span>
          </div>
        )}
      </div>

      {/* Stack */}
      <div className="min-w-[100px]">
        <div className="text-xs font-semibold text-text-muted dark:text-text-dark-muted mb-1.5 uppercase tracking-wider">
          Stack {stack.length > 0 ? `(${stack.length})` : ''}
        </div>
        <div
          className={`
            flex flex-col-reverse gap-0.5 border rounded-lg p-2 min-h-[60px]
            ${!invariantHolds
              ? 'border-accent-red/60 bg-accent-red/5'
              : 'border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt'
            }
          `}
        >
          {stack.length === 0 ? (
            <span className="text-xs text-text-muted dark:text-text-dark-muted italic text-center">
              empty
            </span>
          ) : (
            stack.map((ch, i) => {
              const isCorrupt = !openers.has(ch);
              return (
                <div
                  key={i}
                  className={`
                    flex items-center justify-center w-full py-1 px-2 rounded font-mono text-base font-medium
                    ${isCorrupt
                      ? 'bg-accent-red/20 text-accent-red border border-accent-red/40'
                      : 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light'
                    }
                  `}
                >
                  {ch}
                  {isCorrupt && <span className="ml-1 text-[10px]">(!)</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Heap View ────────────────────────────────────────────────────────────────

function HeapView({ state, invariantHolds }: { state: HeapState; invariantHolds: boolean }) {
  const { heap, highlightA, highlightB } = state;

  if (heap.length === 0) {
    return (
      <div className="text-sm text-text-muted dark:text-text-dark-muted italic text-center py-4">
        Empty heap
      </div>
    );
  }

  // Calculate tree layout
  const depth = Math.floor(Math.log2(heap.length)) + 1;
  const nodeR = 18;
  const levelHeight = 56;
  const svgWidth = Math.max(320, Math.pow(2, depth - 1) * (nodeR * 2 + 16));
  const svgHeight = depth * levelHeight + 20;

  // Position each node
  type NodePos = { x: number; y: number; idx: number };
  const positions: NodePos[] = [];

  for (let i = 0; i < heap.length; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, level) - 1);
    const nodesAtLevel = Math.pow(2, level);
    const spacing = svgWidth / nodesAtLevel;
    const x = spacing * (posInLevel + 0.5);
    const y = level * levelHeight + nodeR + 10;
    positions.push({ x, y, idx: i });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Tree SVG */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width={svgWidth}
        height={svgHeight}
        className="max-w-full"
      >
        {/* Edges */}
        {heap.map((_, i) => {
          if (i === 0) return null;
          const parentI = Math.floor((i - 1) / 2);
          const parent = positions[parentI];
          const child = positions[i];
          if (!parent || !child) return null;

          const isViolation = heap[parentI] > heap[i];
          return (
            <line
              key={`edge-${i}`}
              x1={parent.x}
              y1={parent.y}
              x2={child.x}
              y2={child.y}
              stroke={isViolation ? 'var(--color-accent-red)' : 'var(--color-border)'}
              strokeWidth={isViolation ? 2.5 : 1.5}
              className={isViolation ? '' : 'dark:stroke-border-dark'}
              strokeDasharray={isViolation ? '4,3' : undefined}
            />
          );
        })}

        {/* Nodes */}
        {heap.map((val, i) => {
          const pos = positions[i];
          if (!pos) return null;

          const isHighlightA = i === highlightA;
          const isHighlightB = i === highlightB;
          const parentI = i > 0 ? Math.floor((i - 1) / 2) : -1;
          const hasViolation = parentI >= 0 && heap[parentI] > heap[i];

          let fillClass = 'fill-surface-alt dark:fill-surface-dark-alt';
          let strokeClass = 'stroke-border dark:stroke-border-dark';
          if (isHighlightA || isHighlightB) {
            fillClass = hasViolation
              ? 'fill-accent-red/20'
              : 'fill-primary/15 dark:fill-primary/25';
            strokeClass = hasViolation
              ? 'stroke-accent-red'
              : 'stroke-primary dark:stroke-primary-light';
          }

          return (
            <g key={`node-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeR}
                className={`${fillClass} ${strokeClass}`}
                strokeWidth={isHighlightA || isHighlightB ? 2.5 : 1.5}
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold fill-text dark:fill-text-dark"
              >
                {val}
              </text>
              {/* Index label */}
              <text
                x={pos.x}
                y={pos.y + nodeR + 12}
                textAnchor="middle"
                className="text-[9px] fill-text-muted dark:fill-text-dark-muted"
              >
                [{i}]
              </text>
            </g>
          );
        })}

        {/* Violation marker */}
        {!invariantHolds && (
          <rect
            x={0}
            y={0}
            width={svgWidth}
            height={svgHeight}
            fill="none"
            stroke="var(--color-accent-red)"
            strokeWidth={3}
            strokeDasharray="6,4"
            rx={6}
          />
        )}
      </svg>

      {/* Array representation */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs text-text-muted dark:text-text-dark-muted mr-1">Array:</span>
        {heap.map((val, i) => {
          const isHighlight = i === highlightA || i === highlightB;
          const parentI = i > 0 ? Math.floor((i - 1) / 2) : -1;
          const hasViolation = parentI >= 0 && heap[parentI] > heap[i];
          return (
            <span
              key={i}
              className={`
                inline-flex items-center justify-center w-7 h-7 rounded text-xs font-mono font-medium border
                ${hasViolation
                  ? 'bg-accent-red/15 border-accent-red/40 text-accent-red'
                  : isHighlight
                    ? 'bg-primary/10 border-primary/40 text-primary dark:text-primary-light'
                    : 'bg-surface-alt dark:bg-surface-dark-alt border-border dark:border-border-dark'
                }
              `}
            >
              {val}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dispatch ────────────────────────────────────────────────────────────

export default function StateVisualizer({ state, invariantHolds }: Props) {
  switch (state.kind) {
    case 'two-pointer':
      return <TwoPointerView state={state} invariantHolds={invariantHolds} />;
    case 'stack-parens':
      return <StackParensView state={state} invariantHolds={invariantHolds} />;
    case 'heap-insert':
      return <HeapView state={state} invariantHolds={invariantHolds} />;
  }
}
