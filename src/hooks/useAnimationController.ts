import { useState, useCallback, useRef, useEffect } from 'react';

export interface AnimationState {
  currentStep: number;
  isPlaying: boolean;
  speed: number; // ms per step
  totalSteps: number;
}

export interface AnimationControls {
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  jumpTo: (step: number) => void;
}

export function useAnimationController(totalSteps: number, initialSpeed = 200) {
  const [state, setState] = useState<AnimationState>({
    currentStep: 0,
    isPlaying: false,
    speed: initialSpeed,
    totalSteps,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Update totalSteps when it changes
  useEffect(() => {
    setState(prev => ({ ...prev, totalSteps }));
  }, [totalSteps]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      const s = stateRef.current;
      if (s.currentStep >= s.totalSteps - 1) {
        clearTimer();
        setState(prev => ({ ...prev, isPlaying: false }));
        return;
      }
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }, stateRef.current.speed);
  }, [clearTimer]);

  const play = useCallback(() => {
    const s = stateRef.current;
    if (s.currentStep >= s.totalSteps - 1) {
      // Reset to beginning if at end
      setState(prev => ({ ...prev, currentStep: 0, isPlaying: true }));
    } else {
      setState(prev => ({ ...prev, isPlaying: true }));
    }
    startTimer();
  }, [startTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [clearTimer]);

  const stepForward = useCallback(() => {
    clearTimer();
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
    }));
  }, [clearTimer]);

  const stepBackward = useCallback(() => {
    clearTimer();
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
  }, [clearTimer]);

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }));
    if (stateRef.current.isPlaying) {
      startTimer();
    }
  }, [startTimer]);

  const jumpTo = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.totalSteps - 1)),
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  const controls: AnimationControls = {
    play, pause, stepForward, stepBackward, reset, setSpeed, jumpTo,
  };

  return { state, controls };
}
