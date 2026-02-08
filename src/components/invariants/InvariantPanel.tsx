import type { ProofAnnotation } from '../../lib/invariants';

interface Props {
  invariantRule: string;
  canFlag: boolean;
  onFlag: () => void;
  feedback: { type: 'correct' | 'wrong' | 'missed'; message: string } | null;
  stepDescription: string;
  invariantExplanation: string;
  proofMode: boolean;
  proofAnnotation?: ProofAnnotation;
  onNewCase: () => void;
  score: { correct: number; attempts: number };
  gameOver: boolean;
}

const proofBadgeColors: Record<string, string> = {
  base: 'bg-accent-blue/15 text-accent-blue dark:bg-accent-blue/25 border-accent-blue/30',
  hypothesis: 'bg-accent-purple/15 text-accent-purple dark:bg-accent-purple/25 border-accent-purple/30',
  step: 'bg-accent-green/15 text-accent-green dark:bg-accent-green/25 border-accent-green/30',
  broken: 'bg-accent-red/15 text-accent-red dark:bg-accent-red/25 border-accent-red/30',
};

const proofBadgeLabels: Record<string, string> = {
  base: 'Base Case',
  hypothesis: 'Inductive Hypothesis',
  step: 'Inductive Step',
  broken: 'Proof Breaks',
};

export default function InvariantPanel({
  invariantRule,
  canFlag,
  onFlag,
  feedback,
  stepDescription,
  invariantExplanation,
  proofMode,
  proofAnnotation,
  onNewCase,
  score,
  gameOver,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Invariant rule banner */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-text-dark-muted">
            Invariant:
          </span>
          <code className="px-2 py-1 rounded bg-surface-alt dark:bg-surface-dark-alt border border-border dark:border-border-dark text-sm font-mono font-medium">
            {invariantRule}
          </code>
        </div>
        <div className="text-sm text-text-muted dark:text-text-dark-muted">
          Score: {score.correct}/{score.attempts}
        </div>
      </div>

      {/* Step description */}
      <div className="p-3 rounded-lg bg-surface-alt dark:bg-surface-dark-alt border border-border dark:border-border-dark">
        <p className="text-sm font-medium mb-1">{stepDescription}</p>
        <p className="text-xs text-text-muted dark:text-text-dark-muted">{invariantExplanation}</p>
      </div>

      {/* Proof mode annotation */}
      {proofMode && proofAnnotation && (
        <div className={`p-3 rounded-lg border text-sm ${proofBadgeColors[proofAnnotation.type] ?? ''}`}>
          <span className="font-semibold text-xs uppercase tracking-wider">
            {proofBadgeLabels[proofAnnotation.type] ?? proofAnnotation.type}
          </span>
          <p className="mt-1 opacity-90">{proofAnnotation.text}</p>
        </div>
      )}

      {/* Action buttons & feedback */}
      <div className="flex items-center gap-3 flex-wrap">
        {!gameOver && (
          <button
            onClick={onFlag}
            disabled={!canFlag}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${canFlag
                ? 'bg-accent-red text-white hover:bg-accent-red/80 shadow-sm'
                : 'bg-surface-alt dark:bg-surface-dark-alt text-text-muted dark:text-text-dark-muted cursor-not-allowed border border-border dark:border-border-dark'
              }
            `}
          >
            Flag Bug!
          </button>
        )}
        <button
          onClick={onNewCase}
          className="px-4 py-2 rounded-lg font-medium text-sm bg-primary text-white hover:bg-primary-dark transition-all shadow-sm"
        >
          New Case
        </button>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-sm font-medium ${
            feedback.type === 'correct'
              ? 'bg-accent-green/15 border-accent-green/30 text-accent-green'
              : feedback.type === 'wrong'
                ? 'bg-accent-yellow/15 border-accent-yellow/30 text-accent-yellow'
                : 'bg-accent-red/15 border-accent-red/30 text-accent-red'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
