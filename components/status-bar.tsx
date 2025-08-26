"use client"

import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"

interface StatusBarProps {
  status: string
}

export function StatusBar({ status }: StatusBarProps) {
  return (
    <Card className="p-3 bg-slate-800 border-slate-700">
      <div className="flex items-center gap-2 text-sm">
        <Info className="w-4 h-4 text-slate-400" />
        <span className="text-slate-300">{status}</span>
      </div>
    </Card>
  )
}
