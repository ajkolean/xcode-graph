/**
 * React Wrapper for GraphPlaceholderTab Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphPlaceholderTab } from '../layout/placeholder-tab';

export const LitPlaceholderTabElement = createComponent({
  tagName: 'graph-placeholder-tab',
  elementClass: GraphPlaceholderTab,
  react: React,
});

export interface LitPlaceholderTabProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
}

export function PlaceholderTab({ title = '', className, ...props }: LitPlaceholderTabProps) {
  return <LitPlaceholderTabElement title={title} className={className} {...props} />;
}
