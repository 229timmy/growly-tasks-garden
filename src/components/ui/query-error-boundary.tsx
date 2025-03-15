import React from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ServerCrash, RefreshCw } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { APIError } from '@/lib/api/client';

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Default fallback UI for query errors
 */
function QueryErrorFallback({ 
  error, 
  resetErrorBoundary,
  title = "Data Fetch Error",
  description = "Failed to load data"
}: FallbackProps & { title?: string; description?: string }) {
  const isApiError = error instanceof APIError;
  
  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <ServerCrash className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          {isApiError && error.status ? `Error ${error.status}: ` : ''}
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm font-mono bg-muted p-2 rounded overflow-auto max-h-32">
          {error.message}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={resetErrorBoundary}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * QueryErrorBoundary
 * 
 * A specialized error boundary for handling API/query errors.
 * Integrates with React Query to reset queries when errors are handled.
 * 
 * @example
 * ```tsx
 * <QueryErrorBoundary>
 *   <MyDataComponent />
 * </QueryErrorBoundary>
 * ```
 */
export function QueryErrorBoundary({ 
  children, 
  title,
  description,
  className 
}: QueryErrorBoundaryProps) {
  // Integration with React Query to reset queries when errors are handled
  const { reset } = useQueryErrorResetBoundary();
  
  return (
    <ErrorBoundary
      onReset={reset}
      className={className}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <QueryErrorFallback 
          error={error} 
          resetErrorBoundary={resetErrorBoundary}
          title={title}
          description={description}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * withQueryErrorBoundary
 * 
 * A higher-order component that wraps a component with a QueryErrorBoundary.
 * 
 * @example
 * ```tsx
 * const SafeDataComponent = withQueryErrorBoundary(UnsafeDataComponent);
 * ```
 */
export function withQueryErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithQueryErrorBoundary = (props: P) => (
    <QueryErrorBoundary>
      <Component {...props} />
    </QueryErrorBoundary>
  );
  
  ComponentWithQueryErrorBoundary.displayName = `withQueryErrorBoundary(${displayName})`;
  
  return ComponentWithQueryErrorBoundary;
} 