import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let abortController: AbortController | null = null;

    const checkAuth = async () => {
      try {
        abortController = new AbortController();

        const response = await fetch('/api/dashboard/stats', {
          credentials: 'include',
          signal: abortController.signal,
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401 || response.status === 403) {
          setIsAuthenticated(false);
          setLocation('/admin/login');
        } else {
          setIsAuthenticated(false);
          setLocation('/admin/login');
        }
      } catch (error: unknown) {
        if ((error as Error)?.name !== 'AbortError') {
          setIsAuthenticated(false);
          setLocation('/admin/login');
        }
      }
    };

    // Longer delay for mobile to allow session to be established
    const timer = setTimeout(checkAuth, 1000);

    return () => {
      clearTimeout(timer);
      abortController?.abort();
    };
  }, [setLocation]);

  // Show loading skeleton while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-4" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render children only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null if not authenticated (redirect is handled in useEffect)
  return null;
}