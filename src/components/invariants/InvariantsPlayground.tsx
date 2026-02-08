import { useState, useCallback, useEffect } from 'react';
import {
  type ScenarioType,
  type Scenario,
  generateScenario,
  ALL_SCENARIO_TYPES,
} from '../../lib/invariants';
import { useAnimationController } from '../../hooks/useAnimationController';
import { useProgress } from '../../hooks/useProgress';
import AnimationController from '../shared/AnimationController';
import InfoPanel from '../shared/InfoPanel';
import ScenarioSelector from './ScenarioSelector';
import StateVisualizer from './StateVisualizer';
import InvariantPanel from './InvariantPanel';

export default function InvariantsPlayground() {
  const [scenarioType, setScenarioType] = useState<ScenarioType>('two-pointer');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [proofMode, setProofMode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'missed'; message: string } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [triedScenarios, setTriedScenarios] = useState<Set<ScenarioType>>(new Set(['two-pointer']));

  const { markMilestone } = useProgress('invariants');

  // Generate first scenario on mount (avoids SSR/client mismatch from Math.random)
  useEffect(() => {
    setScenario(generateScenario('two-pointer'));
  }, []);

  const totalSteps = scenario ? scenario.steps.length : 1;
  const { state: animState, controls: animControls } = useAnimationController(totalSteps);
  const currentStep = animState.currentStep;

  // Generate a new case for the current scenario type
  const handleNewCase = useCallback(() => {
    const s = generateScenario(scenarioType);
    setScenario(s);
    setFeedback(null);
    setGameOver(false);
    animControls.reset();
  }, [scenarioType, animControls]);

  // Switch scenario type
  const handleSelectScenario = useCallback((type: ScenarioType) => {
    setScenarioType(type);
    const s = generateScenario(type);
    setScenario(s);
    setFeedback(null);
    setGameOver(false);
    animControls.reset();
    setTriedScenarios(prev => {
      const next = new Set(prev);
      next.add(type);
      return next;
    });
  }, [animControls]);

  // Flag bug
  const handleFlag = useCallback(() => {
    if (gameOver || !scenario) return;

    const isCorrect = currentStep === scenario.bugStepIndex;
    const isCloseEnough = currentStep > scenario.bugStepIndex && !scenario.steps[currentStep]?.invariantHolds;

    setScore(prev => ({
      correct: prev.correct + ((isCorrect || isCloseEnough) ? 1 : 0),
      attempts: prev.attempts + 1,
    }));

    if (isCorrect) {
      setFeedback({
        type: 'correct',
        message: `Correct! The invariant "${scenario.invariantRule}" broke at this exact step. Great detective work!`,
      });
      setConsecutiveCorrect(prev => prev + 1);
      setGameOver(true);
      animControls.pause();
    } else if (isCloseEnough) {
      setFeedback({
        type: 'correct',
        message: `Close enough! The invariant first broke at step ${scenario.bugStepIndex + 1}, but you correctly identified it's broken here too.`,
      });
      setConsecutiveCorrect(prev => prev + 1);
      setGameOver(true);
      animControls.pause();
    } else if (currentStep < scenario.bugStepIndex) {
      setFeedback({
        type: 'wrong',
        message: `Not yet — the invariant "${scenario.invariantRule}" still holds at this step. Keep stepping forward.`,
      });
      setConsecutiveCorrect(0);
    } else {
      setFeedback({
        type: 'missed',
        message: `You missed it! The bug was at step ${scenario.bugStepIndex + 1}. The invariant was already broken before this point.`,
      });
      setConsecutiveCorrect(0);
      setGameOver(true);
      animControls.pause();
    }
  }, [currentStep, scenario, gameOver, animControls]);

  // Milestone tracking
  useEffect(() => {
    if (feedback?.type === 'correct') {
      markMilestone('spotted-first-bug');
    }
  }, [feedback, markMilestone]);

  useEffect(() => {
    if (triedScenarios.size === ALL_SCENARIO_TYPES.length) {
      markMilestone('tried-all-scenarios');
    }
  }, [triedScenarios, markMilestone]);

  useEffect(() => {
    if (proofMode) {
      markMilestone('used-proof-mode');
    }
  }, [proofMode, markMilestone]);

  useEffect(() => {
    if (consecutiveCorrect >= 3) {
      markMilestone('perfect-detective');
    }
  }, [consecutiveCorrect, markMilestone]);

  // When animation reaches the end and player hasn't flagged, give a hint
  useEffect(() => {
    if (scenario && currentStep === totalSteps - 1 && totalSteps > 1 && !gameOver && !feedback) {
      setFeedback({
        type: 'missed',
        message: `You reached the end! The bug was at step ${scenario.bugStepIndex + 1}. Try a new case and look more carefully.`,
      });
      setGameOver(true);
    }
  }, [currentStep, totalSteps, gameOver, feedback, scenario]);

  // Loading state while scenario generates on client
  if (!scenario) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center py-12 text-text-muted dark:text-text-dark-muted">
          Loading scenario...
        </div>
      </div>
    );
  }

  const currentAlgoStep = scenario.steps[currentStep] ?? scenario.steps[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Scenario selection */}
      <ScenarioSelector
        selected={scenarioType}
        onSelect={handleSelectScenario}
        triedScenarios={triedScenarios}
      />

      {/* Controls row: animation + proof mode toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <AnimationController state={animState} controls={animControls} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <div
              role="switch"
              aria-checked={proofMode}
              tabIndex={0}
              onClick={() => setProofMode(p => !p)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setProofMode(p => !p); } }}
              className={`
                relative w-10 h-5 rounded-full transition-colors
                ${proofMode
                  ? 'bg-accent-purple'
                  : 'bg-border dark:bg-border-dark'
                }
              `}
            >
              <div
                className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                  ${proofMode ? 'translate-x-5' : 'translate-x-0.5'}
                `}
              />
            </div>
            <span className={proofMode ? 'text-accent-purple font-medium' : 'text-text-muted dark:text-text-dark-muted'}>
              Proof Mode
            </span>
          </label>
        </div>
      </div>

      {/* Visualization */}
      <div className="p-4 border border-border dark:border-border-dark rounded-xl bg-surface dark:bg-surface-dark min-h-[200px] flex items-center justify-center">
        <StateVisualizer
          state={currentAlgoStep.state}
          invariantHolds={currentAlgoStep.invariantHolds}
        />
      </div>

      {/* Invariant panel with flag button, feedback, proof annotations */}
      <InvariantPanel
        invariantRule={scenario.invariantRule}
        canFlag={!gameOver && currentStep > 0}
        onFlag={handleFlag}
        feedback={feedback}
        stepDescription={currentAlgoStep.description}
        invariantExplanation={gameOver ? currentAlgoStep.invariantExplanation : 'Step through and decide — is the invariant still holding?'}
        proofMode={proofMode}
        proofAnnotation={proofMode ? currentAlgoStep.proofAnnotation : undefined}
        onNewCase={handleNewCase}
        score={score}
        gameOver={gameOver}
      />

      {/* Educational panels */}
      <div className="flex flex-col gap-3">
        <InfoPanel title="What is an Invariant?" defaultOpen>
          <p className="mb-2">
            An <strong>invariant</strong> is a property that remains true throughout the execution of an algorithm.
            It&apos;s like a contract: if the invariant holds before a step, it must hold after it.
          </p>
          <p>
            Examples: &ldquo;the array is sorted,&rdquo; &ldquo;the stack contains only unmatched open brackets,&rdquo;
            or &ldquo;every parent in the heap is smaller than its children.&rdquo;
          </p>
        </InfoPanel>
        <InfoPanel title="Invariants as a Debugging Tool">
          <p className="mb-2">
            When a program produces a wrong result, the most efficient debugging strategy is:
            <strong> find the first step where an invariant breaks.</strong>
          </p>
          <p>
            If you know what should always be true, you can binary-search through execution to find
            the exact moment it stops being true. That&apos;s the bug.
          </p>
        </InfoPanel>
        <InfoPanel title="Proof Mode: Inductive Reasoning">
          <p className="mb-2">
            Toggle <strong>Proof Mode</strong> to see how invariants connect to mathematical induction:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Base case:</strong> The invariant holds at the start (step 0).</li>
            <li><strong>Inductive hypothesis:</strong> Assume the invariant holds after step k.</li>
            <li><strong>Inductive step:</strong> Show it still holds after step k+1.</li>
            <li>When the bug is injected, the inductive step <em>fails</em> — that&apos;s the proof breaking.</li>
          </ul>
        </InfoPanel>
      </div>
    </div>
  );
}
