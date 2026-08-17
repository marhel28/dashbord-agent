<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. PAGE HEADER + PRESET PERIOD TOGGLE ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Keuangan</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pantau arus kas, keuntungan, pengeluaran, dan kondisi keuangan bisnis Anda.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Preset Date Range Toggle -->
        <div class="inline-flex p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            v-for="p in periods" :key="p.value"
            @click="setPeriod(p.value)"
            :class="['px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              activePeriod === p.value ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900']"
          >{{ p.label }}</button>
        </div>

        <div class="flex items-center gap-2">
          <Button @click="downloadPdf" :disabled="downloadingPdf" variant="outline" size="sm" class="h-8 text-xs font-semibold rounded-lg">
            <Icon v-if="downloadingPdf" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
            <Icon v-else name="lucide:file-text" class="w-3.5 h-3.5 text-slate-500" />
            <span>{{ downloadingPdf ? 'Menyiapkan...' : 'Laporan PDF' }}</span>
          </Button>
          <Button @click="showExpenseModal = true" size="sm" class="bg-[#047857] hover:bg-[#065f46] text-white h-8 text-xs font-semibold rounded-lg">
            <Icon name="lucide:plus" class="w-3.5 h-3.5" />
            <span>Catat Pengeluaran</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Custom Date Range Picker -->
    <div v-if="activePeriod === 'custom'" class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 animate-fade-in text-xs">
      <span class="font-medium text-slate-600 dark:text-slate-400">Rentang Tanggal:</span>
      <input type="date" v-model="startDate" class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
      <span class="text-slate-400">-</span>
      <input type="date" v-model="endDate" class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
      <Button size="sm" @click="loadData" class="bg-[#047857] text-white text-xs h-8 rounded-lg font-semibold">Terapkan</Button>
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

    <!-- ═══════════ 3. FINANCIAL SUMMARY & HEALTH ═══════════ -->
    <template v-else-if="summary">
      <!-- 4 KPI Cards (Correct Accounting Semantics) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Pendapatan (Revenue) -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pendapatan</span>
            <Icon name="lucide:arrow-down-left" class="w-4 h-4 text-emerald-600" />
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">{{ formatRupiah(summary.total_revenue) }}</p>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-emerald-600 font-semibold">+18.4%</span>
            <span class="text-slate-400">{{ comparisonLabel }}</span>
          </div>
        </div>

        <!-- Pengeluaran (Expenses) -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pengeluaran</span>
            <Icon name="lucide:arrow-up-right" class="w-4 h-4 text-red-600" />
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">{{ formatRupiah(summary.total_expense) }}</p>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-slate-500 font-medium">{{ expenses.length }} transaksi biaya</span>
            <span class="text-slate-400">{{ comparisonLabel }}</span>
          </div>
        </div>

        <!-- Arus Kas Bersih (Net Cash Flow) -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Arus Kas Bersih</span>
            <Icon name="lucide:wallet" class="w-4 h-4" :class="summary.net_profit >= 0 ? 'text-emerald-600' : 'text-red-600'" />
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight mt-1.5" :class="summary.net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
            {{ formatRupiah(summary.net_profit) }}
          </p>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-slate-400 text-[10px]">Uang masuk - keluar</span>
            <span class="text-slate-400">{{ comparisonLabel }}</span>
          </div>
        </div>

        <!-- Piutang (Kasbon Pelanggan) -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Piutang (Kasbon)</span>
            <Icon name="lucide:book-open" class="w-4 h-4 text-amber-600" />
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">{{ formatRupiah(summary.total_receivables) }}</p>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-amber-600 font-semibold">{{ summary.total_receivables > 0 ? 'Perlu ditagih' : 'Tidak ada piutang aktif' }}</span>
          </div>
        </div>
      </div>

      <!-- ── 4. BUSINESS COPILOT FINANCIAL HEALTH DECISION LAYER ── -->
      <div class="p-5 bg-gradient-to-r from-[#003B32] to-[#047857] text-white rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold tracking-wider">Business Copilot Financial Health</span>
            <span class="text-xs text-emerald-200 font-medium">Status Arus Kas: {{ financialHealthState }}</span>
          </div>
          <h3 class="text-base font-bold text-white">
            {{ financialHealthTitle }}
          </h3>
          <p class="text-xs text-slate-200 leading-relaxed max-w-2xl">
            {{ financialHealthDescription }}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink to="/ai-chat">
            <Button size="sm" class="bg-white text-[#003B32] hover:bg-slate-100 font-bold text-xs gap-1.5 rounded-lg">
              <Icon name="lucide:sparkles" class="w-4 h-4 text-emerald-600" />
              <span>Tanya Copilot Keuangan</span>
            </Button>
          </NuxtLink>
        </div>
      </div>

      <!-- ── 5. CASH FLOW CHART & EXPENSE BREAKDOWN ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Combined Cash Flow Chart -->
        <div class="xl:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Grafik Arus Kas (Cash Flow)</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Perbandingan harian uang masuk, uang keluar, dan saldo bersih.</p>
          </div>
          <VChart :option="cashflowOption" autoresize class="h-72 w-full" />
        </div>

        <!-- Expense Breakdown by Category -->
        <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Pengeluaran per Kategori</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Alokasi biaya operasional dan toko.</p>
          </div>

          <div class="space-y-3 pt-2">
            <div v-for="cat in expenseCategoriesBreakdown" :key="cat.name" class="space-y-1 text-xs">
              <div class="flex justify-between font-semibold">
                <span class="text-slate-800 dark:text-slate-200">{{ cat.name }}</span>
                <span class="font-mono text-slate-900 dark:text-slate-100">{{ formatRupiah(cat.amount) }} ({{ cat.pct }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div class="h-full bg-amber-500 rounded-full" :style="{ width: `${cat.pct}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 6. RECENT FINANCIAL TRANSACTIONS & EXPENSES LIST ── -->
      <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Riwayat Pengeluaran Terakhir</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Catatan pengeluaran yang terdaftar di sistem.</p>
          </div>
          <Button @click="showExpenseModal = true" variant="outline" size="sm" class="h-8 text-xs font-semibold rounded-lg">
            + Catat Pengeluaran
          </Button>
        </div>

        <!-- Empty State with Onboarding CTA -->
        <div v-if="expenses.length === 0" class="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Icon name="lucide:receipt" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Belum Ada Catatan Pengeluaran</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Catat biaya operasional, gaji, pembelian stok, dan transportasi untuk mulai melacak arus kas usaha secara presisi.
            </p>
          </div>
          <Button @click="showExpenseModal = true" size="sm" class="bg-[#047857] text-white text-xs font-semibold rounded-lg">
            + Catat Pengeluaran Pertama
          </Button>
        </div>

        <!-- Expenses Table View -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-3">Tanggal</th>
                <th class="py-3 px-3">Kategori</th>
                <th class="py-3 px-3">Keterangan</th>
                <th class="py-3 px-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="exp in expenses" :key="exp.uuid" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-3 font-mono text-slate-500 text-[11px]">{{ formatDateFull(exp.expense_date) }}</td>
                <td class="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                  <Badge variant="outline" class="text-[10px] rounded-md font-medium">
                    {{ getCategoryLabel(exp.category) }}
                  </Badge>
                </td>
                <td class="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">{{ exp.description }}</td>
                <td class="py-3 px-3 text-right font-mono font-bold text-red-600">-{{ formatRupiah(exp.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ═══════════ MODAL CATAT PENGELUARAN ═══════════ -->
    <Teleport to="body">
      <div v-if="showExpenseModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" @click.self="showExpenseModal = false">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Catat Pengeluaran Baru</h2>
              <p class="text-xs text-slate-500 mt-0.5">Masukkan pengeluaran operasional toko Anda.</p>
            </div>
            <button @click="showExpenseModal = false" class="text-slate-400 hover:text-slate-600 p-1">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submitExpense" class="p-6 space-y-4 text-xs">
            <div class="space-y-1.5">
              <Label for="exp-amount" class="font-semibold text-slate-700 dark:text-slate-300">Nominal (Rp) <span class="text-red-500">*</span></Label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">Rp</span>
                <Input id="exp-amount" v-model.number="formExpense.amount" type="number" required min="1" placeholder="0" class="pl-9 h-9 text-xs font-mono rounded-lg" />
              </div>
            </div>

            <div class="space-y-1.5">
              <Label for="exp-category" class="font-semibold text-slate-700 dark:text-slate-300">Kategori Biaya</Label>
              <select id="exp-category" v-model="formExpense.category" class="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                <option value="STOCK">Pembelian Stok / Bahan Baku</option>
                <option value="OPERATIONAL">Operasional (Listrik, Sewa, dll)</option>
                <option value="SALARY">Gaji Karyawan</option>
                <option value="TRANSPORT">Transportasi & Logistik</option>
                <option value="MAINTENANCE">Perbaikan & Peralatan</option>
                <option value="OTHER">Lain-lain</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <Label for="exp-desc" class="font-semibold text-slate-700 dark:text-slate-300">Keterangan Pengeluaran <span class="text-red-500">*</span></Label>
              <Input id="exp-desc" v-model="formExpense.description" type="text" required placeholder="Cth: Beli stok tepung terigu 10 sak" class="h-9 text-xs rounded-lg" />
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" @click="showExpenseModal = false" class="rounded-lg text-xs">Batal</Button>
              <Button type="submit" size="sm" :disabled="submitting" class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold">
                <Icon v-if="submitting" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ submitting ? 'Menyimpan...' : 'Simpan Pengeluaran' }}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '~/utils/api'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import Badge from '~/components/ui/badge.vue'
import Button from '~/components/ui/button.vue'
import Input from '~/components/ui/input.vue'
import Label from '~/components/ui/label.vue'
import Select from '~/components/ui/select.vue'
import Skeleton from '~/components/ui/skeleton.vue'
import Dialog from '~/components/ui/dialog.vue'
import DialogContent from '~/components/ui/dialog-content.vue'
import DialogHeader from '~/components/ui/dialog-header.vue'
import DialogTitle from '~/components/ui/dialog-title.vue'
import DialogFooter from '~/components/ui/dialog-footer.vue'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const summary = ref<any>(null)
const cashflow = ref<any[]>([])
const expenses = ref<any[]>([])
const loading = ref(true)
const showExpenseModal = ref(false)
const submitting = ref(false)
const downloadingPdf = ref(false)

const startDate = ref('')
const endDate = ref('')
const activePeriod = ref<'today' | 'week' | 'month' | '3month' | 'custom'>('month')

const periods = [
  { label: 'Hari Ini', value: 'today' as const },
  { label: 'Minggu Ini', value: 'week' as const },
  { label: 'Bulan Ini', value: 'month' as const },
  { label: '3 Bulan', value: '3month' as const },
  { label: 'Custom', value: 'custom' as const },
]

const formExpense = ref({
  amount: 0,
  category: 'OPERATIONAL',
  description: ''
})

const comparisonLabel = computed(() => {
  if (activePeriod.value === 'today') return 'vs kemarin'
  if (activePeriod.value === 'week') return 'vs minggu lalu'
  if (activePeriod.value === 'month') return 'vs bulan lalu'
  return 'vs sblm'
})

const setPeriod = (p: 'today' | 'week' | 'month' | '3month' | 'custom') => {
  activePeriod.value = p
  if (p !== 'custom') {
    startDate.value = ''
    endDate.value = ''
    loadData()
  }
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
}

const formatDateFull = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    STOCK: 'Pembelian Stok',
    OPERATIONAL: 'Operasional',
    SALARY: 'Gaji Karyawan',
    TRANSPORT: 'Transportasi',
    MAINTENANCE: 'Perbaikan',
    OTHER: 'Lain-lain',
  }
  return map[cat] || cat
}

// ── Financial Health State & Insights ──
const financialHealthState = computed(() => {
  if (!summary.value) return 'Netral'
  const net = summary.value.net_profit
  if (net > 5000000) return 'Sehat'
  if (net >= 0) return 'Stabil'
  return 'Perlu Perhatian'
})

const financialHealthTitle = computed(() => {
  if (!summary.value) return 'Menganalisis Kesehatan Keuangan...'
  const net = summary.value.net_profit
  if (net > 0) return `Arus Kas Positif (${formatRupiah(net)}), Operasional Toko Berjalan Baik`
  return `Arus Kas Defisit (${formatRupiah(net)}), Pengeluaran Melebihi Uang Masuk`
})

const financialHealthDescription = computed(() => {
  if (!summary.value) return 'Data transaksi sedang dikalkulasi.'
  const exp = summary.value.total_expense
  const rev = summary.value.total_revenue
  if (exp > rev) {
    return `Total pengeluaran (${formatRupiah(exp)}) lebih besar dibanding omzet (${formatRupiah(rev)}). Pertimbangkan untuk mengevaluasi biaya pembelian stok atau mempercepat penagihan piutang.`
  }
  return `Toko berhasil mempertahankan surplus arus kas bersih sebesar ${formatRupiah(summary.value.net_profit)}. Alokasikan sebagian surplus untuk cadangan modal usaha.`
})

// ── Expense Breakdown by Category ──
const expenseCategoriesBreakdown = computed(() => {
  if (!expenses.value || expenses.value.length === 0) return []

  const totalExp = summary.value?.total_expense || expenses.value.reduce((acc, e) => acc + (e.amount || 0), 0) || 1
  const map: Record<string, number> = {}

  expenses.value.forEach(e => {
    const label = getCategoryLabel(e.category)
    map[label] = (map[label] || 0) + Number(e.amount || 0)
  })

  return Object.entries(map)
    .map(([name, amount]) => ({
      name,
      amount,
      pct: Math.round((amount / totalExp) * 100),
    }))
    .sort((a, b) => b.amount - a.amount)
})

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
  if (!formExpense.value.amount || !formExpense.value.description) return
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

    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await api.get(`/finance/export-pdf/status/${taskId}`)
        if (statusRes.status === 'SUCCESS') {
          clearInterval(pollInterval)
          downloadingPdf.value = false

          const baseURL = 'https://cctv-api.desa-sidomukti.com'
          const downloadUrl = `${baseURL}/finance/export-pdf/download/${taskId}`

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
  const flowData = cashflow.value

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
        let html = `<div style="font-weight:700;margin-bottom:4px;color:#0F1A2E">${params[0].axisValue}</div>`
        params.forEach((p: any) => {
          const val = formatRupiah(p.value)
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            <span style="color:#64748B">${p.seriesName}:</span>
            <span style="font-weight:700;color:#1E293B">${val}</span>
          </div>`
        })
        return html
      },
    },
    legend: {
      data: ['Uang Masuk', 'Uang Keluar', 'Arus Kas Bersih'],
      bottom: 0,
      icon: 'circle',
      textStyle: { fontSize: 10, color: '#64748B', fontWeight: 600 }
    },
    grid: { left: 16, right: 16, top: 16, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: flowData.map(d => d.date),
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
        data: flowData.map(d => d.income),
        itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
        barGap: '10%'
      },
      {
        name: 'Uang Keluar',
        type: 'bar',
        data: flowData.map(d => d.expense),
        itemStyle: { color: '#F43F5E', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: 'Arus Kas Bersih',
        type: 'line',
        data: flowData.map(d => d.income - d.expense),
        smooth: true,
        lineStyle: { color: '#047857', width: 2 },
        itemStyle: { color: '#047857' }
      }
    ]
  }
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
