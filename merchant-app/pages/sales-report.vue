<template>
  <div class="space-y-6 animate-fade-in">
    <!-- ═══════════ HEADER + PERIOD TOGGLE ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-navy);">Analisis Penjualan</h1>
        <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">
          Performa penjualan detail dengan analisis pendapatan, profit & tren.
        </p>
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
    
    <!-- Custom Date Range Picker -->
    <div v-if="period === 'custom'" class="flex items-center gap-2 animate-fade-in-up">
      <input type="date" v-model="localStartDate" class="px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500" style="border-color: var(--wp-border); color: var(--wp-text);" />
      <span class="text-xs text-slate-500">-</span>
      <input type="date" v-model="localEndDate" class="px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500" style="border-color: var(--wp-border); color: var(--wp-text);" />
      <button @click="applyCustomDate" class="px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-all" style="background: var(--wp-gold);">Terapkan</button>
    </div>

    <!-- ═══════════ LOADING STATE ═══════════ -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center space-y-3">
        <div class="w-10 h-10 mx-auto rounded-full border-4 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
        <p class="text-sm font-medium" style="color: var(--wp-text-secondary);">Memuat data analisis…</p>
      </div>
    </div>

    <!-- ═══════════ ERROR STATE ═══════════ -->
    <div v-else-if="error" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4 max-w-sm">
        <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style="background: #FEF2F2;">
          <Icon name="heroicons:exclamation-triangle" class="w-8 h-8" style="color: #DC2626;" />
        </div>
        <h3 class="text-lg font-bold" style="color: var(--wp-text);">Gagal memuat data</h3>
        <p class="text-sm" style="color: var(--wp-text-secondary);">{{ error }}</p>
        <button @click="fetchAnalytics()" class="px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-sm transition"
          style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- ═══════════ EMPTY STATE ═══════════ -->
    <div v-else-if="!data || data.kpi.total_transactions === 0" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4 max-w-sm">
        <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style="background: rgba(212,168,67,0.08);">
          <Icon name="heroicons:chart-bar" class="w-8 h-8" style="color: var(--wp-gold);" />
        </div>
        <h3 class="text-lg font-bold" style="color: var(--wp-text);">Belum ada data penjualan</h3>
        <p class="text-sm" style="color: var(--wp-text-secondary);">
          Mulai catat transaksi untuk melihat dashboard analisis penjualan Anda.
        </p>
      </div>
    </div>

    <!-- ═══════════ DASHBOARD ═══════════ -->
    <template v-else-if="data">
      <!-- ── KPI Row ── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div v-for="card in kpiCards" :key="card.label"
          class="bg-white border rounded-2xl p-5 shadow-sm transition hover:shadow-md relative overflow-hidden group"
          style="border-color: var(--wp-border);">
          <!-- accent top bar -->
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
            <span class="font-medium ml-0.5" style="color: var(--wp-text-secondary);">vs sblm</span>
          </p>
        </div>
      </div>

      <!-- ── Row 1: Revenue Trend (2/3) + Category Donut (1/3) ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Revenue & Profit Trend -->
        <div class="xl:col-span-2 bg-white border rounded-2xl p-6 shadow-sm transition hover:shadow-md" style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between mb-1">
            <h2 class="text-base font-bold" style="color: var(--wp-text);">Tren Pendapatan & Profit</h2>
            <div class="flex items-center gap-4 text-[10px] font-bold tracking-wider" style="color: var(--wp-text-secondary);">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background: var(--wp-gold);"></span>Pendapatan
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background: var(--wp-success);"></span>Profit
              </span>
            </div>
          </div>
          <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Rincian harian dengan kontrol zoom</p>
          <VChart :option="trendOption" autoresize class="h-72" />
        </div>

        <!-- Sales by Category -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm transition hover:shadow-md" style="border-color: var(--wp-border);">
          <h2 class="text-base font-bold mb-1" style="color: var(--wp-text);">Penjualan per Kategori</h2>
          <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Distribusi pendapatan di berbagai jenis produk</p>
          <VChart :option="categoryOption" autoresize class="h-64" />
        </div>
      </div>

      <!-- ── Row 2: Payment Methods (1/3) + Top Products (2/3) ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Payment Method Distribution -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm transition hover:shadow-md" style="border-color: var(--wp-border);">
          <h2 class="text-base font-bold mb-1" style="color: var(--wp-text);">Metode Pembayaran</h2>
          <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Jumlah transaksi & total per metode</p>
          <VChart :option="paymentOption" autoresize class="h-64" />
        </div>

        <!-- Top Selling Products -->
        <div class="xl:col-span-2 bg-white border rounded-2xl p-6 shadow-sm transition hover:shadow-md" style="border-color: var(--wp-border);">
          <h2 class="text-base font-bold mb-1" style="color: var(--wp-text);">Produk Terlaris</h2>
          <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Berdasarkan kontribusi pendapatan</p>
          <VChart :option="topProductsOption" autoresize class="h-64" />
        </div>
      </div>

      <!-- ── Row 3: Recent Transactions Table ── -->
      <div class="bg-white border rounded-2xl p-6 shadow-sm transition hover:shadow-md" style="border-color: var(--wp-border);">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold" style="color: var(--wp-text);">Transaksi Terbaru</h2>
          <span class="text-[10px] font-bold px-2.5 py-1 rounded-full" style="background: rgba(5,150,105,0.1); color: var(--wp-success);">
            {{ data.recent_sales.length }} data
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[10px] font-bold uppercase tracking-widest border-b" style="color: var(--wp-text-secondary); border-color: var(--wp-border);">
                <th class="py-3 pr-4">Faktur</th>
                <th class="py-3 pr-4">Pelanggan</th>
                <th class="py-3 pr-4 text-right">Total</th>
                <th class="py-3 pr-4">Pembayaran</th>
                <th class="py-3 pr-4 text-center">Status</th>
                <th class="py-3 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody class="divide-y text-xs" style="border-color: var(--wp-border);">
              <tr v-for="sale in data.recent_sales" :key="sale.uuid" class="transition-colors hover:bg-slate-50/50">
                <td class="py-3 pr-4 font-bold font-mono text-[11px]" style="color: var(--wp-text);">{{ sale.invoice_number }}</td>
                <td class="py-3 pr-4 font-medium" style="color: var(--wp-text-secondary);">{{ sale.customer_name || '—' }}</td>
                <td class="py-3 pr-4 text-right font-bold font-mono" style="color: var(--wp-text);">{{ formatRupiah(sale.total) }}</td>
                <td class="py-3 pr-4">
                  <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold border"
                    :style="sale.payment_method === 'QRIS'
                      ? { background: 'rgba(15,26,46,0.06)', color: 'var(--wp-navy)', borderColor: 'rgba(15,26,46,0.15)' }
                      : { background: 'rgba(212,168,67,0.08)', color: 'var(--wp-gold-dark)', borderColor: 'rgba(212,168,67,0.20)' }">
                    {{ sale.payment_method || '—' }}
                  </span>
                </td>
                <td class="py-3 pr-4 text-center">
                  <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold border inline-flex items-center gap-1"
                    :style="sale.status === 'PAID'
                      ? { background: '#F0FDF4', color: '#059669', borderColor: '#DCFCE7' }
                      : { background: '#FFFBEB', color: '#D97706', borderColor: '#FDE68A' }">
                    <span class="w-1.5 h-1.5 rounded-full" :style="{ background: sale.status === 'PAID' ? '#059669' : '#D97706' }"></span>
                    {{ sale.status }}
                  </span>
                </td>
                <td class="py-3 text-right font-medium font-mono text-[10px]" style="color: var(--wp-text-secondary);">
                  {{ formatDate(sale.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
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

// Register ECharts components once (tree-shakeable)
use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, TitleComponent])

const {
  period, data, loading, error, customStartDate, customEndDate,
  fetchAnalytics, setPeriod, formatRupiah, formatCompact, formatPct,
} = useAnalytics()

const localStartDate = ref('')
const localEndDate = ref('')

const periods = [
  { label: 'Hari Ini', value: 'today' as const },
  { label: 'Minggu Ini', value: 'week' as const },
  { label: 'Bulan Ini', value: 'month' as const },
  { label: 'Tahun Ini', value: 'year' as const },
  { label: 'Kustom', value: 'custom' as const },
]

const applyCustomDate = () => {
  setPeriod('custom', localStartDate.value, localEndDate.value)
}

// ── KPI Cards ──
const kpiCards = computed(() => {
  if (!data.value) return []
  const k = data.value.kpi
  return [
    {
      label: 'Total Pendapatan',
      value: formatRupiah(k.total_revenue),
      change: k.revenue_change_pct,
      icon: 'heroicons:banknotes',
      accent: 'linear-gradient(90deg, var(--wp-gold), var(--wp-gold-light))',
    },
    {
      label: 'Laba Kotor',
      value: formatRupiah(k.total_profit),
      change: k.profit_change_pct,
      icon: 'heroicons:arrow-trending-up',
      accent: 'linear-gradient(90deg, var(--wp-success), #34D399)',
    },
    {
      label: 'Transaksi',
      value: k.total_transactions.toLocaleString('id-ID'),
      change: k.transactions_change_pct,
      icon: 'heroicons:document-text',
      accent: 'linear-gradient(90deg, var(--wp-navy), #3B5998)',
    },
    {
      label: 'Rata-rata Pesanan',
      value: formatRupiah(k.avg_order_value),
      change: k.aov_change_pct,
      icon: 'heroicons:shopping-cart',
      accent: 'linear-gradient(90deg, var(--wp-warning), #F59E0B)',
    },
  ]
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

// ── Revenue & Profit Trend ──
const trendOption = computed(() => {
  if (!data.value) return {}
  const trend = data.value.trend
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 10,
      padding: [10, 14],
      textStyle: { color: '#1E293B', fontSize: 12, fontFamily: 'var(--wp-font)' },
      axisPointer: { type: 'cross', crossStyle: { color: '#94A3B8' } },
      formatter: (params: any) => {
        const d = params[0]
        let html = `<div style="font-weight:700;margin-bottom:4px;color:#0F1A2E">${d.axisValue}</div>`
        params.forEach((p: any) => {
          const val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)
          let label = p.seriesName === 'Revenue' ? 'Pendapatan' : 'Profit'
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            <span style="color:#64748B">${label}:</span>
            <span style="font-weight:700;color:#1E293B">${val}</span>
          </div>`
        })
        return html
      },
    },
    legend: { show: false },
    grid: { left: 12, right: 24, top: 8, bottom: 36 },
    xAxis: {
      type: 'category',
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
        type: 'slider',
        start: 0,
        end: 100,
        height: 20,
        bottom: 4,
        borderColor: gridColor,
        backgroundColor: '#F8FAFC',
        fillerColor: 'rgba(212,168,67,0.15)',
        handleStyle: { color: goldHex, borderColor: goldDarkHex },
        textStyle: { color: textColor, fontSize: 9 },
      },
    ],
    series: [
      {
        name: 'Revenue',
        type: 'line',
        data: trend.map((t: any) => t.revenue),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: goldHex, width: 2.5 },
        itemStyle: { color: goldHex, borderColor: '#fff', borderWidth: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(212,168,67,0.15)' }, { offset: 1, color: 'rgba(212,168,67,0.0)' }] } },
      },
      {
        name: 'Profit',
        type: 'line',
        data: trend.map((t: any) => t.profit),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: successHex, width: 2.5 },
        itemStyle: { color: successHex, borderColor: '#fff', borderWidth: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(5,150,105,0.12)' }, { offset: 1, color: 'rgba(5,150,105,0.0)' }] } },
      },
    ],
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

// ── Top Products Horizontal Bar ──
const topProductsOption = computed(() => {
  if (!data.value) return {}
  const prods = data.value.top_products
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 10,
      padding: [10, 14],
      textStyle: { color: '#1E293B', fontSize: 12, fontFamily: 'var(--wp-font)' },
      formatter: (params: any) => {
        const idx = params[0].dataIndex
        const p = prods[idx]
        const rev = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.revenue)
        const prof = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.profit)
        return `<div style="font-weight:700;color:#0F1A2E;margin-bottom:4px">${p.product_name}</div>
          <div style="color:#64748B;font-size:10px">${p.category} · Terjual: <b>${p.quantity_sold}</b></div>
          <div style="margin-top:4px;color:#64748B">Pendapatan: <b style="color:#1E293B">${rev}</b></div>
          <div style="color:#64748B">Profit: <b style="color:#059669">${prof}</b></div>`
      },
    },
    grid: { left: 4, right: 24, top: 8, bottom: 24 },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: textColor,
        fontSize: 10,
        fontWeight: 600,
        formatter: (v: number) => formatCompact(v),
      },
      splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: prods.map((p: any) => p.product_name).reverse(),
      axisLine: { lineStyle: { color: gridColor } },
      axisTick: { show: false },
      axisLabel: {
        color: textDark,
        fontSize: 11,
        fontWeight: 600,
        width: 120,
        overflow: 'truncate',
      },
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        data: [...prods].reverse().map((p: any, i: number) => ({
          value: p.revenue,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: palette[i % palette.length] },
              { offset: 1, color: palette[i % palette.length] + '99' },
            ]),
            borderRadius: [0, 6, 6, 0],
          },
        })),
        barWidth: 16,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.12)' },
        },
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
