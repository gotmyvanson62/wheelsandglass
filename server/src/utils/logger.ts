/**
 * Structured Logger for Production
 * Provides consistent JSON logging with log levels and context
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  correlationId?: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private service: string;
  private minLevel: LogLevel;
  private correlationId?: string;

  constructor(service: string, minLevel?: LogLevel) {
    this.service = service;
    this.minLevel = minLevel || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  }

  /**
   * Create a child logger with a correlation ID
   */
  withCorrelationId(correlationId: string): Logger {
    const child = new Logger(this.service, this.minLevel);
    child.correlationId = correlationId;
    return child;
  }

  /**
   * Create a child logger for a specific service
   */
  child(service: string): Logger {
    const child = new Logger(`${this.service}:${service}`, this.minLevel);
    child.correlationId = this.correlationId;
    return child;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
    };

    if (this.correlationId) {
      entry.correlationId = this.correlationId;
    }

    if (context && Object.keys(context).length > 0) {
      // Sanitize sensitive data
      entry.context = this.sanitize(context);
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      };
    }

    return entry;
  }

  private sanitize(obj: LogContext): LogContext {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization', 'auth'];
    const sanitized: LogContext = {};

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value as LogContext);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private output(entry: LogEntry): void {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Production: JSON output for log aggregators
      const output = entry.level === 'error' ? console.error : console.log;
      output(JSON.stringify(entry));
    } else {
      // Development: Human-readable output
      const levelColors: Record<LogLevel, string> = {
        debug: '\x1b[90m', // gray
        info: '\x1b[36m',  // cyan
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      };
      const reset = '\x1b[0m';
      const color = levelColors[entry.level];

      let output = `${color}[${entry.level.toUpperCase()}]${reset} [${entry.service}] ${entry.message}`;

      if (entry.correlationId) {
        output += ` (${entry.correlationId})`;
      }

      if (entry.context) {
        output += ` ${JSON.stringify(entry.context)}`;
      }

      if (entry.error) {
        output += `\n  Error: ${entry.error.message}`;
        if (entry.error.stack) {
          output += `\n  ${entry.error.stack}`;
        }
      }

      const logFn = entry.level === 'error' ? console.error : (entry.level === 'warn' ? console.warn : console.log);
      logFn(output);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.output(this.formatEntry('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.output(this.formatEntry('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.output(this.formatEntry('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.output(this.formatEntry('error', message, context, err));
    }
  }
}

// Default logger instance
export const logger = new Logger('wheels-and-glass');

// Service-specific loggers
export const loggers = {
  api: logger.child('api'),
  auth: logger.child('auth'),
  db: logger.child('db'),
  sms: logger.child('sms'),
  webhook: logger.child('webhook'),
  payment: logger.child('payment'),
  quote: logger.child('quote'),
};

/**
 * Create a request-scoped logger with correlation ID
 */
export function createRequestLogger(correlationId: string): Logger {
  return logger.withCorrelationId(correlationId);
}

export default logger;
