'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/authContext';
import { Toaster } from '@/components/ui/toaster';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}