export interface ExcelData {
  fileName: string
  data: Record<string, any>[]
  hasChannelColumn: boolean
  channels: string[]
  timeColumn: string
  valueColumn: string
}

export interface ChannelSelection {
  channel: string
  selected: boolean
  interval: 5 | 15
}

export interface ProcessedResult {
  channel: string
  interval: number
  times: string[]
  values: (number | string)[]
}
