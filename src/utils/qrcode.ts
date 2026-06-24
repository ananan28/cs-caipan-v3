// 简单二维码生成（纯前端，无依赖）
export const generateQRCode = (text: string, size: number = 200): string => {
  // 使用在线 API 生成二维码
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
}
