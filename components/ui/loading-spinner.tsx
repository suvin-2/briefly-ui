"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  text?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, text = "불러오는 중...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}>
      <Loader2 className={cn("animate-spin text-[#5D7AA5]", sizeClasses[size])} />
      <p className={cn("text-gray-500", textSizeClasses[size])}>{text}</p>
    </div>
  )
}
