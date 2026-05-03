import { start, getRun } from 'workflow/api'
import { dailyBriefWorkflow } from '@/app/workflows/daily-brief'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/workflows/daily-brief/trigger
 * Triggers a new daily brief workflow for the authenticated user.
 *
 * Request body:
 * {
 *   "scheduledHour": 6  // Optional: Hour of day (0-23) when brief should generate. Default 6 AM.
 * }
 *
 * Response:
 * {
 *   "runId": "run_...",
 *   "message": "Daily brief workflow started"
 * }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const body = (await request.json()) as { scheduledHour?: number }
    const scheduledHour = body.scheduledHour ?? 6

    // Validate hour
    if (scheduledHour < 0 || scheduledHour > 23) {
      return Response.json(
        { error: 'scheduledHour must be between 0 and 23' },
        { status: 400 },
      )
    }

    // Start the workflow
    const run = await start(dailyBriefWorkflow, [user.id, scheduledHour])

    console.log(
      `[api] Started daily brief workflow for user ${user.id}, run ID: ${run.runId}`,
    )

    return Response.json({
      runId: run.runId,
      message: 'Daily brief workflow started',
      userId: user.id,
      scheduledHour,
    })
  } catch (error) {
    console.error('[api] Error triggering daily brief:', error)
    return Response.json(
      { error: 'Failed to start workflow', details: String(error) },
      { status: 500 },
    )
  }
}

/**
 * GET /api/workflows/daily-brief/status?runId=...
 * Check the status of a running daily brief workflow.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const runId = url.searchParams.get('runId')

    if (!runId) {
      return Response.json({ error: 'runId query parameter required' }, { status: 400 })
    }

    // Get run status
    const run = await getRun(runId)

    if (!run) {
      return Response.json({ error: 'Run not found' }, { status: 404 })
    }

    const status = run.status || 'unknown'
    const isComplete = status === 'completed' || status === 'failed'

    let returnValue = null
    if (isComplete && run.returnValue) {
      try {
        returnValue = JSON.parse(run.returnValue)
      } catch {
        returnValue = run.returnValue
      }
    }

    return Response.json({
      runId,
      status,
      isComplete,
      returnValue,
    })
  } catch (error) {
    console.error('[api] Error checking workflow status:', error)
    return Response.json(
      { error: 'Failed to check workflow status', details: String(error) },
      { status: 500 },
    )
  }
}
