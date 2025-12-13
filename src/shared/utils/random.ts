/**
 * Simple seeded PRNG using mulberry32
 * Returns a function that generates deterministic "random" numbers
 */
function createSeededRandom(initialSeed: number): () => number {
  let seed = initialSeed;
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Global seeded random - reset with setSeed() for deterministic layouts
let seededRandom = createSeededRandom(12345);

/**
 * Reset the random seed for deterministic results
 */
export function setSeed(seed: number): void {
  seededRandom = createSeededRandom(seed);
}

/**
 * Get a deterministic "random" number between min and max
 */
export function randomNumber(min: number = 0, max: number = 1): number {
  return seededRandom() * (max - min) + min;
}
