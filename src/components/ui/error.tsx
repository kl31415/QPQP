'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorComponent({
  error,
  reset,
  children,
}: {
  error?: Error;
  reset?: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <Button
          onClick={() => reset?.()}
          variant="destructive"
          className="mb-4"
        >
          Try again
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Page
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}