"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface AnnouncerContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null)

export function SrOnlyAnnouncer({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState("")
  const [assertiveMessage, setAssertiveMessage] = useState("")

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      setAssertiveMessage(message)
      setTimeout(() => setAssertiveMessage(""), 100)
    } else {
      setPoliteMessage(message)
      setTimeout(() => setPoliteMessage(""), 100)
    }
  }, [])

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* 스크린 리더 전용 live region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  )
}

export function useAnnouncer() {
  const context = useContext(AnnouncerContext)
  if (!context) {
    throw new Error("useAnnouncer must be used within SrOnlyAnnouncer")
  }
  return context
}
