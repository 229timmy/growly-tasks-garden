import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: React.ComponentType<FallbackProps>;
  fallbackRender?: (props: FallbackProps) => React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default fallback UI for ErrorBoundary
 */
function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Something went wrong</span>
        </CardTitle>
        <CardDescription>
          An error occurred while rendering this component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm font-mono bg-muted p-2 rounded overflow-auto max-h-32">
          {error?.message}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={resetErrorBoundary}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try again</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * ErrorBoundary
 * 
 * A reusable error boundary component that catches JavaScript errors anywhere in its
 * child component tree and displays a fallback UI instead of crashing the whole app.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <ComponentThatMightThrow />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { children, fallback, fallbackRender, FallbackComponent } = this.props;
    
    if (this.state.hasError && this.state.error) {
      const fallbackProps: FallbackProps = {
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary
      };
      
      // Use the provided fallback components in order of specificity
      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }
      
      if (fallbackRender) {
        return fallbackRender(fallbackProps);
      }
      
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      return <DefaultFallback {...fallbackProps} />;
    }

    return children;
  }
}

/**
 * withErrorBoundary
 * 
 * A higher-order component that wraps a component with an ErrorBoundary.
 * 
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(UnsafeComponent);
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

/**
 * useErrorHandler
 * 
 * A hook to programmatically trigger errors to be caught by the nearest ErrorBoundary.
 * 
 * @example
 * ```tsx
 * const { showBoundary } = useErrorBoundary();
 * 
 * try {
 *   doSomethingThatMightThrow();
 * } catch (error) {
 *   showBoundary(error);
 * }
 * ```
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  
  if (error) {
    throw error;
  }
  
  return {
    showBoundary: (error: Error) => setError(error),
    clearError: () => setError(null),
  };
} 