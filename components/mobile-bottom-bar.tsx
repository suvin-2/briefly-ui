"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Layout, User, Beaker } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="border-t border-gray-200/50 bg-slate-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors",
                  isActive ? "bg-white text-gray-900" : "text-gray-600 hover:text-gray-900",
                  item.isDev && !isActive && "text-gray-400",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
