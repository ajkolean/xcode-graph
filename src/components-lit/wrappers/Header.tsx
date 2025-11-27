/**
 * React Wrapper for GraphHeader Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphHeader } from '../layout/header';

export const LitHeaderElement = createComponent({
  tagName: 'graph-header',
  elementClass: GraphHeader,
  react: React,
});

export interface LitHeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function Header(props: LitHeaderProps = {}) {
  return <LitHeaderElement {...props} />;
}
