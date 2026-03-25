"use client"

import { useState, useCallback, useEffect } from "react"
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
  const [singleChannelInterval, setSingleChannelInterval] = useState<5 | 15>(5)

  const processData = useCallback(async (data: ExcelData, intervalForSingle: 5 | 15) => {
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
          
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
          }
          if (indexA !== -1) return -1
          if (indexB !== -1) return 1
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
          interval: intervalForSingle,
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

  const handleFileLoad = useCallback((data: ExcelData) => {
    // Determine the initial interval based on filename before setting data
    const is5Min = data.fileName.includes("5_min") || data.fileName.includes("5min") || data.fileName.includes("5_minutos");
    const initialInterval = is5Min ? 5 : 15;
    
    setSingleChannelInterval(initialInterval)
    setExcelData(data)
  }, [])

  // Auto-process when data or single interval option changes
  useEffect(() => {
    if (excelData) {
      processData(excelData, singleChannelInterval)
    }
  }, [excelData, singleChannelInterval, processData])

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
            
            {/* Opciones de intervalo para Canal Único */}
            {excelData && !excelData.hasChannelColumn && (
              <div className="flex items-center gap-4 mt-4 p-4 border border-slate-700 rounded-md bg-slate-800/50">
                <span className="text-sm font-medium text-slate-300">
                  Intervalo a utilizar para el archivo cargado:
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant={singleChannelInterval === 5 ? "default" : "outline"} 
                    onClick={() => setSingleChannelInterval(5)}
                    className={singleChannelInterval === 5 ? "" : "bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"}
                    size="sm"
                  >
                    Cada 5 minutos
                  </Button>
                  <Button 
                    variant={singleChannelInterval === 15 ? "default" : "outline"} 
                    onClick={() => setSingleChannelInterval(15)}
                    className={singleChannelInterval === 15 ? "" : "bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"}
                    size="sm"
                  >
                    Cada 15 minutos
                  </Button>
                </div>
              </div>
            )}
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
