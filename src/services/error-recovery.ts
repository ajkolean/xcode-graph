/**
 * Error Recovery Strategies
 *
 * Provides common error recovery patterns and retry logic for
 * handling failures in layout computation, rendering, and data fetching.
 *
 * Features:
 * - Exponential backoff retry
 * - Circuit breaker pattern
 * - Graceful degradation strategies
 * - Recovery action builders
 *
 * @module services/error-recovery
 */

import { ErrorCategory, ErrorSeverity } from "@shared/schemas/error.schema";
import { errorService } from "./error-service";

// ==================== Type Definitions ====================

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelayMs: number;
  /** Delay multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
}

/**
 * Circuit breaker state
 */
export type CircuitState = "closed" | "open" | "half-open";

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms to wait before attempting recovery */
  resetTimeoutMs: number;
  /** Number of successful calls needed to close circuit */
  successThreshold: number;
}

// ==================== Constants ====================

/** Default retry configuration */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

/** Default circuit breaker configuration */
export const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60000, // 1 minute
  successThreshold: 2,
};

// ==================== Retry Logic ====================

/**
 * Execute a function with exponential backoff retry
 *
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @returns Promise resolving to function result
 * @throws Error if all retry attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const { maxAttempts, initialDelayMs, backoffMultiplier, maxDelayMs } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        break;
      }

      // Wait before retrying
      await sleep(delay);

      // Exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== Circuit Breaker ====================

/**
 * Circuit breaker for preventing repeated failures
 */
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private nextAttemptTime = 0;

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG,
  ) {}

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker [${this.name}] is open`);
      }
      this.state = "half-open";
      this.successCount = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset circuit to closed state
   */
  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = 0;
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = "closed";
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = "open";
      this.nextAttemptTime = Date.now() + this.config.resetTimeoutMs;

      errorService.handleWarning(
        `Circuit breaker [${this.name}] opened after ${this.failureCount} failures`,
        ErrorCategory.Unknown,
      );
    }
  }
}

// ==================== Recovery Action Builders ====================

/**
 * Create a retry action for layout computation
 */
export function createLayoutRetryAction(
  computeLayoutFn: () => Promise<void>,
): () => Promise<void> {
  return async () => {
    try {
      await withRetry(computeLayoutFn, {
        maxAttempts: 2,
        initialDelayMs: 500,
      });

      errorService.handleInfo("Layout computation succeeded after retry");
    } catch (error) {
      errorService.handleError(error, {
        category: ErrorCategory.Layout,
        severity: ErrorSeverity.Error,
        userMessage: "Failed to compute layout after retrying",
      });
    }
  };
}

/**
 * Create a reload action for critical errors
 */
export function createReloadAction(): () => void {
  return () => {
    window.location.reload();
  };
}

/**
 * Create a refresh data action
 */
export function createRefreshDataAction(
  refreshFn: () => Promise<void>,
): () => Promise<void> {
  return async () => {
    try {
      await refreshFn();
      errorService.handleInfo("Data refreshed successfully");
    } catch (error) {
      errorService.handleError(error, {
        category: ErrorCategory.Data,
        severity: ErrorSeverity.Error,
        userMessage: "Failed to refresh data",
      });
    }
  };
}

// ==================== Graceful Degradation ====================

/**
 * Execute with fallback - returns fallback value if function fails
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  category: ErrorCategory = ErrorCategory.Unknown,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    errorService.handleError(error, {
      category,
      severity: ErrorSeverity.Warning,
      userMessage: "Operation failed, using fallback value",
      logToConsole: true,
    });
    return fallback;
  }
}

/**
 * Execute with timeout - throws if function takes too long
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  return Promise.race([fn(), timeoutPromise]);
}

// ==================== Global Circuit Breakers ====================

/** Circuit breaker for layout computation */
export const layoutCircuitBreaker = new CircuitBreaker("layout", {
  failureThreshold: 3,
  resetTimeoutMs: 30000,
  successThreshold: 2,
});

/** Circuit breaker for worker communication */
export const workerCircuitBreaker = new CircuitBreaker("worker", {
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  successThreshold: 3,
});
