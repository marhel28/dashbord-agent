<template>
  <div
    v-if="recommendation && !isDismissed"
    class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
  >
    <div class="space-y-3">
      <!-- Header: Badges & Dismiss -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 flex-wrap">
          <!-- Action Badge -->
          <span
            class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md"
            :class="badgeClasses"
          >
            {{ actionTypeLabel }}
          </span>

          <!-- Impact/Urgency Badges -->
          <span
            v-if="recommendation.priority_level === 'CRITICAL' || recommendation.priority_level === 'HIGH'"
            class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            Impact Tinggi
          </span>
          <span
            class="px-2 py-0.5 text-[9px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md"
          >
            Mendesak
          </span>
        </div>

        <button
          @click="dismissCard"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 text-[11px] font-medium transition-colors"
          title="Abaikan Rekomendasi Ini"
        >
          <Icon name="lucide:x-circle" class="w-4 h-4" />
        </button>
      </div>

      <!-- Action-Oriented Title & Product Subtitle -->
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
          {{ actionOrientedTitle }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
          <template v-if="recommendation.metrics">
            Stok: {{ recommendation.metrics.stock_qty ?? 0 }} pcs &bull;
            {{ (recommendation.metrics.days_of_inventory ?? 999) < 999 ? (recommendation.metrics.days_of_inventory ?? 0).toFixed(0) + ' Hari Persediaan' : 'Tanpa Pergerakan' }}
            &bull; Margin {{ (recommendation.metrics.margin_pct ?? 0).toFixed(0) }}%
          </template>
        </p>
      </div>

      <!-- Expected Impact & Financial Rupiah Anchor -->
      <div class="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Potensi Keuntungan / Recovery</span>
          <span class="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
            Rp {{ (recommendation.expected_impact_rupiah ?? 0).toLocaleString('id-ID') }}
          </span>
        </div>
        <p class="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
          {{ recommendation.expected_outcome || recommendation.recommendation_text }}
        </p>
      </div>
    </div>

    <!-- Actions: Primary AI CTA + Secondary Detail Drawer Trigger -->
    <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      <Button
        size="sm"
        class="flex-1 bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9"
        @click="$emit('action', recommendation, primaryCta)"
      >
        <Icon name="lucide:sparkles" class="w-3.5 h-3.5" />
        <span>{{ primaryCtaLabel }}</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        class="rounded-lg text-xs font-medium h-9 border-slate-200 dark:border-slate-800"
        @click="$emit('open-detail', recommendation)"
      >
        <span>Lihat Detail</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '~/components/ui/button.vue'

const props = defineProps<{
  recommendation: any
}>()

const emit = defineEmits(['action', 'open-detail'])

const isDismissed = ref(false)

const dismissCard = () => {
  isDismissed.value = true
}

const actionTypeLabel = computed(() => {
  const type = props.recommendation?.action_type
  const map: Record<string, string> = {
    PROMOTION: 'Promosi',
    RESTOCK: 'Restock Stok',
    PRICE_CHANGE: 'Penyesuaian Harga',
    STOP_SALES: 'Hentikan Penjualan',
    CLEARANCE: 'Cuci Gudang',
  }
  return map[type] || type || 'Rekomendasi'
})

const badgeClasses = computed(() => {
  const type = props.recommendation?.action_type
  if (type === 'PROMOTION') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  if (type === 'RESTOCK') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  if (type === 'PRICE_CHANGE') return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
  return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
})

const actionOrientedTitle = computed(() => {
  const rec = props.recommendation
  if (!rec) return ''
  const type = rec.action_type
  const name = rec.product_name

  if (type === 'PROMOTION') return `Stok ${name} Menumpuk, Disarankan Promo`
  if (type === 'RESTOCK') return `${name} Hampir Habis, Segera Restock`
  if (type === 'PRICE_CHANGE') return `Penyesuaian Harga Produk ${name}`
  return `Tindakan Diperlukan untuk ${name}`
})

const primaryCta = computed(() => {
  const ctas = props.recommendation?.cta || []
  return ctas[0] || { action: 'execute', label: 'Terapkan Rekomendasi' }
})

const primaryCtaLabel = computed(() => {
  const type = props.recommendation?.action_type
  if (type === 'PROMOTION') return 'Terapkan Promo AI'
  if (type === 'RESTOCK') return 'Pesan Restock AI'
  return 'Terapkan dengan AI'
})
</script>
