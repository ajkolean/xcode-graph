/**
 * DEAD CODE - MARKED FOR DELETION
 *
 * This component is not used in the main application (`pnpm dev`) or Storybook.
 * Analysis date: 2025-11-26
 *
 * Can be safely deleted after verification that:
 * 1. `pnpm dev` works correctly
 * 2. `pnpm build` passes
 * 3. No hidden dependencies exist
 *
 * If you need this component, remove this comment and update the analysis.
 */

'use client';

import { useTheme } from 'next-themes@0.4.6';
import { Toaster as Sonner, type ToasterProps } from 'sonner@2.0.3';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
