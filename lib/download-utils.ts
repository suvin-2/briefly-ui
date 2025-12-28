export function downloadAsMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
  downloadBlob(blob, filename)
}

export function downloadAsText(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}
