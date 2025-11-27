import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';

const fn = vi.fn;

// Lightweight shim to satisfy Storybook story imports during Vitest runs
export { within, userEvent, expect, fn };
