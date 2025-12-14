"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, FileSpreadsheet, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

interface TemplateUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateUploadModal({ open, onOpenChange }: TemplateUploadModalProps) {
  const { t } = useLanguage()
  const [fileType, setFileType] = useState<"xlsx" | "docx">("xlsx")
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      console.log("[v0] Uploading file:", selectedFile.name, "Type:", fileType)
      // Implement upload logic here
      onOpenChange(false)
      setSelectedFile(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md border-white/50 bg-white/80 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">{t.uploadCustomTemplate}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Type Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">{t.fileType}</Label>
            <RadioGroup value={fileType} onValueChange={(value) => setFileType(value as "xlsx" | "docx")}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="xlsx" id="xlsx" />
                  <Label htmlFor="xlsx" className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    Excel (.xlsx)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="docx" id="docx" />
                  <Label htmlFor="docx" className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Word (.docx)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/40 p-6 transition-all md:p-8",
              isDragging ? "border-[#5D7AA5] bg-[#5D7AA5]/5" : "border-gray-300",
            )}
          >
            <input
              type="file"
              accept={fileType === "xlsx" ? ".xlsx" : ".docx"}
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            {selectedFile ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5D7AA5]/10">
                  {fileType === "xlsx" ? (
                    <FileSpreadsheet className="h-8 w-8 text-[#5D7AA5]" />
                  ) : (
                    <FileText className="h-8 w-8 text-[#5D7AA5]" />
                  )}
                </div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5D7AA5]/10">
                  <Upload className="h-8 w-8 text-[#5D7AA5]" />
                </div>
                <p className="mb-2 text-base font-medium text-gray-900">{t.dragFileHere}</p>
                <p className="text-sm text-gray-500">{t.orClickBrowse}</p>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="rounded-xl bg-blue-50/50 p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t.proUsersOnly}</span> {t.onlyXlsxDocx}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="w-full bg-[#5D7AA5] text-white hover:bg-[#4d6a95] disabled:opacity-50 sm:w-auto"
          >
            {t.uploadTemplate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
