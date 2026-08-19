<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header with Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Analitik Penggunaan AI</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau tingkat adopsi agen AI, tingkat keberhasilan, dan kepuasan merchant.</p>
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
      <NuxtLink to="/analytics/ai-usage" class="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg whitespace-nowrap shadow-xs">Penggunaan AI</NuxtLink>
      <NuxtLink to="/analytics/catalog" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Katalog Produk</NuxtLink>
      <NuxtLink to="/analytics/reports" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Laporan</NuxtLink>
    </div>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4">
      <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>

    <template v-else-if="data">
      <!-- Global KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Adopsi Copilot" :value="`${(data.kpi?.adoptionRate || 0).toFixed(1)}%`" icon="lucide:users" accent="#3B82F6" />
        <KpiCard title="Tingkat Sukses AI" :value="`${(data.kpi?.successRate || 0).toFixed(1)}%`" icon="lucide:check-circle-2" accent="#10B981" />
        <KpiCard title="Rating Kepuasan" :value="`${(data.kpi?.avgRating || 0).toFixed(1)} / 5.0`" icon="lucide:star" accent="#F59E0B" />
        <KpiCard title="Tugas Otomatis" :value="(data.kpi?.tasksAutomated || 0).toLocaleString('id-ID')" icon="lucide:cpu" accent="#8B5CF6" />
      </div>

      <!-- Main Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- AI Usage Trend -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
          <h2 class="text-sm font-bold mb-4 text-slate-900 dark:text-slate-100">Interaksi Harian AI Copilot</h2>
          <VChart v-if="usageOption" :option="usageOption" autoresize class="h-80 w-full" />
        </div>
        
        <!-- Agent Workload Distribution -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
          <h2 class="text-sm font-bold mb-4 text-slate-900 dark:text-slate-100">Beban Kerja Spesialisasi Agen</h2>
          <VChart v-if="agentOption" :option="agentOption" autoresize class="h-80 w-full" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" v-if="data.tables">
        <!-- AI Needs Attention (Audit Log) -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Icon name="lucide:alert-circle" class="w-4 h-4 text-amber-500" />
              <span>Audit Log Respon AI</span>
            </h2>
          </div>
          <div class="overflow-x-auto p-4">
            <div v-if="!data.tables.auditLogs?.length" class="text-center py-10 text-slate-400 text-xs">
              Semua respon model AI beroperasi dengan optimal tanpa keluhan.
            </div>
            <div v-else class="space-y-3">
              <div v-for="(log, i) in data.tables.auditLogs" :key="i" class="p-4 border border-slate-200/80 dark:border-slate-700/60 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ log.store }}</span>
                  <div class="flex items-center gap-1 text-amber-500">
                    <Icon v-for="s in 5" :key="s" :name="s <= (log.rating || 0) ? 'lucide:star' : 'lucide:star'" class="w-3.5 h-3.5" :class="{ 'fill-amber-500': s <= (log.rating || 0) }" />
                  </div>
                </div>
                <div class="text-xs text-slate-700 dark:text-slate-300">
                  <span class="font-bold text-slate-500 dark:text-slate-400">User:</span> {{ log.message }}
                </div>
                <div class="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">AI:</span> {{ log.reply }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Power Users Table -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50">
            <h2 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Top Power Users</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700/60">
                <tr>
                  <th class="px-4 py-3">Nama Toko</th>
                  <th class="px-4 py-3 text-right">Interaksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                <tr v-for="(u, i) in data.tables.powerUsers" :key="i" class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                  <td class="px-4 py-3 font-sans font-semibold text-slate-900 dark:text-slate-100 truncate">{{ u.store }}</td>
                  <td class="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{{ u.interactions }}</td>
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
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { api } from '~/utils/api'

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const loading = ref(true)
const data = ref<any>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/analytics/ai-deep')
    if (res) {
      data.value = res
    }
  } catch (err) {
    console.error("Failed to fetch ai analytics", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const usageOption = computed(() => {
  if (!data.value?.charts?.usageTrend) return null
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
      data: data.value.charts.usageTrend.dates,
      axisLabel: { color: isDark.value ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: { 
      type: 'value',
      axisLabel: { color: isDark.value ? '#94A3B8' : '#64748B', fontSize: 11 },
      splitLine: { lineStyle: { color: isDark.value ? '#334155' : '#F1F5F9' } }
    },
    series: [
      {
        name: 'Interactions',
        type: 'line',
        smooth: true,
        data: data.value.charts.usageTrend.values,
        itemStyle: { color: '#8B5CF6' },
        lineStyle: { width: 3, shadowColor: 'rgba(139,92,246,0.4)', shadowBlur: 10 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#8B5CF644' }, { offset: 1, color: '#8B5CF600' }]
          }
        }
      }
    ]
  }
})

const agentOption = computed(() => {
  if (!data.value?.charts?.agentWorkload) return null
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
        data: data.value.charts.agentWorkload
      }
    ]
  }
})
</script>
