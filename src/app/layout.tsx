// src/app/layout.tsx
import { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: 'Quid Pro Quo Plaza',
  description: 'The ultimate exchange platform',
};

// Note: Move AuthProvider to a separate client component
import { ClientLayout } from "./client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}