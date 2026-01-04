"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Layout, User, Beaker } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function MobileBottomBar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navigationItems = [
    { name: t.home, href: "/", icon: Home },
    { name: t.report, href: "/report", icon: FileText },
    { name: t.templates, href: "/templates", icon: Layout },
    { name: t.myPage, href: "/my-page", icon: User },
    { name: t.uiGuide, href: "/ui-guide", icon: Beaker, isDev: true },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden" role="navigation" aria-label="모바일 메인 네비게이션">
      <div className="border-t border-gray-200/50 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                  isActive ? "bg-white text-gray-900 dark:bg-zinc-800 dark:text-zinc-50" : "text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-50",
                  item.isDev && !isActive && "text-gray-400 dark:text-zinc-600",
                )}
                aria-label={item.name}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
          <div className="flex flex-col items-center gap-1 px-3 py-2">
            <ThemeToggle />
            <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">테마</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
