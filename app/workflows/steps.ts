'use step'

import { generateBrief } from '@/app/actions/generate-brief'
import { createClient } from '@/lib/supabase/server'

export interface BriefResult {
  persona: string
  content: string
  citations?: unknown
}

export interface BriefEmailPayload {
  macro: BriefResult
  career: BriefResult
  client: BriefResult
}

/**
 * Step function: Generate a brief for a specific persona.
 * Step functions have full Node.js access and automatic retry on failure.
 */
export async function generateBriefForPersona(
  userId: string,
  persona: 'macro' | 'career' | 'client',
): Promise<BriefResult> {
  'use step'

  try {
    console.log(`[workflow/step] Generating ${persona} brief for user ${userId}`)

    // Call the existing server action that generates briefs
    const result = await generateBrief({
      persona,
      context: '', // Use default context from dashboard
      manualRefresh: false,
    })

    if ('success' in result && result.success) {
      return {
        persona,
        content: result.brief || '',
        citations: result.citations,
      }
    }

    throw new Error(`Failed to generate ${persona} brief: ${result.error || 'Unknown error'}`)
  } catch (error) {
    console.error(`[workflow/step] Error generating ${persona} brief:`, error)
    throw error
  }
}

/**
 * Step function: Send generated briefs via email.
 * In production, this would integrate with SendGrid, Resend, or similar.
 */
export async function sendBriefEmail(
  userId: string,
  briefs: BriefEmailPayload,
): Promise<{ messageId: string; sentAt: string }> {
  'use step'

  try {
    console.log(`[workflow/step] Sending email briefs to user ${userId}`)

    // Get user email from Supabase
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.admin.getUserById(userId)

    if (!userData?.user?.email) {
      throw new Error(`No email found for user ${userId}`)
    }

    // For demo: log the briefs (in production, call Resend/SendGrid)
    console.log('[workflow/step] Email would be sent to:', userData.user.email)
    console.log('[workflow/step] Briefs:', {
      macro: briefs.macro.content.slice(0, 100) + '...',
      career: briefs.career.content.slice(0, 100) + '...',
      client: briefs.client.content.slice(0, 100) + '...',
    })

    // TODO: Integrate with email service
    // const response = await resend.emails.send({
    //   from: 'Alpha Agent <briefs@alpha-agent.app>',
    //   to: userData.user.email,
    //   subject: `Alpha Agent Daily Briefs - ${new Date().toLocaleDateString()}`,
    //   html: buildBriefEmail(briefs),
    // })

    return {
      messageId: `demo-${Date.now()}`,
      sentAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[workflow/step] Error sending email:', error)
    throw error
  }
}
