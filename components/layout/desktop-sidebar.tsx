"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Layout, User, Beaker } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function DesktopSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navigationItems = [
    { name: t.home, href: "/", icon: Home },
    { name: t.report, href: "/report", icon: FileText },
    { name: t.templates, href: "/templates", icon: Layout },
    { name: t.myPage, href: "/my-page", icon: User },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 md:block" role="complementary" aria-label="사이드바">
      <div className="h-full border-r border-gray-200/50 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center border-b border-gray-200/50 px-6 dark:border-zinc-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">{t.appName}</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4" role="navigation" aria-label="메인 네비게이션">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50",
                  )}
                  aria-label={item.name}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-gray-200/50 p-4 space-y-2 dark:border-zinc-800">
            <Link
              href="/ui-guide"
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                pathname === "/ui-guide"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-gray-500 hover:bg-white/50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50",
              )}
              aria-label={t.uiGuide}
              aria-current={pathname === "/ui-guide" ? "page" : undefined}
            >
              <Beaker className="h-5 w-5" aria-hidden="true" />
              {t.uiGuide}
            </Link>
            <div className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-white/50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50">
              <ThemeToggle />
              <span>테마</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
