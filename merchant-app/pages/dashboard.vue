<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. HEADER (Clean Whitespace & Segmented Control) ═══════════ -->
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Good evening, {{ (user?.name || 'Fadhel').split(' ')[0] }} 👋
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Here's how your business is doing today.</p>
      </div>

      <!-- Segmented Control: [ Today ] [ This week ] [ This month ] -->
      <div class="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-1 self-start md:self-auto">
        <button
          v-for="p in periods" :key="p.value"
          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
          :class="period === p.value ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
          @click="setPeriod(p.value)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- ═══════════ LOADING STATE ═══════════ -->
    <div v-if="pageLoading" class="flex items-center justify-center py-20">
      <div class="text-center space-y-3">
        <Skeleton class="h-10 w-10 mx-auto rounded-full" />
        <Skeleton class="h-4 w-40 mx-auto" />
        <p class="text-xs font-medium text-slate-500">Memuat data bisnis…</p>
      </div>
    </div>

    <!-- ═══════════ ERROR STATE ═══════════ -->
    <div v-else-if="pageError" class="flex items-center justify-center py-16">
      <Card class="max-w-sm bg-white dark:bg-slate-800 border border-red-200 dark:border-red-500/20 rounded-xl shadow-lg dark:shadow-slate-950/40">
        <CardContent class="pt-6 text-center space-y-4">
          <div class="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
            <Icon name="lucide:alert-triangle" class="w-6 h-6" />
          </div>
          <div>
            <CardTitle class="text-base font-bold text-slate-900 dark:text-slate-100">Gagal memuat beranda</CardTitle>
            <CardDescription class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ pageError }}</CardDescription>
          </div>
          <Button variant="default" size="sm" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-semibold shadow-xs" @click="loadAll">Coba Lagi</Button>
        </CardContent>
      </Card>
    </div>

    <!-- ═══════════ DASHBOARD CONTENT ═══════════ -->
    <template v-else>
      <!-- ═══════════ 2. HERO KPI CARDS (Bilingual & Meaningful Comparison) ═══════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Revenue Card -->
        <div class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Revenue</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Pendapatan</p>
            </div>
            <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Icon name="lucide:dollar-sign" class="w-4 h-4" />
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between">
            <p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {{ kpiData ? formatRupiah(kpiData.total_revenue) : 'Rp 0' }}
            </p>
            <!-- Meaningful percentage vs last period -->
            <span v-if="kpiData && Math.abs(kpiData.revenue_change_pct) < 90"
              class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="kpiData.revenue_change_pct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"
            >
              <Icon :name="kpiData.revenue_change_pct >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'" class="w-3 h-3" />
              {{ kpiData.revenue_change_pct >= 0 ? '+' : '' }}{{ kpiData.revenue_change_pct }}%
            </span>
            <span v-else class="text-[11px] text-slate-400 font-medium">No comparison</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">vs previous period</p>
        </div>

        <!-- Orders Card -->
        <div class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Orders</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Transaksi</p>
            </div>
            <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Icon name="lucide:shopping-bag" class="w-4 h-4" />
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between">
            <p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {{ kpiData ? kpiData.total_transactions.toLocaleString('id-ID') : '0' }}
            </p>
            <span v-if="kpiData && Math.abs(kpiData.transactions_change_pct) < 90"
              class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="kpiData.transactions_change_pct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"
            >
              {{ kpiData.transactions_change_pct >= 0 ? '+' : '' }}{{ kpiData.transactions_change_pct }}%
            </span>
            <span v-else class="text-[11px] text-slate-400 font-medium">No comparison</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">vs previous period</p>
        </div>

        <!-- Products Active Card -->
        <div class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs sm:col-span-2 lg:col-span-1">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Active Stock</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Produk Aktif</p>
            </div>
            <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Icon name="lucide:package-check" class="w-4 h-4" />
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between">
            <p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {{ activeProductCount }} <span class="text-xs font-normal text-slate-400">items</span>
            </p>
            <span v-if="lowStockCount > 0" class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Icon name="lucide:alert-circle" class="w-3 h-3" />
              {{ lowStockCount }} low stock
            </span>
            <span v-else class="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Healthy
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Inventory health status</p>
        </div>
      </div>

      <!-- ═══════════ 3. MAIN SECTION: SALES CHART (2/3) + SMART ACTIONABLE COPILOT (1/3) ═══════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sales Overview Chart (Minimal Grid & Subtle Gradient) -->
        <div class="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between pb-3">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Sales Overview</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Revenue trend vs previous period</p>
            </div>
            <span class="text-xs font-mono font-medium text-slate-400">IDR</span>
          </div>
          <VChart v-if="trendOption" :option="trendOption" autoresize class="h-64" />
          <div v-else class="h-64 flex items-center justify-center text-slate-400">
            <p class="text-xs">No sales data recorded for this period.</p>
          </div>
        </div>

        <!-- Smart Actionable Business Copilot Card -->
        <div class="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 class="text-sm font-bold text-emerald-950 dark:text-emerald-300">Business Copilot</h3>
              </div>
              <Badge variant="secondary" class="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px]">
                Active AI
              </Badge>
            </div>

            <!-- Smart Data -> Insight -> Recommendation -->
            <div class="space-y-3">
              <div v-if="lowStockCount > 0" class="space-y-2">
                <p class="text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                  <strong class="text-amber-700 dark:text-amber-400 font-semibold">{{ lowStockCount }} products</strong> are running low on stock.
                </p>
                <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Recommended Action:</p>
                  <p class="text-slate-600 dark:text-slate-400">Restock Teh Celup Sariwangi & Beras Setra Ramos before weekend demand peaks.</p>
                </div>
                <NuxtLink to="/inventory" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                  View inventory recommendations →
                </NuxtLink>
              </div>

              <div v-else class="space-y-2">
                <p class="text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                  Sales are performing steadily this week with <strong class="text-emerald-700 dark:text-emerald-400 font-semibold">+12.8% growth</strong>.
                </p>
                <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Top Performer:</p>
                  <p class="text-slate-600 dark:text-slate-400">Teh Celup Sariwangi 25 is generating highest repeat orders.</p>
                </div>
                <NuxtLink to="/marketing" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                  Create automated campaign →
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-emerald-200/60 dark:border-emerald-900/40">
            <NuxtLink to="/chat" class="w-full">
              <Button class="w-full bg-[#047857] hover:bg-[#065f46] text-white rounded-lg shadow-xs text-xs font-semibold gap-2">
                <Icon name="lucide:sparkles" class="w-4 h-4" />
                <span>Ask Copilot</span>
              </Button>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- ═══════════ 4. ACTIONABLE BUSINESS INSIGHTS (Inventory, Sales, Marketing) ═══════════ -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Icon name="lucide:lightbulb" class="w-4 h-4 text-emerald-600" />
          <span>Actionable Insights</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- Inventory Insight -->
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold mb-1">
                <Icon name="lucide:package-warning" class="w-4 h-4" />
                <span>Inventory Alert</span>
              </div>
              <p class="font-semibold text-slate-900 dark:text-slate-100">Beras Setra Ramos 5kg is low</p>
              <p class="text-slate-500 dark:text-slate-400 mt-1 text-[11px]">10 items remaining in warehouse</p>
            </div>
            <NuxtLink to="/inventory">
              <Button variant="outline" size="sm" class="w-full text-xs h-8 rounded-lg border-amber-200 text-amber-800 hover:bg-amber-50">
                Restock Now
              </Button>
            </NuxtLink>
          </div>

          <!-- Sales Insight -->
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                <Icon name="lucide:trending-up" class="w-4 h-4" />
                <span>Sales Growth</span>
              </div>
              <p class="font-semibold text-slate-900 dark:text-slate-100">Weekend sales increased 18%</p>
              <p class="text-slate-500 dark:text-slate-400 mt-1 text-[11px]">Best performer: Teh Celup Sariwangi</p>
            </div>
            <NuxtLink to="/sales-report">
              <Button variant="outline" size="sm" class="w-full text-xs h-8 rounded-lg">
                View Sales Details
              </Button>
            </NuxtLink>
          </div>

          <!-- Marketing Insight -->
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1">
                <Icon name="lucide:megaphone" class="w-4 h-4" />
                <span>Marketing Opportunity</span>
              </div>
              <p class="font-semibold text-slate-900 dark:text-slate-100">Teh Celup Sariwangi top seller</p>
              <p class="text-slate-500 dark:text-slate-400 mt-1 text-[11px]">Create a weekend promo campaign</p>
            </div>
            <NuxtLink to="/marketing">
              <Button variant="outline" size="sm" class="w-full text-xs h-8 rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50">
                Create Campaign
              </Button>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- ═══════════ 5. COMPACT STOCK MANAGEMENT (Max 4 Rows, Clean Table Layout) ═══════════ -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Manajemen Stok & Produk</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ stocks.length }} produk terdaftar</p>
          </div>
          <NuxtLink to="/inventory" class="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
            Lihat Semua →
          </NuxtLink>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div v-if="stocks.length === 0" class="py-10 text-center">
            <Icon name="lucide:package-open" class="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p class="text-xs text-slate-500">Belum ada produk di inventaris.</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th class="py-3 px-4">Product</th>
                  <th class="py-3 px-4 text-right">Stock</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr v-for="item in displayStocks.slice(0, 4)" :key="item.uuid" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{{ item.product_name }}</td>
                  <td class="py-3 px-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">{{ item.stock_quantity }}</td>
                  <td class="py-3 px-4 text-center">
                    <Badge
                      :variant="item.stock_quantity === 0 ? 'destructive' : item.stock_quantity <= item.min_stock ? 'warning' : 'success'"
                      class="text-[10px] rounded-md font-medium"
                    >
                      {{ item.stock_quantity === 0 ? 'Out of Stock' : item.stock_quantity <= item.min_stock ? 'Low Stock' : 'Available' }}
                    </Badge>
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
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
  VisualMapComponent,
  DataZoomComponent,
  MarkLineComponent,
} from 'echarts/components'
import { api } from '~/utils/api'
import { useAnalytics } from '~/composables/useAnalytics'
import { useAuth } from '~/composables/useAuth'
import { useWallet } from '~/composables/useWallet'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  DataZoomComponent,
  MarkLineComponent,
])

// ── Data ──
const {
  period, data: analyticsData, loading: analyticsLoading, error: analyticsError,
  setPeriod, fetchAnalytics: fetchAnalyticsData, formatRupiah, formatCompact,
} = useAnalytics()

const { user } = useAuth()
const { wallet, fetchWallet } = useWallet()

const userUuid = computed(() => user.value?.uuid || '')

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
  { label: 'Hari Ini', value: 'today' as const },
  { label: 'Minggu Ini', value: 'week' as const },
  { label: 'Bulan Ini', value: 'month' as const },
  { label: 'Tahun Ini', value: 'year' as const },
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
  await Promise.all([fetchAnalyticsData(), fetchStocks(), fetchWallet()])
}

// ── Computed data ──
const kpiData = computed(() => analyticsData.value?.kpi)
const activeProductCount = computed(() => stocks.value.filter(s => s.is_active).length)
const lowStockCount = computed(() => stocks.value.filter(s => s.is_active && s.stock_quantity <= s.min_stock).length)

// ── ECharts: Sales Trend (Clean Emerald Area Chart) ──
const trendOption = computed(() => {
  const trend = analyticsData.value?.trend
  if (!trend || trend.length === 0) return null

  const dates = trend.map((t: any) => t.date)
  const revenues = trend.map((t: any) => t.revenue)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 8,
      padding: [8, 12],
      textStyle: { color: '#0F172A', fontSize: 12, fontFamily: 'Inter' },
      formatter: (params: any) => {
        const p = params[0]
        const val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)
        return `<b style="color:#0F172A">${p.axisValue}</b><br/><span style="color:#10B981">●</span> <span style="color:#64748B">Revenue:</span> <b>${val}</b>`
      },
    },
    grid: { left: 12, right: 16, top: 16, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748B', fontSize: 11, fontWeight: 500 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748B',
        fontSize: 11,
        fontWeight: 500,
        formatter: (v: number) => formatCompact(v),
      },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
    },
    series: [
      {
        name: 'Pendapatan',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: revenues,
        itemStyle: { color: '#10B981' },
        lineStyle: { width: 2, color: '#10B981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.01)' }
            ]
          }
        },
      },
    ],
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
    const cat = s.category || 'Tanpa Kategori'
    catMap[cat] = (catMap[cat] || 0) + s.stock_quantity
  }
  const entries = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  const total = entries.reduce((sum, e) => sum + e.value, 0)

  const top4 = entries.slice(0, 4)
  const other = entries.slice(4).reduce((s, e) => s + e.value, 0)
  const data = top4.map((e, i) => ({ value: e.value, name: e.name, itemStyle: { color: catPalette[i] } }))
  if (other > 0) data.push({ value: other, name: 'Lainnya', itemStyle: { color: '#CBD5E1' } })

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
  if (item.stock_quantity === 0) return { label: 'Stok Habis', color: '#DC2626' }
  if (item.stock_quantity <= item.min_stock) return { label: 'Stok Menipis', color: '#D97706' }
  return { label: 'Tersedia', color: '#059669' }
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
.stock-bar--high :deep(> div) {
  background: var(--chart-1);
}
.stock-bar--low :deep(> div) {
  background: var(--warning);
}
.stock-bar--empty :deep(> div) {
  background: var(--destructive);
}
</style>
