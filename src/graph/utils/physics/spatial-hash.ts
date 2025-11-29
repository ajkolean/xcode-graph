import { pairwise } from '@shared/pairwise';

/**
 * Spatial Hash Grid - Efficient collision detection
 *
 * Reduces collision detection from O(n²) to O(n) average case
 * by partitioning space into grid cells.
 *
 * **Algorithm:**
 * - Divide space into grid cells (cell size = 2 * max entity radius)
 * - Each entity is placed in one or more cells based on its bounding box
 * - Collision checks only happen within same cell and adjacent cells
 * - Instead of checking all n entities, check only ~8 neighbors per cell
 *
 * @module utils/physics/spatial-hash
 */

// ==================== Type Definitions ====================

/**
 * Entity with position, size, and identifier
 */
export interface SpatialEntity {
  x: number;
  y: number;
  radius: number;
  id: string;
}

/**
 * Configuration for spatial hash grid
 */
export interface SpatialHashConfig {
  cellSize: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

// ==================== Spatial Hash Class ====================

/**
 * Grid-based spatial indexing data structure
 *
 * Enables efficient collision detection by partitioning entities
 * into grid cells. Only entities in the same or adjacent cells
 * need to be checked for collisions.
 *
 * @typeParam T - Entity type (must extend SpatialEntity)
 */
export class SpatialHash<T extends SpatialEntity> {
  private readonly cellSize: number;
  private readonly grid: Map<string, Set<T>>;
  private readonly bounds?: SpatialHashConfig['bounds'];

  constructor(config: SpatialHashConfig) {
    this.cellSize = config.cellSize;
    this.bounds = config.bounds;
    this.grid = new Map();
  }

  /**
   * Clear all entities from the grid
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * Insert an entity into the spatial hash
   */
  insert(entity: T): void {
    const cells = this.getCellsForEntity(entity);
    for (const cellKey of cells) {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, new Set());
      }
      this.grid.get(cellKey)!.add(entity);
    }
  }

  /**
   * Insert multiple entities
   */
  insertMany(entities: T[]): void {
    for (const entity of entities) {
      this.insert(entity);
    }
  }

  /**
   * Get all entities in cells near this entity (including the entity itself)
   */
  getNearby(entity: T): T[] {
    const nearby = new Set<T>();
    const cells = this.getCellsForEntity(entity);

    for (const cellKey of cells) {
      this.collectEntitiesFromCell(cellKey, nearby);

      // Also check adjacent cells
      for (const adjacentKey of this.getAdjacentCellKeys(cellKey)) {
        this.collectEntitiesFromCell(adjacentKey, nearby);
      }
    }

    return Array.from(nearby);
  }

  /**
   * Collects entities from a cell into a set
   */
  private collectEntitiesFromCell(cellKey: string, target: Set<T>): void {
    const cellEntities = this.grid.get(cellKey);
    if (cellEntities) {
      for (const e of cellEntities) {
        target.add(e);
      }
    }
  }

  /**
   * Gets all 8 adjacent cell keys for a given cell
   */
  private getAdjacentCellKeys(cellKey: string): string[] {
    const [cellX, cellY] = this.parseCellKey(cellKey);
    const keys: string[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        keys.push(this.getCellKey(cellX + dx, cellY + dy));
      }
    }

    return keys;
  }

  /**
   * Get all potential collision pairs
   * More efficient than getNearby for batch collision detection
   */
  getPotentialCollisions(): Array<[T, T]> {
    const pairs: Array<[T, T]> = [];
    const checked = new Set<string>();

    for (const entities of this.grid.values()) {
      const entitiesArray = Array.from(entities);

      for (const [a, b] of pairwise(entitiesArray)) {
        const pairKey = this.getPairKey(a, b);

        if (!checked.has(pairKey)) {
          pairs.push([a, b]);
          checked.add(pairKey);
        }
      }
    }

    return pairs;
  }

  /**
   * Query entities in a specific region
   */
  queryRegion(minX: number, minY: number, maxX: number, maxY: number): T[] {
    const result = new Set<T>();

    const minCellX = Math.floor(minX / this.cellSize);
    const minCellY = Math.floor(minY / this.cellSize);
    const maxCellX = Math.floor(maxX / this.cellSize);
    const maxCellY = Math.floor(maxY / this.cellSize);

    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const cellKey = this.getCellKey(cellX, cellY);
        const cellEntities = this.grid.get(cellKey);
        if (cellEntities) {
          cellEntities.forEach((e) => {
            // Additional bounds check
            if (e.x >= minX && e.x <= maxX && e.y >= minY && e.y <= maxY) {
              result.add(e);
            }
          });
        }
      }
    }

    return Array.from(result);
  }

  /**
   * Get statistics about the spatial hash
   */
  getStats() {
    const cellCounts = Array.from(this.grid.values()).map((set) => set.size);
    const totalEntities = cellCounts.reduce((sum, count) => sum + count, 0);

    return {
      totalCells: this.grid.size,
      totalEntities,
      avgEntitiesPerCell: totalEntities / this.grid.size || 0,
      maxEntitiesPerCell: Math.max(...cellCounts, 0),
      minEntitiesPerCell: Math.min(...cellCounts, Infinity),
    };
  }

  // ========================================
  // Private Helpers
  // ========================================

  private getCellsForEntity(entity: T): string[] {
    const cells: string[] = [];
    const radius = entity.radius || 10;

    // Calculate bounding box
    const minX = entity.x - radius;
    const maxX = entity.x + radius;
    const minY = entity.y - radius;
    const maxY = entity.y + radius;

    // Get all cells this entity overlaps
    const minCellX = Math.floor(minX / this.cellSize);
    const maxCellX = Math.floor(maxX / this.cellSize);
    const minCellY = Math.floor(minY / this.cellSize);
    const maxCellY = Math.floor(maxY / this.cellSize);

    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        cells.push(this.getCellKey(cellX, cellY));
      }
    }

    return cells;
  }

  private getCellKey(cellX: number, cellY: number): string {
    return `${cellX},${cellY}`;
  }

  private parseCellKey(key: string): [number, number] {
    const [x, y] = key.split(',').map(Number);
    return [x, y];
  }

  private getPairKey(a: T, b: T): string {
    // Ensure consistent ordering
    return a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
  }
}

// ==================== Helper Functions ====================

/**
 * Create and populate a spatial hash from entities
 *
 * Automatically calculates cell size based on entity radii if not provided.
 *
 * @param entities - Entities to insert into the hash
 * @param cellSize - Optional cell size (defaults to 2x max radius)
 * @returns Populated SpatialHash instance
 */
export function createSpatialHash<T extends SpatialEntity>(
  entities: T[],
  cellSize?: number,
): SpatialHash<T> {
  // Auto-calculate cell size if not provided (2x the max radius)
  const autoCellSize = cellSize ?? Math.max(...entities.map((e) => e.radius || 10)) * 2;

  const hash = new SpatialHash<T>({ cellSize: autoCellSize });
  hash.insertMany(entities);
  return hash;
}
