/**
 * Minimal Error Logger for Production Monitoring
 * 
 * Captures critical errors without external dependencies.
 * Does NOT send sensitive data (emails, notes). Uses anonymized IDs.
 */

export type ErrorCategory = 
  | 'session_start'
  | 'session_finish'
  | 'session_discard'
  | 'mapping_normalization'
  | 'analytics_compute'
  | 'user_level_cache'
  | 'unknown';

interface ErrorLogEntry {
  category: ErrorCategory;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  userId?: string; // Anonymized ID (last 8 chars of UUID)
}

// In-memory buffer for errors (max 100 entries)
const errorBuffer: ErrorLogEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Anonymize user ID by keeping only last 8 characters
 */
function anonymizeUserId(userId?: string): string | undefined {
  if (!userId) return undefined;
  return userId.slice(-8);
}

/**
 * Remove sensitive data from context
 */
function sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  
  const sensitiveKeys = ['email', 'notes', 'password', 'token', 'key', 'secret', 'pain_note'];
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.includes('@')) {
      // Likely an email
      sanitized[key] = '[REDACTED_EMAIL]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Log an error to the buffer
 */
export function logError(
  category: ErrorCategory,
  message: string,
  options?: {
    error?: unknown;
    userId?: string;
    context?: Record<string, unknown>;
    showToast?: boolean;
  }
): void {
  const entry: ErrorLogEntry = {
    category,
    message,
    context: sanitizeContext(options?.context),
    timestamp: new Date().toISOString(),
    userId: anonymizeUserId(options?.userId),
  };
  
  // Add error details if present
  if (options?.error) {
    if (options.error instanceof Error) {
      entry.context = {
        ...entry.context,
        errorName: options.error.name,
        errorMessage: options.error.message,
      };
    } else if (typeof options.error === 'object') {
      entry.context = {
        ...entry.context,
        errorDetails: JSON.stringify(options.error).slice(0, 500),
      };
    }
  }
  
  // Add to buffer
  errorBuffer.push(entry);
  if (errorBuffer.length > MAX_BUFFER_SIZE) {
    errorBuffer.shift();
  }
  
  // Always log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${category}] ${message}`, entry.context);
  }
}

/**
 * Get all logged errors (for debugging)
 */
export function getErrorLog(): ErrorLogEntry[] {
  return [...errorBuffer];
}

/**
 * Clear error log
 */
export function clearErrorLog(): void {
  errorBuffer.length = 0;
}

/**
 * Get count of errors by category
 */
export function getErrorCounts(): Record<ErrorCategory, number> {
  const counts: Record<ErrorCategory, number> = {
    session_start: 0,
    session_finish: 0,
    session_discard: 0,
    mapping_normalization: 0,
    analytics_compute: 0,
    user_level_cache: 0,
    unknown: 0,
  };
  
  for (const entry of errorBuffer) {
    counts[entry.category]++;
  }
  
  return counts;
}
