import { createComponent } from '@lit/react';
import * as React from 'react';
import { GraphSlider } from '../ui/slider';

export const LitSliderElement = createComponent({
  tagName: 'graph-slider',
  elementClass: GraphSlider,
  react: React,
  events: {
    onSliderChange: 'slider-change',
  },
});

export interface LitSliderProps extends React.HTMLAttributes<HTMLElement> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
  onSliderChange?: (event: CustomEvent<{ value: number }>) => void;
}

export function LitSlider({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  disabled = false,
  className,
  onSliderChange,
  ...props
}: LitSliderProps) {
  return (
    <LitSliderElement
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      className={className}
      onSliderChange={onSliderChange}
      {...props}
    />
  );
}
