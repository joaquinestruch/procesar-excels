import * as XLSX from "xlsx"
import type { ProcessedResult } from "./types"

export function exportToExcel(results: ProcessedResult[], fileName: string) {
  const workbook = XLSX.utils.book_new()

  // Create data array following the exact format from Python script
  const data: (string | number)[][] = []

  results.forEach((result) => {
    // Row 1: Channel name with interval
    data.push([`${result.channel} (${result.interval} min)`])

    // Row 2: Times
    data.push(result.times)

    // Row 3: Values
    data.push(result.values)

    // Row 4: Empty separator
    data.push([])
  })

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")

  // Download file
  XLSX.writeFile(workbook, fileName)
}

export async function copyToClipboard(
  results: ProcessedResult[],
  format: "html" | "tsv" | "csv",
  viewType: "combined" | "by-channel",
) {
  let content = ""

  if (format === "html") {
    content = generateHTMLTable(results, viewType)
  } else if (format === "tsv") {
    content = generateDelimitedText(results, "\t", viewType)
  } else if (format === "csv") {
    content = generateDelimitedText(results, ",", viewType)
  }

  try {
    await navigator.clipboard.writeText(content)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = content
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
  }
}

function generateHTMLTable(results: ProcessedResult[], viewType: "combined" | "by-channel"): string {
  if (viewType === "by-channel") {
    let html = "<div>"
    results.forEach((result) => {
      html += `<h3>${result.channel} (${result.interval} min)</h3>`
      html += '<table border="1"><tr><th>Horas</th></tr><tr>'
      result.times.forEach((time) => {
        html += `<td>${time}</td>`
      })
      html += "</tr></table>"
      html += '<table border="1"><tr><th>Valores</th></tr><tr>'
      result.values.forEach((value) => {
        html += `<td>${value}</td>`
      })
      html += "</tr></table><br>"
    })
    html += "</div>"
    return html
  }

  // Combined view
  let html = '<table border="1">'
  results.forEach((result) => {
    html += `<tr><td colspan="100">${result.channel} (${result.interval} min)</td></tr>`
    html += "<tr>"
    result.times.forEach((time) => {
      html += `<td>${time}</td>`
    })
    html += "</tr><tr>"
    result.values.forEach((value) => {
      html += `<td>${value}</td>`
    })
    html += '</tr><tr><td colspan="100"></td></tr>'
  })
  html += "</table>"
  return html
}

function generateDelimitedText(
  results: ProcessedResult[],
  delimiter: string,
  viewType: "combined" | "by-channel",
): string {
  const lines: string[] = []

  if (viewType === "by-channel") {
    results.forEach((result) => {
      lines.push(`${result.channel} (${result.interval} min)`)
      lines.push(result.times.join(delimiter))
      lines.push(result.values.join(delimiter))
      lines.push("")
    })
  } else {
    // Combined view
    results.forEach((result) => {
      lines.push(`${result.channel} (${result.interval} min)`)
      lines.push(result.times.join(delimiter))
      lines.push(result.values.join(delimiter))
      lines.push("")
    })
  }

  return lines.join("\n")
}
