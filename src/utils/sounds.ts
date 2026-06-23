export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch {
    // 音频不可用，静默失败
  }
}

export const playErrorSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 400
    oscillator.type = 'square'
    gainNode.gain.value = 0.2
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch {}
}

export const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 1200
    oscillator.type = 'sine'
    gainNode.gain.value = 0.2
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.15)
    setTimeout(() => {
      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()
      osc2.connect(gain2)
      gain2.connect(audioContext.destination)
      osc2.frequency.value = 1500
      osc2.type = 'sine'
      gain2.gain.value = 0.2
      osc2.start()
      osc2.stop(audioContext.currentTime + 0.15)
    }, 150)
  } catch {}
}
