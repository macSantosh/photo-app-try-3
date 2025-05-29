/**
 * Logger utility for the application
 * Provides consistent logging with contextual information
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  
  private constructor() {}
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log information messages
   */
  public info(message: string, context?: LogContext): void {
    this.logWithLevel('info', message, context);
  }

  /**
   * Log warning messages
   */
  public warn(message: string, context?: LogContext): void {
    this.logWithLevel('warn', message, context);
  }

  /**
   * Log error messages
   */
  public error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      errorMessage: error?.message,
      stack: error?.stack,
    };
    this.logWithLevel('error', message, errorContext);
  }

  /**
   * Log debug messages
   */
  public debug(message: string, context?: LogContext): void {
    // Only log debug messages in development
    if (__DEV__) {
      this.logWithLevel('debug', message, context);
    }
  }

  private logWithLevel(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context, null, 2) : '';
    
    switch (level) {
      case 'info':
        console.log(`[${timestamp}] [INFO] ${message}`, contextStr);
        break;
      case 'warn':
        console.warn(`[${timestamp}] [WARN] ${message}`, contextStr);
        break;
      case 'error':
        console.error(`[${timestamp}] [ERROR] ${message}`, contextStr);
        break;
      case 'debug':
        console.debug(`[${timestamp}] [DEBUG] ${message}`, contextStr);
        break;
    }
  }
}

const logger = Logger.getInstance();
export default logger;
