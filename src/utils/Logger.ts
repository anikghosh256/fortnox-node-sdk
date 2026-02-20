/**
 * Logger interface for SDK logging
 * Allows users to provide custom logger implementations
 */
export interface Logger {
  /**
   * Log debug messages
   * @param message - The message to log
   * @param args - Additional arguments
   */
  debug(message: string, ...args: unknown[]): void;

  /**
   * Log informational messages
   * @param message - The message to log
   * @param args - Additional arguments
   */
  info(message: string, ...args: unknown[]): void;

  /**
   * Log warning messages
   * @param message - The message to log
   * @param args - Additional arguments
   */
  warn(message: string, ...args: unknown[]): void;

  /**
   * Log error messages
   * @param message - The message to log
   * @param args - Additional arguments
   */
  error(message: string, ...args: unknown[]): void;
}

/**
 * Default console logger implementation
 * Only logs if enabled via configuration
 */
export class ConsoleLogger implements Logger {
  constructor(private readonly enabled: boolean = false) {}

  debug(message: string, ...args: unknown[]): void {
    if (this.enabled) {
      console.debug(`[Fortnox SDK] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.enabled) {
      console.info(`[Fortnox SDK] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.enabled) {
      console.warn(`[Fortnox SDK] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.enabled) {
      console.error(`[Fortnox SDK] ${message}`, ...args);
    }
  }
}

/**
 * No-op logger that doesn't log anything
 * Useful for production environments
 */
export class NoOpLogger implements Logger {
  debug(_message: string, ..._args: unknown[]): void {
    // No-op
  }

  info(_message: string, ..._args: unknown[]): void {
    // No-op
  }

  warn(_message: string, ..._args: unknown[]): void {
    // No-op
  }

  error(_message: string, ..._args: unknown[]): void {
    // No-op
  }
}
