"use server"

// Bright Data integration for real-time web intelligence
// Supports: News scraping, job postings, company data, competitive intelligence

interface BrightDataConfig {
  apiToken: string
}

interface NewsResult {
  title: string
  source: string
  date: string
  snippet: string
  url: string
  relevance: "high" | "medium" | "low"
}

interface JobResult {
  title: string
  company: string
  location: string
  postedDate: string
  url: string
  isRemote: boolean
}

interface CompanyIntelResult {
  company: string
  event: string
  type: "leadership" | "earnings" | "product" | "funding" | "partnership" | "layoffs"
  date: string
  source: string
  impact: "positive" | "negative" | "neutral"
}

// Mock data for demonstration - replace with actual Bright Data API calls when API key is provided
const MOCK_NEWS: Record<string, NewsResult[]> = {
  macro: [
    { title: "BoJ Signals Potential Rate Hike in Q3 Amid Wage Growth", source: "Reuters", date: "2024-04-15", snippet: "Bank of Japan officials hinted at possible rate increases as wage negotiations show stronger-than-expected outcomes...", url: "#", relevance: "high" },
    { title: "ECB Expected to Cut Rates Before Fed, Markets Price In June Move", source: "Bloomberg", date: "2024-04-14", snippet: "European Central Bank appears set to begin its rate-cutting cycle ahead of the Federal Reserve...", url: "#", relevance: "high" },
    { title: "Crude Oil Surges Past $85 on Middle East Tensions", source: "Financial Times", date: "2024-04-14", snippet: "Oil prices jumped 3% as geopolitical risks in the region intensify...", url: "#", relevance: "medium" },
    { title: "German Manufacturing PMI Shows Signs of Recovery", source: "WSJ", date: "2024-04-13", snippet: "Flash PMI reading beats expectations, signaling potential eurozone industrial rebound...", url: "#", relevance: "medium" },
  ],
  career: [
    { title: "OpenAI Expands Enterprise Division, Eyes IPO Preparation", source: "The Information", date: "2024-04-15", snippet: "OpenAI is rapidly scaling its enterprise sales team and executive leadership ahead of potential public offering...", url: "#", relevance: "high" },
    { title: "Anthropic Raises $2.75B at $18.4B Valuation", source: "TechCrunch", date: "2024-04-12", snippet: "AI safety company Anthropic closes massive funding round, plans aggressive hiring in research and go-to-market...", url: "#", relevance: "high" },
    { title: "Google DeepMind Launches New Enterprise AI Division", source: "The Verge", date: "2024-04-10", snippet: "DeepMind creates dedicated unit to commercialize AI research, seeking business development leaders...", url: "#", relevance: "high" },
    { title: "AI Talent War Intensifies as Startups Poach Big Tech Veterans", source: "Forbes", date: "2024-04-08", snippet: "Series B/C stage companies offering 2-3x equity packages to lure senior talent...", url: "#", relevance: "medium" },
  ],
  client: [
    { title: "Snowflake Announces Cost Optimization Initiative", source: "Seeking Alpha", date: "2024-04-15", snippet: "Cloud data company launches new tools to help customers reduce compute costs by up to 30%...", url: "#", relevance: "high" },
    { title: "Palantir Names New CRO, Signals Commercial Sector Push", source: "Business Insider", date: "2024-04-13", snippet: "Data analytics firm reorganizes sales leadership, doubling down on enterprise commercial accounts...", url: "#", relevance: "high" },
    { title: "Databricks vs Microsoft Fabric: Enterprise Battle Heats Up", source: "ZDNet", date: "2024-04-11", snippet: "Competition intensifies as both platforms vie for enterprise data lakehouse dominance...", url: "#", relevance: "medium" },
    { title: "AWS Announces 15% Price Cut on Data Analytics Services", source: "AWS Blog", date: "2024-04-09", snippet: "Amazon Web Services reduces pricing across Redshift, Athena, and EMR services...", url: "#", relevance: "high" },
  ]
}

const MOCK_JOBS: JobResult[] = [
  { title: "Chief of Staff to CEO", company: "OpenAI", location: "San Francisco, CA", postedDate: "2024-04-14", url: "#", isRemote: false },
  { title: "VP Strategy & Operations", company: "Anthropic", location: "San Francisco, CA", postedDate: "2024-04-13", url: "#", isRemote: true },
  { title: "Head of Business Development", company: "Google DeepMind", location: "London, UK", postedDate: "2024-04-12", url: "#", isRemote: false },
  { title: "Director, Enterprise Sales", company: "OpenAI", location: "New York, NY", postedDate: "2024-04-11", url: "#", isRemote: true },
  { title: "VP Product Strategy", company: "Anthropic", location: "Remote", postedDate: "2024-04-10", url: "#", isRemote: true },
]

const MOCK_COMPANY_INTEL: CompanyIntelResult[] = [
  { company: "Snowflake", event: "New CTO Sarah Chen appointed, focus on cost optimization", type: "leadership", date: "2024-04-15", source: "Press Release", impact: "positive" },
  { company: "Palantir", event: "Q1 earnings beat estimates, commercial revenue up 40%", type: "earnings", date: "2024-04-14", source: "SEC Filing", impact: "positive" },
  { company: "Databricks", event: "Launches Unity Catalog for AI governance", type: "product", date: "2024-04-12", source: "Company Blog", impact: "positive" },
  { company: "Snowflake", event: "Announces strategic partnership with NVIDIA for AI workloads", type: "partnership", date: "2024-04-10", source: "Press Release", impact: "positive" },
  { company: "Microsoft Azure", event: "Fabric GA release, aggressive migration credits offered", type: "product", date: "2024-04-08", source: "Microsoft Blog", impact: "neutral" },
]

export async function fetchRealTimeNews(
  persona: "macro" | "career" | "client",
  keywords: string[],
  config?: BrightDataConfig
): Promise<NewsResult[]> {
  // If Bright Data API token is provided, make actual API calls
  if (config?.apiToken) {
    try {
      // In production, this would call Bright Data's News Scraper API
      // const response = await fetch('https://api.brightdata.com/datasets/v3/trigger', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${config.apiToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     dataset_id: 'gd_news_scraper',
      //     input: keywords.map(k => ({ keyword: k }))
      //   })
      // })
      // return await response.json()
      
      // For now, return filtered mock data
      return MOCK_NEWS[persona] || []
    } catch (error) {
      console.error("Bright Data API error:", error)
      return MOCK_NEWS[persona] || []
    }
  }
  
  // Return mock data for demonstration
  return MOCK_NEWS[persona] || []
}

export async function fetchJobPostings(
  companies: string[],
  roles: string[],
  config?: BrightDataConfig
): Promise<JobResult[]> {
  if (config?.apiToken) {
    // In production, call Bright Data's LinkedIn Jobs Scraper
    // Similar implementation as above
  }
  
  // Filter mock jobs by companies and roles
  return MOCK_JOBS.filter(job => 
    companies.some(c => job.company.toLowerCase().includes(c.toLowerCase())) ||
    roles.some(r => job.title.toLowerCase().includes(r.toLowerCase()))
  )
}

export async function fetchCompanyIntel(
  accounts: string[],
  competitors: string[],
  config?: BrightDataConfig
): Promise<CompanyIntelResult[]> {
  if (config?.apiToken) {
    // In production, call Bright Data's Company Data Scraper
    // Similar implementation as above
  }
  
  const allTargets = [...accounts, ...competitors]
  return MOCK_COMPANY_INTEL.filter(intel =>
    allTargets.some(t => intel.company.toLowerCase().includes(t.toLowerCase()))
  )
}

// Format intelligence data for AI prompt enhancement
export function formatIntelligenceForPrompt(
  news: NewsResult[],
  jobs?: JobResult[],
  companyIntel?: CompanyIntelResult[]
): string {
  let formatted = ""
  
  if (news.length > 0) {
    formatted += "=== REAL-TIME NEWS (from Bright Data) ===\n"
    news.forEach(n => {
      formatted += `- [${n.relevance.toUpperCase()}] ${n.title} (${n.source}, ${n.date})\n  ${n.snippet}\n`
    })
    formatted += "\n"
  }
  
  if (jobs && jobs.length > 0) {
    formatted += "=== ACTIVE JOB POSTINGS ===\n"
    jobs.forEach(j => {
      formatted += `- ${j.title} at ${j.company} (${j.location}${j.isRemote ? ', Remote OK' : ''}) - Posted ${j.postedDate}\n`
    })
    formatted += "\n"
  }
  
  if (companyIntel && companyIntel.length > 0) {
    formatted += "=== COMPANY TRIGGER EVENTS ===\n"
    companyIntel.forEach(c => {
      formatted += `- [${c.type.toUpperCase()}] ${c.company}: ${c.event} (${c.date}, ${c.impact} impact)\n`
    })
    formatted += "\n"
  }
  
  return formatted
}
