/**
 * Vector math utilities for 2D physics calculations
 */

export interface Vec2 {
  x: number;
  y: number;
}

export const vec2 = {
  subtract: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),

  add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),

  scale: (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s }),

  magnitude: (v: Vec2): number => Math.hypot(v.x, v.y),

  normalize: (v: Vec2): Vec2 => {
    const mag = vec2.magnitude(v);
    return mag > 0 ? vec2.scale(v, 1 / mag) : { x: 0, y: 0 };
  },

  distance: (a: Vec2, b: Vec2): number => vec2.magnitude(vec2.subtract(b, a)),
};
