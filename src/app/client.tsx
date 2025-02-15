// src/app/ClientLayout.tsx
'use client';

import { AuthProvider } from "@/context/authContext";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}