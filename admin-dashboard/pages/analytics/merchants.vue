<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header with Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Performa Pedagang</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau laju akuisisi, retensi merchant, dan peringkat pedagang terbaik.</p>
      </div>
      
      <!-- Date Filter & Map Link -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 p-1 rounded-xl shadow-2xs">
          <button class="px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg">30 Hari</button>
          <button class="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">90 Hari</button>
        </div>
        <NuxtLink to="/merchants/map">
          <Button class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg h-9 gap-1.5 shadow-xs">
            <Icon name="lucide:map-pin" class="w-3.5 h-3.5" />
            <span>Buka Peta Live</span>
          </Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 custom-scrollbar">
      <NuxtLink to="/analytics" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Overview</NuxtLink>
      <NuxtLink to="/analytics/finance" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Keuangan</NuxtLink>
      <NuxtLink to="/analytics/merchants" class="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg whitespace-nowrap shadow-xs">Pedagang</NuxtLink>
      <NuxtLink to="/analytics/ai-usage" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Penggunaan AI</NuxtLink>
      <NuxtLink to="/analytics/catalog" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Katalog Produk</NuxtLink>
      <NuxtLink to="/analytics/reports" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Laporan</NuxtLink>
    </div>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4">
      <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>

    <template v-else-if="data">
      <!-- Global KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Pedagang" :value="(data.kpi?.totalMerchants || 0).toLocaleString('id-ID')" icon="lucide:store" accent="#10B981" />
        <KpiCard title="Pedagang Baru (30h)" :value="`+${(data.kpi?.newMerchants || 0).toLocaleString('id-ID')}`" icon="lucide:user-plus" accent="#3B82F6" />
        <KpiCard title="Rasio Keaktifan" :value="`${data.kpi?.activeRatio || 0}%`" icon="lucide:activity" accent="#8B5CF6" />
        <KpiCard title="Churn Rate" :value="`${data.kpi?.churnRate || 0}%`" icon="lucide:alert-triangle" accent="#EF4444" />
      </div>

      <!-- Main Row -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- New Merchant Acquisition Trend -->
        <div class="xl:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
          <h2 class="text-sm font-bold mb-4 text-slate-900 dark:text-slate-100">Tren Akuisisi Pedagang Baru</h2>
          <VChart v-if="acqOption" :option="acqOption" autoresize class="h-80 w-full" />
        </div>

        <!-- Geographic Performance Callout -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div class="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
            <Icon name="lucide:map-pin" class="w-7 h-7" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-slate-100">Sebaran Wilayah & Klaster</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Jelajahi peta interaktif untuk melihat konsentrasi pasar dan titik merchant aktif.</p>
          </div>
          <NuxtLink to="/merchants/map">
            <Button class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs">
              Buka Peta Sebaran Lengkap &rarr;
            </Button>
          </NuxtLink>
        </div>
      </div>

      <!-- Leaderboard Table -->
      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col" v-if="data.tables?.leaderboard">
        <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
          <h2 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Peringkat Pedagang Terbaik (Leaderboard)</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700/60 tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Peringkat</th>
                <th class="px-5 py-3.5">Nama Toko</th>
                <th class="px-5 py-3.5 text-center">Status</th>
                <th class="px-5 py-3.5 text-right">Total Pesanan</th>
                <th class="px-5 py-3.5 text-right">Pendapatan</th>
                <th class="px-5 py-3.5 text-right">Pertumbuhan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
              <tr v-if="!data.tables.leaderboard.length">
                <td colspan="6" class="px-5 py-8 text-center text-slate-400">Belum ada data pedagang</td>
              </tr>
              <tr v-for="(m, i) in data.tables.leaderboard" :key="m.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
                <td class="px-5 py-4 font-mono font-bold" :class="i === 0 ? 'text-amber-500 font-extrabold' : i === 1 ? 'text-slate-400 font-bold' : i === 2 ? 'text-amber-700' : 'text-slate-500'">#{{ i + 1 }}</td>
                <td class="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{{ m.store_name }}</td>
                <td class="px-5 py-4 text-center">
                  <Badge variant="outline" class="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
                    {{ m.verified ? 'TERVERIFIKASI' : 'MENUNGGU' }}
                  </Badge>
                </td>
                <td class="px-5 py-4 text-right font-mono">{{ m.orders.toLocaleString('id-ID') }}</td>
                <td class="px-5 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ formatRupiah(m.revenue) }}</td>
                <td class="px-5 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">+{{ m.growth }}%</td>
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
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { api } from '~/utils/api'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

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
    const res = await api.get('/admin/analytics/merchants-deep')
    if (res) {
      data.value = res
    }
  } catch (err) {
    console.error("Failed to fetch merchants analytics", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const acqOption = computed(() => {
  if (!data.value?.charts?.acquisitionTrend) return null
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
      data: data.value.charts.acquisitionTrend.dates,
      axisLabel: { color: isDark.value ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: { 
      type: 'value',
      axisLabel: { color: isDark.value ? '#94A3B8' : '#64748B', fontSize: 11 },
      splitLine: { lineStyle: { color: isDark.value ? '#334155' : '#F1F5F9' } }
    },
    series: [
      {
        name: 'New Merchants',
        type: 'line',
        smooth: true,
        data: data.value.charts.acquisitionTrend.values,
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
</script>
