<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. HEADER & DATA FRESHNESS ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Keputusan (Decision Command Center)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Rekomendasi tindakan bisnis cerdas berbasis data toko aktual Anda.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Analisis Terakhir: {{ lastAnalysisTime }}
        </span>

        <button
          @click="refresh"
          :disabled="loading"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
        >
          <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Perbarui</span>
        </button>
      </div>
    </div>

    <!-- ═══════════ 2. METRIC SUMMARY COUNTERS ═══════════ -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="p-3.5 rounded-xl border border-red-200 bg-red-50/60 dark:bg-red-950/30 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300">Tindakan Critical</span>
          <p class="text-xl font-mono font-bold text-red-700 dark:text-red-400 mt-0.5">{{ criticalCount + highCount }}</p>
        </div>
        <Icon name="lucide:alert-circle" class="w-6 h-6 text-red-500 opacity-80" />
      </div>

      <div class="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/30 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Perlu Restock</span>
          <p class="text-xl font-mono font-bold text-amber-800 dark:text-amber-400 mt-0.5">{{ restockCount }}</p>
        </div>
        <Icon name="lucide:package" class="w-6 h-6 text-amber-500 opacity-80" />
      </div>

      <div class="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:blue-300">Peluang Promo</span>
          <p class="text-xl font-mono font-bold text-blue-800 dark:text-blue-400 mt-0.5">{{ promoCount }}</p>
        </div>
        <Icon name="lucide:tag" class="w-6 h-6 text-blue-500 opacity-80" />
      </div>

      <div class="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Potensi Keuntungan</span>
          <p class="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{{ opportunityCount }}</p>
        </div>
        <Icon name="lucide:trending-up" class="w-6 h-6 text-emerald-500 opacity-80" />
      </div>
    </div>

    <!-- ═══════════ 3. QUICK WINS CAROUSEL ═══════════ -->
    <div v-if="(quickWins ?? []).length > 0" class="p-5 bg-gradient-to-r from-emerald-900 to-[#003B32] text-white rounded-xl shadow-md space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold tracking-wider">Quick Wins</span>
          <h2 class="text-sm font-bold text-white">Tindakan Cepat 1-Klik Hari Ini</h2>
        </div>
        <span class="text-xs text-emerald-200">{{ quickWins.length }} Rekomendasi Teratas</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="rec in quickWins.slice(0, 3)"
          :key="'qw_' + rec.product_uuid"
          @click="openDetailDrawer(rec)"
          class="p-3.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15 cursor-pointer transition-all space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200">
              {{ rec.action_type }}
            </span>
            <span class="text-xs font-mono font-bold text-emerald-300">
              +Rp {{ (rec.expected_impact_rupiah ?? 0).toLocaleString('id-ID') }}
            </span>
          </div>
          <p class="text-xs font-bold text-white truncate">{{ rec.product_name }}</p>
          <p class="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">{{ rec.recommendation_text || rec.expected_outcome }}</p>
        </div>
      </div>
    </div>

    <!-- ═══════════ 4. MAIN DECISION CARDS GRID (PAGINATED TOP 4) ═══════════ -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Daftar Rekomendasi Tindakan (Prioritas Utama)</h2>

        <!-- Action Type Filter Tabs -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="f in filterTabs" :key="f.value"
            @click="filterActionType = f.value"
            :class="['px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              filterActionType === f.value ? 'bg-[#047857] text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900']"
          >{{ f.label }}</button>
        </div>
      </div>

      <!-- SKELETON LOADING -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton class="h-48 rounded-xl" />
        <Skeleton class="h-48 rounded-xl" />
      </div>

      <!-- TRUE EMPTY STATE GUARD (Only rendered when filteredRecommendations.length === 0) -->
      <div v-else-if="filteredRecommendations.length === 0" class="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <Icon name="lucide:check-circle-2" class="w-12 h-12 mx-auto text-emerald-500" />
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Semua Baik-Baik Saja</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Tidak ada rekomendasi tindakan mendesak untuk filter kategori yang Anda pilih.</p>
        </div>
      </div>

      <!-- CARDS LIST -->
      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DecisionCard
            v-for="rec in displayedRecommendations"
            :key="rec.product_uuid + rec.action_type"
            :recommendation="rec"
            @action="handleAction"
            @open-detail="openDetailDrawer"
          />
        </div>

        <!-- Pagination / Load More Button -->
        <div v-if="filteredRecommendations.length > displayLimit" class="pt-4 text-center">
          <Button variant="outline" size="sm" @click="displayLimit += 4" class="rounded-lg text-xs font-semibold px-6">
            Lihat {{ filteredRecommendations.length - displayLimit }} Rekomendasi Lainnya ↓
          </Button>
        </div>
      </template>
    </div>

    <!-- ═══════════ 5. DETAIL SIDE DRAWER (PROGRESSIVE DISCLOSURE) ═══════════ -->
    <Teleport to="body">
      <div v-if="selectedRec" class="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-xs" @click.self="selectedRec = null">
        <div class="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 space-y-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Analisis AI Copilot</span>
                <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">{{ selectedRec.product_name }}</h3>
              </div>
              <button @click="selectedRec = null" class="text-slate-400 hover:text-slate-600">
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <!-- Financial Impact Header Card -->
            <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
              <span class="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Potensi Dampak Keuangan</span>
              <p class="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                Rp {{ (selectedRec.expected_impact_rupiah ?? 0).toLocaleString('id-ID') }}
              </p>
              <p class="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mt-1">
                {{ selectedRec.expected_outcome || selectedRec.recommendation_text }}
              </p>
            </div>

            <!-- AI 5 Reasons / Evidence Section -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Mengapa AI Menyimpulkan Ini?</h4>
              <div class="space-y-2 text-xs">
                <div v-for="(ev, i) in (selectedRec.evidence || [selectedRec.recommendation_text])" :key="i" class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <Icon name="lucide:check-circle-2" class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span class="leading-relaxed">{{ ev }}</span>
                </div>
              </div>
            </div>

            <!-- Product Metrics -->
            <div v-if="selectedRec.metrics" class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span class="font-bold text-slate-900 dark:text-slate-100 block">Metrik Produk Toko</span>
              <div class="grid grid-cols-3 gap-2 text-center pt-1">
                <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span class="text-[10px] text-slate-400 block">Stok</span>
                  <span class="font-bold text-slate-900 dark:text-slate-100 font-mono">{{ selectedRec.metrics.stock_qty || 0 }}</span>
                </div>
                <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span class="text-[10px] text-slate-400 block">Tahan Hari</span>
                  <span class="font-bold text-slate-900 dark:text-slate-100 font-mono">{{ (selectedRec.metrics.days_of_inventory || 0).toFixed(0) }} hr</span>
                </div>
                <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span class="text-[10px] text-slate-400 block">Margin</span>
                  <span class="font-bold text-slate-900 dark:text-slate-100 font-mono">{{ (selectedRec.metrics.margin_pct || 0).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Execute Action -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button class="w-full bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-10" @click="handleAction(selectedRec)">
              Eksekusi Tindakan Ini Sekarang
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DecisionCard from '~/components/DecisionCard.vue'
import Button from '~/components/ui/button.vue'
import Skeleton from '~/components/ui/skeleton.vue'
import { useDecisionSupport } from '~/composables/useDecisionSupport'

const {
  loading,
  quickWins,
  filteredRecommendations,
  criticalCount,
  highCount,
  restockCount,
  promoCount,
  opportunityCount,
  refresh,
  filterActionType,
} = useDecisionSupport()

const displayLimit = ref(4)
const selectedRec = ref<any | null>(null)

const lastAnalysisTime = computed(() => {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`
})

const filterTabs = [
  { label: 'Semua Kategori', value: 'all' },
  { label: 'Promosi', value: 'PROMOTION' },
  { label: 'Restock', value: 'RESTOCK' },
  { label: 'Optimasi Harga', value: 'PRICE_CHANGE' },
]

const displayedRecommendations = computed(() => {
  return (filteredRecommendations.value || []).slice(0, displayLimit.value)
})

const openDetailDrawer = (rec: any) => {
  selectedRec.value = rec
}

const handleAction = (rec: any) => {
  if (rec.action_type === 'PROMOTION') {
    navigateTo(`/marketing?product=${rec.product_uuid}`)
  } else if (rec.action_type === 'RESTOCK') {
    navigateTo(`/inventory?highlight=${rec.product_uuid}`)
  } else if (rec.action_type === 'PRICE_CHANGE') {
    navigateTo(`/inventory?highlight=${rec.product_uuid}&action=price`)
  } else {
    navigateTo(`/inventory?highlight=${rec.product_uuid}`)
  }
}

function scrollToRec(rec: Recommendation) {
  filterActionType.value = 'all'
  filterPriorityLevel.value = 'all'
  // Scroll to the section containing this rec
  const level = rec.priority_level.toLowerCase()
  const el = document.getElementById(`section-${level}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  refresh()
})
</script>
