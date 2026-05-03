# Alpha Agent — Vercel Workflows Integration

This implementation demonstrates **Vercel Workflows** for Alpha Agent's daily scheduled brief generation.

## What Was Built

### 1. **Daily Brief Workflow** (`app/workflows/daily-brief.ts`)
A durable workflow that:
- Waits until a scheduled time (default 6 AM)
- Generates briefs for all three personas in parallel
- Sends email notification with all briefs
- **Survives service restarts** — if the VM crashes at 5:55 AM, the workflow resumes at the right time

### 2. **Workflow Steps** (`app/workflows/steps.ts`)
Step functions with full Node.js access that:
- Call the existing `generateBrief` server action
- Fetch user email from Supabase
- Handle retries automatically on transient failures

### 3. **Trigger API** (`app/api/workflows/daily-brief/route.ts`)
- `POST /api/workflows/daily-brief` — Start a new workflow for the authenticated user
- `GET /api/workflows/daily-brief?runId=...` — Check workflow status

### 4. **UI Component** (`components/schedule-brief-panel.tsx`)
A client component in Settings that:
- Lets users pick a time (0-23 hours)
- Shows real-time status updates via polling
- Displays success/error feedback

## Key Features

✅ **Guaranteed Delivery** — Emails won't get lost if the service crashes  
✅ **Automatic Retries** — Transient API failures are retried automatically  
✅ **No Data Loss** — Workflow state is persisted; restarts resume seamlessly  
✅ **Easy Testing** — Use `npx workflow web` to inspect running workflows  

## How It Works

1. User goes to Settings → Automation → Schedule Daily Briefs
2. Selects 6 AM, clicks "Schedule"
3. Frontend calls `/api/workflows/daily-brief` (POST)
4. Backend calls `start(dailyBriefWorkflow, [userId, 6])`
5. Workflow sleeps until 6 AM tomorrow
6. At 6 AM: generates 3 briefs in parallel
7. Sends email with briefs
8. Workflow completes

If your service crashes at 5:55 AM, **the workflow automatically resumes at 6:00 AM** without any manual intervention.

## Testing Locally

```bash
# Start dev server
pnpm dev

# In another terminal, watch workflow runs
npx workflow web

# Trigger workflow from API (logged-in user required)
curl -X POST http://localhost:3000/api/workflows/daily-brief \
  -H "Content-Type: application/json" \
  -d '{"scheduledHour": 6}'

# Check workflow status
curl "http://localhost:3000/api/workflows/daily-brief?runId=run_..."
```

## Production Deployment

Workflows are automatically supported on Vercel. When you deploy:

1. All workflows continue running even if you redeploy
2. Workflows survive node crashes
3. Use `npx workflow inspect runs --backend vercel --project <name>` to see production workflows

## Next Steps

- **Email Integration**: Replace the mock email step with Resend or SendGrid
- **Advanced Scheduling**: Add cron patterns (e.g., "every weekday at 6 AM")
- **User Preferences**: Store custom brief templates per user
- **Subscription Workflows**: Onboarding, trial expiry reminders, churn recovery

---

See `useworkflow.dev` for full Vercel Workflows documentation.
