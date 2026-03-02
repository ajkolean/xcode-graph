/**
 * Node Colors utility tests
 */

import { describe, expect, it } from 'vitest';
import { getNodeTypeColor, getNodeTypeColorFromTheme, NODE_TYPE_COLORS } from './node-colors';

describe('getNodeTypeColor', () => {
  it('returns mapped color for known type', () => {
    const color = getNodeTypeColor('app');
    expect(color).to.equal(NODE_TYPE_COLORS['app']);
  });

  it('returns default color for unknown type', () => {
    const color = getNodeTypeColor('unknown-type');
    expect(color).to.equal(NODE_TYPE_COLORS['app']);
  });
});

describe('getNodeTypeColorFromTheme', () => {
  const mockTheme = {
    nodeApp: '#FF0000',
    nodeFramework: '#00FF00',
    nodeLibrary: '#0000FF',
    nodeTest: '#FFFF00',
    nodeCli: '#FF00FF',
    nodePackage: '#00FFFF',
  } as Parameters<typeof getNodeTypeColorFromTheme>[1];

  it('returns themed color for known type', () => {
    expect(getNodeTypeColorFromTheme('framework', mockTheme)).to.equal('#00FF00');
  });

  it('returns nodeApp fallback for unknown type', () => {
    expect(getNodeTypeColorFromTheme('unknown', mockTheme)).to.equal('#FF0000');
  });
});
