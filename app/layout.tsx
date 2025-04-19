import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Homework',
  description: 'Various homework assignments',
  generator: 'v0.dev',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Homework',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
  }
}

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: 'device-width',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-lvh bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="min-h-svh safe-area flex flex-col max-w-5xl mx-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
