import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StartupAnalyst — AI-Powered Startup Validation',
  description: 'Get a rigorous, structured viability assessment of your startup idea powered by AI.',
  openGraph: {
    title: 'StartupAnalyst — AI-Powered Startup Validation',
    description: 'Get a rigorous, structured viability assessment of your startup idea powered by AI.',
  }
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
