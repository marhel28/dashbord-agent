<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header with Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Katalog & Wawasan Produk</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Analisis makro pergerakan SKU produk ekosistem, harga rata-rata, dan kesehatan stok.</p>
      </div>
      
      <!-- Date Filter -->
      <div class="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 p-1 rounded-xl shadow-2xs">
        <button class="px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg">30 Hari</button>
        <button class="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">90 Hari</button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 custom-scrollbar">
      <NuxtLink to="/analytics" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Overview</NuxtLink>
      <NuxtLink to="/analytics/finance" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Keuangan</NuxtLink>
      <NuxtLink to="/analytics/merchants" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Pedagang</NuxtLink>
      <NuxtLink to="/analytics/ai-usage" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Penggunaan AI</NuxtLink>
      <NuxtLink to="/analytics/catalog" class="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg whitespace-nowrap shadow-xs">Katalog Produk</NuxtLink>
      <NuxtLink to="/analytics/reports" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Laporan</NuxtLink>
    </div>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4">
      <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>

    <template v-else-if="data">
      <!-- Global KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Platform SKUs" :value="(data.kpi?.totalSku || 0).toLocaleString('id-ID')" icon="lucide:package" accent="#3B82F6" />
        <KpiCard title="Produk Aktif" :value="(data.kpi?.activeSku || 0).toLocaleString('id-ID')" icon="lucide:check-circle" accent="#10B981" />
        <KpiCard title="Stockout Rate" :value="`${(data.kpi?.stockoutRate || 0).toFixed(1)}%`" icon="lucide:archive-x" accent="#EF4444" />
        <KpiCard title="Avg Indeks Harga" :value="formatRupiah(data.kpi?.avgPrice || 0)" icon="lucide:tag" accent="#8B5CF6" />
      </div>

      <!-- Main Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Catalog Growth Trend -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
          <h2 class="text-sm font-bold mb-4 text-slate-900 dark:text-slate-100">Tren Penambahan Produk Baru</h2>
          <VChart v-if="growthOption" :option="growthOption" autoresize class="h-80 w-full" />
        </div>
        
        <!-- Category Saturation -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
          <h2 class="text-sm font-bold mb-4 text-slate-900 dark:text-slate-100">Saturasi Kategori</h2>
          <VChart v-if="saturationOption" :option="saturationOption" autoresize class="h-80 w-full" />
        </div>
      </div>

      <!-- Category Performance Table -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col" v-if="data.tables?.categoryPerformance">
        <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50">
          <h2 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Matriks Performa Kategori</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700/60">
              <tr>
                <th class="px-5 py-3.5">Nama Kategori</th>
                <th class="px-5 py-3.5 text-right">Total SKU</th>
                <th class="px-5 py-3.5 text-right">Harga Rata-rata</th>
                <th class="px-5 py-3.5 text-right">Unit Terjual</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
              <tr v-if="!data.tables.categoryPerformance.length">
                <td colspan="4" class="px-5 py-8 text-center text-slate-400 font-sans">Belum ada data kategori</td>
              </tr>
              <tr v-for="(cat, i) in data.tables.categoryPerformance" :key="i" class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                <td class="px-5 py-4 font-sans font-semibold text-slate-900 dark:text-slate-100 truncate">{{ cat.category }}</td>
                <td class="px-5 py-4 text-right">{{ cat.totalSku.toLocaleString('id-ID') }}</td>
                <td class="px-5 py-4 text-right">{{ formatRupiah(cat.avgPrice) }}</td>
                <td class="px-5 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{{ cat.qtySold.toLocaleString('id-ID') }} pcs</td>
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
    const res = await api.get('/admin/analytics/catalog-deep')
    if (res) {
      data.value = res
    }
  } catch (err) {
    console.error("Failed to fetch catalog analytics", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const growthOption = computed(() => {
  if (!data.value?.charts?.growthTrend) return null
  return {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: isDark.value ? '#1E293B' : 'rgba(255,255,255,0.95)',
      textStyle: { color: isDark.value ? '#F8FAFC' : '#0F172A', fontSize: 12 },
      borderColor: isDark.value ? '#334155' : '#E2E8F0',
      borderWidth: 1
    },
    grid: { left: 40, right: 20, top: 20, bottom: 20 },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      data: data.value.charts.growthTrend.dates,
      axisLabel: { color: isDark.value ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: { 
      type: 'value',
      axisLabel: { color: isDark.value ? '#94A3B8' : '#64748B', fontSize: 11 },
      splitLine: { lineStyle: { color: isDark.value ? '#334155' : '#F1F5F9' } }
    },
    series: [
      {
        name: 'New Products',
        type: 'line',
        smooth: true,
        data: data.value.charts.growthTrend.values,
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

const saturationOption = computed(() => {
  if (!data.value?.charts?.saturation) return null
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
        data: data.value.charts.saturation
      }
    ]
  }
})
</script>
