"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/i18n"
import LoginPage from "../login/page"
import { ChevronRight, Globe } from "lucide-react"

export default function MyPage() {
  const { t, language, setLanguage } = useLanguage()
  const [showLogin, setShowLogin] = useState(false)

  if (showLogin) {
    return <LoginPage />
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

        {/* Login Test Button */}
        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">{t.testLogin}</CardTitle>
            <CardDescription className="text-gray-500">View the login screen design</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowLogin(true)}
              className="w-full rounded-xl bg-[#5D7AA5] text-white hover:bg-[#4d6a95] sm:w-auto"
            >
              {t.testLogin}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">{t.profileSettings}</CardTitle>
            <CardDescription className="text-gray-500">{t.updateAccountInfo}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Profile content and settings go here...</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
