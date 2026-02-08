import { useMemo, useState } from 'react';
import type { PairNode, PairInfo } from '../../lib/pairs';

interface Props {
  activeNodes: PairNode[];
  pairs: PairInfo[];
}

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 120;
const NODE_RADIUS = 16;

function getNodePosition(index: number, total: number) {
  // Start from the top (-π/2) and go clockwise
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

export default function PairNetwork({ activeNodes, pairs }: Props) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const nodePositions = useMemo(() => {
    const n = activeNodes.length;
    return activeNodes.map((node, i) => ({
      ...node,
      ...getNodePosition(i, n),
    }));
  }, [activeNodes]);

  const posMap = useMemo(() => {
    const map = new Map<number, { x: number; y: number }>();
    nodePositions.forEach((np) => map.set(np.id, { x: np.x, y: np.y }));
    return map;
  }, [nodePositions]);

  // Fade line opacity as density grows
  const lineOpacity = useMemo(() => {
    const n = pairs.length;
    if (n <= 6) return 0.6;
    if (n <= 15) return 0.45;
    if (n <= 28) return 0.35;
    if (n <= 45) return 0.25;
    return 0.18;
  }, [pairs.length]);

  if (activeNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted dark:text-text-dark-muted text-sm">
        Add participants above to see connections
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-sm"
        role="img"
        aria-label={`Network diagram showing ${pairs.length} connections between ${activeNodes.length} nodes`}
      >
        {/* Connection lines */}
        {pairs.map((pair) => {
          const posA = posMap.get(pair.a.id);
          const posB = posMap.get(pair.b.id);
          if (!posA || !posB) return null;

          const isHighlighted =
            hoveredId !== null &&
            (pair.a.id === hoveredId || pair.b.id === hoveredId);
          const isDimmed = hoveredId !== null && !isHighlighted;

          return (
            <line
              key={`${pair.a.id}-${pair.b.id}`}
              x1={posA.x}
              y1={posA.y}
              x2={posB.x}
              y2={posB.y}
              className={
                isHighlighted
                  ? 'stroke-primary dark:stroke-primary-light'
                  : 'stroke-accent-blue dark:stroke-accent-blue-light'
              }
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              opacity={isDimmed ? lineOpacity * 0.3 : isHighlighted ? 0.9 : lineOpacity}
              strokeLinecap="round"
            />
          );
        })}

        {/* Nodes */}
        {nodePositions.map((node) => {
          const isHovered = hoveredId === node.id;
          return (
            <g
              key={node.id}
              onPointerEnter={() => setHoveredId(node.id)}
              onPointerLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                className={`
                  transition-all
                  ${isHovered
                    ? 'fill-primary dark:fill-primary-light stroke-primary dark:stroke-primary-light'
                    : 'fill-surface-alt dark:fill-surface-dark-alt stroke-border dark:stroke-border-dark'
                  }
                `}
                strokeWidth={isHovered ? 2.5 : 1.5}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                className="pointer-events-none select-none"
              >
                {node.emoji}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
