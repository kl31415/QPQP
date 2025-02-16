import { Metadata } from "next";
import "@/styles/globals.css";
import { ClientLayout } from "./client";

export const metadata: Metadata = {
  title: 'Quid Pro Quo Plaza',
  description: 'The ultimate exchange platform',
};

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