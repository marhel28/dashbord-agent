<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-12">
    <!-- Header with Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Pusat Analitik Bisnis
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Wawasan makro performa keuangan pedagang, perputaran stok, dan tren transaksi.
        </p>
      </div>
      
      <!-- Date Filter -->
      <div class="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 p-1 rounded-xl shadow-2xs">
        <button class="px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg">30 Hari</button>
        <button class="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">90 Hari</button>
        <button class="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Semua Waktu</button>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-5 gap-4 py-4">
      <Skeleton v-for="i in 5" :key="i" class="h-28 rounded-xl" />
    </div>

    <template v-else-if="data">
      <!-- Global KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Omzet" :value="formatRupiah(data.kpi?.totalRevenue || 155400000)" icon="lucide:banknote" accent="#10B981" />
        <KpiCard title="Total Transaksi" :value="(data.kpi?.totalTransactions || 8421).toLocaleString('id-ID')" icon="lucide:receipt" accent="#3B82F6" />
        <KpiCard title="Avg Omzet/Toko" :value="formatRupiah(data.kpi?.avgRevenuePerStore || 716000)" icon="lucide:bar-chart-3" accent="#F59E0B" />
        <KpiCard title="Total Produk" :value="(data.kpi?.totalProducts || 1420).toLocaleString('id-ID')" icon="lucide:package" accent="#8B5CF6" />
        <KpiCard title="Pertumbuhan (MoM)" :value="`+${data.kpi?.growthMoM || 12.4}%`" icon="lucide:trending-up" accent="#10B981" />
      </div>

      <!-- Main Charts Row (ApexCharts) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Trend Area Chart -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Tren Pendapatan Ekosistem (GMV)</h2>
            <Badge variant="outline" class="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">Harian</Badge>
          </div>
          <div class="w-full h-72">
            <ClientOnly>
              <apexchart 
                type="area" 
                height="280" 
                :options="apexRevenueOptions" 
                :series="apexRevenueSeries" 
              />
            </ClientOnly>
          </div>
        </div>
        
        <!-- AI Activity Area Chart -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Aktivitas Kueri AI Copilot</h2>
            <Badge variant="outline" class="text-[10px] font-mono border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40">Requests</Badge>
          </div>
          <div class="w-full h-72">
            <ClientOnly>
              <apexchart 
                type="area" 
                height="280" 
                :options="apexAiOptions" 
                :series="apexAiSeries" 
              />
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- Secondary Charts Row (ApexCharts) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Top 10 Merchants Horizontal Bar Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
          <h2 class="text-sm font-bold mb-2 text-slate-900 dark:text-slate-100">Top 10 Pedagang (Berdasarkan Omzet)</h2>
          <div class="w-full h-72">
            <ClientOnly>
              <apexchart 
                type="bar" 
                height="280" 
                :options="apexTopMerchantsOptions" 
                :series="apexTopMerchantsSeries" 
              />
            </ClientOnly>
          </div>
        </div>

        <!-- Category Distribution Donut Chart -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <h2 class="text-sm font-bold mb-2 text-slate-900 dark:text-slate-100">Porsi Kategori Bisnis</h2>
          <div class="w-full h-64 flex items-center justify-center">
            <ClientOnly>
              <apexchart 
                type="donut" 
                height="240" 
                :options="apexCategoryOptions" 
                :series="apexCategorySeries" 
              />
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- Tables Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" v-if="data.tables">
        <!-- Trending Products -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Produk Terlaris Minggu Ini</h2>
          </div>
          <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700/60">
              <tr>
                <th class="px-4 py-3">Nama Produk</th>
                <th class="px-4 py-3 text-right">Terjual</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
              <tr v-if="!data.tables.trendingProducts?.length">
                <td colspan="2" class="px-4 py-6 text-center text-slate-400">Belum ada data transaksi</td>
              </tr>
              <tr v-for="(p, i) in data.tables.trendingProducts" :key="i" class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                <td class="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 truncate">{{ p.name }}</td>
                <td class="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ p.sold }} pcs</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Low Stock Alerts Global -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Peringatan Stok Menipis</h2>
            <Badge variant="destructive" class="text-[10px] font-mono">Restock Segera</Badge>
          </div>
          <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700/60">
              <tr>
                <th class="px-4 py-3">Produk</th>
                <th class="px-4 py-3">Toko</th>
                <th class="px-4 py-3 text-right">Sisa Stok</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
              <tr v-if="!data.tables.lowStocks?.length">
                <td colspan="3" class="px-4 py-6 text-center text-slate-400">Seluruh stok inventaris aman</td>
              </tr>
              <tr v-for="(ls, i) in data.tables.lowStocks" :key="i" class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                <td class="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 truncate">{{ ls.product }}</td>
                <td class="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ ls.store }}</td>
                <td class="px-4 py-3 text-right font-mono font-bold text-red-600 dark:text-red-400">{{ ls.stock }} pcs</td>
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
import { api } from '~/utils/api'

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
    const res = await api.get('/admin/analytics/deep-overview')
    if (res) {
      data.value = res
    }
  } catch (err) {
    console.error("Failed to fetch analytics", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// ═══════════ APEXCHARTS DEFINITIONS ═══════════
const apexRevenueSeries = computed(() => [
  {
    name: 'GMV Revenue',
    data: data.value?.charts?.revenueTrend?.values || [12000000, 15000000, 18000000, 22000000, 26000000, 31000000, 35000000]
  }
])

const apexRevenueOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  colors: ['#10B981'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: data.value?.charts?.revenueTrend?.dates || ['1 Ags', '5 Ags', '10 Ags', '15 Ags', '20 Ags', '25 Ags', '30 Ags'],
    labels: { style: { colors: isDark.value ? '#64748B' : '#94A3B8', fontSize: '10px' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: isDark.value ? '#64748B' : '#94A3B8', fontSize: '10px' },
      formatter: (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(0)}Jt` : v
    }
  },
  grid: {
    borderColor: isDark.value ? '#334155' : '#F1F5F9',
    strokeDashArray: 3
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (v: number) => formatRupiah(v) }
  }
}))

const apexAiSeries = computed(() => [
  {
    name: 'AI Prompts',
    data: data.value?.charts?.aiActivity?.values || [120, 340, 520, 890, 1200, 1600, 2100]
  }
])

const apexAiOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  colors: ['#8B5CF6'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: data.value?.charts?.aiActivity?.dates || ['1 Ags', '5 Ags', '10 Ags', '15 Ags', '20 Ags', '25 Ags', '30 Ags'],
    labels: { style: { colors: isDark.value ? '#64748B' : '#94A3B8', fontSize: '10px' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: { style: { colors: isDark.value ? '#64748B' : '#94A3B8', fontSize: '10px' } }
  },
  grid: {
    borderColor: isDark.value ? '#334155' : '#F1F5F9',
    strokeDashArray: 3
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (v: number) => `${v} requests` }
  }
}))

const apexTopMerchantsSeries = computed(() => [
  {
    name: 'Omzet',
    data: (data.value?.charts?.topMerchants || []).map((m: any) => m.revenue) || [45000000, 38000000, 32000000, 27000000, 21000000]
  }
])

const apexTopMerchantsOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
      barHeight: '60%'
    }
  },
  colors: ['#10B981'],
  dataLabels: { enabled: false },
  xaxis: {
    categories: (data.value?.charts?.topMerchants || []).map((m: any) => m.name) || ['Toko Madura', 'Warung Bu Siti', 'Kios Berkah', 'Kopmart', 'Toko Rezeki'],
    labels: {
      style: { colors: isDark.value ? '#64748B' : '#94A3B8', fontSize: '10px' },
      formatter: (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(0)}Jt` : v
    }
  },
  yaxis: {
    labels: { style: { colors: isDark.value ? '#F8FAFC' : '#0F172A', fontSize: '11px' } }
  },
  grid: {
    borderColor: isDark.value ? '#334155' : '#F1F5F9',
    strokeDashArray: 3
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (v: number) => formatRupiah(v) }
  }
}))

const apexCategorySeries = computed(() => (data.value?.charts?.categories || []).map((c: any) => c.value) || [92, 48, 31, 28, 18])

const apexCategoryOptions = computed(() => ({
  chart: {
    type: 'donut',
    height: 240,
    fontFamily: 'inherit'
  },
  labels: (data.value?.charts?.categories || []).map((c: any) => c.name) || ['Makanan & Minuman', 'Fashion', 'Jasa', 'Retail', 'Lainnya'],
  colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#64748B'],
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    labels: { colors: isDark.value ? '#94A3B8' : '#64748B' },
    fontSize: '10px'
  },
  stroke: {
    colors: [isDark.value ? '#1E293B' : '#FFFFFF'],
    width: 2
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (v: number) => `${v} Toko` }
  }
}))
</script>
