import { DetectionService, DetectionResult } from '@/services/detection/DetectionService'

const detectionService = new DetectionService()

export async function createDetectionTask(
  phones: string[],
  items: string[]
): Promise<{ success: boolean; results: DetectionResult[]; error?: string }> {
  try {
    const results = await detectionService.detectBatch(phones, items)
    return { success: true, results }
  } catch (error: any) {
    return { success: false, results: [], error: error.message }
  }
}
