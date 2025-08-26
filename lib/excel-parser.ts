import * as XLSX from "xlsx"
import type { ExcelData } from "./types"

const CHANNEL_COLUMN = "channel_name"
const TIME_COLUMNS = ["hora_minuto", "time_of_day"]
const VALUE_COLUMN = "avg"

export async function parseExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          throw new Error("El archivo Excel está vacío")
        }

        // Get column names
        const columns = Object.keys(jsonData[0] as Record<string, any>)

        // Check for required columns
        const hasChannelColumn = columns.includes(CHANNEL_COLUMN)

        // Find time column
        let timeColumn = ""
        for (const col of TIME_COLUMNS) {
          if (columns.includes(col)) {
            timeColumn = col
            break
          }
        }

        if (!timeColumn) {
          throw new Error(`No se encontró ninguna columna de hora válida: ${TIME_COLUMNS.join(" / ")}`)
        }

        if (!columns.includes(VALUE_COLUMN)) {
          throw new Error(`Columna '${VALUE_COLUMN}' no encontrada`)
        }

        // Get unique channels if channel column exists
        let channels: string[] = []
        if (hasChannelColumn) {
          const channelSet = new Set<string>()
          jsonData.forEach((row: any) => {
            const channel = row[CHANNEL_COLUMN]
            if (channel && typeof channel === "string" && channel.trim()) {
              channelSet.add(channel.trim())
            }
          })
          channels = Array.from(channelSet).sort()

          if (channels.length === 0) {
            throw new Error("No se encontraron canales válidos")
          }
        }

        resolve({
          fileName: file.name.replace(/\.[^/.]+$/, ""),
          data: jsonData as Record<string, any>[],
          hasChannelColumn,
          channels,
          timeColumn,
          valueColumn: VALUE_COLUMN,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Error al leer el archivo"))
    reader.readAsArrayBuffer(file)
  })
}
