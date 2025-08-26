"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet } from "lucide-react"
import { parseExcelFile } from "@/lib/excel-parser"
import type { ExcelData } from "@/lib/types"

interface FileUploadProps {
  onFileLoad: (data: ExcelData) => void
  onError: (error: string) => void
}

export function FileUpload({ onFileLoad, onError }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const processFile = useCallback(
    async (file: File) => {
      try {
        const data = await parseExcelFile(file)
        onFileLoad(data)
      } catch (error) {
        onError(error instanceof Error ? error.message : "Error al leer el archivo")
      }
    },
    [onFileLoad, onError],
  )

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      await processFile(file)
    },
    [processFile],
  )

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragOver(false)

      const files = event.dataTransfer.files
      if (files.length === 0) return

      const file = files[0]
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        onError("Por favor selecciona un archivo Excel (.xlsx o .xls)")
        return
      }

      await processFile(file)
    },
    [processFile, onError],
  )

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50/10"
            : "border-slate-600 hover:border-slate-500"
        }`}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Upload className={`w-8 h-8 ${isDragOver ? "text-blue-400" : "text-slate-400"}`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${isDragOver ? "text-blue-400" : "text-slate-300"}`}>
              {isDragOver ? "Suelta el archivo aquí" : "Arrastra un archivo Excel aquí"}
            </p>
            <p className="text-xs text-slate-500 mt-1">o</p>
          </div>
          <Button onClick={handleButtonClick} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Seleccionar Archivo
          </Button>
        </div>
      </div>
      <div className="text-sm text-slate-400 text-center">
        <FileSpreadsheet className="w-4 h-4 inline mr-1" />
        Formatos soportados: .xlsx, .xls
      </div>
    </div>
  )
}
