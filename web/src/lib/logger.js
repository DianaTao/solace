/**
 * Logger utility for SOLACE application
 * Provides consistent logging across the application with environment-aware output
 */

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = null) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    return `[${timestamp}]${contextStr} ${level}: ${message}`;
  }

  /**
   * Log info messages (development only)
   */
  info(message, context = null) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('INFO', message, context)); // eslint-disable-line no-console
    }
  }

  /**
   * Log warning messages
   */
  warn(message, context = null) {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('WARN', message, context)); // eslint-disable-line no-console
    }
  }

  /**
   * Log error messages (always shown, but safely)
   */
  error(message, error = null, context = null) {
    const errorDetails = error ? ` - ${error.message || error}` : '';
    const fullMessage = `${message}${errorDetails}`;
    
    if (this.isDevelopment) {
      console.error(this.formatMessage('ERROR', fullMessage, context)); // eslint-disable-line no-console
      if (error && error.stack) {
        console.error(error.stack); // eslint-disable-line no-console
      }
    } else {
      // In production, you might want to send to a logging service
      // For now, we'll just store it or send to an error tracking service
      this.logToService('ERROR', fullMessage, context, error);
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message, data = null, context = null) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('DEBUG', message, context)); // eslint-disable-line no-console
      if (data) {
        console.log(data); // eslint-disable-line no-console
      }
    }
  }

  /**
   * Log success messages with emoji (development only)
   */
  success(message, context = null) {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`, context ? `[${context}]` : ''); // eslint-disable-line no-console
    }
  }

  /**
   * Log authentication-related messages
   */
  auth(message, context = 'AUTH') {
    this.info(`🔐 ${message}`, context);
  }

  /**
   * Log database-related messages
   */
  database(message, context = 'DATABASE') {
    this.info(`🗄️ ${message}`, context);
  }

  /**
   * Log API-related messages
   */
  api(message, context = 'API') {
    this.info(`🌐 ${message}`, context);
  }

  /**
   * Send logs to external service in production
   * This is where you'd integrate with services like Sentry, LogRocket, etc.
   */
  logToService(level, message, context, error) {
    // In production, you might want to:
    // 1. Send to error tracking service (Sentry, Bugsnag)
    // 2. Send to analytics (Mixpanel, Amplitude)
    // 3. Store in database for debugging
    
    // For now, we'll just store critical errors
    if (level === 'ERROR' && typeof window !== 'undefined') {
      // Store in localStorage for debugging (limit to last 50 errors)
      try {
        const errors = JSON.parse(localStorage.getItem('solace_errors') || '[]');
        errors.unshift({
          timestamp: new Date().toISOString(),
          level,
          message,
          context,
          error: error ? {
            message: error.message,
            stack: error.stack
          } : null
        });
        
        // Keep only last 50 errors
        const recentErrors = errors.slice(0, 50);
        localStorage.setItem('solace_errors', JSON.stringify(recentErrors));
      } catch (storageError) {
        // If localStorage fails, fail silently
      }
    }
  }

  /**
   * Get stored errors for debugging
   */
  getStoredErrors() {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('solace_errors') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('solace_errors');
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Export specific methods for convenience
export const { info, warn, error, debug, success, auth, database, api } = logger; 