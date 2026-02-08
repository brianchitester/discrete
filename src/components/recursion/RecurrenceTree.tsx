import { useMemo } from 'react';
import {
  type TreeNode,
  type LayoutNode,
  layoutTree,
  getWorkPerLevel,
  getDepth,
} from '../../lib/recursion';

// Level colors — cycle through project accent palette
const LEVEL_COLORS = [
  { fill: '#6366f1', text: '#ffffff' },  // primary / indigo
  { fill: '#3b82f6', text: '#ffffff' },  // accent-blue
  { fill: '#22c55e', text: '#ffffff' },  // accent-green
  { fill: '#f97316', text: '#ffffff' },  // accent-orange
  { fill: '#a855f7', text: '#ffffff' },  // accent-purple
  { fill: '#ef4444', text: '#ffffff' },  // accent-red
  { fill: '#eab308', text: '#1e293b' },  // accent-yellow
  { fill: '#f59e0b', text: '#1e293b' },  // accent-gold
];

function colorForLevel(depth: number) {
  return LEVEL_COLORS[depth % LEVEL_COLORS.length];
}

interface Props {
  root: TreeNode;
}

export default function RecurrenceTree({ root }: Props) {
  const nodeRadius = 24;
  const levelHeight = 80;
  const minNodeSpacing = 16;

  const { nodes, width, height } = useMemo(
    () => layoutTree(root, nodeRadius, levelHeight, minNodeSpacing),
    [root],
  );

  const treeDepth = useMemo(() => getDepth(root), [root]);
  const workPerLevel = useMemo(() => getWorkPerLevel(root), [root]);

  // Compute level label positions (left margin)
  const levelLabelX = 0;
  const leftMargin = 70;
  const rightMargin = 80;

  // Shift all nodes right to make room for level labels
  const shiftedNodes: LayoutNode[] = nodes.map((ln) => ({
    ...ln,
    x: ln.x + leftMargin,
    parentX: ln.parentX !== undefined ? ln.parentX + leftMargin : undefined,
  }));

  const totalWidth = width + leftMargin + rightMargin;
  const totalHeight = height + 10;

  // Build level info for annotations
  const levelAnnotations: { y: number; label: string; workLabel: string }[] = [];
  for (let d = 0; d <= treeDepth; d++) {
    const y = d * levelHeight + nodeRadius + 10;
    const work = workPerLevel[d] ?? 0;
    levelAnnotations.push({
      y,
      label: `L${d}`,
      workLabel: `${work}`,
    });
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(totalWidth, 200)} ${Math.max(totalHeight, 100)}`}
        className="w-full"
        style={{ minHeight: Math.min(totalHeight, 500), maxHeight: 520 }}
      >
        {/* Level backgrounds — subtle alternating rows */}
        {levelAnnotations.map((lvl, i) => (
          <rect
            key={`bg-${i}`}
            x={0}
            y={lvl.y - levelHeight / 2}
            width={Math.max(totalWidth, 200)}
            height={levelHeight}
            className={
              i % 2 === 0
                ? 'fill-surface-alt dark:fill-surface-dark-alt'
                : 'fill-transparent'
            }
            opacity={0.5}
          />
        ))}

        {/* Level labels on the left */}
        {levelAnnotations.map((lvl, i) => (
          <g key={`label-${i}`}>
            <text
              x={levelLabelX + 8}
              y={lvl.y + 1}
              textAnchor="start"
              dominantBaseline="middle"
              className="fill-text-muted dark:fill-text-dark-muted"
              fontSize={11}
              fontWeight={600}
            >
              {lvl.label}
            </text>
          </g>
        ))}

        {/* Work-per-level labels on the right */}
        {levelAnnotations.map((lvl, i) => (
          <text
            key={`work-${i}`}
            x={Math.max(totalWidth, 200) - 8}
            y={lvl.y + 1}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-text-muted dark:fill-text-dark-muted"
            fontSize={10}
            fontFamily="monospace"
          >
            work={lvl.workLabel}
          </text>
        ))}

        {/* Edges */}
        {shiftedNodes.map(
          (ln) =>
            ln.parentX !== undefined &&
            ln.parentY !== undefined && (
              <line
                key={`edge-${ln.node.id}`}
                x1={ln.parentX}
                y1={ln.parentY + nodeRadius}
                x2={ln.x}
                y2={ln.y - nodeRadius}
                className="stroke-border dark:stroke-border-dark"
                strokeWidth={2}
              />
            ),
        )}

        {/* Nodes */}
        {shiftedNodes.map((ln) => {
          const color = colorForLevel(ln.node.depth);
          return (
            <g key={`node-${ln.node.id}`}>
              <circle
                cx={ln.x}
                cy={ln.y}
                r={nodeRadius}
                fill={color.fill}
                opacity={0.9}
              />
              <text
                x={ln.x}
                y={ln.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color.text}
                fontSize={ln.node.n >= 100 ? 10 : 12}
                fontWeight={600}
                fontFamily="monospace"
              >
                {ln.node.n}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
