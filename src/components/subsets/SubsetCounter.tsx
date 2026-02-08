import { useEffect, useRef, useState } from 'react';
import { humanScaleComparison } from '../../lib/subsets';

interface Props {
  n: number;
  total: number;
}

export default function SubsetCounter({ n, total }: Props) {
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
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  const comparison = humanScaleComparison(total);

  return (
    <div className="text-center py-4">
      <div className="text-2xl sm:text-3xl font-bold font-mono">
        <span className="text-text-muted dark:text-text-dark-muted">2</span>
        <sup className="text-primary dark:text-primary-light text-lg sm:text-xl">{n}</sup>
        <span className="text-text-muted dark:text-text-dark-muted mx-2">=</span>
        <span className="text-primary dark:text-primary-light tabular-nums">
          {displayCount.toLocaleString()}
        </span>
      </div>
      {comparison && (
        <p className="mt-2 text-sm text-text-muted dark:text-text-dark-muted">
          {comparison}
        </p>
      )}
    </div>
  );
}
