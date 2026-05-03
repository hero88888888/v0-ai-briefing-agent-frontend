'use workflow'

import { sleep } from 'workflow'
import { generateBriefForPersona, sendBriefEmail } from './steps'

/**
 * Daily brief workflow: Generates a brief at a scheduled time each day
 * and emails it to the user. This demonstrates workflow durability — if the
 * service crashes, it resumes from where it left off.
 */
export async function dailyBriefWorkflow(userId: string, scheduledHour: number = 6) {
  'use workflow'

  // Sleep until the scheduled hour (e.g., 6 AM)
  // Format: "until HHmm" for next occurrence, or "1d" for 24 hours from now
  const timeUntilScheduled = `until ${String(scheduledHour).padStart(2, '0')}00`

  try {
    // Wait until scheduled time
    await sleep(timeUntilScheduled)

    // Generate briefs for all three personas in parallel
    const [macroBrief, careerBrief, clientBrief] = await Promise.all([
      generateBriefForPersona(userId, 'macro'),
      generateBriefForPersona(userId, 'career'),
      generateBriefForPersona(userId, 'client'),
    ])

    // Send email with all briefs
    await sendBriefEmail(userId, {
      macro: macroBrief,
      career: careerBrief,
      client: clientBrief,
    })

    return {
      status: 'success',
      briefsGenerated: 3,
      sentAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[workflow] Daily brief failed:', error)
    throw error
  }
}
