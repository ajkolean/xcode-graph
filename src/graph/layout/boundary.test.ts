import { describe, expect, it } from 'vitest';
import forceBoundary from './boundary';

describe('forceBoundary', () => {
  it('creates a force function with setter methods', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    expect(typeof force).toBe('function');
    expect(typeof force.initialize).toBe('function');
    expect(typeof force.x0).toBe('function');
    expect(typeof force.x1).toBe('function');
    expect(typeof force.y0).toBe('function');
    expect(typeof force.y1).toBe('function');
    expect(typeof force.strength).toBe('function');
    expect(typeof force.border).toBe('function');
    expect(typeof force.hardBoundary).toBe('function');
  });

  it('setters return the force for chaining', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    expect(force.x0(0)).toBe(force);
    expect(force.x1(200)).toBe(force);
    expect(force.y0(0)).toBe(force);
    expect(force.y1(200)).toBe(force);
    expect(force.strength(0.5)).toBe(force);
    expect(force.border(20)).toBe(force);
    expect(force.hardBoundary(false)).toBe(force);
  });

  it('accepts function accessors for x0, x1, y0, y1', () => {
    const force = forceBoundary(
      () => -50,
      () => -50,
      () => 50,
      () => 50,
    );
    const nodes = [{ x: 0, y: 0, vx: 0, vy: 0 }];
    force.initialize(nodes);
    // Should not throw
    force(1.0);
  });

  it('accepts constant values for setters', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    force.initialize([{ x: 0, y: 0, vx: 0, vy: 0 }]);
    force.x0(-200);
    force.x1(200);
    force.y0(-200);
    force.y1(200);
    force.strength(0.3);
    force.border(10);
    // Should not throw
    force(0.5);
  });

  it('accepts function accessors for strength and border setters', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    force.initialize([{ x: 0, y: 0, vx: 0, vy: 0 }]);
    force.strength(() => 0.5);
    force.border(() => 10);
    force(0.5);
  });
});

describe('isNearBorder / force main loop', () => {
  it('applies velocity adjustments to nodes near the border', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    const node = { x: 95, y: 0, vx: 0, vy: 0 };
    force.initialize([node]);
    force(1.0);

    // Node at x=95 is near right border (100) within default border zone
    // Force should push it toward center (negative vx)
    expect(node.vx).toBeLessThan(0);
  });

  it('does not adjust velocity for nodes far from border', () => {
    const force = forceBoundary(-1000, -1000, 1000, 1000);
    force.border(10);
    const node = { x: 0, y: 0, vx: 0, vy: 0 };
    force.initialize([node]);
    force(1.0);

    // Node at center of large boundary, far from border
    // Only hard boundary might apply but x is well inside
    expect(node.vx).toBe(0);
    expect(node.vy).toBe(0);
  });
});

describe('applyHardBoundary', () => {
  it('constrains node position when outside right boundary', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    force.hardBoundary(true);
    const node = { x: 150, y: 0, vx: 0, vy: 0 };
    force.initialize([node]);
    force(1.0);

    // Node at x=150 is beyond x1=100, hard boundary should add negative vx
    expect(node.vx).toBeLessThan(0);
  });

  it('constrains node position when outside left boundary', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    force.hardBoundary(true);
    const node = { x: -150, y: 0, vx: 0, vy: 0 };
    force.initialize([node]);
    force(1.0);

    // Node at x=-150 is beyond x0=-100
    expect(node.vx).toBeGreaterThan(0);
  });

  it('constrains node position when outside bottom boundary', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    force.hardBoundary(true);
    const node = { x: 0, y: 150, vx: 0, vy: 0 };
    force.initialize([node]);
    force(1.0);

    expect(node.vy).toBeLessThan(0);
  });

  it('constrains node position when outside top boundary', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    force.hardBoundary(true);
    const node = { x: 0, y: -150, vx: 0, vy: 0 };
    force.initialize([node]);
    force(1.0);

    expect(node.vy).toBeGreaterThan(0);
  });

  it('does not constrain when hardBoundary is false', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    force.hardBoundary(false);
    force.border(1); // Very small border so near-border check is narrow
    const node = { x: 150, y: 150, vx: 0, vy: 0 };
    force.initialize([node]);
    force(1.0);

    // Near-border check may still apply force, but hard clamp should not
    // With border=1, the node at 150 is near border (150 > 100-1=99)
    // So the near-border soft force may adjust vx/vy toward center
    // But the hard boundary clamp effect is separate
    // Let's verify it doesn't add the hard boundary correction specifically
    // by checking behavior differs from hard boundary = true
    const forceHard = forceBoundary(-100, -100, 100, 100);
    forceHard.hardBoundary(true);
    forceHard.border(1);
    const nodeHard = { x: 150, y: 150, vx: 0, vy: 0 };
    forceHard.initialize([nodeHard]);
    forceHard(1.0);

    // Hard boundary should add stronger correction
    expect(Math.abs(nodeHard.vx)).toBeGreaterThan(Math.abs(node.vx));
  });
});

describe('initialize', () => {
  it('handles empty node array', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    force.initialize([]);
    // Should not throw
    force(1.0);
  });

  it('handles nodes with undefined positions', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    const node = { vx: 0, vy: 0 }; // x, y undefined
    force.initialize([node]);
    force(1.0);
    // Should use 0 as default for undefined x/y
  });

  it('handles multiple nodes', () => {
    const force = forceBoundary(-100, -100, 100, 100);
    const nodes = [
      { x: -90, y: 0, vx: 0, vy: 0 },
      { x: 90, y: 0, vx: 0, vy: 0 },
      { x: 0, y: -90, vx: 0, vy: 0 },
      { x: 0, y: 90, vx: 0, vy: 0 },
    ];
    force.initialize(nodes);
    force(1.0);
    // All nodes near borders should have velocity adjustments
    for (const n of nodes) {
      expect(typeof n.vx).toBe('number');
      expect(typeof n.vy).toBe('number');
    }
  });
});

describe('toAccessor null handling', () => {
  it('handles null values by using default', () => {
    // Passing null as boundary value (cast to number to match type)
    const force = forceBoundary(
      null as unknown as number,
      null as unknown as number,
      null as unknown as number,
      null as unknown as number,
    );
    const node = { x: 0, y: 0, vx: 0, vy: 0 };
    force.initialize([node]);
    // Should use defaults (-100, -100, 100, 100) and not throw
    force(1.0);
  });
});

describe('computeDefaultBorder', () => {
  it('computes border as half of the smaller dimension', () => {
    // forceBoundary with constants: width = 200-0 = 200, height = 100-0 = 100
    // defaultBorder = min(200, 100) / 2 = 50
    const force = forceBoundary(0, 0, 200, 100);
    // The default border is computed internally
    // We verify by testing that a node at position 55 (within 50 of border at 100)
    // is treated as near-border
    const node = { x: 160, y: 50, vx: 0, vy: 0 };
    force.initialize([node]);
    force(1.0);
    // Node at x=160 with x1=200, border=50 means threshold is 200-50=150
    // So 160 > 150 → near border → should get velocity adjustment
    expect(node.vx).not.toBe(0);
  });

  it('uses function accessor defaults when boundary values are functions', () => {
    // When x0/y0/x1/y1 are functions, computeDefaultBorder uses 100/-100 defaults
    const force = forceBoundary(
      () => 0,
      () => 0,
      () => 200,
      () => 100,
    );
    // computeDefaultBorder receives functions → uses (100 - -100) = 200 for both → min = 200 → border = 100
    const node = { x: 0, y: 0, vx: 0, vy: 0 };
    force.initialize([node]);
    // Should not throw
    force(1.0);
  });
});
