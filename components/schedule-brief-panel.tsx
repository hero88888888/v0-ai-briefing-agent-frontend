'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function ScheduleBriefPanel() {
  const [scheduledHour, setScheduledHour] = useState<string>('6')
  const [isLoading, setIsLoading] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>(
    'idle',
  )

  const handleSchedule = async () => {
    if (!scheduledHour) {
      toast.error('Please select a time')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/workflows/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledHour: parseInt(scheduledHour) }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to schedule workflow')
      }

      const data = await response.json()
      setRunId(data.runId)
      setWorkflowStatus('running')
      toast.success(`Workflow started! Run ID: ${data.runId}`)

      // Poll status
      pollWorkflowStatus(data.runId)
    } catch (error) {
      toast.error(String(error))
      setWorkflowStatus('failed')
    } finally {
      setIsLoading(false)
    }
  }

  const pollWorkflowStatus = (rId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/workflows/daily-brief?runId=${rId}`)
        const data = await response.json()

        if (data.isComplete) {
          clearInterval(interval)
          setWorkflowStatus(data.status === 'completed' ? 'completed' : 'failed')

          if (data.status === 'completed') {
            toast.success(`Briefs generated and queued for ${scheduledHour}:00!`)
          } else {
            toast.error(`Workflow failed: ${data.status}`)
          }
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 2000)
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Schedule Daily Briefs</h3>
        <p className="text-sm text-muted-foreground">
          Generate AI briefs automatically every day at your preferred time.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Time of day</label>
            <Select value={scheduledHour} onValueChange={setScheduledHour} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {String(i).padStart(2, '0')}:00 ({i < 12 ? 'AM' : 'PM'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSchedule} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Scheduling...' : 'Schedule'}
          </Button>
        </div>

        {runId && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              {workflowStatus === 'running' && (
                <Loader2 className="w-5 h-5 text-primary animate-spin mt-0.5 flex-shrink-0" />
              )}
              {workflowStatus === 'completed' && (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              )}
              {workflowStatus === 'failed' && (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}

              <div className="flex-1">
                <p className="text-sm font-medium">
                  {workflowStatus === 'running' && 'Generating briefs...'}
                  {workflowStatus === 'completed' && 'Briefs scheduled successfully!'}
                  {workflowStatus === 'failed' && 'Workflow encountered an error'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Run ID: {runId}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground italic">
          This uses Vercel Workflows — your scheduled brief will be generated even if our service
          restarts.
        </p>
      </div>
    </div>
  )
}
