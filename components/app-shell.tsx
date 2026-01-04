"use client"

import type { ReactNode } from "react"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { MobileBottomBar } from "@/components/mobile-bottom-bar"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/30 via-purple-50/20 to-blue-50/30">
      {/* Desktop Sidebar - Hidden on mobile */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <main id="main-content" className="md:pl-64" role="main" aria-label="주요 콘텐츠">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:px-8 md:pb-6">{children}</div>
      </main>

      {/* Mobile Bottom Bar - Hidden on desktop */}
      <MobileBottomBar />
    </div>
  )
}
