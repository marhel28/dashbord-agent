/**
 * Marketing Composable — state management for Marketing Command Center.
 *
 * Dual-path:
 * - Path A (Gateway Direct): fetch* functions call /agentic/marketing/* for structured data
 * - Path B (Orchestrator Chat): sendChat calls /agentic/marketing/chat for open-ended queries
 */

import { ref } from 'vue'
import { api } from '~/utils/api'

// ── Types ───────────────────────────────────────────────────────────

export interface MarketingRecommendation {
  rank: number
  product: string
  score: number
  stock_level: string
  margin_level: string
  trend: string
  ai_reason: string
  action: string
}

export interface MarketingKPI {
  label: string
  value: string
  change?: number
  icon?: string
  status?: string
}

export interface MarketingAlert {
  type: string
  severity: string
  message: string
  metric?: string
}

export interface OverviewData {
  recommendations: MarketingRecommendation[]
  kpis: MarketingKPI[]
  alerts: MarketingAlert[]
  ai_recommendations: string[]
}

export interface ChatMessage {
  role: 'user' | 'ai'
  text: string
  agents?: string[]
}

// ── Composable ──────────────────────────────────────────────────────

export const useMarketing = () => {
  // Path A state — structured data from gateway
  const overview = ref<OverviewData | null>(null)
  const recommendations = ref<MarketingRecommendation[]>([])
  const kpis = ref<MarketingKPI[]>([])
  const campaigns = ref<any>(null)
  const slowProducts = ref<any[]>([])
  const calendar = ref<any>(null)
  const customers = ref<any>(null)
  const channels = ref<any>(null)
  const insights = ref<any>(null)
  const health = ref<any>(null)

  // Path B state — chat
  const chatMessages = ref<ChatMessage[]>([])
  const chatSending = ref(false)

  // Content generation state
  const generatedContent = ref<any>(null)
  const showContentModal = ref(false)
  const contentGenerating = ref(false)

  // Common state
  const loading = ref(false)
  const error = ref('')

  // ── Path A: Gateway Direct fetchers ────────────────────────────────

  const fetchOverview = async () => {
    try {
      const res = await api.get('/agentic/marketing/overview')
      overview.value = res.data || res
      kpis.value = res.data?.kpis || res?.kpis || []
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat overview'
    }
  }

  const fetchRecommendations = async (limit = 10) => {
    try {
      const res = await api.get('/agentic/marketing/recommendations', { params: { limit } })
      recommendations.value = res.data?.recommendations || res?.recommendations || []
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat rekomendasi'
    }
  }

  const fetchKpis = async () => {
    try {
      const res = await api.get('/agentic/marketing/kpis')
      kpis.value = res.data?.kpis || res?.kpis || []
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat KPI'
    }
  }

  const fetchCampaigns = async (days = 30) => {
    try {
      const res = await api.get('/agentic/marketing/campaigns', { params: { days } })
      campaigns.value = res.data || res
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat campaign'
    }
  }

  const fetchSlowProducts = async (limit = 5, days = 30) => {
    try {
      const res = await api.get('/agentic/marketing/content/slow-products', { params: { limit, days } })
      slowProducts.value = res.data?.rows || res?.rows || res?.data || []
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat produk lambat'
    }
  }

  const fetchCalendar = async () => {
    try {
      const res = await api.get('/agentic/marketing/calendar')
      calendar.value = res.data || res
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat kalender'
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/agentic/marketing/customers')
      customers.value = res.data || res
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat data pelanggan'
    }
  }

  const fetchChannels = async () => {
    try {
      const res = await api.get('/agentic/marketing/channels')
      channels.value = res.data || res
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat channel'
    }
  }

  const fetchInsights = async () => {
    try {
      const res = await api.get('/agentic/marketing/insights')
      insights.value = res.data || res
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat insights'
    }
  }

  const fetchHealth = async () => {
    try {
      const res = await api.get('/agentic/marketing/health')
      health.value = res.data || res
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat health score'
    }
  }

  // ── Path B: Orchestrator Chat ─────────────────────────────────────

  const sendChat = async (message: string) => {
    chatMessages.value.push({ role: 'user', text: message })
    chatSending.value = true
    try {
      const res = await api.post('/agentic/marketing/chat', { message })
      chatMessages.value.push({
        role: 'ai',
        text: res.reply || res.data?.reply || 'Maaf, ada kendala teknis.',
        agents: res.agents_used || res.data?.agents_used || [],
      })
    } catch (err: any) {
      chatMessages.value.push({
        role: 'ai',
        text: `Maaf, terjadi kesalahan: ${err.message || 'Unknown error'}`,
      })
    } finally {
      chatSending.value = false
    }
  }

  const clearChat = () => {
    chatMessages.value = []
  }

  // ── Content Generation ────────────────────────────────────────────

  const generateCaption = async (productName: string, platform = 'instagram', goal = 'hard_selling') => {
    contentGenerating.value = true
    error.value = ''
    try {
      const res = await api.post('/agentic/marketing/content/generate', {
        product_name: productName,
        platform,
        goal,
      })
      generatedContent.value = res.data || res
      showContentModal.value = true
      return generatedContent.value
    } catch (err: any) {
      error.value = err.message || 'Gagal generate konten'
      throw err
    } finally {
      contentGenerating.value = false
    }
  }

  const openContentModal = (content: any) => {
    generatedContent.value = content
    showContentModal.value = true
  }

  const closeContentModal = () => {
    showContentModal.value = false
  }

  const copied = ref(false)
  const copyAllCaptions = () => {
    const variants = generatedContent.value?.variants || []
    const text = variants.map((v: any, i: number) =>
      `${i + 1}. ${v.style}\n${v.caption}\n${v.hashtags?.join(' ') || ''}\nCTA: ${v.cta || ''}`
    ).join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }

  const createCampaignPlan = async (params: {
    objective?: string
    budget?: number
    duration_days?: number
    channel?: string
    target_audience?: string
  }) => {
    try {
      const res = await api.post('/agentic/marketing/campaign/create', {
        objective: params.objective || 'sales_boost',
        budget: params.budget || 0,
        duration_days: params.duration_days || 14,
        channel: params.channel || 'all',
        target_audience: params.target_audience || 'all',
      })
      return res.data || res
    } catch (err: any) {
      error.value = err.message || 'Gagal membuat rencana campaign'
      throw err
    }
  }

  // ── Automation State ────────────────────────────────────────────
  const scheduledContent = ref<any[]>([])
  const campaignRecommendation = ref<any>(null)

  // ── Automation Actions ──────────────────────────────────────────
  const loadScheduledContent = async () => {
    try {
      const res = await api.get('/agentic/automation/scheduled-content')
      scheduledContent.value = res || []
    } catch (err) {
      console.error('Failed to load scheduled content:', err)
    }
  }

  const cancelScheduledContent = async (id: string) => {
    await api.delete(`/agentic/automation/scheduled-content/${id}`)
    await loadScheduledContent()
  }

  const loadCampaigns = async () => {
    try {
      const res = await api.get('/agentic/automation/campaigns')
      campaigns.value = res || []
    } catch (err) {
      console.error('Failed to load campaigns:', err)
    }
  }

  const loadCampaignRecommendation = async () => {
    try {
      const res = await api.get('/agentic/automation/campaigns')
      // Get recommendation from first campaign or fetch separately
      campaignRecommendation.value = null // TODO: Add recommendation endpoint
    } catch (err) {
      console.error('Failed to load campaign recommendation:', err)
    }
  }

  return {
    // Path A state
    overview,
    recommendations,
    kpis,
    slowProducts,
    calendar,
    customers,
    channels,
    insights,
    health,

    // Path B state
    chatMessages,
    chatSending,

    // Content state
    generatedContent,
    showContentModal,
    contentGenerating,
    copied,

    // Automation state
    scheduledContent,
    campaigns,
    campaignRecommendation,

    // Common state
    loading,
    error,

    // Path A actions
    fetchOverview,
    fetchRecommendations,
    fetchKpis,
    fetchCampaigns,
    fetchSlowProducts,
    fetchCalendar,
    fetchCustomers,
    fetchChannels,
    fetchInsights,
    fetchHealth,

    // Path B actions
    sendChat,
    clearChat,

    // Content actions
    generateCaption,
    openContentModal,
    closeContentModal,
    createCampaignPlan,
    copyAllCaptions,

    // Automation actions
    loadScheduledContent,
    cancelScheduledContent,
    loadCampaigns,
    loadCampaignRecommendation,
  }
}
