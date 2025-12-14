"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import type { DateRange } from "react-day-picker"

interface GenerateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateReportDialog({ open, onOpenChange }: GenerateReportDialogProps) {
  const isMobile = useMobile()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [template, setTemplate] = useState<string>()

  const handleGenerate = () => {
    // Generate report logic here
    console.log("[v0] Generating report with:", { dateRange, template })
    onOpenChange(false)
  }

  const content = (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="date-range">Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              initialFocus
              numberOfMonths={1}
              classNames={{
                day_range_start: "bg-[#5D7AA5] text-white rounded-l-full hover:bg-[#5D7AA5]",
                day_range_end: "bg-[#5D7AA5] text-white rounded-r-full hover:bg-[#5D7AA5]",
                day_range_middle: "bg-blue-100 text-[#5D7AA5] rounded-none",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">Template</Label>
        <Select value={template} onValueChange={setTemplate}>
          <SelectTrigger id="template">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly-summary">Weekly Summary</SelectItem>
            <SelectItem value="monthly-overview">Monthly Overview</SelectItem>
            <SelectItem value="project-update">Project Update</SelectItem>
            <SelectItem value="team-performance">Team Performance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full bg-[#5D7AA5] text-white hover:bg-[#4d6a95]" size="lg" onClick={handleGenerate}>
        <Sparkles className="mr-2 h-5 w-5" />
        Generate with AI
      </Button>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="border-white/50 bg-white/90 backdrop-blur-md">
          <DrawerHeader>
            <DrawerTitle className="text-gray-900">Generate New Report</DrawerTitle>
            <DrawerDescription className="text-gray-500">
              Select date range and template to create your report
            </DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/50 bg-white/90 backdrop-blur-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Generate New Report</DialogTitle>
          <DialogDescription className="text-gray-500">
            Select date range and template to create your report
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
