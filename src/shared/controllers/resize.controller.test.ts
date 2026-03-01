/**
 * Tests for ResizeController re-export
 * Verifies the module re-exports from @lit-labs/observers correctly
 */

import { ResizeController as UpstreamResizeController } from '@lit-labs/observers/resize-controller.js';
import { describe, expect, it } from 'vitest';
import { ResizeController } from './resize.controller';

describe('ResizeController', () => {
  it('should re-export ResizeController from @lit-labs/observers', () => {
    expect(ResizeController).toBe(UpstreamResizeController);
  });
});
