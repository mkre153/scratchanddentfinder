import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/components/Providers'
import { SITE_NAME, DEFAULT_DESCRIPTION, SITE_URL } from '@/lib/config'
import {
  JsonLd,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/schema'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'

// Optimized font loading: preload, swap display, subset
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  // Icons auto-detected from icon.tsx and apple-icon.tsx (Next.js convention)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {/* JSON-LD: Organization → WebSite (deterministic order) */}
        <JsonLd data={generateOrganizationSchema()} />
        <JsonLd data={generateWebSiteSchema()} />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
        <Analytics />
        <GoogleAnalytics />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID.startsWith('ca-') ? process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID : `ca-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  )
}
