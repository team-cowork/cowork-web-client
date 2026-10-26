'use client';

import {
  Suspense,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from 'react';

import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

export interface QueryBoundaryProps {
  children: ReactNode;
  loadingFallback: ReactNode;
  errorFallback: ComponentType<FallbackProps>;
  resetKeys?: unknown[];
  onError?: (error: unknown) => void;
}

function subscribe() {
  return () => {};
}

export function QueryBoundary({
  children,
  loadingFallback,
  errorFallback,
  resetKeys,
  onError,
}: QueryBoundaryProps) {
  const isMounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { reset } = useQueryErrorResetBoundary();

  if (!isMounted) return loadingFallback;

  return (
    <ErrorBoundary
      onReset={reset}
      onError={onError}
      FallbackComponent={errorFallback}
      resetKeys={resetKeys}
    >
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
