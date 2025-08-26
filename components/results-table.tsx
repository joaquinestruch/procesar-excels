"use client"

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ProcessedResult } from "@/lib/types"

interface ResultsTableProps {
  results: ProcessedResult[]
  viewType: "combined" | "by-channel"
  fileName: string
}

export function ResultsTable({ results, viewType, fileName }: ResultsTableProps) {
  const { toast } = useToast()

  if (results.length === 0) {
    return <div className="text-center py-8 text-slate-400">No hay resultados para mostrar</div>
  }

  const copyChannelNumbers = async (result: ProcessedResult) => {
    const roundedValues = result.values.map((v) => (typeof v === "number" ? Math.round(v) : v))
    const numbersOnly = roundedValues.join("\t")

    try {
      await navigator.clipboard.writeText(numbersOnly)
      toast({
        title: "¡Copiado!",
        description: `Números de ${result.channel} copiados al portapapeles`,
        duration: 2000,
      })
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const copyNumbersOnly = async () => {
    const numbersData: string[] = []

    results.forEach((result) => {
      // Add channel name as header
      const displayInterval = result.channel.toLowerCase().includes("olga") ? 5 : result.interval
      numbersData.push(`${result.channel} (${displayInterval} min)`)

      // Add only the rounded numerical values, tab-separated
      const roundedValues = result.values.map((v) => (typeof v === "number" ? Math.round(v) : v))
      numbersData.push(roundedValues.join("\t"))

      // Add empty line for separation
      numbersData.push("")
    })

    try {
      await navigator.clipboard.writeText(numbersData.join("\n"))
      toast({
        title: "¡Todos los datos copiados!",
        description: `${results.length} canales copiados al portapapeles`,
        duration: 2000,
      })
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const renderChannelSection = (result: ProcessedResult, startIndex: number) => {
    const displayInterval = result.channel.toLowerCase().includes("olga") ? 5 : result.interval
    const maxCols = Math.max(result.times.length, result.values.length)

    return (
      <>
        {/* Channel header row with copy button */}
        <TableRow className="hover:bg-slate-700/50">
          <td className="h-10"> 
            <div className="flex items-center justify-center h-full">
              <Button
                onClick={() => copyChannelNumbers(result)}
                variant="outline"
                size="sm"
                className="bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500 h-6 px-2 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
          </td>
          <TableCell
            colSpan={maxCols - 1}
            className="text-sm font-mono border-r border-slate-600 px-3 py-2 text-slate-200"
          >
            {`${result.channel} (${displayInterval} min)`}
          </TableCell>
          <TableCell className="text-sm font-mono px-3 py-2 text-right">
            
          </TableCell>
        </TableRow>

        {/* Time row */}
        <TableRow className="bg-slate-600/50 hover:bg-slate-600/70">
          {result.times.map((time, colIndex) => (
            <TableCell
              key={colIndex}
              className="text-sm font-mono border-r border-slate-600 last:border-r-0 px-3 py-2 text-slate-100 font-semibold"
            >
              {time}
            </TableCell>
          ))}
        </TableRow>

        {/* Values row */}
        <TableRow className="hover:bg-slate-700/50">
          {result.values.map((value, colIndex) => (
            <TableCell
              key={colIndex}
              className="text-sm font-mono border-r border-slate-600 last:border-r-0 px-3 py-2 text-slate-200"
            >
              {typeof value === "number" ? Math.round(value) : value}
            </TableCell>
          ))}
        </TableRow>

        {/* Empty separator row */}
        <TableRow className="bg-slate-600/30">
          <TableCell colSpan={maxCols} className="h-2"></TableCell>
        </TableRow>
      </>
    )
  }

  const maxCols = Math.max(...results.map((result) => Math.max(result.times.length, result.values.length)))

  return (
    <div className="space-y-4">
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Datos Procesados</CardTitle>
          <CardDescription className="text-slate-300">
            Vista ampliada de los resultados procesados sin decimales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[800px] border border-slate-600 rounded bg-slate-800">
            <Table>
              <TableBody>{results.map((result, index) => renderChannelSection(result, index))}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
