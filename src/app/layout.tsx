import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Quid Pro Quo Plaza',
  description: 'The ultimate exchange platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
