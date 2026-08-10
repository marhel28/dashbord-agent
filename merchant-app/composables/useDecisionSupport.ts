// ── Decision Support Composable v2 — recommendations + AI insight + history + filters
import { ref, computed } from 'vue'
import { api } from '../utils/api'

// ── Types ────────────────────────────────────────────────────────

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
  stock_value_rupiah: number
  price: number
  cost_price: number
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
  priority_level: string
  confidence: number
  metrics: DecisionMetrics
  expected_impact_rupiah: number
  expected_outcome: string
  reason: string
  evidence: string[]
  recommendation_text: string
  scores: DecisionScores
  confidence_factors: string[]
  cta: DecisionCTA[]
  data_freshness: string
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

export interface DecisionInsight {
  insight: string
  recommendations: Recommendation[]
  generated_at?: string
}

export interface DecisionHistoryEntry {
  id: string
  date: string
  product_name: string
  action_type: string
  status: 'done' | 'rejected' | 'pending'
  priority: number
}

// ── State ────────────────────────────────────────────────────────

const data = ref<DecisionData | null>(null)
const health = ref<BusinessHealth | null>(null)
const insight = ref<DecisionInsight | null>(null)
const history = ref<DecisionHistoryEntry[]>([])
const loading = ref(true)
const insightLoading = ref(false)
const error = ref<string | null>(null)

// Filter state
const filterActionType = ref<string>('all')
const filterPriorityLevel = ref<string>('all')
const filterMinConfidence = ref<number>(0)

// ── Computed ──────────────────────────────────────────────────────

const recommendations = computed(() => data.value?.recommendations ?? [])

const filteredRecommendations = computed(() => {
  let recs = recommendations.value
  if (filterActionType.value !== 'all') {
    recs = recs.filter((r) => r.action_type === filterActionType.value)
  }
  if (filterPriorityLevel.value !== 'all') {
    recs = recs.filter((r) => r.priority_level === filterPriorityLevel.value)
  }
  if (filterMinConfidence.value > 0) {
    recs = recs.filter((r) => r.confidence >= filterMinConfidence.value)
  }
  return recs
})

const criticalRecs = computed(() =>
  filteredRecommendations.value.filter((r) => r.priority_level === 'CRITICAL'),
)
const highRecs = computed(() =>
  filteredRecommendations.value.filter((r) => r.priority_level === 'HIGH'),
)
const mediumRecs = computed(() =>
  filteredRecommendations.value.filter((r) => r.priority_level === 'MEDIUM'),
)
const opportunityRecs = computed(() =>
  filteredRecommendations.value.filter((r) => r.priority_level === 'OPPORTUNITY'),
)

const quickWins = computed(() =>
  [...recommendations.value].sort((a, b) => b.expected_impact_rupiah - a.expected_impact_rupiah).slice(0, 3),
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
const criticalCount = computed(() => criticalRecs.value.length)
const highCount = computed(() => highRecs.value.length)
const opportunityCount = computed(() => opportunityRecs.value.length)

const doneCount = computed(() => history.value.filter((h) => h.status === 'done').length)
const rejectedCount = computed(() => history.value.filter((h) => h.status === 'rejected').length)

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
  try {
    const res = await api.get('/agentic/decision-support/health')
    if (res.status === 'success') {
      health.value = res.data
    }
  } catch {
    // Health is non-critical
  }
}

async function fetchInsight() {
  insightLoading.value = true
  try {
    const res = await api.get('/agentic/decision-support/insights')
    if (res.status === 'success') {
      insight.value = res.data
    }
  } catch {
    // Insight is non-critical
  } finally {
    insightLoading.value = false
  }
}

function loadHistory() {
  try {
    const stored = localStorage.getItem('decision_history')
    if (stored) {
      history.value = JSON.parse(stored)
    }
  } catch {
    history.value = []
  }
}

function markDecision(rec: Recommendation, status: 'done' | 'rejected') {
  const entry: DecisionHistoryEntry = {
    id: `${rec.product_uuid}_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    product_name: rec.product_name,
    action_type: rec.action_type,
    status,
    priority: rec.priority,
  }
  history.value.unshift(entry)
  try {
    localStorage.setItem('decision_history', JSON.stringify(history.value.slice(0, 50)))
  } catch {
    // Storage full, ignore
  }
}

async function refresh() {
  await Promise.all([fetchRecommendations(), fetchHealth()])
}

function setFilter(actionType?: string, priorityLevel?: string, minConfidence?: number) {
  if (actionType !== undefined) filterActionType.value = actionType
  if (priorityLevel !== undefined) filterPriorityLevel.value = priorityLevel
  if (minConfidence !== undefined) filterMinConfidence.value = minConfidence
}

function resetFilters() {
  filterActionType.value = 'all'
  filterPriorityLevel.value = 'all'
  filterMinConfidence.value = 0
}

// ── Composable return ─────────────────────────────────────────────

export function useDecisionSupport() {
  return {
    // State
    data,
    health,
    insight,
    history,
    loading,
    insightLoading,
    error,
    // Filters
    filterActionType,
    filterPriorityLevel,
    filterMinConfidence,
    // Computed
    recommendations,
    filteredRecommendations,
    criticalRecs,
    highRecs,
    mediumRecs,
    opportunityRecs,
    quickWins,
    restockCount,
    promoCount,
    priceCount,
    criticalCount,
    highCount,
    opportunityCount,
    doneCount,
    rejectedCount,
    // Formatters
    formatRupiah,
    formatPct,
    // Actions
    fetchRecommendations,
    fetchHealth,
    fetchInsight,
    loadHistory,
    markDecision,
    refresh,
    setFilter,
    resetFilters,
  }
}
