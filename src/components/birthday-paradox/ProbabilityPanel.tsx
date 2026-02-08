import { exactCollisionProbability, birthdayBound, type MonteCarloResult } from '../../lib/birthday';

interface Props {
  k: number;
  n: number;
  monteCarloResult: MonteCarloResult | null;
  mcProgress: { done: number; total: number } | null;
  onRunMonteCarlo: () => void;
  isRunningMC: boolean;
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border dark:border-border-dark px-2 py-1.5">
      <span className="text-[10px] uppercase tracking-wide text-text-muted dark:text-text-dark-muted">
        {label}
      </span>
      <span className={`text-sm font-bold font-mono ${color ?? ''}`}>{value}</span>
    </div>
  );
}

function probabilityColor(p: number): string {
  if (p < 0.25) return 'text-accent-green';
  if (p < 0.50) return 'text-accent-yellow';
  if (p < 0.75) return 'text-accent-orange';
  return 'text-accent-red';
}

export default function ProbabilityPanel({
  k,
  n,
  monteCarloResult,
  mcProgress,
  onRunMonteCarlo,
  isRunningMC,
}: Props) {
  const pExact = exactCollisionProbability(k, n);
  const bound = birthdayBound(n);
  const pColor = probabilityColor(pExact);

  return (
    <div className="space-y-4">
      {/* Main probability display */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wide text-text-muted dark:text-text-dark-muted mb-1">
            P(collision)
          </span>
          <span className={`text-3xl font-bold font-mono ${pColor}`}>
            {(pExact * 100).toFixed(1)}%
          </span>
        </div>
        <div className="text-xs text-text-muted dark:text-text-dark-muted leading-relaxed flex-1 min-w-[180px]">
          <p className="font-mono bg-surface-alt dark:bg-surface-dark-alt rounded px-2 py-1 mb-1">
            P = 1 &minus; &prod;(1 &minus; i/{n}) for i = 0..{k - 1}
          </p>
          <p>
            With <strong>{k}</strong> people and <strong>{n.toLocaleString()}</strong> possible days,
            {pExact >= 0.5
              ? ' a collision is more likely than not!'
              : ' the chance of a collision is lower than you might think.'}
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <StatBox label="People (k)" value={String(k)} />
        <StatBox label="Days (n)" value={n.toLocaleString()} />
        <StatBox
          label="Exact P"
          value={`${(pExact * 100).toFixed(1)}%`}
          color={pColor}
        />
        <StatBox
          label="50% at k="
          value={String(bound)}
          color={k >= bound ? 'text-accent-red' : undefined}
        />
        <div className="flex flex-col items-center justify-center rounded-lg border border-border dark:border-border-dark px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-wide text-text-muted dark:text-text-dark-muted">
            Monte Carlo
          </span>
          {monteCarloResult ? (
            <span className={`text-sm font-bold font-mono ${probabilityColor(monteCarloResult.collisionRate)}`}>
              {(monteCarloResult.collisionRate * 100).toFixed(1)}%
            </span>
          ) : (
            <span className="text-sm font-mono text-text-muted dark:text-text-dark-muted">--</span>
          )}
        </div>
      </div>

      {/* Monte Carlo controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onRunMonteCarlo}
          disabled={isRunningMC}
          className="px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-purple text-white hover:bg-accent-purple/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isRunningMC ? 'Running...' : 'Run 10,000 Trials'}
        </button>

        {isRunningMC && mcProgress && (
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <div className="flex-1 h-2 bg-surface-alt dark:bg-surface-dark-alt rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-purple transition-all duration-100 rounded-full"
                style={{ width: `${(mcProgress.done / mcProgress.total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-muted dark:text-text-dark-muted font-mono">
              {mcProgress.done.toLocaleString()}/{mcProgress.total.toLocaleString()}
            </span>
          </div>
        )}

        {monteCarloResult && !isRunningMC && (
          <span className="text-xs text-text-muted dark:text-text-dark-muted">
            {monteCarloResult.trials.toLocaleString()} trials &middot;
            avg first collision at person #{Math.round(monteCarloResult.avgFirstCollision + 1)}
          </span>
        )}
      </div>
    </div>
  );
}
