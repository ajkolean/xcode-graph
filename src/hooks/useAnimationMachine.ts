import { useMachine } from '@zag-js/react';
import { useCallback, useId } from 'react';
import { animationMachine } from '../machines/animation.machine';

interface UseAnimationMachineProps {
  defaultMaxTicks?: number;
  onSettled?: () => void;
}

/**
 * React hook for the animation state machine
 *
 * Provides a convenient API for managing layout animation states:
 * - Idle: No animation
 * - Animating: Animation in progress
 * - Settled: Animation complete
 */
export function useAnimationMachine(props: UseAnimationMachineProps = {}) {
  const id = useId();
  const service = useMachine(animationMachine, {
    id,
    defaultMaxTicks: props.defaultMaxTicks,
    onSettled: props.onSettled,
  });

  // Current state
  const isIdle = service.state.matches('idle');
  const isAnimating = service.state.matches('animating');
  const isSettled = service.state.matches('settled');

  const tickCount = service.context.get('tickCount');
  const maxTicks = service.context.get('maxTicks');
  const alpha = service.context.get('alpha');

  // Progress as a percentage (0-100)
  const progress = maxTicks > 0 ? (tickCount / maxTicks) * 100 : 0;

  // Actions
  const start = useCallback(
    (maxTicks?: number) => {
      service.send({ type: 'START', maxTicks });
    },
    [service],
  );

  const tick = useCallback(() => {
    service.send({ type: 'TICK' });
  }, [service]);

  const reset = useCallback(() => {
    service.send({ type: 'RESET' });
  }, [service]);

  const disable = useCallback(() => {
    service.send({ type: 'DISABLE' });
  }, [service]);

  const enable = useCallback(() => {
    service.send({ type: 'ENABLE' });
  }, [service]);

  return {
    // State
    isIdle,
    isAnimating,
    isSettled,
    tickCount,
    maxTicks,
    alpha,
    progress,

    // Actions
    start,
    tick,
    reset,
    disable,
    enable,

    // Raw service for advanced use cases
    service,
  };
}
