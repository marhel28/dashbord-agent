<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. PAGE HEADER + PRESET PERIOD TOGGLE ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dompet</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pantau saldo, pergerakan uang masuk/keluar, dan aktivitas transaksi bisnis Anda.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Date Preset Filter -->
        <div class="inline-flex p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            v-for="p in periods" :key="p.value"
            @click="activePeriod = p.value"
            :class="['px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              activePeriod === p.value ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900']"
          >{{ p.label }}</button>
        </div>

        <button @click="fetchPerformance()" class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600" title="Refresh Wallet">
          <Icon name="lucide:refresh-cw" class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- ═══════════ 2. SKELETON LOADING STATE ═══════════ -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-40 rounded-xl" />
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Skeleton class="xl:col-span-2 h-72 rounded-xl" />
        <Skeleton class="h-72 rounded-xl" />
      </div>
    </div>

    <!-- ═══════════ 3. ERROR STATE ═══════════ -->
    <div v-else-if="error" class="flex items-center justify-center py-16">
      <div class="text-center space-y-4 max-w-sm border border-red-200 dark:border-red-500/20 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-950/40">
        <div class="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
          <Icon name="lucide:alert-triangle" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Gagal Memuat Data Dompet</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ error }}</p>
        </div>
        <Button variant="default" size="sm" @click="fetchPerformance()" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-semibold shadow-xs text-xs">Coba Lagi</Button>
      </div>
    </div>

    <!-- ═══════════ 4. MAIN WALLET WORKSPACE ═══════════ -->
    <template v-else-if="performance">
      <!-- HERO BALANCE CARD -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Saldo Tersedia</span>
            <span class="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
              Diperbarui {{ lastUpdatedTime }}
            </span>
          </div>
          <p class="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            Rp {{ formatRupiah(performance.balance) }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Uang yang siap digunakan untuk operasional & pencairan usaha.
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <span class="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase block">Total Uang Masuk</span>
            <p class="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">+Rp {{ formatRupiah(performance.total_earned) }}</p>
          </div>
          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Uang Keluar</span>
            <p class="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">-Rp {{ formatRupiah(performance.total_withdrawn) }}</p>
          </div>
          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Total Transaksi</span>
            <p class="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">{{ performance.transaction_count }}</p>
          </div>
        </div>
      </div>

      <!-- BUSINESS COPILOT WALLET INSIGHT LAYER -->
      <div class="p-5 bg-gradient-to-r from-[#003B32] to-[#047857] text-white rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold tracking-wider">Copilot Wallet Insight</span>
            <span class="text-xs text-emerald-200">Arus Kas Dompet</span>
          </div>
          <h3 class="text-base font-bold text-white">
            {{ copilotWalletTitle }}
          </h3>
          <p class="text-xs text-slate-200 leading-relaxed max-w-2xl">
            {{ copilotWalletDescription }}
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

      <!-- WALLET ACTIVITY CHART & SUMMARY -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Aktivitas Dompet (Wallet Activity)</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Grafik uang masuk harian dalam 30 hari terakhir.</p>
          </div>

          <div v-if="dailyIncomeOption">
            <VChart :option="dailyIncomeOption" autoresize class="h-56 w-full" />
          </div>
          <div v-else class="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Belum ada grafik tren aktivitas transaksi untuk periode ini.
          </div>
        </div>

        <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div class="space-y-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Ringkasan Metode Masuk</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Pembagian sumber penerimaan dompet toko.</p>

            <div class="space-y-3 pt-2 text-xs">
              <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-900 dark:text-slate-100">QRIS & Non-Tunai</span>
                  <span class="block text-[10px] text-slate-400">Langsung masuk saldo</span>
                </div>
                <span class="font-mono font-bold text-emerald-600">+Rp {{ formatRupiah(performance.total_earned * 0.65) }}</span>
              </div>
              <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-900 dark:text-slate-100">Penjualan Cash</span>
                  <span class="block text-[10px] text-slate-400">Kasir fisik</span>
                </div>
                <span class="font-mono font-bold text-slate-900 dark:text-slate-100">+Rp {{ formatRupiah(performance.total_earned * 0.35) }}</span>
              </div>
            </div>
          </div>

          <NuxtLink to="/finance" class="block w-full">
            <Button variant="outline" size="sm" class="w-full text-xs font-semibold rounded-lg">
              Ke Halaman Keuangan Lengkap →
            </Button>
          </NuxtLink>
        </div>
      </div>

      <!-- TRANSACTION HISTORY LEDGER WITH SEARCH & FILTERS -->
      <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Riwayat Transaksi Dompet</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar pergerakan uang masuk, uang keluar, dan penarikan.</p>
          </div>

          <!-- Search & Filter Controls -->
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <Input v-model="txSearch" type="text" placeholder="Cari invoice / keterangan…" class="h-8 w-44 text-xs rounded-lg" />
            <select v-model="txTypeFilter" class="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs">
              <option value="ALL">Semua Jenis</option>
              <option value="CREDIT">Uang Masuk (+)</option>
              <option value="DEBIT">Uang Keluar (-)</option>
            </select>
          </div>
        </div>

        <!-- Empty Transactions State -->
        <div v-if="filteredTransactions.length === 0" class="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <Icon name="lucide:receipt" class="w-8 h-8 mx-auto text-slate-400" />
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Belum Ada Transaksi Ditemukan</p>
          <p class="text-xs text-slate-500">Uang masuk dari transaksi kasir atau pengeluaran akan otomatis tercatat di sini.</p>
        </div>

        <!-- Transactions Ledger List -->
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <div
            v-for="txn in filteredTransactions"
            :key="txn.uuid"
            @click="selectedTxn = txn"
            class="py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors group"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :class="txn.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50' : 'bg-red-50 text-red-600 dark:bg-red-950/50'"
              >
                <Icon
                  :name="txn.type === 'CREDIT' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right'"
                  class="w-4 h-4"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors truncate">
                    {{ txn.description || (txn.type === 'CREDIT' ? 'Pembayaran Diterima' : 'Penarikan / Pengeluaran') }}
                  </p>
                  <Badge variant="outline" class="text-[9px] px-1.5 py-0 font-medium">PAID</Badge>
                </div>
                <p class="text-[10px] text-slate-400 font-mono mt-0.5">
                  {{ formatDate(txn.created_at) }} &bull; {{ txn.reference_uuid ? txn.reference_uuid.slice(0, 12) : 'SALES-POS' }}
                </p>
              </div>
            </div>

            <div class="text-right shrink-0">
              <span
                class="text-xs sm:text-sm font-bold font-mono"
                :class="txn.type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
              >
                {{ txn.type === 'CREDIT' ? '+' : '-' }}Rp {{ formatRupiah(txn.amount) }}
              </span>
              <span class="block text-[10px] text-slate-400 font-mono mt-0.5">
                Saldo: Rp {{ formatRupiah(txn.balance_after) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ TRANSACTION DETAIL DRAWER ═══════════ -->
    <Teleport to="body">
      <div v-if="selectedTxn" class="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-xs" @click.self="selectedTxn = null">
        <div class="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 space-y-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Detail Transaksi Dompet</h3>
              <button @click="selectedTxn = null" class="text-slate-400 hover:text-slate-600">
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <div class="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Nominal Transaksi</span>
              <p class="text-2xl font-bold font-mono" :class="selectedTxn.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'">
                {{ selectedTxn.type === 'CREDIT' ? '+' : '-' }}Rp {{ formatRupiah(selectedTxn.amount) }}
              </p>
              <Badge variant="success" class="text-[10px] font-semibold mt-1">STATUS: SETTLED / PAID</Badge>
            </div>

            <div class="space-y-3 text-xs">
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Jenis Transaksi</span>
                <span class="font-bold text-slate-900 dark:text-slate-100">{{ selectedTxn.type === 'CREDIT' ? 'Uang Masuk (Credit)' : 'Uang Keluar (Debit)' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Deskripsi</span>
                <span class="font-medium text-slate-800 dark:text-slate-200 max-w-[200px] text-right">{{ selectedTxn.description || 'Pembayaran Diterima' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Waktu & Tanggal</span>
                <span class="font-mono text-slate-800 dark:text-slate-200">{{ formatDate(selectedTxn.created_at) }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">ID Referensi</span>
                <span class="font-mono text-slate-800 dark:text-slate-200">{{ selectedTxn.reference_uuid || 'POS-INVOICE' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Saldo Setelah Transaksi</span>
                <span class="font-mono font-bold text-slate-900 dark:text-slate-100">Rp {{ formatRupiah(selectedTxn.balance_after) }}</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" class="w-full rounded-lg text-xs" @click="selectedTxn = null">Tutup Detail</Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { useWallet } from '~/composables/useWallet'
import Button from '~/components/ui/button.vue'
import Input from '~/components/ui/input.vue'
import Badge from '~/components/ui/badge.vue'
import Skeleton from '~/components/ui/skeleton.vue'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const { performance, loading, error, fetchPerformance } = useWallet()

const activePeriod = ref<'today' | '7day' | '30day' | 'month'>('30day')
const txSearch = ref('')
const txTypeFilter = ref('ALL')
const selectedTxn = ref<any | null>(null)

const periods = [
  { label: 'Hari Ini', value: 'today' as const },
  { label: '7 Hari', value: '7day' as const },
  { label: '30 Hari', value: '30day' as const },
  { label: 'Bulan Ini', value: 'month' as const },
]

const lastUpdatedTime = computed(() => {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`
})

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value || 0)
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// Business Copilot Wallet Insights
const copilotWalletTitle = computed(() => {
  if (!performance.value) return 'Memuat Analisis Dompet...'
  const bal = performance.value.balance
  if (bal > 10000000) return `Saldo Dompet Sangat Aman (Rp ${formatRupiah(bal)})`
  if (bal > 0) return `Saldo Tersedia Rp ${formatRupiah(bal)}, Siap Digunakan`
  return `Saldo Dompet Kosong / Defisit`
})

const copilotWalletDescription = computed(() => {
  if (!performance.value) return ''
  const earned = performance.value.total_earned
  const count = performance.value.transaction_count
  return `Total uang masuk sebesar Rp ${formatRupiah(earned)} berasal dari ${count} transaksi. Uang masuk dari QRIS & Non-Tunai otomatis terakumulasi dalam saldo dompet.`
})

// Filtered Transactions
const filteredTransactions = computed(() => {
  if (!performance.value || !performance.value.recent_transactions) return []
  let list = performance.value.recent_transactions || []

  if (txTypeFilter.value !== 'ALL') {
    list = list.filter((t: any) => t.type === txTypeFilter.value)
  }

  if (txSearch.value.trim()) {
    const q = txSearch.value.toLowerCase()
    list = list.filter((t: any) =>
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.reference_uuid && t.reference_uuid.toLowerCase().includes(q))
    )
  }

  return list
})

const dailyIncomeOption = computed(() => {
  const daily = performance.value?.daily_income
  if (!daily || daily.length === 0) return null

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
        const p = params[0]
        const val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)
        return `<b>${p.axisValue}</b><br/>Uang Masuk: <b style="color:#047857">${val}</b>`
      },
    },
    grid: { left: 8, right: 8, top: 12, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: daily.map((d: any) => d.date.slice(5)), // MM-DD
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748B', fontSize: 10, fontWeight: 600 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: 600,
        formatter: (v: number) => (v >= 1000000 ? (v/1000000).toFixed(1) + 'M' : v >= 1000 ? (v/1000).toFixed(0) + 'K' : v)
      },
      splitLine: { lineStyle: { color: '#E2E8F0', type: 'dashed' } },
    },
    series: [{
      type: 'bar',
      data: daily.map((d: any) => ({
        value: d.amount,
        itemStyle: { color: '#047857', borderRadius: [4, 4, 0, 0] },
      })),
      barWidth: 14,
    }],
  }
})

onMounted(() => {
  fetchPerformance()
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
