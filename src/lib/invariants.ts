// ── Types ────────────────────────────────────────────────────────────────────

export type ScenarioType = 'two-pointer' | 'stack-parens' | 'heap-insert';

export interface TwoPointerState {
  kind: 'two-pointer';
  array: number[];
  left: number;
  right: number;
  target: number;
  found: boolean;
}

export interface StackParensState {
  kind: 'stack-parens';
  input: string;
  cursor: number;
  stack: string[];
}

export interface HeapState {
  kind: 'heap-insert';
  heap: number[];
  highlightA: number; // primary highlighted index (-1 = none)
  highlightB: number; // secondary highlighted index (-1 = none)
}

export type ScenarioState = TwoPointerState | StackParensState | HeapState;

export interface ProofAnnotation {
  type: 'base' | 'hypothesis' | 'step' | 'broken';
  text: string;
}

export interface AlgorithmStep {
  description: string;
  state: ScenarioState;
  invariantHolds: boolean;
  invariantExplanation: string;
  proofAnnotation?: ProofAnnotation;
}

export interface Scenario {
  type: ScenarioType;
  title: string;
  invariantRule: string;
  steps: AlgorithmStep[];
  bugStepIndex: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Two-Pointer Scenario ─────────────────────────────────────────────────────
// Find a pair in a sorted array that sums to a target.
// Invariant: left <= right

function generateTwoPointerScenario(): Scenario {
  // Generate a sorted array of 8–10 distinct values
  const n = randInt(8, 10);
  const values = new Set<number>();
  while (values.size < n) values.add(randInt(1, 40));
  const array = [...values].sort((a, b) => a - b);

  // Pick a valid pair so the algorithm converges
  const li = randInt(0, Math.floor(n / 2) - 1);
  const ri = randInt(Math.ceil(n / 2), n - 1);
  const target = array[li] + array[ri];

  // Run the correct algorithm, collecting steps
  const correctSteps: AlgorithmStep[] = [];
  let left = 0;
  let right = n - 1;

  correctSteps.push({
    description: `Initialize: left=0, right=${right}. Target sum = ${target}.`,
    state: { kind: 'two-pointer', array, left, right, target, found: false },
    invariantHolds: true,
    invariantExplanation: `left (${left}) <= right (${right}). Search space is valid.`,
    proofAnnotation: { type: 'base', text: `Base case: left=0, right=${right}. Since 0 <= ${right}, the invariant holds initially.` },
  });

  while (left < right) {
    const sum = array[left] + array[right];
    if (sum === target) {
      correctSteps.push({
        description: `arr[${left}] + arr[${right}] = ${array[left]} + ${array[right]} = ${target}. Found!`,
        state: { kind: 'two-pointer', array, left, right, target, found: true },
        invariantHolds: true,
        invariantExplanation: `left (${left}) <= right (${right}). Pair found while invariant holds.`,
        proofAnnotation: { type: 'step', text: `Sum equals target. Invariant still holds (${left} <= ${right}). Algorithm terminates successfully.` },
      });
      break;
    } else if (sum < target) {
      const oldLeft = left;
      left++;
      correctSteps.push({
        description: `arr[${oldLeft}] + arr[${right}] = ${array[oldLeft]} + ${array[right]} = ${sum} < ${target}. Move left pointer right.`,
        state: { kind: 'two-pointer', array, left, right, target, found: false },
        invariantHolds: true,
        invariantExplanation: `left (${left}) <= right (${right}). Search space still valid.`,
        proofAnnotation: { type: 'step', text: `Inductive step: sum < target, so arr[${oldLeft}] can't be part of any valid pair with arr[${oldLeft + 1}..${right}]. Moving left preserves invariant: ${left} <= ${right}.` },
      });
    } else {
      const oldRight = right;
      right--;
      correctSteps.push({
        description: `arr[${left}] + arr[${oldRight}] = ${array[left]} + ${array[oldRight]} = ${sum} > ${target}. Move right pointer left.`,
        state: { kind: 'two-pointer', array, left, right, target, found: false },
        invariantHolds: true,
        invariantExplanation: `left (${left}) <= right (${right}). Search space still valid.`,
        proofAnnotation: { type: 'step', text: `Inductive step: sum > target, so arr[${oldRight}] can't be part of any valid pair with arr[${left}..${oldRight - 1}]. Moving right preserves invariant: ${left} <= ${right}.` },
      });
    }
  }

  // Inject a bug: pick a step (not the first, not the last) and break the invariant
  // We replace that step so left jumps past right
  const bugCandidates = correctSteps
    .map((_, i) => i)
    .filter(i => i >= 2 && i < correctSteps.length - 1);

  const bugStepIndex = bugCandidates.length > 0
    ? bugCandidates[randInt(0, bugCandidates.length - 1)]
    : Math.min(2, correctSteps.length - 1);

  // Create the bugged version: at bugStepIndex, left jumps to right+1
  const prev = correctSteps[bugStepIndex - 1].state as TwoPointerState;
  const bugLeft = prev.right + 1;
  const bugRight = prev.right;

  const buggedSteps: AlgorithmStep[] = correctSteps.map((step, i) => {
    if (i < bugStepIndex) return step;
    if (i === bugStepIndex) {
      return {
        ...step,
        description: `Bug! arr[${prev.left}] + arr[${prev.right}] sum too small. Left jumps to index ${bugLeft}.`,
        state: { kind: 'two-pointer' as const, array, left: bugLeft, right: bugRight, target, found: false },
        invariantHolds: false,
        invariantExplanation: `left (${bugLeft}) > right (${bugRight}). The invariant is BROKEN — search space is invalid!`,
        proofAnnotation: { type: 'broken' as const, text: `Inductive step FAILS: left was moved to ${bugLeft} but right is ${bugRight}. The invariant left <= right no longer holds. The proof breaks here.` },
      };
    }
    // Steps after the bug continue with broken state
    return {
      ...step,
      state: { kind: 'two-pointer' as const, array, left: bugLeft, right: bugRight, target, found: false },
      invariantHolds: false,
      invariantExplanation: `left (${bugLeft}) > right (${bugRight}). Invariant remains broken from step ${bugStepIndex + 1}.`,
      proofAnnotation: { type: 'broken' as const, text: `Invariant was broken at step ${bugStepIndex + 1}. All subsequent reasoning is invalid.` },
    };
  });

  return {
    type: 'two-pointer',
    title: 'Two-Pointer Search',
    invariantRule: 'left <= right',
    steps: buggedSteps,
    bugStepIndex,
  };
}

// ── Stack Parentheses Scenario ───────────────────────────────────────────────
// Scan a bracket string and validate it using a stack.
// Invariant: stack always contains only unmatched open brackets

function generateStackParensScenario(): Scenario {
  // Generate a balanced parentheses string, then we'll process it
  const pairs: Array<[string, string]> = [['(', ')'], ['[', ']'], ['{', '}']];
  const depth = randInt(3, 5);

  // Build a balanced string by random nesting
  function buildBalanced(maxDepth: number): string {
    if (maxDepth === 0) return '';
    const pair = pairs[randInt(0, pairs.length - 1)];
    const inner = buildBalanced(maxDepth - 1);
    const suffix = maxDepth > 1 && Math.random() > 0.5 ? buildBalanced(maxDepth - 1) : '';
    return pair[0] + inner + pair[1] + suffix;
  }

  const input = buildBalanced(depth);
  if (input.length < 6) {
    // Ensure minimum length for interesting gameplay
    return generateStackParensScenario();
  }

  const openers = new Set(['(', '[', '{']);
  const matchMap: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  // Build correct steps
  const correctSteps: AlgorithmStep[] = [];
  const stack: string[] = [];

  correctSteps.push({
    description: `Start scanning: "${input}". Stack is empty.`,
    state: { kind: 'stack-parens', input, cursor: -1, stack: [] },
    invariantHolds: true,
    invariantExplanation: 'Stack is empty — trivially contains only unmatched open brackets.',
    proofAnnotation: { type: 'base', text: 'Base case: before scanning, the stack is empty. An empty stack trivially satisfies the invariant.' },
  });

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (openers.has(ch)) {
      stack.push(ch);
      correctSteps.push({
        description: `Read '${ch}' at position ${i}. Push onto stack.`,
        state: { kind: 'stack-parens', input, cursor: i, stack: [...stack] },
        invariantHolds: true,
        invariantExplanation: `Pushed open bracket '${ch}'. Stack [${stack.join(', ')}] contains only unmatched openers.`,
        proofAnnotation: { type: 'step', text: `Inductive step: '${ch}' is an opener. Pushing it preserves the invariant — every element in the stack is an unmatched open bracket.` },
      });
    } else {
      const expected = matchMap[ch];
      const popped = stack.pop();
      correctSteps.push({
        description: `Read '${ch}' at position ${i}. Pop '${popped}' — it matches.`,
        state: { kind: 'stack-parens', input, cursor: i, stack: [...stack] },
        invariantHolds: true,
        invariantExplanation: `Popped '${popped}' to match '${ch}'. Stack [${stack.join(', ')}] still only has unmatched openers.`,
        proofAnnotation: { type: 'step', text: `Inductive step: '${ch}' closes '${expected}'. Popping the matching opener preserves the invariant — remaining stack items are still unmatched.` },
      });
    }
  }

  // Final step
  correctSteps.push({
    description: `Finished scanning. Stack is ${stack.length === 0 ? 'empty — string is balanced!' : 'not empty — unmatched brackets remain.'}`,
    state: { kind: 'stack-parens', input, cursor: input.length, stack: [...stack] },
    invariantHolds: true,
    invariantExplanation: stack.length === 0
      ? 'Stack is empty. All brackets matched. Invariant held throughout.'
      : `Stack has ${stack.length} unmatched openers. Invariant held but string is unbalanced.`,
    proofAnnotation: { type: 'step', text: 'Scanning complete. The invariant held at every step, so our conclusion about balance is correct.' },
  });

  // Inject bug: at a step that processes a close bracket, we DON'T pop
  // Instead we push the close bracket, corrupting the stack
  const closerSteps = correctSteps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => {
      const st = s.state as StackParensState;
      return st.cursor >= 0 && st.cursor < input.length && !openers.has(input[st.cursor]);
    });

  if (closerSteps.length === 0) {
    // Very unlikely, but just regenerate
    return generateStackParensScenario();
  }

  const bugEntry = closerSteps[randInt(0, closerSteps.length - 1)];
  const bugStepIndex = bugEntry.i;
  const bugCursor = (correctSteps[bugStepIndex].state as StackParensState).cursor;
  const bugChar = input[bugCursor];

  // Rebuild steps with the bug
  const buggedSteps: AlgorithmStep[] = [];
  const bugStack: string[] = [];
  let bugInjected = false;

  for (let i = 0; i < correctSteps.length; i++) {
    if (i === 0) {
      buggedSteps.push(correctSteps[0]);
      continue;
    }

    if (i < bugStepIndex) {
      // Replay correct steps, maintaining our own stack
      const st = correctSteps[i].state as StackParensState;
      if (st.cursor >= 0 && st.cursor < input.length) {
        const ch = input[st.cursor];
        if (openers.has(ch)) {
          bugStack.push(ch);
        } else {
          bugStack.pop();
        }
      }
      buggedSteps.push(correctSteps[i]);
      continue;
    }

    if (i === bugStepIndex && !bugInjected) {
      bugInjected = true;
      // Instead of popping, push the close bracket
      bugStack.push(bugChar);
      buggedSteps.push({
        description: `Read '${bugChar}' at position ${bugCursor}. Bug! Pushed '${bugChar}' instead of popping.`,
        state: { kind: 'stack-parens', input, cursor: bugCursor, stack: [...bugStack] },
        invariantHolds: false,
        invariantExplanation: `Stack [${bugStack.join(', ')}] now contains '${bugChar}', a CLOSE bracket. Invariant broken — stack should only have open brackets!`,
        proofAnnotation: { type: 'broken', text: `Inductive step FAILS: '${bugChar}' is a closer but was pushed instead of matching-and-popping. The stack no longer contains only unmatched openers.` },
      });
      continue;
    }

    // Steps after the bug — continue with corrupted stack
    if (i > bugStepIndex && i < correctSteps.length - 1) {
      const st = correctSteps[i].state as StackParensState;
      if (st.cursor >= 0 && st.cursor < input.length) {
        const ch = input[st.cursor];
        if (openers.has(ch)) {
          bugStack.push(ch);
        } else {
          bugStack.pop();
        }
      }
      buggedSteps.push({
        ...correctSteps[i],
        description: correctSteps[i].description,
        state: { kind: 'stack-parens', input, cursor: st.cursor, stack: [...bugStack] },
        invariantHolds: false,
        invariantExplanation: `Stack is corrupted since step ${bugStepIndex + 1}. Contains close bracket '${bugChar}'.`,
        proofAnnotation: { type: 'broken', text: `Invariant was broken at step ${bugStepIndex + 1}. Subsequent reasoning is unreliable.` },
      });
      continue;
    }

    // Final step
    buggedSteps.push({
      ...correctSteps[i],
      state: { kind: 'stack-parens', input, cursor: input.length, stack: [...bugStack] },
      invariantHolds: false,
      invariantExplanation: `Stack is corrupted — balance check result is unreliable.`,
      proofAnnotation: { type: 'broken', text: `The invariant broke at step ${bugStepIndex + 1}. The final result cannot be trusted.` },
    });
  }

  return {
    type: 'stack-parens',
    title: 'Stack Parentheses',
    invariantRule: 'Stack contains only unmatched open brackets',
    steps: buggedSteps,
    bugStepIndex,
  };
}

// ── Min-Heap Insert Scenario ─────────────────────────────────────────────────
// Insert values one by one into a min-heap, bubbling up.
// Invariant: parent <= children for every node.

function parentIdx(i: number): number { return Math.floor((i - 1) / 2); }
function leftChild(i: number): number { return 2 * i + 1; }
function rightChild(i: number): number { return 2 * i + 2; }

function checkHeapInvariant(heap: number[]): { holds: boolean; violationAt?: [number, number] } {
  for (let i = 1; i < heap.length; i++) {
    const p = parentIdx(i);
    if (heap[p] > heap[i]) {
      return { holds: false, violationAt: [p, i] };
    }
  }
  return { holds: true };
}

function generateHeapScenario(): Scenario {
  // Values to insert
  const count = randInt(5, 7);
  const values = shuffle(Array.from({ length: 15 }, (_, i) => i + 1)).slice(0, count);

  const steps: AlgorithmStep[] = [];
  const heap: number[] = [];

  steps.push({
    description: `Start with empty heap. Will insert: [${values.join(', ')}].`,
    state: { kind: 'heap-insert', heap: [], highlightA: -1, highlightB: -1 },
    invariantHolds: true,
    invariantExplanation: 'Empty heap — invariant trivially holds.',
    proofAnnotation: { type: 'base', text: 'Base case: an empty heap has no parent-child pairs, so the invariant parent <= children holds vacuously.' },
  });

  // Pick which insertion will have the bug (skip the first one — it's trivial)
  const bugInsertIdx = randInt(2, count - 1);

  let bugInjected = false;
  let bugStepIndex = -1;

  for (let ins = 0; ins < count; ins++) {
    const val = values[ins];
    heap.push(val);
    const insertedAt = heap.length - 1;

    steps.push({
      description: `Insert ${val} at index ${insertedAt} (end of array).`,
      state: { kind: 'heap-insert', heap: [...heap], highlightA: insertedAt, highlightB: -1 },
      invariantHolds: true,
      invariantExplanation: insertedAt === 0
        ? `Single element — invariant holds.`
        : `Inserted at index ${insertedAt}. Parent is heap[${parentIdx(insertedAt)}]=${heap[parentIdx(insertedAt)]}. Need to check if bubble-up is required.`,
      proofAnnotation: { type: 'step', text: `Insert ${val} at leaf position ${insertedAt}. Before bubble-up, the heap property may be temporarily violated at this node.` },
    });

    // Bubble up
    let ci = insertedAt;
    if (ins === bugInsertIdx && !bugInjected) {
      // This is the bugged insertion — skip the first bubble-up swap
      const pi = parentIdx(ci);
      if (pi >= 0 && heap[pi] > heap[ci]) {
        // There IS a violation — skip the swap (inject bug)
        bugInjected = true;
        bugStepIndex = steps.length;

        steps.push({
          description: `Bug! heap[${pi}]=${heap[pi]} > heap[${ci}]=${heap[ci]}, but bubble-up swap was SKIPPED.`,
          state: { kind: 'heap-insert', heap: [...heap], highlightA: pi, highlightB: ci },
          invariantHolds: false,
          invariantExplanation: `heap[${pi}]=${heap[pi]} > heap[${ci}]=${heap[ci]}. Parent is GREATER than child — invariant BROKEN!`,
          proofAnnotation: { type: 'broken', text: `Inductive step FAILS: after inserting ${val}, heap[${pi}]=${heap[pi]} > heap[${ci}]=${heap[ci]}. The swap that should restore the invariant was skipped.` },
        });

        // Don't bubble up — leave the heap broken
        continue;
      }
      // If no swap needed (value is already in order), this isn't a good bug spot.
      // Fall through to normal bubble-up and try to bug the next insertion.
    }

    // Normal bubble up
    while (ci > 0) {
      const pi = parentIdx(ci);
      if (heap[pi] <= heap[ci]) break;
      // Swap
      [heap[pi], heap[ci]] = [heap[ci], heap[pi]];
      steps.push({
        description: `Bubble up: swap heap[${pi}]=${heap[ci]} with heap[${ci}]=${heap[pi]}. (${heap[pi]} < ${heap[ci]})`,
        state: { kind: 'heap-insert', heap: [...heap], highlightA: pi, highlightB: ci },
        invariantHolds: !bugInjected,
        invariantExplanation: bugInjected
          ? `Heap still has a violation from the skipped swap at step ${bugStepIndex + 1}.`
          : `After swap, heap[${pi}]=${heap[pi]} <= heap[${ci}]=${heap[ci]}. Invariant maintained.`,
        proofAnnotation: bugInjected
          ? { type: 'broken', text: `Invariant was broken at step ${bugStepIndex + 1}. Subsequent swaps cannot fully repair it.` }
          : { type: 'step', text: `Inductive step: swapping ${heap[pi]} up restores parent <= child at index ${pi}. The sub-heap below ${ci} was already valid.` },
      });
      ci = pi;
    }

    // After bubble-up completes (or if no swap needed)
    if (ci === insertedAt && !bugInjected) {
      // No swap was needed
      if (insertedAt > 0) {
        steps.push({
          description: `No swap needed — heap[${parentIdx(ci)}]=${heap[parentIdx(ci)]} <= ${val}. Heap property holds.`,
          state: { kind: 'heap-insert', heap: [...heap], highlightA: ci, highlightB: -1 },
          invariantHolds: true,
          invariantExplanation: `Parent ${heap[parentIdx(ci)]} <= child ${val}. Invariant maintained.`,
          proofAnnotation: { type: 'step', text: `Inductive step: ${val} >= its parent, so insertion preserves the heap property without any swaps.` },
        });
      }
    }
  }

  // If we never managed to inject a bug (very rare: value always in order), regenerate
  if (!bugInjected) {
    return generateHeapScenario();
  }

  // After all insertions, verify invariant status on remaining steps
  const finalCheck = checkHeapInvariant(heap);
  steps.push({
    description: finalCheck.holds
      ? `All values inserted. Heap: [${heap.join(', ')}].`
      : `All values inserted. Heap: [${heap.join(', ')}]. Violation present!`,
    state: { kind: 'heap-insert', heap: [...heap], highlightA: -1, highlightB: -1 },
    invariantHolds: finalCheck.holds && !bugInjected,
    invariantExplanation: bugInjected
      ? `Heap has a violation due to the skipped swap. Final heap is not a valid min-heap.`
      : `All parent <= child relationships hold. Valid min-heap.`,
    proofAnnotation: bugInjected
      ? { type: 'broken', text: `The skipped swap at step ${bugStepIndex + 1} left a permanent violation. This heap cannot be trusted.` }
      : { type: 'step', text: `By induction, every insertion preserved the heap property. The final heap is valid.` },
  });

  return {
    type: 'heap-insert',
    title: 'Min-Heap Insert',
    invariantRule: 'parent <= children (for every node)',
    steps,
    bugStepIndex,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export function generateScenario(type: ScenarioType): Scenario {
  switch (type) {
    case 'two-pointer': return generateTwoPointerScenario();
    case 'stack-parens': return generateStackParensScenario();
    case 'heap-insert': return generateHeapScenario();
  }
}

export const SCENARIO_INFO: Record<ScenarioType, { title: string; invariant: string; icon: string; brief: string }> = {
  'two-pointer': {
    title: 'Two-Pointer Search',
    invariant: 'left <= right',
    icon: '👈👉',
    brief: 'Find a pair that sums to a target in a sorted array',
  },
  'stack-parens': {
    title: 'Stack Parentheses',
    invariant: 'Stack contains only unmatched open brackets',
    icon: '🥞',
    brief: 'Validate a bracket string using a stack',
  },
  'heap-insert': {
    title: 'Min-Heap Insert',
    invariant: 'parent <= children',
    icon: '🌳',
    brief: 'Insert values into a min-heap with bubble-up',
  },
};

export const ALL_SCENARIO_TYPES: ScenarioType[] = ['two-pointer', 'stack-parens', 'heap-insert'];
