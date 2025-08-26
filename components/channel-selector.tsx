"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { ExcelData, ChannelSelection } from "@/lib/types"

interface ChannelSelectorProps {
  excelData: ExcelData | null
  channelSelections: ChannelSelection[]
  onChannelSelectionsChange: (selections: ChannelSelection[]) => void
  globalInterval: 5 | 15
  onGlobalIntervalChange: (interval: 5 | 15) => void
}

export function ChannelSelector({
  excelData,
  channelSelections,
  onChannelSelectionsChange,
  globalInterval,
  onGlobalIntervalChange,
}: ChannelSelectorProps) {
  if (!excelData) {
    return (
      <div className="text-muted-foreground text-center py-8">
        Carga un archivo Excel para ver las opciones de canal
      </div>
    )
  }

  if (!excelData.hasChannelColumn) {
    return (
      <div className="space-y-4">
        <Label htmlFor="global-interval">Seleccionar Intervalo:</Label>
        <Select
          value={globalInterval.toString()}
          onValueChange={(value) => onGlobalIntervalChange(Number.parseInt(value) as 5 | 15)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Cada 5 minutos</SelectItem>
            <SelectItem value="15">Cada 15 minutos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  const handleChannelToggle = (channelIndex: number, checked: boolean) => {
    const updated = [...channelSelections]
    updated[channelIndex].selected = checked
    onChannelSelectionsChange(updated)
  }

  const handleIntervalChange = (channelIndex: number, interval: string) => {
    const updated = [...channelSelections]
    updated[channelIndex].interval = Number.parseInt(interval) as 5 | 15
    onChannelSelectionsChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 font-semibold text-sm">
        <div>Canal</div>
        <div>Intervalo</div>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {channelSelections.map((selection, index) => (
          <div key={selection.channel} className="grid grid-cols-2 gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`channel-${index}`}
                checked={selection.selected}
                onCheckedChange={(checked) => handleChannelToggle(index, checked as boolean)}
              />
              <Label htmlFor={`channel-${index}`} className="text-sm">
                {selection.channel}
              </Label>
            </div>
            <Select value={selection.interval.toString()} onValueChange={(value) => handleIntervalChange(index, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {channelSelections.filter((s) => s.selected).length} de {channelSelections.length} canales seleccionados
      </div>
    </div>
  )
}
