import toast from 'react-hot-toast'

export const exportCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    toast.error('没有数据可导出')
    return
  }
  try {
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`✅ ${filename}.csv 已导出`)
  } catch (error) {
    toast.error('导出失败')
  }
}

export const exportJSON = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    toast.error('没有数据可导出')
    return
  }
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`✅ ${filename}.json 已导出`)
  } catch (error) {
    toast.error('导出失败')
  }
}

export const exportExcel = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    toast.error('没有数据可导出')
    return
  }
  try {
    const headers = Object.keys(data[0])
    let html = `<html><head><meta charset="UTF-8"><style>td{mso-number-format:"@"}</style></head><body><table><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`
    data.forEach(row => {
      html += `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
    })
    html += '</table></body></html>'
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`✅ ${filename}.xls 已导出`)
  } catch (error) {
    toast.error('导出失败')
  }
}

export const exportPDF = async (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    toast.error('没有数据可导出')
    return
  }
  try {
    const headers = Object.keys(data[0] || {})
    let html = `<html><head><title>${filename}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>${filename}</h1><table><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`
    data.forEach(row => {
      html += `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
    })
    html += '</table></body></html>'
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => { printWindow.print() }, 500)
      toast.success(`✅ ${filename} 已发送到打印机`)
    } else {
      toast.error('请允许弹出窗口')
    }
  } catch (error) {
    toast.error('导出失败')
  }
}
