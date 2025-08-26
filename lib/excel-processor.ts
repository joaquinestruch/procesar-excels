import type { ExcelData, ChannelSelection, ProcessedResult } from "./types"

export async function processExcelData(
  excelData: ExcelData,
  selections: ChannelSelection[],
  setStatus: (status: string) => void,
): Promise<ProcessedResult[]> {
  const results: ProcessedResult[] = []

  for (const selection of selections) {
    const actualInterval = selection.channel.toLowerCase().includes("olga") ? 5 : selection.interval
    setStatus(`Procesando: ${selection.channel} (${actualInterval} min)...`)

    // Filter data by channel if channel column exists
    let filteredData = excelData.data
    if (excelData.hasChannelColumn && selection.channel !== "Canal Único") {
      filteredData = excelData.data.filter(
        (row) =>
          row[excelData.timeColumn.replace("channel_name", "channel_name")] === selection.channel ||
          row["channel_name"] === selection.channel,
      )
    }

    // Parse and filter by time
    const processedRows: { time: Date; value: number | string }[] = []

    for (const row of filteredData) {
      const timeValue = row[excelData.timeColumn]
      const avgValue = row[excelData.valueColumn]

      if (!timeValue || avgValue === undefined || avgValue === null) continue

      // Parse time - handle various formats
      let parsedTime: Date
      try {
        if (timeValue instanceof Date) {
          parsedTime = timeValue
        } else if (typeof timeValue === "string") {
          // Try parsing as time string (HH:MM or HH:MM:SS)
          const timeMatch = timeValue.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
          if (timeMatch) {
            const hours = Number.parseInt(timeMatch[1])
            const minutes = Number.parseInt(timeMatch[2])
            const seconds = Number.parseInt(timeMatch[3] || "0")
            parsedTime = new Date()
            parsedTime.setHours(hours, minutes, seconds, 0)
          } else {
            parsedTime = new Date(timeValue)
          }
        } else {
          parsedTime = new Date(timeValue)
        }

        if (isNaN(parsedTime.getTime())) continue
      } catch {
        continue
      }

      processedRows.push({ time: parsedTime, value: avgValue })
    }

    if (processedRows.length === 0) {
      console.warn(`Saltando canal ${selection.channel}: No hay datos válidos de hora.`)
      continue
    }

    // Sort by time
    processedRows.sort((a, b) => a.time.getTime() - b.time.getTime())

    // Apply interval filtering
    const filteredRows = processedRows.filter((row) => {
      const minutes = row.time.getMinutes()
      const hours = row.time.getHours()

      // Always include 09:20
      if (hours === 9 && minutes === 20) {
        return true
      }

      const matchesInterval = minutes % actualInterval === 0

      // For 15-minute intervals, exclude 09:15 and 09:30
      if (actualInterval === 15 && hours === 9 && (minutes === 15 || minutes === 30)) {
        return false
      }

      return matchesInterval
    })

    if (filteredRows.length === 0) {
      console.warn(`Saltando canal ${selection.channel}: No hay datos en el intervalo de ${actualInterval} minutos.`)
      continue
    }

    // Format results
    const times = filteredRows.map((row) =>
      row.time.toLocaleTimeString("es-ES", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    )

    const values = filteredRows.map((row) => row.value)

    results.push({
      channel: selection.channel,
      interval: actualInterval,
      times,
      values,
    })
  }

  return results
}
