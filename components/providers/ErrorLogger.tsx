'use client';

import { useEffect } from 'react';

/**
 * ErrorLogger component captures global client-side errors and sends them to the server.
 */
export function ErrorLogger() {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      fetch('/api/system/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'ERROR',
          message: event.message || 'Uncaught Client Error',
          details: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
          },
        }),
      }).catch(console.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      fetch('/api/system/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'ERROR',
          message: 'Unhandled Promise Rejection',
          details: {
            reason: event.reason?.message || String(event.reason),
            stack: event.reason?.stack,
          },
        }),
      }).catch(console.error);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
