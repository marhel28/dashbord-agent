<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-navy);">Keuangan & Arus Kas</h1>
        <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">
          Pantau kesehatan finansial toko Anda. Pilih rentang waktu.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <input type="date" v-model="startDate" class="px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white" style="border-color: var(--wp-border); color: var(--wp-text);" />
        <span class="text-xs text-slate-500">-</span>
        <input type="date" v-model="endDate" class="px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white" style="border-color: var(--wp-border); color: var(--wp-text);" />
        <button @click="loadData" class="px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-all" style="background: var(--wp-gold);">Terapkan</button>
      </div>
      <div class="flex gap-2">
        <button @click="downloadPdf" :disabled="downloadingPdf" class="px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 border bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50" style="border-color: var(--wp-border);">
          <Icon v-if="downloadingPdf" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <Icon v-else name="heroicons:document-arrow-down" class="w-4 h-4" />
          {{ downloadingPdf ? 'Menyiapkan...' : 'Unduh Laporan (PDF)' }}
        </button>
        <button @click="showExpenseModal = true" class="px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-2" style="background: linear-gradient(135deg, var(--wp-navy), #1e293b); color: white;">
          <Icon name="heroicons:plus" class="w-4 h-4" /> Catat Pengeluaran
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 rounded-full border-4 animate-spin mx-auto" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
    </div>

    <!-- Main Content -->
    <template v-else-if="summary">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Revenue -->
        <div class="bg-white border rounded-2xl p-5 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Uang Masuk (Sales)</span>
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 text-emerald-500" />
          </div>
          <p class="text-2xl font-black text-slate-800">{{ formatRupiah(summary.total_revenue) }}</p>
        </div>
        <!-- Expenses -->
        <div class="bg-white border rounded-2xl p-5 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Uang Keluar (Opex)</span>
            <Icon name="heroicons:arrow-up-tray" class="w-4 h-4 text-rose-500" />
          </div>
          <p class="text-2xl font-black text-slate-800">{{ formatRupiah(summary.total_expense) }}</p>
        </div>
        <!-- Net Profit -->
        <div class="bg-white border rounded-2xl p-5 shadow-sm relative overflow-hidden" style="border-color: var(--wp-border);">
          <div class="absolute inset-0 opacity-10" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));"></div>
          <div class="flex items-center justify-between mb-2 relative z-10">
            <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-navy);">Laba Bersih</span>
            <Icon name="heroicons:banknotes" class="w-4 h-4" style="color: var(--wp-gold-dark);" />
          </div>
          <p class="text-2xl font-black relative z-10" :class="summary.net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'">
            {{ formatRupiah(summary.net_profit) }}
          </p>
        </div>
        <!-- Receivables -->
        <div class="bg-white border rounded-2xl p-5 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Piutang (Kasbon)</span>
            <Icon name="heroicons:document-text" class="w-4 h-4 text-amber-500" />
          </div>
          <p class="text-2xl font-black text-slate-800">{{ formatRupiah(summary.total_receivables) }}</p>
        </div>
      </div>

      <!-- Cash Flow Chart & Expenses List -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart -->
        <div class="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <h2 class="text-base font-bold mb-4" style="color: var(--wp-text);">Arus Kas (Periode Dipilih)</h2>
          <VChart :option="cashflowOption" autoresize class="h-72" />
        </div>

        <!-- Recent Expenses -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm flex flex-col" style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold" style="color: var(--wp-text);">Pengeluaran Terakhir</h2>
          </div>
          <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            <div v-if="expenses.length === 0" class="text-center py-10 text-xs text-slate-400 font-medium">
              Belum ada pengeluaran dicatat.
            </div>
            <div v-for="exp in expenses" :key="exp.uuid" class="flex items-center justify-between p-3 rounded-xl border bg-slate-50" style="border-color: var(--wp-border);">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm text-slate-400">
                  <Icon v-if="exp.category === 'OPERATIONAL'" name="heroicons:bolt" class="w-4 h-4" />
                  <Icon v-else-if="exp.category === 'SALARY'" name="heroicons:user-group" class="w-4 h-4" />
                  <Icon v-else-if="exp.category === 'MAINTENANCE'" name="heroicons:wrench" class="w-4 h-4" />
                  <Icon v-else name="heroicons:document" class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-[11px] font-bold text-slate-800">{{ exp.description }}</p>
                  <p class="text-[9px] font-semibold text-slate-400">{{ formatDate(exp.expense_date) }} &bull; {{ exp.category }}</p>
                </div>
              </div>
              <span class="text-xs font-black text-rose-600">-{{ formatRupiah(exp.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal Catat Pengeluaran -->
    <div v-if="showExpenseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-fade-in-up">
        <div class="px-5 py-4 border-b flex justify-between items-center" style="border-color: var(--wp-border);">
          <h3 class="font-bold text-sm" style="color: var(--wp-navy);">Catat Pengeluaran</h3>
          <button @click="showExpenseModal = false" class="text-slate-400 hover:text-slate-600">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="submitExpense" class="p-5 space-y-4">
          <div>
            <label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nominal (Rp)</label>
            <input v-model.number="formExpense.amount" type="number" required min="1" class="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:border-[var(--wp-gold)]" />
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Kategori</label>
            <select v-model="formExpense.category" class="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:border-[var(--wp-gold)] bg-white">
              <option value="OPERATIONAL">Operasional (Listrik, Sewa, dll)</option>
              <option value="SALARY">Gaji Karyawan</option>
              <option value="MAINTENANCE">Perbaikan/Maintenance</option>
              <option value="OTHER">Lain-lain</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Deskripsi Singkat</label>
            <input v-model="formExpense.description" type="text" required placeholder="Cth: Bayar tagihan internet" class="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:border-[var(--wp-gold)]" />
          </div>
          <div class="pt-2">
            <button type="submit" :disabled="submitting" class="w-full py-2.5 rounded-lg text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-50" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
              {{ submitting ? 'Menyimpan...' : 'Simpan Pengeluaran' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '~/utils/api'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

const summary = ref<any>(null)
const cashflow = ref<any[]>([])
const expenses = ref<any[]>([])
const loading = ref(true)
const showExpenseModal = ref(false)
const submitting = ref(false)
const downloadingPdf = ref(false)

const startDate = ref('')
const endDate = ref('')

const formExpense = ref({
  amount: 0,
  category: 'OPERATIONAL',
  description: ''
})

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (startDate.value) params.start_date = startDate.value
    if (endDate.value) params.end_date = endDate.value

    const [sumRes, expRes, flowRes] = await Promise.all([
      api.get('/finance/summary', { params }),
      api.get('/finance/expenses', { params }),
      api.get('/finance/cashflow', { params })
    ])
    summary.value = sumRes
    expenses.value = expRes
    cashflow.value = flowRes.trend
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const submitExpense = async () => {
  submitting.value = true
  try {
    await api.post('/finance/expenses', formExpense.value)
    showExpenseModal.value = false
    formExpense.value = { amount: 0, category: 'OPERATIONAL', description: '' }
    await loadData()
  } catch (e) {
    alert('Gagal menyimpan pengeluaran')
  } finally {
    submitting.value = false
  }
}

const downloadPdf = async () => {
  downloadingPdf.value = true
  try {
    const res = await api.post('/finance/export-pdf')
    const taskId = res.task_id
    
    // Polling status
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await api.get(`/finance/export-pdf/status/${taskId}`)
        if (statusRes.status === 'SUCCESS') {
          clearInterval(pollInterval)
          downloadingPdf.value = false
          
          // Construct the base URL appropriately (adjusting for development/production)
          const baseURL = 'https://cctv-api.desa-sidomukti.com'
          const downloadUrl = `${baseURL}/finance/export-pdf/download/${taskId}`
          
          // Open the URL to trigger the browser download
          const a = document.createElement('a')
          a.href = downloadUrl
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (e: any) {
        clearInterval(pollInterval)
        downloadingPdf.value = false
        console.error("Polling error:", e)
        alert('Gagal mengecek status PDF: ' + (e.message || e))
      }
    }, 2000)
    
  } catch (e) {
    downloadingPdf.value = false
    alert('Gagal memulai unduhan PDF.')
  }
}

onMounted(() => {
  loadData()
})

const cashflowOption = computed(() => {
  if (!cashflow.value || cashflow.value.length === 0) return {}
  const data = cashflow.value
  
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 10,
      padding: [8, 12],
      textStyle: { color: '#1E293B', fontSize: 12, fontFamily: 'var(--wp-font)' },
    },
    legend: {
      data: ['Uang Masuk', 'Uang Keluar'],
      bottom: 0,
      icon: 'circle',
      textStyle: { fontSize: 10, color: '#64748B', fontWeight: 600 }
    },
    grid: { left: 16, right: 16, top: 16, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748B', fontSize: 9, fontWeight: 600 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748B',
        fontSize: 9,
        fontWeight: 600,
        formatter: (v: number) => (v >= 1000000 ? (v/1000000).toFixed(1) + 'M' : v >= 1000 ? (v/1000).toFixed(0) + 'K' : v)
      },
      splitLine: { lineStyle: { color: '#E2E8F0', type: 'dashed' } },
    },
    series: [
      {
        name: 'Uang Masuk',
        type: 'bar',
        data: data.map(d => d.income),
        itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
        barGap: '10%'
      },
      {
        name: 'Uang Keluar',
        type: 'bar',
        data: data.map(d => d.expense),
        itemStyle: { color: '#F43F5E', borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
})
</script>
