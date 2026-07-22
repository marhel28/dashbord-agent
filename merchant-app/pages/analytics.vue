<template>
  <div class="h-full flex flex-col space-y-4">
    <!-- Header -->
    <div class="flex-shrink-0 flex items-center justify-between border-b pb-3" style="border-color: var(--wp-border);">
      <div>
        <h1 class="text-xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Kecerdasan Bisnis</h1>
        <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
          Insight operasional toko. Pilih rentang waktu analisis.
        </p>
      </div>
      
      <div class="flex items-center gap-2">
        <input type="date" v-model="startDate" class="px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500" style="border-color: var(--wp-border); color: var(--wp-text);" />
        <span class="text-xs text-slate-500">-</span>
        <input type="date" v-model="endDate" class="px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500" style="border-color: var(--wp-border); color: var(--wp-text);" />
        <button @click="loadData" class="px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-all" style="background: var(--wp-gold);">Terapkan</button>
      </div>
    </div>

    <!-- Content area: 2 columns -->
    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4 pr-1">
      
      <!-- Left Column: Peak Hours & Fast Moving -->
      <div class="flex flex-col gap-4">
        <!-- Peak Hours -->
        <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 mb-4 border-b pb-2" style="border-color: var(--wp-border);">
            <div class="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <Icon name="heroicons:clock" class="w-4 h-4" />
            </div>
            <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Jam Tersibuk Toko</h2>
          </div>
          
          <div class="flex-1 flex flex-col justify-center">
            <div v-if="loading" class="flex justify-center py-4"><Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin text-slate-300" /></div>
            <div v-else-if="!peakHours.length" class="text-xs text-center text-slate-400 italic">Belum ada data transaksi di periode ini.</div>
            <div v-else class="space-y-3">
              <div v-for="(ph, idx) in peakHours" :key="idx" class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span class="w-4 text-slate-400 text-right">{{ idx + 1 }}.</span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 border text-[11px]">{{ ph.hour }} WIB</span>
                </div>
                <div class="text-xs font-black" style="color: var(--wp-navy);">
                  {{ ph.transaction_count }} Transaksi
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fast Moving -->
        <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 mb-4 border-b pb-2" style="border-color: var(--wp-border);">
            <div class="p-1.5 rounded-md bg-green-50 text-green-600">
              <Icon name="heroicons:rocket-launch" class="w-4 h-4" />
            </div>
            <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Paling Laris Terjual</h2>
          </div>
          
          <div class="flex-1 flex flex-col">
            <div v-if="loading" class="flex justify-center py-4"><Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin text-slate-300" /></div>
            <div v-else-if="!fastMoving.length" class="text-xs text-center text-slate-400 italic">Belum ada data penjualan.</div>
            <div v-else class="space-y-2">
              <div v-for="(item, idx) in fastMoving" :key="idx" class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 gap-2 overflow-hidden">
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-xs font-bold text-slate-700 truncate block">{{ item.product_name }}</span>
                  <span class="text-[10px] text-slate-400">Sisa Stok: {{ item.current_stock }}</span>
                </div>
                <div class="text-xs font-black text-green-600 bg-green-100/50 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                  {{ item.total_sold }} terjual
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Dead Stock -->
      <div class="flex flex-col">
        <div class="bg-white border rounded-xl p-4 shadow-sm h-full flex flex-col relative overflow-hidden" style="border-color: var(--wp-border);">
          <!-- Decorative background -->
          <div class="absolute -right-10 -top-10 text-rose-50 opacity-50 transform rotate-12 pointer-events-none">
            <Icon name="heroicons:archive-box-x-mark" class="w-48 h-48" />
          </div>

          <div class="flex items-center gap-2 mb-4 border-b pb-2 relative z-10" style="border-color: var(--wp-border);">
            <div class="p-1.5 rounded-md bg-rose-50 text-rose-600">
              <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
            </div>
            <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Stok Mati (Dead Stock)</h2>
          </div>
          <p class="text-[10px] text-slate-500 mb-3 relative z-10 font-medium">Barang yang tidak laku sama sekali pada periode ini. Pertimbangkan diskon atau buang agar modal tidak mandek.</p>

          <div class="flex-1 overflow-y-auto pr-1 relative z-10">
            <div v-if="loading" class="flex justify-center py-4"><Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin text-slate-300" /></div>
            <div v-else-if="!deadStock.length" class="flex flex-col items-center justify-center py-10 text-center">
              <Icon name="heroicons:check-badge" class="w-10 h-10 text-emerald-400 mb-2" />
              <span class="text-xs font-bold text-slate-600">Luar Biasa!</span>
              <span class="text-[10px] text-slate-400 mt-1 max-w-[150px]">Tidak ada stok mati. Semua produk Anda laku bulan ini.</span>
            </div>
            <div v-else class="space-y-2">
              <div v-for="(ds, idx) in deadStock" :key="idx" class="flex items-center justify-between p-2 rounded-lg border border-rose-100 bg-white hover:bg-rose-50/30 transition-colors">
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-xs font-bold text-slate-700 truncate block">{{ ds.product_name }}</span>
                  <span class="text-[10px] text-rose-500 font-medium">Mangkrak: {{ ds.stock_quantity }} pcs</span>
                </div>
                <div class="flex flex-col items-end flex-shrink-0 ml-2">
                  <span class="text-[10px] text-slate-400">Modal Terkunci</span>
                  <span class="text-xs font-black text-rose-600">Rp {{ formatCurrencyCompact(ds.total_capital_stuck) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!loading && deadStock.length > 0" class="mt-4 pt-3 border-t relative z-10 flex justify-between items-center" style="border-color: var(--wp-border);">
            <span class="text-xs font-semibold text-slate-500">Total Modal Tertahan:</span>
            <span class="text-sm font-black text-rose-600">Rp {{ formatCurrencyCompact(totalDeadCapital) }}</span>
          </div>

        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '~/utils/api'

interface DeadStockItem {
  product_name: string
  stock_quantity: number
  cost_price: number
  total_capital_stuck: number
}

interface FastMovingItem {
  product_name: string
  current_stock: number
  total_sold: number
}

interface PeakHourItem {
  hour: string
  transaction_count: number
}

const loading = ref(true)
const deadStock = ref<DeadStockItem[]>([])
const fastMoving = ref<FastMovingItem[]>([])
const peakHours = ref<PeakHourItem[]>([])

const startDate = ref('')
const endDate = ref('')

const totalDeadCapital = computed(() => {
  return deadStock.value.reduce((sum, item) => sum + item.total_capital_stuck, 0)
})

const formatCurrencyCompact = (val: number) => {
  return val.toLocaleString('id-ID')
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (startDate.value) params.start_date = startDate.value
    if (endDate.value) params.end_date = endDate.value

    const [resDead, resFast, resPeak] = await Promise.all([
      api.get('/analytics/dead-stock', { params }),
      api.get('/analytics/fast-moving', { params }),
      api.get('/analytics/peak-hours', { params })
    ])
    
    deadStock.value = resDead as DeadStockItem[]
    fastMoving.value = resFast as FastMovingItem[]
    peakHours.value = resPeak as PeakHourItem[]
  } catch (err) {
    console.error("Gagal memuat analitik:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
