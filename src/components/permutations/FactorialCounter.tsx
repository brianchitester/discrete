import { useEffect, useRef, useState } from 'react';
import { humanFactorialComparison, factorial } from '../../lib/permutations';

interface Props {
  n: number;
  total: number;
}

export default function FactorialCounter({ n, total }: Props) {
  const [displayCount, setDisplayCount] = useState(total);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = displayCount;
    const end = total;
    if (start === end) return;

    const duration = 400;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  const comparison = humanFactorialComparison(total);
  const power2 = Math.pow(2, n);
  const ratio = n >= 3 && total > power2 ? Math.round(total / power2) : 0;

  return (
    <div className="text-center py-4">
      <div className="text-2xl sm:text-3xl font-bold font-mono">
        <span className="text-text-muted dark:text-text-dark-muted">{n}</span>
        <span className="text-primary dark:text-primary-light text-lg sm:text-xl">!</span>
        <span className="text-text-muted dark:text-text-dark-muted mx-2">=</span>
        <span className="text-primary dark:text-primary-light tabular-nums">
          {total > 1e15 ? `${factorial(n).toExponential(1)}` : displayCount.toLocaleString()}
        </span>
      </div>
      {ratio > 0 && (
        <p className="mt-1 text-xs text-text-muted dark:text-text-dark-muted">
          {n}! is <strong className="text-primary dark:text-primary-light">{ratio}×</strong> larger than 2<sup>{n}</sup>
        </p>
      )}
      {comparison && (
        <p className="mt-2 text-sm text-text-muted dark:text-text-dark-muted">
          {comparison}
        </p>
      )}
    </div>
  );
}
