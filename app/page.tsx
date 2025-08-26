"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/file-upload"
import { ResultsTable } from "@/components/results-table"
import { StatusBar } from "@/components/status-bar"
import { processExcelData } from "@/lib/excel-processor"
import type { ExcelData, ProcessedResult, ChannelSelection } from "@/lib/types"

export default function ExcelProcessor() {
  const [excelData, setExcelData] = useState<ExcelData | null>(null)
  const [processedResults, setProcessedResults] = useState<ProcessedResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState("Esperando archivo...")

  const handleFileLoad = useCallback(async (data: ExcelData) => {
    setExcelData(data)
    setError(null)
    setProcessedResults([])
    setIsProcessing(true)
    setStatus("Procesando automáticamente...")

    try {
      const selections: ChannelSelection[] = []

      if (data.hasChannelColumn) {
        const filteredChannels = data.channels.filter((channel) => {
          const channelLower = channel.toLowerCase()
          return !["carajo", "azz"].includes(channelLower) && !channelLower.includes("neura")
        })

        // Orden personalizado de canales
        const channelOrder = ["Olga", "Luzu", "Urbana", "Vorterix", "La casa", "gelatina", "bondi", "blender"]
        
        // Ordenar canales según el orden especificado
        const sortedChannels = filteredChannels.sort((a, b) => {
          const indexA = channelOrder.findIndex(orderChannel => 
            a.toLowerCase().includes(orderChannel.toLowerCase())
          )
          const indexB = channelOrder.findIndex(orderChannel => 
            b.toLowerCase().includes(orderChannel.toLowerCase())
          )
          
          // Si ambos están en el orden, usar el índice
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
          }
          // Si solo uno está en el orden, ese va primero
          if (indexA !== -1) return -1
          if (indexB !== -1) return 1
          // Si ninguno está en el orden, mantener orden alfabético
          return a.localeCompare(b)
        })

        for (const channel of sortedChannels) {
          selections.push({
            channel,
            selected: true,
            interval: channel === "Olga" ? 5 : 15,
          })
        }
      } else {
        selections.push({
          channel: "Canal Único",
          selected: true,
          interval: 15,
        })
      }

      if (selections.length === 0) {
        setError("No hay canales válidos para procesar después de filtrar.")
        setStatus("Error: Sin canales válidos.")
        return
      }

      const results = await processExcelData(data, selections, setStatus)
      setProcessedResults(results)
      setStatus("¡Proceso completado! Listo para copiar a Google Sheets.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error durante el procesamiento")
      setStatus("Error en el procesamiento.")
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setStatus("Error al cargar archivo.")
  }, [])

  const handleReset = useCallback(() => {
    setExcelData(null)
    setProcessedResults([])
    setError(null)
    setStatus("Esperando archivo...")
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Procesar Excels</h1>
          <p className="text-slate-300">
            Procesa automáticamente archivos Excel - Olga (5 min), otros canales (15 min)
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Cargar y Procesar Archivo</CardTitle>
            <CardDescription className="text-slate-300">
              Selecciona un archivo Excel (.xlsx/.xls). Se procesará automáticamente excluyendo Carajo, Neura y AZZ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload onFileLoad={handleFileLoad} onError={handleError} />
          </CardContent>
        </Card>

        {processedResults.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Resultados Procesados</CardTitle>
              <CardDescription className="text-slate-300">Vista ampliada de los datos procesados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsTable results={processedResults} viewType="combined" fileName={excelData?.fileName || "datos"} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
