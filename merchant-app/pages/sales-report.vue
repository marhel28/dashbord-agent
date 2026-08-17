<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. PAGE HEADER + PERIOD SELECTOR ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Analisis Penjualan</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pantau pendapatan, laba, tren penjualan, dan produk terlaris bisnis Anda.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Last Updated / Sync indicator -->
        <span class="text-[11px] font-medium text-slate-400 hidden lg:inline-flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sync 5 mnt lalu
        </span>

        <!-- Period Toggle Buttons -->
        <div class="inline-flex p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            v-for="p in periods" :key="p.value"
            @click="setPeriod(p.value)"
            :class="['px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              period === p.value ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900']"
          >{{ p.label }}</button>
        </div>
      </div>
    </div>

    <!-- Custom Date Range Picker -->
    <div v-if="period === 'custom'" class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 animate-fade-in text-xs">
      <span class="font-medium text-slate-600 dark:text-slate-400">Rentang Tanggal:</span>
      <input type="date" v-model="localStartDate" class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
      <span class="text-slate-400">-</span>
      <input type="date" v-model="localEndDate" class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
      <Button size="sm" @click="applyCustomDate" class="bg-[#047857] text-white text-xs h-8 rounded-lg font-semibold">Terapkan</Button>
    </div>

    <!-- ═══════════ 2. SKELETON LOADING STATE ═══════════ -->
    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
      </div>
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Skeleton class="xl:col-span-2 h-80 rounded-xl" />
        <Skeleton class="h-80 rounded-xl" />
      </div>
    </div>

    <!-- ═══════════ 3. ERROR STATE ═══════════ -->
    <div v-else-if="error" class="flex items-center justify-center py-16">
      <div class="text-center space-y-4 max-w-sm border border-red-200 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-xs">
        <div class="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-red-50 text-red-600">
          <Icon name="lucide:alert-triangle" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Gagal Memuat Data Penjualan</h3>
          <p class="text-xs text-slate-500 mt-1">{{ error }}</p>
        </div>
        <Button variant="default" size="sm" @click="fetchAnalytics()" class="rounded-lg text-xs">Coba Lagi</Button>
      </div>
    </div>

    <!-- ═══════════ 4. EMPTY STATE ═══════════ -->
    <div v-else-if="!data || data.kpi.total_transactions === 0" class="flex items-center justify-center py-16">
      <div class="text-center space-y-4 max-w-md border border-slate-200 dark:border-slate-800 p-8 bg-white dark:bg-slate-900 rounded-xl shadow-xs">
        <div class="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <Icon name="lucide:bar-chart-2" class="w-8 h-8" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Belum Ada Transaksi Penjualan</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Mulai catat transaksi kasir atau penjualan produk untuk melihat statistik bisnis secara real-time.
          </p>
        </div>
        <NuxtLink to="/pos">
          <Button size="sm" class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold">
            + Catat Transaksi Baru
          </Button>
        </NuxtLink>
      </div>
    </div>

    <!-- ═══════════ 5. PRODUCTION SALES DASHBOARD ═══════════ -->
    <template v-else-if="data">
      <!-- ── PERFORMANCE SUMMARY (CLICKABLE KPI SHORTCUTS + GROSS MARGIN) ── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Pendapatan (Total Revenue) -->
        <button
          @click="trendMetric = 'revenue'"
          class="p-4 rounded-xl text-left transition-all border shadow-xs bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          :class="trendMetric === 'revenue' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Pendapatan</span>
            <Icon name="lucide:banknotes" class="w-4 h-4 text-emerald-600" />
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">{{ formatRupiah(data.kpi.total_revenue) }}</p>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span :class="data.kpi.revenue_change_pct >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'">
              {{ data.kpi.revenue_change_pct >= 0 ? '+' : '' }}{{ data.kpi.revenue_change_pct }}%
            </span>
            <span class="text-slate-400">{{ periodComparisonLabel }}</span>
          </div>
        </button>

        <!-- Laba Kotor + Gross Margin -->
        <button
          @click="trendMetric = 'profit'"
          class="p-4 rounded-xl text-left transition-all border shadow-xs bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          :class="trendMetric === 'profit' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Laba Kotor</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Margin {{ grossMarginPct }}%</span>
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-1.5">{{ formatRupiah(data.kpi.total_profit) }}</p>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span :class="data.kpi.profit_change_pct >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'">
              {{ data.kpi.profit_change_pct >= 0 ? '+' : '' }}{{ data.kpi.profit_change_pct }}%
            </span>
            <span class="text-slate-400">{{ periodComparisonLabel }}</span>
          </div>
        </button>

        <!-- Transaksi (Orders) Shortcut -->
        <button
          @click="scrollToTransactions()"
          class="p-4 rounded-xl text-left transition-all border shadow-xs bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 border-slate-200 dark:border-slate-800"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Transaksi</span>
            <Icon name="lucide:receipt" class="w-4 h-4 text-blue-600" />
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">{{ data.kpi.total_transactions.toLocaleString('id-ID') }}</p>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span :class="data.kpi.transactions_change_pct >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'">
              {{ data.kpi.transactions_change_pct >= 0 ? '+' : '' }}{{ data.kpi.transactions_change_pct }}%
            </span>
            <span class="text-slate-400">{{ periodComparisonLabel }}</span>
          </div>
        </button>

        <!-- Rata-rata Nilai Transaksi (AOV) -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Rata-rata Transaksi (AOV)</span>
            <Icon name="lucide:shopping-bag" class="w-4 h-4 text-amber-600" />
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">{{ formatRupiah(data.kpi.avg_order_value) }}</p>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span :class="data.kpi.aov_change_pct >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'">
              {{ data.kpi.aov_change_pct >= 0 ? '+' : '' }}{{ data.kpi.aov_change_pct }}%
            </span>
            <span class="text-slate-400">{{ periodComparisonLabel }}</span>
          </div>
        </div>
      </div>

      <!-- ── 6. BUSINESS COPILOT DECISION LAYER (ACTIONABLE INSIGHTS) ── -->
      <div class="p-5 bg-gradient-to-r from-[#003B32] to-[#047857] text-white rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold tracking-wider">Business Copilot Insight</span>
            <span class="text-xs text-emerald-200">Performa Minggu Ini</span>
          </div>
          <h3 class="text-base font-bold text-white">
            {{ copilotSummaryTitle }}
          </h3>
          <p class="text-xs text-slate-200 leading-relaxed max-w-2xl">
            {{ copilotSummaryDescription }}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink to="/ai-chat">
            <Button size="sm" class="bg-white text-[#003B32] hover:bg-slate-100 font-bold text-xs gap-1.5 rounded-lg">
              <Icon name="lucide:sparkles" class="w-4 h-4 text-emerald-600" />
              <span>Tanya Copilot</span>
            </Button>
          </NuxtLink>
        </div>
      </div>

      <!-- ── 7. PERFORMANCE TREND CHART (WITH METRIC TOGGLES) ── -->
      <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Tren Performa Penjualan</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pantau fluktuasi pendapatan, laba kotor, dan margin harian.</p>
          </div>
          <!-- Toggle Chart View -->
          <div class="inline-flex p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
            <button
              @click="trendMetric = 'all'"
              :class="['px-3 py-1 rounded-md transition-colors', trendMetric === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-xs' : 'text-slate-500']"
            >Semua</button>
            <button
              @click="trendMetric = 'revenue'"
              :class="['px-3 py-1 rounded-md transition-colors', trendMetric === 'revenue' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-xs' : 'text-slate-500']"
            >Pendapatan</button>
            <button
              @click="trendMetric = 'profit'"
              :class="['px-3 py-1 rounded-md transition-colors', trendMetric === 'profit' ? 'bg-white dark:bg-slate-900 text-[#047857] font-bold shadow-xs' : 'text-slate-500']"
            >Laba Kotor</button>
          </div>
        </div>

        <VChart :option="trendOption" autoresize class="h-72 w-full" />
      </div>

      <!-- ── 8. BUSINESS BREAKDOWN: CATEGORIES & TOP PRODUCTS ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Horizontal Bar Category Ranking -->
        <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Penjualan per Kategori</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kontribusi omzet berdasarkan kelompok produk.</p>
          </div>

          <div class="space-y-3 pt-2">
            <div v-for="(cat, idx) in data.by_category" :key="cat.category" class="space-y-1 text-xs">
              <div class="flex justify-between font-semibold">
                <span class="text-slate-800 dark:text-slate-200">{{ idx + 1 }}. {{ cat.category }}</span>
                <span class="font-mono text-slate-900 dark:text-slate-100">{{ formatRupiah(cat.revenue) }} ({{ cat.percentage }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div class="h-full bg-[#047857] rounded-full" :style="{ width: `${cat.percentage}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products List (with Metric Toggles) -->
        <div class="xl:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Produk Teratas (Top Products)</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Produk berkinerja terbaik di periode terpilih.</p>
            </div>
            <!-- Metric Toggle -->
            <div class="inline-flex p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
              <button
                @click="productMetric = 'revenue'"
                :class="['px-2.5 py-1 rounded-md transition-colors', productMetric === 'revenue' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-xs' : 'text-slate-500']"
              >Pendapatan</button>
              <button
                @click="productMetric = 'quantity'"
                :class="['px-2.5 py-1 rounded-md transition-colors', productMetric === 'quantity' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-xs' : 'text-slate-500']"
              >Unit Terjual</button>
              <button
                @click="productMetric = 'profit'"
                :class="['px-2.5 py-1 rounded-md transition-colors', productMetric === 'profit' ? 'bg-white dark:bg-slate-900 text-[#047857] font-bold shadow-xs' : 'text-slate-500']"
              >Laba</button>
            </div>
          </div>

          <VChart :option="topProductsOption" autoresize class="h-64 w-full" />
        </div>
      </div>

      <!-- ── 9. PAYMENT MIX & METHODS ── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Metode Pembayaran</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Preferensi pembayaran dari pelanggan toko Anda.</p>

          <div class="space-y-3 pt-2 text-xs">
            <div v-for="pmt in data.by_payment" :key="pmt.method" class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span class="font-bold text-slate-900 dark:text-slate-100">{{ pmt.method }}</span>
                <span class="block text-[10px] text-slate-400">{{ pmt.count }} transaksi</span>
              </div>
              <span class="font-mono font-bold text-slate-900 dark:text-slate-100">{{ formatRupiah(pmt.total) }}</span>
            </div>
          </div>
        </div>

        <div class="md:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Distribusi Omzet Pembayaran</h2>
          <VChart :option="paymentOption" autoresize class="h-56 w-full" />
        </div>
      </div>

      <!-- ── 10. RECENT TRANSACTIONS TABLE WITH FILTERS ── -->
      <div id="transactions-section" class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Transaksi Terbaru</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar transaksi penjualan terdaftar di sistem.</p>
          </div>
          <!-- Filter input & Status dropdown -->
          <div class="flex items-center gap-2 text-xs">
            <Input v-model="txSearch" type="text" placeholder="Cari faktur / pelanggan…" class="h-8 w-44 text-xs rounded-lg" />
            <select v-model="txStatusFilter" class="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs">
              <option value="all">Semua Status</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        <!-- Table View -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-3">Faktur</th>
                <th class="py-3 px-3">Pelanggan</th>
                <th class="py-3 px-3 text-right">Total</th>
                <th class="py-3 px-3">Metode</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-3 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="sale in filteredTransactions" :key="sale.uuid" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{{ sale.invoice_number }}</td>
                <td class="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">{{ sale.customer_name || 'Guest' }}</td>
                <td class="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{{ formatRupiah(sale.total) }}</td>
                <td class="py-3 px-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {{ sale.payment_method || 'Cash' }}
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <Badge
                    :variant="sale.status === 'PAID' ? 'success' : sale.status === 'PENDING' ? 'warning' : 'destructive'"
                    class="text-[10px] rounded-md font-medium"
                  >
                    {{ sale.status }}
                  </Badge>
                </td>
                <td class="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">{{ formatDate(sale.created_at) }}</td>
              </tr>
            </tbody>
          </table>
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
  DataZoomComponent,
  TitleComponent,
} from 'echarts/components'
import * as echarts from 'echarts'
import { useAnalytics } from '~/composables/useAnalytics'
import Button from '~/components/ui/button.vue'
import Input from '~/components/ui/input.vue'
import Badge from '~/components/ui/badge.vue'
import Skeleton from '~/components/ui/skeleton.vue'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  TitleComponent,
])

const {
  period, data, loading, error,
  fetchAnalytics, setPeriod, formatRupiah, formatCompact,
} = useAnalytics()

const localStartDate = ref('')
const localEndDate = ref('')
const trendMetric = ref<'all' | 'revenue' | 'profit'>('all')
const productMetric = ref<'revenue' | 'quantity' | 'profit'>('revenue')

// Transaction table filters
const txSearch = ref('')
const txStatusFilter = ref('all')

const periods = [
  { label: 'Hari Ini', value: 'today' as const },
  { label: 'Minggu Ini', value: 'week' as const },
  { label: 'Bulan Ini', value: 'month' as const },
  { label: '3 Bulan', value: 'year' as const },
  { label: 'Kustom', value: 'custom' as const },
]

const applyCustomDate = () => {
  setPeriod('custom', localStartDate.value, localEndDate.value)
}

// Comparison text helper
const periodComparisonLabel = computed(() => {
  if (period.value === 'today') return 'vs kemarin'
  if (period.value === 'week') return 'vs minggu lalu'
  if (period.value === 'month') return 'vs bulan lalu'
  if (period.value === 'year') return 'vs periode lalu'
  return 'vs sblm'
})

// Gross Margin Percentage Calculation
const grossMarginPct = computed(() => {
  if (!data.value || !data.value.kpi.total_revenue) return '0.0'
  const margin = (data.value.kpi.total_profit / data.value.kpi.total_revenue) * 100
  return margin.toFixed(1)
})

// Business Copilot Insight Generation
const copilotSummaryTitle = computed(() => {
  if (!data.value) return 'Memuat Analisis Business Copilot...'
  const revPct = data.value.kpi.revenue_change_pct
  const margin = Number(grossMarginPct.value)
  if (revPct >= 10 && margin >= 20) return `Penjualan Sangat Sehat! Omzet Naik ${revPct}% & Margin ${margin}%`
  if (revPct >= 0) return `Omzet Tumbuh Stabil (+${revPct}%), Pertahankan Efisiensi Stok`
  return `Omzet Turun ${Math.abs(revPct)}%, Tinjau Ulang Kategori & Promo Produk`
})

const copilotSummaryDescription = computed(() => {
  if (!data.value || !data.value.top_products.length) return 'Data transaksi belum mencukupi.'
  const topProd = data.value.top_products[0]
  const topCat = data.value.by_category[0]?.category || 'Utama'
  return `Produk "${topProd.product_name}" menyumbang kontribusi omzet terbesar (${formatRupiah(topProd.revenue)}) di kategori ${topCat}. Tingkatkan promosi bundling di kategori ini untuk mengoptimalkan Laba Kotor.`
})

const scrollToTransactions = () => {
  const el = document.getElementById('transactions-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// Filtered Transactions
const filteredTransactions = computed(() => {
  if (!data.value) return []
  let list = data.value.recent_sales || []

  if (txStatusFilter.value !== 'all') {
    list = list.filter((s: any) => s.status === txStatusFilter.value)
  }

  if (txSearch.value.trim()) {
    const q = txSearch.value.toLowerCase()
    list = list.filter((s: any) =>
      s.invoice_number.toLowerCase().includes(q) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(q))
    )
  }

  return list
})

// ── Shared chart text palette ──
const textColor = '#64748B'
const textDark = '#1E293B'
const gridColor = '#E2E8F0'
const goldHex = '#D4A843'
const goldDarkHex = '#B8922E'
const successHex = '#059669'
const navyHex = '#0F1A2E'
const warningHex = '#D97706'

// ── Revenue & Profit Trend (Dynamic Metric Toggle) ──
const trendOption = computed(() => {
  if (!data.value) return {}
  const trend = data.value.trend
  const revenues = trend.map((t: any) => t.revenue)
  const profits = trend.map((t: any) => t.profit)

  const series: any[] = []

  if (trendMetric.value === 'all' || trendMetric.value === 'revenue') {
    series.push({
      name: 'Revenue',
      type: 'line',
      data: revenues,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#047857', width: 2.5 },
      itemStyle: { color: '#047857', borderColor: '#fff', borderWidth: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(4,120,87,0.2)' }, { offset: 1, color: 'rgba(4,120,87,0.0)' }] } },
    })
  }

  if (trendMetric.value === 'all' || trendMetric.value === 'profit') {
    series.push({
      name: 'Profit',
      type: 'line',
      data: profits,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#D97706', width: 2.5 },
      itemStyle: { color: '#D97706', borderColor: '#fff', borderWidth: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(217,119,6,0.15)' }, { offset: 1, color: 'rgba(217,119,6,0.0)' }] } },
    })
  }

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 10,
      padding: [10, 14],
      textStyle: { color: '#1E293B', fontSize: 12 },
      formatter: (params: any) => {
        const d = params[0]
        let html = `<div style="font-weight:700;margin-bottom:4px;color:#0F1A2E">${d.axisValue}</div>`
        params.forEach((p: any) => {
          const val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)
          let label = p.seriesName === 'Revenue' ? 'Pendapatan' : 'Laba Kotor'
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            <span style="color:#64748B">${label}:</span>
            <span style="font-weight:700;color:#1E293B">${val}</span>
          </div>`
        })
        return html
      },
    },
    grid: { left: 12, right: 24, top: 16, bottom: 45, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.map((t: any) => t.date),
      axisLine: { lineStyle: { color: gridColor } },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 10, fontWeight: 600 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: textColor,
        fontSize: 10,
        fontWeight: 600,
        formatter: (v: number) => formatCompact(v),
      },
      splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 18,
        bottom: 4,
        borderColor: gridColor,
        backgroundColor: '#F8FAFC',
        fillerColor: 'rgba(4,120,87,0.15)',
        textStyle: { color: textColor, fontSize: 9 },
      },
    ],
    series,
  }
})

// ── Category Donut ──
const categoryOption = computed(() => {
  if (!data.value) return {}
  const cats = data.value.by_category
  const palette = ['#D4A843', '#0F1A2E', '#059669', '#D97706', '#64748B', '#3B82F6', '#8B5CF6', '#EC4899']
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 10,
      padding: [8, 12],
      textStyle: { color: '#1E293B', fontSize: 12, fontFamily: 'var(--wp-font)' },
      formatter: (p: any) => {
        const val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)
        return `<div style="font-weight:700;color:#0F1A2E">${p.name}</div>
          <div style="margin-top:2px"><span style="color:#64748B">Pendapatan:</span> <b>${val}</b></div>
          <div style="color:#64748B">Porsi: <b>${p.percent}%</b></div>`
      },
    },
    legend: {
      orient: 'vertical',
      left: 0,
      top: 'center',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 10,
      textStyle: { color: textDark, fontSize: 11, fontWeight: 600, fontFamily: 'var(--wp-font)' },
      formatter: (name: string) => {
        const item = cats.find((c: any) => c.category === name)
        return item ? `${name} (${item.percentage}%)` : name
      },
    },
    series: [
      {
        name: 'Kategori',
        type: 'pie',
        radius: ['55%', '82%'],
        center: ['62%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 12, fontWeight: 'bold' },
          scaleSize: 6,
        },
        data: cats.map((c: any, i: number) => ({
          value: c.revenue,
          name: c.category,
          itemStyle: { color: palette[i % palette.length] },
        })),
      },
    ],
  }
})

// ── Payment Method Bar ──
const paymentOption = computed(() => {
  if (!data.value) return {}
  const pmts = data.value.by_payment
  const methodColors: Record<string, string> = { QRIS: navyHex, Cash: goldHex, Transfer: '#3B82F6', Unknown: '#94A3B8' }
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 10,
      padding: [8, 12],
      textStyle: { color: '#1E293B', fontSize: 12, fontFamily: 'var(--wp-font)' },
      formatter: (params: any) => {
        const p = params[0]
        const val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)
        return `<div style="font-weight:700;color:#0F1A2E">${p.name}</div>
          <div style="margin-top:2px;color:#64748B">Total: <b style="color:#1E293B">${val}</b></div>
          <div style="color:#64748B">Transaksi: <b style="color:#1E293B">${pmts[p.dataIndex]?.count || 0}</b></div>`
      },
    },
    grid: { left: 12, right: 24, top: 8, bottom: 24 },
    xAxis: {
      type: 'category',
      data: pmts.map((p: any) => p.method),
      axisLine: { lineStyle: { color: gridColor } },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 10, fontWeight: 600 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: textColor,
        fontSize: 10,
        fontWeight: 600,
        formatter: (v: number) => formatCompact(v),
      },
      splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: pmts.map((p: any, i: number) => ({
          value: p.total,
          itemStyle: {
            color: methodColors[p.method] || palette[i % palette.length],
            borderRadius: [6, 6, 0, 0],
          },
        })),
        barWidth: 40,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.12)' },
        },
      },
    ],
  }
})

const palette = ['#D4A843', '#0F1A2E', '#059669', '#D97706', '#64748B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E']

// ── Top Products Horizontal Bar (Dynamic Metric Toggle) ──
const topProductsOption = computed(() => {
  if (!data.value) return {}
  const prods = data.value.top_products || []

  // Sort prods according to active metric
  const sortedProds = [...prods].sort((a: any, b: any) => {
    if (productMetric.value === 'quantity') return b.quantity_sold - a.quantity_sold
    if (productMetric.value === 'profit') return b.profit - a.profit
    return b.revenue - a.revenue
  })

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 10,
      padding: [10, 14],
      textStyle: { color: '#1E293B', fontSize: 12 },
      formatter: (params: any) => {
        const idx = params[0].dataIndex
        const p = sortedProds[idx]
        if (!p) return ''
        const rev = formatRupiah(p.revenue)
        const prof = formatRupiah(p.profit)
        return `<div style="font-weight:700;color:#0F1A2E;margin-bottom:4px">${p.product_name}</div>
          <div style="color:#64748B;font-size:10px">${p.category || 'Umum'} · Unit Terjual: <b>${p.quantity_sold}</b></div>
          <div style="margin-top:4px;color:#64748B">Pendapatan: <b style="color:#1E293B">${rev}</b></div>
          <div style="color:#64748B">Laba Kotor: <b style="color:#047857">${prof}</b></div>`
      },
    },
    grid: { left: 12, right: 24, top: 12, bottom: 24, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: textColor,
        fontSize: 10,
        fontWeight: 600,
        formatter: (v: number) => productMetric.value === 'quantity' ? v.toString() : formatCompact(v),
      },
      splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: sortedProds.map((p: any) => p.product_name),
      axisLine: { lineStyle: { color: gridColor } },
      axisTick: { show: false },
      axisLabel: {
        color: textDark,
        fontSize: 11,
        fontWeight: 600,
        width: 140,
        overflow: 'truncate',
      },
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        data: sortedProds.map((p: any) => {
          const val = productMetric.value === 'quantity' ? p.quantity_sold : (productMetric.value === 'profit' ? p.profit : p.revenue)
          return {
            value: val,
            itemStyle: {
              color: productMetric.value === 'profit' ? '#047857' : (productMetric.value === 'quantity' ? '#2563EB' : '#D97706'),
              borderRadius: [0, 6, 6, 0],
            },
          }
        }),
        barWidth: 16,
      },
    ],
  }
})

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchAnalytics()
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
