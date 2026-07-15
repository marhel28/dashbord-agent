<template>
  <div class="space-y-6 animate-fade-in">
    <!-- ═══════════ HEADER + PERIOD TOGGLE ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-navy);">Dashboard Overview</h1>
        <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">Monitor daily operations, sales performance & inventory health.</p>
      </div>
      <div class="inline-flex p-1 rounded-xl border" style="background: var(--wp-bg); border-color: var(--wp-border);">
        <button
          v-for="p in periods" :key="p.value"
          @click="setPeriod(p.value)"
          :class="['px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200',
            period === p.value ? 'text-white shadow-sm' : 'hover:text-slate-700']"
          :style="period === p.value
            ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;'
            : 'color: var(--wp-text-secondary);'"
        >{{ p.label }}</button>
      </div>
    </div>

    <!-- ═══════════ LOADING ═══════════ -->
    <div v-if="pageLoading" class="flex items-center justify-center py-20">
      <div class="text-center space-y-3">
        <div class="w-10 h-10 mx-auto rounded-full border-4 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
        <p class="text-sm font-medium" style="color: var(--wp-text-secondary);">Loading dashboard…</p>
      </div>
    </div>

    <!-- ═══════════ ERROR ═══════════ -->
    <div v-else-if="pageError" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4 max-w-sm">
        <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style="background: #FEF2F2;">
          <Icon name="heroicons:exclamation-triangle" class="w-8 h-8" style="color: #DC2626;" />
        </div>
        <h3 class="text-lg font-bold" style="color: var(--wp-text);">Failed to load dashboard</h3>
        <p class="text-sm" style="color: var(--wp-text-secondary);">{{ pageError }}</p>
        <button @click="loadAll" class="px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-sm transition"
          style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          Retry
        </button>
      </div>
    </div>

    <!-- ═══════════ DASHBOARD CONTENT ═══════════ -->
    <template v-else>
      <!-- ── KPI Row ── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div
          v-for="card in kpiCards" :key="card.label"
          class="bg-white border rounded-2xl p-5 shadow-sm transition hover:shadow-md relative overflow-hidden group"
          style="border-color: var(--wp-border);"
        >
          <div class="absolute top-0 left-4 right-4 h-0.5 rounded-b" :style="{ background: card.accent }"></div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">{{ card.label }}</span>
            <Icon :name="card.icon" class="w-4 h-4" style="color: var(--wp-gold);" />
          </div>
          <p class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-text); font-variant-numeric: tabular-nums;">
            {{ card.value }}
          </p>
          <p class="text-[11px] font-semibold mt-1.5 flex items-center gap-1"
            :style="{ color: card.change >= 0 ? 'var(--wp-success)' : 'var(--wp-error)' }">
            <Icon :name="card.change >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" class="w-3.5 h-3.5" />
            {{ card.change >= 0 ? '+' : '' }}{{ card.change }}%
            <span class="font-medium ml-0.5" style="color: var(--wp-text-secondary);">vs prev</span>
          </p>
        </div>
      </div>

      <!-- ── Row 1: Sales Trend (2/3) + Inventory Overview (1/3) ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Sales Trend Chart -->
        <div class="xl:col-span-2 bg-white border rounded-2xl p-6 shadow-sm transition hover:shadow-md" style="border-color: var(--wp-border);">
          <h2 class="text-base font-bold mb-1" style="color: var(--wp-text);">Sales Trends</h2>
          <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Revenue overview</p>
          <VChart v-if="trendOption" :option="trendOption" autoresize class="h-56" />
          <div v-else class="h-56 flex items-center justify-center" style="color: var(--wp-text-secondary);">
            <p class="text-xs">No sales data for this period yet.</p>
          </div>
        </div>

        <!-- Inventory Overview -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm transition hover:shadow-md flex flex-col" style="border-color: var(--wp-border);">
          <h2 class="text-base font-bold mb-1" style="color: var(--wp-text);">Inventory Overview</h2>
          <p class="text-xs mb-2" style="color: var(--wp-text-secondary);">By category</p>
          <div v-if="categoryDonutOption" class="flex-1">
            <VChart :option="categoryDonutOption" autoresize class="h-44" />
          </div>
          <div v-else class="flex-1 flex items-center justify-center" style="color: var(--wp-text-secondary);">
            <p class="text-xs">No products in inventory yet.</p>
          </div>
          <NuxtLink to="/inventory" class="text-[10px] font-bold flex items-center gap-1 mt-2 transition hover:underline" style="color: var(--wp-gold);">
            Manage Inventory <span>→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- ── Row 2: Quick Actions (1/3) + Stock Table (2/3) ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <div class="space-y-4">
          <h3 class="text-base font-bold" style="color: var(--wp-text);">Quick Actions</h3>
          <NuxtLink to="/agents" class="block bg-white border rounded-2xl p-5 shadow-sm transition hover:shadow-md group" style="border-color: var(--wp-border);">
            <div class="flex items-start gap-4">
              <div class="p-2.5 rounded-xl border transition group-hover:border-[var(--wp-gold)]" style="background: var(--wp-bg); border-color: var(--wp-border);">
                <Icon name="heroicons:sparkles" class="w-5 h-5" style="color: var(--wp-text-secondary);" />
              </div>
              <div>
                <h4 class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">AI Agents</h4>
                <p class="text-xs font-medium mt-0.5" style="color: var(--wp-text-secondary);">Chat with AI specialists — finance, stock, marketing & research.</p>
              </div>
            </div>
            <div class="text-right mt-3">
              <span class="text-[10px] font-bold tracking-widest transition-colors" style="color: var(--wp-gold);">START →</span>
            </div>
          </NuxtLink>
          <NuxtLink to="/tambah-skill" class="block bg-white border rounded-2xl p-5 shadow-sm transition hover:shadow-md group" style="border-color: var(--wp-border);">
            <div class="flex items-start gap-4">
              <div class="p-2.5 rounded-xl border transition group-hover:border-[var(--wp-gold)]" style="background: var(--wp-bg); border-color: var(--wp-border);">
                <Icon name="heroicons:plus-circle" class="w-5 h-5" style="color: var(--wp-text-secondary);" />
              </div>
              <div>
                <h4 class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Tambah Skill</h4>
                <p class="text-xs font-medium mt-0.5" style="color: var(--wp-text-secondary);">Add new operational capabilities to existing staff.</p>
              </div>
            </div>
            <div class="text-right mt-3">
              <span class="text-[10px] font-bold tracking-widest transition-colors" style="color: var(--wp-gold);">MANAGE →</span>
            </div>
          </NuxtLink>
          <NuxtLink to="/sales-report" class="block bg-white border rounded-2xl p-5 shadow-sm transition hover:shadow-md group" style="border-color: var(--wp-border);">
            <div class="flex items-start gap-4">
              <div class="p-2.5 rounded-xl border transition group-hover:border-[var(--wp-gold)]" style="background: var(--wp-bg); border-color: var(--wp-border);">
                <Icon name="heroicons:chart-bar" class="w-5 h-5" style="color: var(--wp-text-secondary);" />
              </div>
              <div>
                <h4 class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Sales Report</h4>
                <p class="text-xs font-medium mt-0.5" style="color: var(--wp-text-secondary);">View detailed analytics, trends & export reports.</p>
              </div>
            </div>
            <div class="text-right mt-3">
              <span class="text-[10px] font-bold tracking-widest transition-colors" style="color: var(--wp-gold);">ANALYZE →</span>
            </div>
          </NuxtLink>
        </div>

        <!-- Inventory Table -->
        <div class="xl:col-span-2 bg-white rounded-2xl border p-6 shadow-sm transition hover:shadow-md" style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between pb-4 border-b" style="border-color: var(--wp-border);">
            <div>
              <h2 class="text-base font-bold" style="color: var(--wp-text);">Inventory Management</h2>
              <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">{{ stocks.length }} products tracked</p>
            </div>
            <NuxtLink to="/inventory" class="text-xs font-bold flex items-center gap-1 transition hover:underline" style="color: var(--wp-gold);">
              View All <span class="text-[10px]">→</span>
            </NuxtLink>
          </div>

          <!-- Empty inventory -->
          <div v-if="stocks.length === 0" class="py-12 text-center">
            <Icon name="heroicons:archive-box" class="w-10 h-10 mx-auto mb-3" style="color: var(--wp-border);" />
            <p class="text-sm font-medium" style="color: var(--wp-text-secondary);">No products in inventory</p>
            <NuxtLink to="/inventory" class="inline-block mt-3 text-xs font-bold" style="color: var(--wp-gold);">Add your first product →</NuxtLink>
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] font-bold uppercase tracking-widest border-b" style="color: var(--wp-text-secondary); border-color: var(--wp-border);">
                  <th class="py-4 pr-4">Product Name</th>
                  <th class="py-4 pr-4">Category</th>
                  <th class="py-4 pr-4">Stock Level</th>
                  <th class="py-4 pr-4 text-center">Status</th>
                  <th class="py-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody class="divide-y text-xs" style="border-color: var(--wp-border);">
                <tr v-for="item in displayStocks" :key="item.uuid" class="transition-colors hover:bg-slate-50/50">
                  <td class="py-4 pr-4 font-bold" style="color: var(--wp-text);">{{ item.product_name }}</td>
                  <td class="py-4 pr-4 font-medium" style="color: var(--wp-text-secondary);">{{ item.category || '—' }}</td>
                  <td class="py-4 pr-4">
                    <div class="flex items-center gap-3">
                      <span class="w-8 font-bold text-sm font-mono" style="color: var(--wp-text);">{{ item.stock_quantity }}</span>
                      <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: #E2E8F0;">
                        <div class="h-full rounded-full transition-all duration-700 ease-out"
                          :style="{
                            width: stockPercentage(item) + '%',
                            background: stockBarColor(item),
                          }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 pr-4 text-center">
                    <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold border inline-flex items-center gap-1"
                      :style="stockBadgeStyle(item)">
                      <span class="w-1.5 h-1.5 rounded-full" :style="{ background: stockBadgeStyle(item).color }"></span>
                      {{ stockStatus(item).label }}
                    </span>
                  </td>
                  <td class="py-4 text-right font-bold font-mono" style="color: var(--wp-text);">
                    {{ formatRupiah(item.price) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { api } from '~/utils/api'
import { useAnalytics } from '~/composables/useAnalytics'

use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

// ── Data ──
const {
  period, data: analyticsData, loading: analyticsLoading, error: analyticsError,
  setPeriod, fetchAnalytics: fetchAnalyticsData, formatRupiah, formatCompact,
} = useAnalytics()

interface StockItem {
  uuid: string
  product_name: string
  category: string | null
  stock_quantity: number
  min_stock: number
  price: number
  is_active: boolean
}
const stocks = ref<StockItem[]>([])
const stocksLoading = ref(false)
const stocksError = ref<string | null>(null)

const pageLoading = computed(() => analyticsLoading.value || stocksLoading.value)
const pageError = computed(() => analyticsError.value || stocksError.value)

const periods = [
  { label: 'Today', value: 'today' as const },
  { label: 'This Week', value: 'week' as const },
  { label: 'Month', value: 'month' as const },
  { label: 'Year', value: 'year' as const },
]

// ── Fetch stocks ──
const fetchStocks = async () => {
  stocksLoading.value = true
  stocksError.value = null
  try {
    const result = await api.get('/stocks/')
    stocks.value = (result || []) as StockItem[]
  } catch (err: any) {
    stocksError.value = err.message || 'Failed to fetch inventory'
  } finally {
    stocksLoading.value = false
  }
}

const loadAll = async () => {
  await Promise.all([fetchAnalyticsData(), fetchStocks()])
}

// ── KPI Cards ──
const kpiCards = computed(() => {
  const k = analyticsData.value?.kpi
  const activeProducts = stocks.value.filter(s => s.is_active).length
  return [
    {
      label: 'Total Revenue',
      value: k ? formatRupiah(k.total_revenue) : '—',
      change: k?.revenue_change_pct ?? 0,
      icon: 'heroicons:banknotes',
      accent: 'linear-gradient(90deg, var(--wp-gold), var(--wp-gold-light))',
    },
    {
      label: 'Gross Profit',
      value: k ? formatRupiah(k.total_profit) : '—',
      change: k?.profit_change_pct ?? 0,
      icon: 'heroicons:arrow-trending-up',
      accent: 'linear-gradient(90deg, var(--wp-success), #34D399)',
    },
    {
      label: 'Transactions',
      value: k ? k.total_transactions.toLocaleString('id-ID') : '0',
      change: k?.transactions_change_pct ?? 0,
      icon: 'heroicons:document-text',
      accent: 'linear-gradient(90deg, var(--wp-navy), #3B5998)',
    },
    {
      label: 'Active Products',
      value: `${activeProducts}`,
      change: 0,
      icon: 'heroicons:archive-box',
      accent: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
    },
  ]
})

// ── ECharts: Sales Trend (simple bar) ──
const trendOption = computed(() => {
  const trend = analyticsData.value?.trend
  if (!trend || trend.length === 0) return null
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 8,
      padding: [8, 12],
      textStyle: { color: '#1E293B', fontSize: 12, fontFamily: 'var(--wp-font)' },
      formatter: (params: any) => {
        const p = params[0]
        const val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)
        return `<b style="color:#0F1A2E">${p.axisValue}</b><br/><span style="color:#64748B">Revenue:</span> <b>${val}</b>`
      },
    },
    grid: { left: 0, right: 8, top: 8, bottom: 20 },
    xAxis: {
      type: 'category',
      data: trend.map((t: any) => t.date),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 9, fontWeight: 600 },
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [{
      type: 'bar',
      data: trend.map((t: any) => ({
        value: t.revenue,
        itemStyle: {
          color: '#D4A843',
          borderRadius: [4, 4, 0, 0],
        },
      })),
      barWidth: 14,
      emphasis: {
        itemStyle: { color: '#B8922E' },
      },
    }],
  }
})

// ── ECharts: Category Donut (from inventory, not sales) ──
const catPalette = ['#D4A843', '#0F1A2E', '#059669', '#D97706', '#3B82F6', '#8B5CF6', '#64748B', '#EC4899']
const categoryDonutOption = computed(() => {
  const active = stocks.value.filter(s => s.is_active)
  if (active.length === 0) return null

  // Aggregate stock count by category
  const catMap: Record<string, number> = {}
  for (const s of active) {
    const cat = s.category || 'Uncategorized'
    catMap[cat] = (catMap[cat] || 0) + s.stock_quantity
  }
  const entries = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  const total = entries.reduce((sum, e) => sum + e.value, 0)

  const top4 = entries.slice(0, 4)
  const other = entries.slice(4).reduce((s, e) => s + e.value, 0)
  const data = top4.map((e, i) => ({ value: e.value, name: e.name, itemStyle: { color: catPalette[i] } }))
  if (other > 0) data.push({ value: other, name: 'Other', itemStyle: { color: '#CBD5E1' } })

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 8,
      padding: [6, 10],
      textStyle: { color: '#1E293B', fontSize: 11, fontFamily: 'var(--wp-font)' },
      formatter: (p: any) => `<b>${p.name}</b><br/>${p.value.toLocaleString('id-ID')} items (${p.percent}%)`,
    },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['60%', '82%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        position: 'outside',
        formatter: (p: any) => `${p.name}  ${p.percent}%`,
        fontSize: 9,
        fontWeight: 600,
        color: '#64748B',
      },
      emphasis: { scaleSize: 4 },
      data,
    }],
  }
})

// ── Stock helpers ──
const displayStocks = computed(() => stocks.value.filter(s => s.is_active).slice(0, 6))

const stockPercentage = (item: StockItem) => {
  const max = Math.max(item.stock_quantity, item.min_stock * 2, 100)
  return Math.min(100, Math.round((item.stock_quantity / max) * 100))
}

const stockStatus = (item: StockItem) => {
  if (item.stock_quantity === 0) return { label: 'Out of Stock', color: '#DC2626' }
  if (item.stock_quantity <= item.min_stock) return { label: 'Low Stock', color: '#D97706' }
  return { label: 'In Stock', color: '#059669' }
}

const stockBarColor = (item: StockItem) => {
  if (item.stock_quantity === 0) return 'linear-gradient(90deg, #EF4444, #DC2626)'
  if (item.stock_quantity <= item.min_stock) return 'linear-gradient(90deg, #F59E0B, #D97706)'
  return 'linear-gradient(90deg, var(--wp-gold), var(--wp-gold-dark))'
}

const stockBadgeStyle = (item: StockItem) => {
  const status = stockStatus(item)
  if (status.color === '#DC2626') return { background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }
  if (status.color === '#D97706') return { background: '#FFFBEB', color: '#D97706', borderColor: '#FDE68A' }
  return { background: '#F0FDF4', color: '#059669', borderColor: '#DCFCE7' }
}

// ── Init ──
onMounted(() => {
  loadAll()
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
