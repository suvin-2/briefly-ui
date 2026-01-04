import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/components/auth-provider"
import { QueryProvider } from "@/components/query-provider"
import { ProgressBarProvider } from "@/components/progress-bar-provider"
import { SrOnlyAnnouncer } from "@/components/sr-only-announcer"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Briefly",
  description: "Created with v0",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased`}>
        <a href="#main-content" className="skip-to-main">
          메인 콘텐츠로 이동
        </a>
        <ProgressBarProvider>
          <QueryProvider>
            <AuthProvider>
              <SrOnlyAnnouncer>
                <LanguageProvider>{children}</LanguageProvider>
              </SrOnlyAnnouncer>
            </AuthProvider>
          </QueryProvider>
        </ProgressBarProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
