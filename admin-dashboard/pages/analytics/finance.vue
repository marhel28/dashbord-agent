<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header with Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Analitik Keuangan</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Laporan terperinci omzet, margin platform, dan persebaran metode pembayaran.</p>
      </div>
      
      <!-- Date Filter & Export -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 p-1 rounded-xl shadow-2xs">
          <button class="px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg">30 Hari</button>
          <button class="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">90 Hari</button>
        </div>
        <Button class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg h-9 gap-1.5 shadow-xs">
          <Icon name="lucide:download" class="w-3.5 h-3.5" />
          <span>Ekspor CSV</span>
        </Button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 custom-scrollbar">
      <NuxtLink to="/analytics" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Overview</NuxtLink>
      <NuxtLink to="/analytics/finance" class="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg whitespace-nowrap shadow-xs">Keuangan</NuxtLink>
      <NuxtLink to="/analytics/merchants" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Pedagang</NuxtLink>
      <NuxtLink to="/analytics/ai-usage" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Penggunaan AI</NuxtLink>
      <NuxtLink to="/analytics/catalog" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Katalog Produk</NuxtLink>
      <NuxtLink to="/analytics/reports" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Laporan</NuxtLink>
    </div>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-5 gap-4 py-4">
      <Skeleton v-for="i in 5" :key="i" class="h-28 rounded-xl" />
    </div>

    <template v-else-if="data">
      <!-- Global KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Gross Revenue" :value="formatRupiah(data.kpi?.grossRevenue || 0)" icon="lucide:banknote" accent="#10B981" />
        <KpiCard title="Net Revenue (Est.)" :value="formatRupiah(data.kpi?.netRevenue || 0)" icon="lucide:wallet" accent="#3B82F6" />
        <KpiCard title="Platform Margin" :value="formatRupiah(data.kpi?.margin || 0)" icon="lucide:scale" accent="#F59E0B" />
        <KpiCard title="Avg Order Value" :value="formatRupiah(data.kpi?.aov || 0)" icon="lucide:shopping-bag" accent="#8B5CF6" />
        <KpiCard title="Refund Rate" :value="`${data.kpi?.refundRate || 0}%`" icon="lucide:undo-2" accent="#EF4444" />
      </div>

      <!-- Main Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sales Trend Line Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
          <h2 class="text-sm font-bold mb-4 text-slate-900 dark:text-slate-100">Tren Penjualan Harian (Gross)</h2>
          <VChart v-if="salesOption" :option="salesOption" autoresize class="h-80 w-full" />
        </div>
        
        <!-- Payment Method Pie Chart -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
          <h2 class="text-sm font-bold mb-4 text-slate-900 dark:text-slate-100">Metode Pembayaran</h2>
          <VChart v-if="paymentOption" :option="paymentOption" autoresize class="h-80 w-full" />
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
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { api } from '~/utils/api'

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const loading = ref(true)
const data = ref<any>(null)

const formatRupiah = (value: number) => {
  if (!value) return 'Rp 0'
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`
  return `Rp ${value.toLocaleString('id-ID')}`
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/analytics/finance')
    if (res) {
      data.value = res
    }
  } catch (err) {
    console.error("Failed to fetch finance analytics", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const salesOption = computed(() => {
  if (!data.value?.charts?.salesTrend) return null
  return {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: isDark.value ? '#1E293B' : 'rgba(255,255,255,0.95)',
      textStyle: { color: isDark.value ? '#F8FAFC' : '#0F172A', fontSize: 12 },
      borderColor: isDark.value ? '#334155' : '#E2E8F0',
      borderWidth: 1
    },
    grid: { left: 60, right: 20, top: 20, bottom: 20 },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      data: data.value.charts.salesTrend.dates,
      axisLabel: { color: isDark.value ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: { 
      type: 'value',
      axisLabel: { 
        color: isDark.value ? '#94A3B8' : '#64748B',
        fontSize: 11,
        formatter: (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(0)}Jt` : v 
      },
      splitLine: { lineStyle: { color: isDark.value ? '#334155' : '#F1F5F9' } }
    },
    series: [
      {
        name: 'Sales',
        type: 'line',
        smooth: true,
        data: data.value.charts.salesTrend.values,
        itemStyle: { color: '#10B981' },
        lineStyle: { width: 3, shadowColor: 'rgba(16,185,129,0.4)', shadowBlur: 10 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#10B98144' }, { offset: 1, color: '#10B98100' }]
          }
        }
      }
    ]
  }
})

const paymentOption = computed(() => {
  if (!data.value?.charts?.paymentMethods) return null
  return {
    tooltip: { 
      trigger: 'item',
      backgroundColor: isDark.value ? '#1E293B' : 'rgba(255,255,255,0.95)',
      textStyle: { color: isDark.value ? '#F8FAFC' : '#0F172A', fontSize: 12 },
      borderColor: isDark.value ? '#334155' : '#E2E8F0',
      borderWidth: 1
    },
    legend: { 
      bottom: 0, 
      type: 'scroll',
      textStyle: { color: isDark.value ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: isDark.value ? '#1E293B' : '#fff', borderWidth: 2 },
        label: { show: false },
        color: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
        data: data.value.charts.paymentMethods
      }
    ]
  }
})
</script>
