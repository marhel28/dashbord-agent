// ── Decision Support Composable — fetches algorithmic business recommendations
import { ref, computed } from 'vue'
import { api } from '../utils/api'

export interface DecisionScores {
  impact: number
  urgency: number
  confidence: number
  financial: number
  actionability: number
}

export interface DecisionMetrics {
  stock_qty: number
  sales_velocity: number
  days_of_inventory: number
  margin_pct: number
  growth_rate: number
  revenue_contribution?: number
}

export interface DecisionCTA {
  label: string
  action: string
}

export interface Recommendation {
  product_uuid: string
  product_name: string
  sku: string
  action_type: string
  priority: number
  confidence: number
  metrics: DecisionMetrics
  reason: string
  scores: DecisionScores
  cta: DecisionCTA
}

export interface DecisionData {
  total: number
  recommendations: Recommendation[]
}

export interface BusinessHealth {
  revenue: number
  transactions: number
  avg_order_value: number
  avg_margin_pct: number
  total_products: number
  low_stock_count: number
  out_of_stock_count: number
  alerts: string[]
  status: 'healthy' | 'warning' | 'critical'
}

// ── State ─────────────────────────────────────────────────────────

const data = ref<DecisionData | null>(null)
const health = ref<BusinessHealth | null>(null)
const loading = ref(true)
const healthLoading = ref(true)
const error = ref<string | null>(null)

// ── Computed ──────────────────────────────────────────────────────

const recommendations = computed(() => data.value?.recommendations ?? [])

const highPriority = computed(() =>
  recommendations.value.filter((r) => r.priority >= 80),
)
const mediumPriority = computed(() =>
  recommendations.value.filter((r) => r.priority >= 60 && r.priority < 80),
)
const lowPriority = computed(() =>
  recommendations.value.filter((r) => r.priority >= 40 && r.priority < 60),
)
const opportunities = computed(() =>
  recommendations.value.filter((r) => r.priority < 40),
)

const restockCount = computed(() =>
  recommendations.value.filter((r) => r.action_type === 'RESTOCK').length,
)
const promoCount = computed(() =>
  recommendations.value.filter((r) =>
    ['PROMOTION', 'PROMOTE', 'OVERSTOCK'].includes(r.action_type),
  ).length,
)
const priceCount = computed(() =>
  recommendations.value.filter((r) => r.action_type === 'PRICE_OPTIMIZATION').length,
)

// ── Formatters ────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0'
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`
}

function formatPct(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%'
  return `${Math.round(value)}%`
}

// ── Actions ───────────────────────────────────────────────────────

async function fetchRecommendations() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/agentic/decision-support/recommendations')
    if (res.status === 'success') {
      data.value = res.data
    } else {
      error.value = res.message ?? 'Gagal memuat rekomendasi.'
    }
  } catch (e: any) {
    error.value = e?.message ?? 'Terjadi kesalahan saat memuat data.'
  } finally {
    loading.value = false
  }
}

async function fetchHealth() {
  healthLoading.value = true
  try {
    const res = await api.get('/agentic/decision-support/health')
    if (res.status === 'success') {
      health.value = res.data
    }
  } catch (e: any) {
    // Health is non-critical, silently fail
  } finally {
    healthLoading.value = false
  }
}

async function refresh() {
  await Promise.all([fetchRecommendations(), fetchHealth()])
}

// ── Composable return ─────────────────────────────────────────────

export function useDecisionSupport() {
  return {
    // State
    data,
    health,
    loading,
    healthLoading,
    error,
    // Computed
    recommendations,
    highPriority,
    mediumPriority,
    lowPriority,
    opportunities,
    restockCount,
    promoCount,
    priceCount,
    // Formatters
    formatRupiah,
    formatPct,
    // Actions
    fetchRecommendations,
    fetchHealth,
    refresh,
  }
}
