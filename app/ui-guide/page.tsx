"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"
import { Loader2, CheckCircle2, AlertCircle, Info, FileText } from "lucide-react"

export default function UIGuidePage() {
  const { t } = useLanguage()

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-balance text-3xl font-bold text-gray-900">{t.uiComponentGuide}</h1>
          <p className="text-pretty text-gray-500">Testing shared components and loading states</p>
        </div>

        {/* Section A: Loading States */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{t.loadingAndProgress}</h2>

          {/* Component 1: Spinner */}
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">{t.spinner}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-[#5D7AA5]" />
            </CardContent>
          </Card>

          {/* Component 2: Progress Bar */}
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">{t.progressBar}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={60} className="h-3" />
              <p className="text-center text-sm text-gray-500">60% Complete</p>
            </CardContent>
          </Card>

          {/* Component 3: Report Generating Overlay */}
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">{t.reportGeneratingOverlay}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 overflow-hidden rounded-2xl bg-gray-100">
                {/* Simulated content behind overlay */}
                <div className="p-6">
                  <div className="mb-4 h-6 w-3/4 rounded bg-gray-300"></div>
                  <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
                  <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
                  <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                </div>

                {/* Full Screen Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xl">
                  <div className="flex flex-col items-center gap-6">
                    <div className="rounded-3xl bg-[#5D7AA5] p-6 shadow-2xl shadow-[#5D7AA5]/30">
                      <FileText className="h-12 w-12 animate-pulse text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{t.aiWritingReport}</p>
                      <Loader2 className="mx-auto mt-4 h-6 w-6 animate-spin text-[#5D7AA5]" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section B: Alerts & Toasts */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{t.feedbackMessages}</h2>

          {/* Success Toast */}
          <Card className="border-green-200 bg-white/70 shadow-lg backdrop-blur-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">{t.successfullySaved}</p>
              </div>
            </CardContent>
          </Card>

          {/* Error Toast */}
          <Card className="border-red-200 bg-white/70 shadow-lg backdrop-blur-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-900">{t.failedToGenerate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Card className="border-blue-200 bg-blue-50/70 shadow-lg backdrop-blur-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">{t.infoMessage}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section C: Buttons */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{t.buttons}</h2>

          <Card className="border-gray-200 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Primary Button */}
                <Button className="rounded-xl bg-[#5D7AA5] px-6 py-3 text-white hover:bg-[#4d6a95]">
                  {t.primaryButton}
                </Button>

                {/* Secondary Button */}
                <Button
                  variant="outline"
                  className="rounded-xl border-2 border-gray-300 px-6 py-3 hover:bg-gray-50 bg-transparent"
                >
                  {t.secondaryButton}
                </Button>

                {/* Destructive Button */}
                <Button variant="destructive" className="rounded-xl bg-red-500 px-6 py-3 text-white hover:bg-red-600">
                  {t.destructiveButton}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
