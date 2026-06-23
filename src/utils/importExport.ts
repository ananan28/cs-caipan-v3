import toast from 'react-hot-toast'

// 导出数据
export const exportData = (data: any[], filename: string, format: 'csv' | 'json' | 'excel' = 'csv') => {
  if (!data || data.length === 0) {
    toast.error('没有数据可导出')
    return
  }

  if (format === 'csv') {
    const headers = Object.keys(data[0])
    const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n')
    downloadFile('\uFEFF' + csv, `${filename}.csv`, 'text/csv;charset=utf-8')
  } else if (format === 'json') {
    downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json')
  } else {
    const headers = Object.keys(data[0])
    let html = `<html><head><meta charset="UTF-8"><style>td{mso-number-format:"@"}</style></head><body><table><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`
    data.forEach(row => { html += `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>` })
    html += '</table></body></html>'
    downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8')
  }
  toast.success(`✅ ${filename} 已导出`)
}

// 导入数据
export const importData = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(l => l.trim())
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        const result = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {})
        })
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    reader.readAsText(file)
  })
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
