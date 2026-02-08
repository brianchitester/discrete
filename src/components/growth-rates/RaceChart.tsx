import { useRef, useEffect, useState, useMemo } from 'react';
import { scaleLinear, scaleLog } from 'd3-scale';
import { complexityClasses } from '../../lib/growth';
import { formatNumber } from '../../lib/growth';

interface Props {
  values: Map<string, number>;
  maxValue: number;
  logScale: boolean;
  viewMode: 'bar' | 'line';
  n: number;
  rangeValues?: Map<string, number[]>;
}

const margin = { top: 20, right: 30, bottom: 40, left: 60 };
const HEIGHT = 400;
const CHART_WIDTH = 600;

const colorMap = new Map(complexityClasses.map(c => [c.id, c.color]));
const labelMap = new Map(complexityClasses.map(c => [c.id, c.notation]));

function useMeasuredWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(CHART_WIDTH);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return width;
}

export default function RaceChart({ values, maxValue, logScale, viewMode, n, rangeValues }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useMeasuredWidth(containerRef);

  const innerW = width - margin.left - margin.right;
  const innerH = HEIGHT - margin.top - margin.bottom;

  const yScale = useMemo(() => {
    const domainMax = maxValue || 1;
    if (logScale) {
      return scaleLog().domain([1, domainMax]).range([innerH, 0]).clamp(true);
    }
    return scaleLinear().domain([0, domainMax]).range([innerH, 0]).clamp(true);
  }, [logScale, maxValue, innerH]);

  const yTicks = useMemo(() => {
    if (logScale) {
      const ticks: number[] = [];
      let v = 1;
      const domainMax = maxValue || 1;
      while (v <= domainMax) {
        ticks.push(v);
        v *= 10;
      }
      return ticks;
    }
    return yScale.ticks(6);
  }, [logScale, maxValue, yScale]);

  const entries = Array.from(values.entries());

  if (viewMode === 'bar') {
    const barHeight = entries.length > 0 ? Math.min(32, (innerH - (entries.length - 1) * 4) / entries.length) : 32;

    return (
      <div ref={containerRef} className="w-full">
        <svg width={width} height={HEIGHT} className="font-mono text-xs">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* X axis */}
            <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="currentColor" opacity={0.2} />
            {yTicks.map(t => {
              const x = scaleLinear().domain([0, maxValue || 1]).range([0, innerW])(t);
              return (
                <g key={t}>
                  <line x1={x} y1={innerH} x2={x} y2={innerH + 5} stroke="currentColor" opacity={0.3} />
                  <text x={x} y={innerH + 18} textAnchor="middle" fill="currentColor" opacity={0.6}>
                    {formatNumber(t)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {entries.map(([id, val], i) => {
              const barW = maxValue > 0 ? Math.max(0, (Math.min(val, maxValue) / maxValue) * innerW) : 0;
              const y = i * (barHeight + 4);
              const exceeds = val > maxValue;
              return (
                <g key={id}>
                  <rect
                    x={0}
                    y={y}
                    width={barW}
                    height={barHeight}
                    fill={colorMap.get(id)}
                    rx={3}
                  />
                  <text
                    x={Math.max(barW + 6, 4)}
                    y={y + barHeight / 2}
                    dominantBaseline="central"
                    fill="currentColor"
                    opacity={0.8}
                    fontSize={11}
                  >
                    {labelMap.get(id)} = {formatNumber(val)}{exceeds ? ' >' : ''}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    );
  }

  // Line mode
  const xScale = scaleLinear().domain([1, n]).range([0, innerW]);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={HEIGHT} className="font-mono text-xs">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {yTicks.map(t => (
            <line
              key={t}
              x1={0}
              y1={yScale(Math.max(t, logScale ? 1 : 0))}
              x2={innerW}
              y2={yScale(Math.max(t, logScale ? 1 : 0))}
              stroke="currentColor"
              opacity={0.08}
            />
          ))}

          {/* Y axis */}
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="currentColor" opacity={0.2} />
          {yTicks.map(t => (
            <g key={t}>
              <text
                x={-8}
                y={yScale(Math.max(t, logScale ? 1 : 0))}
                textAnchor="end"
                dominantBaseline="central"
                fill="currentColor"
                opacity={0.6}
              >
                {formatNumber(t)}
              </text>
            </g>
          ))}

          {/* X axis */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="currentColor" opacity={0.2} />
          {xScale.ticks(8).map(t => (
            <g key={t}>
              <line x1={xScale(t)} y1={innerH} x2={xScale(t)} y2={innerH + 5} stroke="currentColor" opacity={0.3} />
              <text x={xScale(t)} y={innerH + 18} textAnchor="middle" fill="currentColor" opacity={0.6}>
                {Math.round(t)}
              </text>
            </g>
          ))}
          <text
            x={innerW / 2}
            y={innerH + 34}
            textAnchor="middle"
            fill="currentColor"
            opacity={0.5}
            fontSize={11}
          >
            n
          </text>

          {/* Lines */}
          {rangeValues && Array.from(rangeValues.entries()).map(([id, arr]) => {
            const color = colorMap.get(id)!;
            const points = arr.map((v, i) => {
              const x = xScale(i + 1);
              const yVal = logScale ? Math.max(v, 1) : v;
              const y = yScale(yVal);
              return `${x},${y}`;
            });
            const lastVal = arr[arr.length - 1];
            const exceeds = lastVal >= maxValue;
            return (
              <g key={id}>
                <polyline
                  points={points.join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                {exceeds && (
                  <text
                    x={innerW + 4}
                    y={yScale(logScale ? Math.max(lastVal, 1) : lastVal)}
                    dominantBaseline="central"
                    fill={color}
                    fontWeight="bold"
                    fontSize={14}
                  >
                    {'>'}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
