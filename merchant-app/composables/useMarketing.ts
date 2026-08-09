/**
 * Marketing Composable — state management for Marketing Command Center.
 *
 * Follows the useAnalytics pattern: state refs, fetch functions,
 * loading/error handling, formatters.
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

// ── Composable ──────────────────────────────────────────────────────

export const useMarketing = () => {
  // State
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
  const generatedContent = ref<any>(null)

  const loading = ref(false)
  const error = ref('')

  // ── Fetchers ─────────────────────────────────────────────────────

  const fetchOverview = async () => {
    loading.value = true
    error.value = ''
    try {
      const res = await api.get('/agentic/marketing/overview')
      overview.value = res.data || res
      kpis.value = res.data?.kpis || res?.kpis || []
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat overview'
    } finally {
      loading.value = false
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

  const generateContent = async (productName: string, platform = 'instagram', goal = 'hard_selling') => {
    try {
      const res = await api.post('/agentic/marketing/content/generate', {
        product_name: productName,
        platform,
        goal,
      })
      generatedContent.value = res.data || res
      return generatedContent.value
    } catch (err: any) {
      error.value = err.message || 'Gagal generate konten'
      throw err
    }
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

  // ── Load all data ───────────────────────────────────────────────

  const loadAll = async () => {
    loading.value = true
    error.value = ''
    try {
      await Promise.all([
        fetchOverview(),
        fetchRecommendations(),
        fetchKpis(),
        fetchSlowProducts(),
        fetchCalendar(),
        fetchCustomers(),
        fetchChannels(),
        fetchInsights(),
        fetchHealth(),
      ])
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat data marketing'
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    overview,
    recommendations,
    kpis,
    campaigns,
    slowProducts,
    calendar,
    customers,
    channels,
    insights,
    health,
    generatedContent,
    loading,
    error,

    // Actions
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
    generateContent,
    createCampaignPlan,
    loadAll,
  }
}
