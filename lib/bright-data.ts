/**
 * Bright Data SERP API integration.
 *
 * Calls the live SERP API at https://api.brightdata.com/serp/req when an
 * API key (and zone) is provided, and falls back to high-quality curated
 * mock data otherwise so the dashboard still demos cleanly.
 *
 * Docs: https://docs.brightdata.com/scraping-automation/serp-api/send-your-first-request
 */

// NOTE: This file is a plain server-side library (imported from a Server
// Action). It must NOT be marked "use server" — that directive requires
// every export to be an async function with a Server Action contract.

export interface NewsItem {
  title: string
  source: string
  publishedAt: string
  summary: string
  url?: string
  relevance: "high" | "medium" | "low"
}

export interface JobPosting {
  company: string
  role: string
  location: string
  postedDate: string
  level: string
  url?: string
}

export interface CompanyIntel {
  company: string
  triggerType: "leadership_change" | "earnings" | "product_launch" | "funding" | "acquisition" | "partnership"
  description: string
  date: string
  source: string
  url?: string
}

export interface BrightDataConfig {
  apiKey: string
  /** SERP zone name configured in your Bright Data account. */
  zone?: string
}

export interface FetchResult<T> {
  items: T[]
  /** True if data came from the live Bright Data API (not mocks). */
  live: boolean
  /** Item count actually fetched from the live API. */
  liveCount: number
  /** Error message if the live API call failed. */
  error?: string
}

const DEFAULT_ZONE = "serp_api1"

// ------------------------ Live SERP API ------------------------

interface SerpOrganicResult {
  title?: string
  link?: string
  source?: string
  snippet?: string
  description?: string
  date?: string
}

interface SerpResponse {
  news?: SerpOrganicResult[]
  organic?: SerpOrganicResult[]
}

async function callBrightDataSerp(
  query: string,
  config: BrightDataConfig,
  searchType: "news" | "general" = "news",
): Promise<{ results: SerpOrganicResult[] | null; error?: string }> {
  const zone = config.zone?.trim() || DEFAULT_ZONE

  try {
    const res = await fetch(`https://api.brightdata.com/serp/req?zone=${encodeURIComponent(zone)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchType === "news" ? { q: query, tbm: "nws", num: 8 } : { q: query, num: 8 },
        brd_json: "json",
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      const trimmed = errText.slice(0, 240)
      console.log(`[v0] Bright Data SERP ${res.status} for "${query.slice(0, 60)}":`, trimmed)
      return { results: null, error: `HTTP ${res.status}: ${trimmed || res.statusText}` }
    }

    const data = (await res.json()) as SerpResponse
    const results = data.news ?? data.organic ?? []
    return { results: Array.isArray(results) ? results : null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`[v0] Bright Data fetch failed for "${query.slice(0, 60)}":`, msg)
    return { results: null, error: msg }
  }
}

function relevanceFor(index: number): NewsItem["relevance"] {
  if (index < 2) return "high"
  if (index < 4) return "medium"
  return "low"
}

function safeHostname(url?: string): string {
  if (!url) return "Web"
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return "Web"
  }
}

function formatPublished(raw?: string): string {
  if (!raw) return "Recently"
  return raw
}

// ------------------------ Public fetchers ------------------------

export async function fetchRealTimeNews(
  persona: "macro" | "career" | "client",
  keywords: string[],
  config?: BrightDataConfig,
): Promise<FetchResult<NewsItem>> {
  if (config?.apiKey && keywords.length > 0) {
    const query = buildNewsQuery(persona, keywords)
    const { results, error } = await callBrightDataSerp(query, config, "news")

    if (results && results.length > 0) {
      const items: NewsItem[] = results.slice(0, 6).map((r, i) => ({
        title: r.title ?? "Untitled",
        source: r.source ?? safeHostname(r.link),
        publishedAt: formatPublished(r.date),
        summary: r.snippet ?? r.description ?? "",
        url: r.link,
        relevance: relevanceFor(i),
      }))
      return { items, live: true, liveCount: items.length }
    }

    return { items: getMockNews(persona, keywords), live: false, liveCount: 0, error }
  }

  return { items: getMockNews(persona, keywords), live: false, liveCount: 0 }
}

export async function fetchJobPostings(
  companies: string[],
  roles: string[],
  config?: BrightDataConfig,
): Promise<FetchResult<JobPosting>> {
  if (config?.apiKey && companies.length > 0) {
    const query = `site:linkedin.com/jobs ${roles
      .slice(0, 3)
      .map((r) => `"${r}"`)
      .join(" OR ")} ${companies.slice(0, 3).join(" OR ")}`
    const { results, error } = await callBrightDataSerp(query, config, "general")

    if (results && results.length > 0) {
      const items: JobPosting[] = results.slice(0, 6).map((r) => ({
        company:
          companies.find((c) => r.title?.toLowerCase().includes(c.toLowerCase())) ?? companies[0] ?? "Unknown",
        role:
          roles.find((role) => r.title?.toLowerCase().includes(role.toLowerCase())) ??
          r.title?.split(" - ")[0] ??
          "Role",
        location: extractLocation(r.snippet ?? r.description ?? "") ?? "Remote",
        postedDate: formatPublished(r.date),
        level: inferLevel(r.title ?? ""),
        url: r.link,
      }))
      return { items, live: true, liveCount: items.length }
    }

    return { items: getMockJobs(companies, roles), live: false, liveCount: 0, error }
  }

  return { items: getMockJobs(companies, roles), live: false, liveCount: 0 }
}

export async function fetchCompanyIntel(
  accounts: string[],
  competitors: string[],
  config?: BrightDataConfig,
): Promise<FetchResult<CompanyIntel>> {
  if (config?.apiKey && accounts.length > 0) {
    const allItems: CompanyIntel[] = []
    let lastError: string | undefined

    // Limit to first 3 accounts to keep latency reasonable
    for (const account of accounts.slice(0, 3)) {
      const query = `${account} (CTO OR CEO OR earnings OR launches OR acquires OR layoffs OR partnership)`
      const { results, error } = await callBrightDataSerp(query, config, "news")
      if (error) lastError = error
      if (!results) continue

      for (const r of results.slice(0, 2)) {
        allItems.push({
          company: account,
          triggerType: classifyTrigger(r.title ?? ""),
          description: r.title ?? r.snippet ?? "",
          date: formatPublished(r.date),
          source: r.source ?? safeHostname(r.link),
          url: r.link,
        })
      }
    }

    if (allItems.length > 0) {
      return { items: allItems, live: true, liveCount: allItems.length }
    }

    return { items: getMockCompanyIntel(accounts, competitors), live: false, liveCount: 0, error: lastError }
  }

  return { items: getMockCompanyIntel(accounts, competitors), live: false, liveCount: 0 }
}

// ------------------------ Helpers ------------------------

function buildNewsQuery(persona: "macro" | "career" | "client", keywords: string[]): string {
  const top = keywords.slice(0, 4).join(" OR ")
  switch (persona) {
    case "macro":
      return `${top} (Fed OR ECB OR yields OR inflation OR earnings)`
    case "career":
      return `${top} (hiring OR layoffs OR funding OR IPO)`
    case "client":
      return `${top} (CTO OR CEO OR earnings OR launches OR acquires)`
  }
}

function extractLocation(text: string): string | null {
  const cities = ["San Francisco", "New York", "London", "Remote", "Boston", "Seattle", "Austin", "Palo Alto"]
  return cities.find((c) => text.includes(c)) ?? null
}

function inferLevel(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes("vp") || lower.includes("vice president")) return "VP"
  if (lower.includes("chief") || lower.includes("head of")) return "Executive"
  if (lower.includes("senior") || lower.includes("lead") || lower.includes("staff")) return "Senior"
  if (lower.includes("director")) return "Director"
  return "Mid-Senior"
}

function classifyTrigger(title: string): CompanyIntel["triggerType"] {
  const lower = title.toLowerCase()
  if (
    lower.includes("cto") ||
    lower.includes("ceo") ||
    lower.includes("appoints") ||
    lower.includes("hires") ||
    lower.includes("names")
  )
    return "leadership_change"
  if (lower.includes("earnings") || lower.includes("revenue") || lower.includes("quarterly")) return "earnings"
  if (lower.includes("launches") || lower.includes("releases") || lower.includes("unveils")) return "product_launch"
  if (lower.includes("raises") || lower.includes("funding") || lower.includes("series")) return "funding"
  if (lower.includes("acquires") || lower.includes("merger")) return "acquisition"
  if (lower.includes("partner") || lower.includes("integration")) return "partnership"
  return "product_launch"
}

// ------------------------ Curated mock fallbacks ------------------------

function getMockNews(persona: "macro" | "career" | "client", keywords: string[]): NewsItem[] {
  const kw = keywords[0] ?? ""

  if (persona === "macro") {
    return [
      {
        title: "Fed Officials Signal Caution on Rate Cuts as Services Inflation Stays Sticky",
        source: "Reuters",
        publishedAt: "2 hours ago",
        summary:
          "Multiple FOMC voters this week pushed back on aggressive easing expectations, citing services CPI running above the 3% threshold.",
        relevance: "high",
      },
      {
        title: "BoJ Holds Policy Steady; Yen Slides to 158 Against Dollar",
        source: "Bloomberg",
        publishedAt: "5 hours ago",
        summary: "Governor Ueda kept the policy rate unchanged but flagged FX intervention readiness.",
        relevance: "high",
      },
      {
        title: "Crude Oil Spikes 3% on Red Sea Tanker Incident",
        source: "Financial Times",
        publishedAt: "Yesterday",
        summary: "Brent crude jumped to $87 as a second tanker was disabled near the Bab-el-Mandeb strait.",
        relevance: kw.toLowerCase().includes("oil") ? "high" : "medium",
      },
      {
        title: "EM Currencies Rally on Dollar Weakness, Brazilian Real Leads",
        source: "Wall Street Journal",
        publishedAt: "Yesterday",
        summary: "DXY fell 0.6% after softer-than-expected ISM data, lifting BRL +1.4% on the session.",
        relevance: "medium",
      },
    ]
  }

  if (persona === "career") {
    return [
      {
        title: `${kw || "OpenAI"} Posts Multiple Senior Strategy Roles in Past 30 Days`,
        source: "LinkedIn Talent Insights",
        publishedAt: "Today",
        summary: "Public job-board scraping shows a 40% increase in senior hiring posts vs prior quarter.",
        relevance: "high",
      },
      {
        title: "Anthropic Confirms $4B Series E at $40B Valuation",
        source: "TechCrunch",
        publishedAt: "3 hours ago",
        summary: "Round led by Lightspeed; expected to drive aggressive Bay Area + London hiring through Q2.",
        relevance: "high",
      },
      {
        title: "Stripe Quietly Pauses Mid-Level Hiring Ahead of IPO Path",
        source: "The Information",
        publishedAt: "Yesterday",
        summary: "Internal memo seen by reporters confirms backfill-only policy for L4-L5 engineers.",
        relevance: "medium",
      },
    ]
  }

  return [
    {
      title: "Snowflake Names New CTO from Databricks Engineering Leadership",
      source: "TechCrunch",
      publishedAt: "4 hours ago",
      summary: "Sterling Kelby joins as CTO; previously SVP Engineering at Databricks. Mandate: cost-efficiency.",
      relevance: "high",
    },
    {
      title: "Palantir Beats Q4, AIP Commercial Bookings Up 67% YoY",
      source: "Reuters",
      publishedAt: "Yesterday",
      summary: "Forward guidance raised; commercial pipeline now 60% of new logos.",
      relevance: "high",
    },
    {
      title: "AWS Announces 15% Price Cut on Data Transfer for Enterprise Tier",
      source: "AWS Press",
      publishedAt: "2 days ago",
      summary: "Aggressive pricing move targets data-warehouse migrations off Snowflake and BigQuery.",
      relevance: "medium",
    },
  ]
}

function getMockJobs(companies: string[], roles: string[]): JobPosting[] {
  const c = companies[0] ?? "OpenAI"
  const r = roles[0] ?? "Chief of Staff"
  return [
    { company: c, role: r, location: "San Francisco, CA", postedDate: "2d ago", level: "Senior" },
    {
      company: companies[1] ?? "Anthropic",
      role: roles[1] ?? "VP Strategy",
      location: "Remote",
      postedDate: "5d ago",
      level: "VP",
    },
    {
      company: companies[0] ?? "OpenAI",
      role: roles[2] ?? "Head of BD",
      location: "New York, NY",
      postedDate: "1w ago",
      level: "Executive",
    },
  ]
}

function getMockCompanyIntel(accounts: string[], _competitors: string[]): CompanyIntel[] {
  const a = accounts[0] ?? "Snowflake"
  return [
    {
      company: a,
      triggerType: "leadership_change",
      description: `New CTO appointed at ${a} from rival firm`,
      date: "Today",
      source: "TechCrunch",
    },
    {
      company: accounts[1] ?? "Palantir",
      triggerType: "earnings",
      description: `${accounts[1] ?? "Palantir"} beats earnings, AIP bookings up 67%`,
      date: "Yesterday",
      source: "Reuters",
    },
    {
      company: accounts[2] ?? "Databricks",
      triggerType: "product_launch",
      description: `${accounts[2] ?? "Databricks"} launches Mosaic AI evaluation suite`,
      date: "3d ago",
      source: "Databricks Blog",
    },
  ]
}

// ------------------------ Prompt formatting ------------------------

export function formatIntelligenceForPrompt(
  news?: FetchResult<NewsItem>,
  jobs?: FetchResult<JobPosting>,
  companyIntel?: FetchResult<CompanyIntel>,
): string {
  const sections: string[] = []

  if (news && news.items.length > 0) {
    const liveTag = news.live ? " [LIVE via Bright Data]" : " [demo data]"
    sections.push(
      `=== REAL-TIME NEWS${liveTag} ===\n${news.items
        .map(
          (n, i) =>
            `${i + 1}. "${n.title}" - ${n.source}, ${n.publishedAt}${
              n.relevance === "high" ? " [HIGH RELEVANCE]" : ""
            }\n   ${n.summary}${n.url ? `\n   Source: ${n.url}` : ""}`,
        )
        .join("\n\n")}\n===`,
    )
  }

  if (jobs && jobs.items.length > 0) {
    const liveTag = jobs.live ? " [LIVE via Bright Data]" : " [demo data]"
    sections.push(
      `=== ACTIVE JOB POSTINGS${liveTag} ===\n${jobs.items
        .map((j) => `- ${j.role} at ${j.company} (${j.level}, ${j.location}) - posted ${j.postedDate}`)
        .join("\n")}\n===`,
    )
  }

  if (companyIntel && companyIntel.items.length > 0) {
    const liveTag = companyIntel.live ? " [LIVE via Bright Data]" : " [demo data]"
    sections.push(
      `=== ACCOUNT TRIGGER EVENTS${liveTag} ===\n${companyIntel.items
        .map((c) => `- [${c.triggerType.toUpperCase()}] ${c.company}: ${c.description} (${c.source}, ${c.date})`)
        .join("\n")}\n===`,
    )
  }

  return sections.join("\n\n")
}

/** Flatten all citations from any of the fetch results for client display. */
export interface Citation {
  title: string
  source: string
  url?: string
  publishedAt: string
}

export function collectCitations(
  news?: FetchResult<NewsItem>,
  companyIntel?: FetchResult<CompanyIntel>,
): Citation[] {
  const out: Citation[] = []
  if (news) {
    for (const n of news.items) {
      out.push({ title: n.title, source: n.source, url: n.url, publishedAt: n.publishedAt })
    }
  }
  if (companyIntel) {
    for (const c of companyIntel.items) {
      out.push({ title: c.description, source: c.source, url: c.url, publishedAt: c.date })
    }
  }
  return out
}
