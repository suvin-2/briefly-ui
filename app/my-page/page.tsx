"use client"

import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/components/auth-provider"
import type { Language } from "@/lib/i18n"
import { ChevronRight, Globe, LogOut, User } from "lucide-react"
import Image from "next/image"

export default function MyPage() {
  const { t, language, setLanguage } = useLanguage()
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 px-4 md:px-0">
        <div className="mb-6 space-y-2">
          <h1 className="text-balance text-3xl font-bold text-gray-900">{t.myPage}</h1>
          <p className="text-pretty text-gray-500">{t.updateAccountInfo}</p>
        </div>

        {/* Language Settings */}
        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#5D7AA5] p-3 shadow-md shadow-[#5D7AA5]/20">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">{t.languageSettings}</CardTitle>
                <CardDescription className="text-gray-500">{t.selectLanguage}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <RadioGroup value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-all hover:border-[#5D7AA5] hover:bg-gray-50">
                  <Label htmlFor="ko" className="flex flex-1 cursor-pointer items-center gap-3 text-base font-medium">
                    <RadioGroupItem value="ko" id="ko" />
                    한국어 (Korean)
                  </Label>
                  {language === "ko" && <ChevronRight className="h-5 w-5 text-[#5D7AA5]" />}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-all hover:border-[#5D7AA5] hover:bg-gray-50">
                  <Label htmlFor="en" className="flex flex-1 cursor-pointer items-center gap-3 text-base font-medium">
                    <RadioGroupItem value="en" id="en" />
                    English
                  </Label>
                  {language === "en" && <ChevronRight className="h-5 w-5 text-[#5D7AA5]" />}
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#5D7AA5] p-3 shadow-md shadow-[#5D7AA5]/20">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">{t.profileSettings}</CardTitle>
                <CardDescription className="text-gray-500">{t.updateAccountInfo}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {user ? (
              <div className="space-y-6">
                {/* User Profile */}
                <div className="flex items-center gap-4">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="rounded-full ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5D7AA5] text-2xl font-bold text-white">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">로그인이 필요합니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
