import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

/**
 * Loading spinner component with optional label
 */
export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {label && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {label}
        </span>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  children: React.ReactNode;
}

/**
 * Overlay that shows a loading spinner over content
 */
export function LoadingOverlay({ isLoading, label, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingSpinner size="lg" label={label} />
        </div>
      )}
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingLabel?: string;
  children: React.ReactNode;
}

/**
 * Component that handles loading and empty states
 */
export function LoadingState({
  isLoading,
  isEmpty = false,
  emptyMessage = 'No data available',
  loadingLabel = 'Loading...',
  children
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" label={loadingLabel} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default LoadingSpinner;
