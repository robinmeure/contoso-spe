// src/utils/errorHandling.ts

/**
 * Error severity levels for appropriate handling
 */
export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * Context information for more detailed error reporting
 */
export interface ErrorContext {
  component?: string;
  operation?: string;
  params?: Record<string, any>;
  user?: string;
  [key: string]: any;
}

/**
 * Error handler interface following the Interface Segregation Principle
 */
export interface IErrorHandler {
  handleError(error: Error | unknown, context?: ErrorContext, severity?: ErrorSeverity): void;
  logWarning(message: string, context?: ErrorContext): void;
  logInfo(message: string, context?: ErrorContext): void;
}

/**
 * Default error handler implementation
 * Centralizes error handling logic throughout the application
 */
export class ErrorHandler implements IErrorHandler {
  /**
   * Handle errors consistently across the application
   */
  handleError(
    error: Error | unknown, 
    context?: ErrorContext, 
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ): void {
    // Format the error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Create a structured log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      severity,
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context
    };
    
    // Log with appropriate severity
    switch (severity) {
      case ErrorSeverity.INFO:
        console.info(`[${severity}]`, logEntry);
        break;
      case ErrorSeverity.WARNING:
        console.warn(`[${severity}]`, logEntry);
        break;
      case ErrorSeverity.CRITICAL:
        console.error(`[${severity}] CRITICAL:`, logEntry);
        // In a real app, we might want to notify on-call engineers for critical errors
        // this.notifyCriticalError(logEntry);
        break;
      case ErrorSeverity.ERROR:
      default:
        console.error(`[${severity}]`, logEntry);
        break;
    }
    
    // In a production app, we would send telemetry to a monitoring service
    // this.sendToMonitoringService(logEntry);
  }
  
  /**
   * Log warning messages
   */
  logWarning(message: string, context?: ErrorContext): void {
    this.handleError(new Error(message), context, ErrorSeverity.WARNING);
  }
  
  /**
   * Log informational messages
   */
  logInfo(message: string, context?: ErrorContext): void {
    this.handleError(new Error(message), context, ErrorSeverity.INFO);
  }
  
  /**
   * Send telemetry to a monitoring service (placeholder)
   */
  private sendToMonitoringService(logEntry: any): void {
    // Implementation would integrate with Azure Monitor, Application Insights, etc.
    // For now we're just stubbing this method
  }
  
  /**
   * Notify about critical errors (placeholder)
   */
  private notifyCriticalError(logEntry: any): void {
    // Would send email/SMS/Slack notifications about critical errors
    // For now we're just stubbing this method
  }
}

// Create a singleton instance for app-wide use
export const errorHandler = new ErrorHandler();