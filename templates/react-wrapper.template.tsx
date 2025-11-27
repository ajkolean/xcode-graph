/**
 * TEMPLATE: React Wrapper for Lit Component
 *
 * Use this template to create React wrappers for Lit components.
 * This allows React components to use Lit components seamlessly.
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { COMPONENT_NAME } from '../ui/ELEMENT_TAG';

/**
 * React wrapper for the ELEMENT_TAG Lit component
 */
export const LitCOMPONENT_NAMEElement = createComponent({
  tagName: 'ELEMENT_TAG',
  elementClass: COMPONENT_NAME,
  react: React,
  events: {
    // Map Lit custom events to React props
    onComponentEvent: 'component-event',
  },
});

/**
 * Props interface for the React wrapper
 */
export interface LitCOMPONENT_NAMEProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * [Property description]
   */
  prop1?: string;

  /**
   * [Property description]
   */
  prop2?: boolean;

  /**
   * [Property description]
   */
  prop3?: number;

  /**
   * Event handler for component-event
   */
  onComponentEvent?: (event: CustomEvent) => void;
}

/**
 * React component wrapper for ELEMENT_TAG
 *
 * @example
 * ```tsx
 * <LitCOMPONENT_NAME
 *   prop1="value"
 *   prop3={42}
 *   onComponentEvent={(e) => console.log(e.detail)}
 * />
 * ```
 */
export function LitCOMPONENT_NAME({
  prop1 = '',
  prop2 = false,
  prop3 = 0,
  className,
  onComponentEvent,
  ...props
}: LitCOMPONENT_NAMEProps) {
  return (
    <LitCOMPONENT_NAMEElement
      prop1={prop1}
      prop2={prop2}
      prop3={prop3}
      className={className}
      onComponentEvent={onComponentEvent}
      {...props}
    />
  );
}
