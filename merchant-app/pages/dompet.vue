<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-navy);">Dompet</h1>
      <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">Pantau penghasilan dan performa dompet Anda.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 rounded-full border-4 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Balance Card -->
      <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Saldo Tersedia</p>
            <p class="text-3xl font-extrabold tracking-tight mt-1" style="color: var(--wp-navy); font-variant-numeric: tabular-nums;">
              Rp {{ formatRupiah(performance?.balance || 0) }}
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, rgba(5,150,105,0.12), rgba(5,150,105,0.05));">
            <Icon name="heroicons:wallet" class="w-6 h-6" style="color: #059669;" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-5">
          <div class="p-3 rounded-xl" style="background: rgba(5,150,105,0.06);">
            <p class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Total Pendapatan</p>
            <p class="text-lg font-extrabold mt-1" style="color: #059669;">Rp {{ formatRupiah(performance?.total_earned || 0) }}</p>
          </div>
          <div class="p-3 rounded-xl" style="background: var(--wp-bg);">
            <p class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Total Transaksi</p>
            <p class="text-lg font-extrabold mt-1" style="color: var(--wp-text);">{{ performance?.transaction_count || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Daily Income Chart -->
      <div v-if="dailyIncomeOption" class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
        <h2 class="text-base font-bold mb-1" style="color: var(--wp-text);">Tren Pendapatan (30 Hari)</h2>
        <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Penghasilan harian dari transaksi</p>
        <VChart :option="dailyIncomeOption" autoresize class="h-48" />
      </div>

      <!-- Recent Transactions -->
      <div class="bg-white rounded-2xl border p-6 shadow-sm" style="border-color: var(--wp-border);">
        <div class="flex items-center justify-between pb-4 border-b" style="border-color: var(--wp-border);">
          <h2 class="text-base font-bold" style="color: var(--wp-text);">Riwayat Transaksi</h2>
          <span class="text-[10px] font-bold" style="color: var(--wp-text-secondary);">
            {{ performance?.recent_transactions?.length || 0 }} transaksi terakhir
          </span>
        </div>

        <div v-if="!performance?.recent_transactions?.length" class="py-12 text-center">
          <Icon name="heroicons:banknotes" class="w-10 h-10 mx-auto mb-3" style="color: var(--wp-border);" />
          <p class="text-sm font-medium" style="color: var(--wp-text-secondary);">Belum ada transaksi</p>
          <p class="text-xs mt-1" style="color: var(--wp-text-secondary);">Penghasilan dari setiap transaksi akan muncul di sini.</p>
        </div>

        <div v-else class="divide-y" style="border-color: var(--wp-border);">
          <div
            v-for="txn in performance.recent_transactions"
            :key="txn.uuid"
            class="flex items-center justify-between py-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :style="txn.type === 'CREDIT' ? 'background: rgba(5,150,105,0.1);' : 'background: rgba(239,68,68,0.1);'"
              >
                <Icon
                  :name="txn.type === 'CREDIT' ? 'heroicons:arrow-down' : 'heroicons:arrow-up'"
                  class="w-4 h-4"
                  :style="txn.type === 'CREDIT' ? 'color: #059669;' : 'color: #EF4444;'"
                />
              </div>
              <div>
                <p class="text-xs font-bold" style="color: var(--wp-text);">
                  {{ txn.description || (txn.type === 'CREDIT' ? 'Pendapatan' : 'Penarikan') }}
                </p>
                <p class="text-[10px]" style="color: var(--wp-text-secondary);">
                  {{ formatDate(txn.created_at) }}
                </p>
              </div>
            </div>
            <span
              class="text-sm font-bold font-mono"
              :style="txn.type === 'CREDIT' ? 'color: #059669;' : 'color: #EF4444;'"
            >
              {{ txn.type === 'CREDIT' ? '+' : '-' }}Rp {{ formatRupiah(txn.amount) }}
            </span>
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
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { useWallet } from '~/composables/useWallet'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const { performance, loading, fetchPerformance } = useWallet()

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

const dailyIncomeOption = computed(() => {
  const daily = performance.value?.daily_income
  if (!daily || daily.length === 0) return null

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      borderRadius: 8,
      padding: [8, 12],
      textStyle: { color: '#1E293B', fontSize: 12 },
      formatter: (params: any) => {
        const p = params[0]
        const val = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)
        return `<b>${p.axisValue}</b><br/>Pendapatan: <b>${val}</b>`
      },
    },
    grid: { left: 0, right: 8, top: 8, bottom: 20 },
    xAxis: {
      type: 'category',
      data: daily.map((d: any) => d.date.slice(5)), // MM-DD
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 9, fontWeight: 600 },
    },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'bar',
      data: daily.map((d: any) => ({
        value: d.amount,
        itemStyle: { color: '#059669', borderRadius: [4, 4, 0, 0] },
      })),
      barWidth: 12,
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
