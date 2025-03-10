/**
 * Simple logger utility for consistent logging across the application
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(message: string): string {
    return `[${this.context}] ${message}`;
  }

  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage(message), ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(message), ...args);
  }

  error(message: string, error?: any): void {
    if (error instanceof Error) {
      console.error(this.formatMessage(message), error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    } else if (error) {
      console.error(this.formatMessage(message), error);
    } else {
      console.error(this.formatMessage(message));
    }
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(message), ...args);
    }
  }
}

// Export a default logger instance for use throughout the application
export const logger = new Logger('SturgTrader');
