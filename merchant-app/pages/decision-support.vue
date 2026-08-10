<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="border-b pb-4" style="border-color: var(--wp-navy);">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Keputusan</h1>
          <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
            Rekomendasi tindakan bisnis berdasarkan data toko Anda.
          </p>
        </div>
        <button
          class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded flex items-center gap-1.5 transition-all hover:bg-slate-50"
          style="border-color: var(--wp-border); color: var(--wp-navy);"
          :disabled="loading"
          @click="refresh"
        >
          <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          Perbarui
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b" style="border-color: var(--wp-border);">
      <div class="flex gap-0">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px"
          :style="activeTab === tab.id
            ? { color: 'var(--wp-gold)', borderBottomColor: 'var(--wp-gold)' }
            : { color: 'var(--wp-text-secondary)', borderBottomColor: 'transparent' }"
          @click="activeTab = tab.id; onTabChange(tab.id)"
        >
          {{ tab.label }}
          <span
            v-if="tab.badge"
            class="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full"
            :style="{ backgroundColor: tab.badgeBg || '#F1F5F9', color: tab.badgeColor || '#64748B' }"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>
    </div>

    <!-- Tab: Rekomendasi -->
    <div v-if="activeTab === 'rekomendasi'">
      <!-- Loading -->
      <div v-if="loading" class="bg-white border p-12 shadow-sm flex flex-col items-center justify-center" style="border-color: var(--wp-border);">
        <div class="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin mb-4" style="border-top-color: var(--wp-gold);" />
        <p class="text-xs font-semibold" style="color: var(--wp-text-secondary);">Menganalisis data bisnis Anda...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white border p-8 shadow-sm text-center" style="border-color: var(--wp-border);">
        <Icon name="heroicons:exclamation-triangle" class="w-10 h-10 mx-auto mb-3" style="color: var(--wp-error);" />
        <p class="text-sm font-bold mb-2" style="color: var(--wp-navy);">Gagal Memuat Rekomendasi</p>
        <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">{{ error }}</p>
        <button class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white rounded" style="background-color: var(--wp-gold);" @click="refresh">
          Coba Lagi
        </button>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Summary Bar -->
        <div class="bg-white border p-4 shadow-sm" style="border-color: var(--wp-border);">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="text-center p-2 rounded" style="background-color: #FEF2F2;">
              <div class="text-lg font-black" style="color: #DC2626;">{{ criticalCount + highCount }}</div>
              <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: #DC2626;">Prioritas</div>
            </div>
            <div class="text-center p-2 rounded" style="background-color: #FFF7ED;">
              <div class="text-lg font-black" style="color: #EA580C;">{{ restockCount }}</div>
              <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: #EA580C;">Restock</div>
            </div>
            <div class="text-center p-2 rounded" style="background-color: #FEF3C7;">
              <div class="text-lg font-black" style="color: #D97706;">{{ promoCount }}</div>
              <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: #D97706;">Promosi</div>
            </div>
            <div class="text-center p-2 rounded" style="background-color: #ECFDF5;">
              <div class="text-lg font-black" style="color: #059669;">{{ opportunityCount }}</div>
              <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: #059669;">Peluang</div>
            </div>
          </div>
        </div>

        <!-- Quick Wins -->
        <div v-if="(quickWins ?? []).length > 0">
          <div class="flex items-center gap-2 mb-3">
            <Icon name="heroicons:bolt" class="w-4 h-4" style="color: var(--wp-gold);" />
            <h2 class="text-xs font-bold uppercase tracking-wider" style="color: var(--wp-gold);">
              Quick Wins ({{ (quickWins ?? []).length }})
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="rec in (quickWins ?? [])"
              :key="'qw_' + rec.product_uuid"
              class="bg-white border p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
              style="border-color: var(--wp-border);"
              @click="scrollToRec(rec)"
            >
              <p class="text-[10px] font-bold uppercase tracking-wider mb-1" :style="{ color: ACTION_COLORS[rec.action_type]?.color || '#64748B' }">
                {{ rec.action_type }}
              </p>
              <p class="text-xs font-bold mb-1" style="color: var(--wp-navy);">{{ rec.product_name }}</p>
              <p class="text-sm font-black" style="color: var(--wp-gold);">
                Rp {{ (rec.expected_impact_rupiah ?? 0).toLocaleString('id-ID') }}
              </p>
              <p class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">{{ rec.recommendation_text || '' }}</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white border p-3 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-for="f in filterTabs"
              :key="f.value"
              class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all"
              :style="filterActionType === f.value
                ? { backgroundColor: 'var(--wp-navy)', color: '#fff' }
                : { backgroundColor: '#F1F5F9', color: 'var(--wp-text-secondary)' }"
              @click="filterActionType = f.value"
            >
              {{ f.label }}
            </button>
            <div class="flex-1" />
            <select
              class="text-[10px] font-semibold border rounded px-2 py-1.5"
              style="border-color: var(--wp-border); color: var(--wp-text);"
              :value="filterPriorityLevel"
              @change="filterPriorityLevel = ($event.target as HTMLSelectElement).value"
            >
              <option value="all">Semua Prioritas</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="OPPORTUNITY">Opportunity</option>
            </select>
          </div>
        </div>

        <!-- Critical Section -->
        <div v-if="(criticalRecs ?? []).length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-2 h-2 rounded-full" style="background-color: #DC2626;" />
            <h2 class="text-xs font-bold uppercase tracking-wider" style="color: #DC2626;">
              CRITICAL ({{ (criticalRecs ?? []).length }})
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DecisionCard v-for="rec in (criticalRecs ?? [])" :key="rec.product_uuid + rec.action_type" :recommendation="rec" @action="handleAction" />
          </div>
        </div>

        <!-- High Priority Section -->
        <div v-if="(highRecs ?? []).length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-2 h-2 rounded-full" style="background-color: #EA580C;" />
            <h2 class="text-xs font-bold uppercase tracking-wider" style="color: #EA580C;">
              Prioritas Tinggi ({{ (highRecs ?? []).length }})
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DecisionCard v-for="rec in (highRecs ?? [])" :key="rec.product_uuid + rec.action_type" :recommendation="rec" @action="handleAction" />
          </div>
        </div>

        <!-- Medium Section -->
        <div v-if="(mediumRecs ?? []).length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-2 h-2 rounded-full" style="background-color: #3B82F6;" />
            <h2 class="text-xs font-bold uppercase tracking-wider" style="color: #3B82F6;">
              Perlu Perhatian ({{ (mediumRecs ?? []).length }})
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DecisionCard v-for="rec in (mediumRecs ?? [])" :key="rec.product_uuid + rec.action_type" :recommendation="rec" @action="handleAction" />
          </div>
        </div>

        <!-- Opportunity Section -->
        <div v-if="(opportunityRecs ?? []).length > 0">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-2 h-2 rounded-full" style="background-color: #059669;" />
            <h2 class="text-xs font-bold uppercase tracking-wider" style="color: #059669;">
              Peluang ({{ (opportunityRecs ?? []).length }})
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DecisionCard v-for="rec in (opportunityRecs ?? [])" :key="rec.product_uuid + rec.action_type" :recommendation="rec" @action="handleAction" />
          </div>
        </div>

        <!-- Empty -->
        <div v-if="filteredRecommendations.length === 0 && !loading" class="bg-white border p-12 shadow-sm text-center" style="border-color: var(--wp-border);">
          <Icon name="heroicons:check-circle" class="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 class="text-sm font-bold uppercase tracking-wider mb-2" style="color: var(--wp-navy);">Semua Baik-Baik Saja</h2>
          <p class="text-xs max-w-md mx-auto" style="color: var(--wp-text-secondary);">Tidak ada rekomendasi mendesak saat ini.</p>
        </div>
      </template>
    </div>

    <!-- Tab: AI Insight -->
    <div v-else-if="activeTab === 'insight'">
      <div class="bg-white border p-6 shadow-sm" style="border-color: var(--wp-border);">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:sparkles" class="w-5 h-5" style="color: var(--wp-gold);" />
            <h2 class="text-sm font-bold uppercase tracking-wider" style="color: var(--wp-navy);">AI Insight</h2>
          </div>
          <button
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded flex items-center gap-1.5"
            style="border-color: var(--wp-border); color: var(--wp-navy);"
            :disabled="insightLoading"
            @click="fetchInsight"
          >
            <Icon name="heroicons:arrow-path" class="w-3 h-3" :class="{ 'animate-spin': insightLoading }" />
            {{ insight ? 'Regenerate' : 'Generate' }}
          </button>
        </div>

        <div v-if="insightLoading" class="flex items-center gap-3 p-4">
          <div class="w-6 h-6 border-2 border-slate-200 rounded-full animate-spin" style="border-top-color: var(--wp-gold);" />
          <p class="text-xs" style="color: var(--wp-text-secondary);">AI sedang menganalisis rekomendasi...</p>
        </div>

        <div v-else-if="insight?.insight" class="p-4 rounded" style="background-color: #FEF3C7;">
          <p class="text-sm leading-relaxed whitespace-pre-line" style="color: var(--wp-text);">{{ insight.insight }}</p>
          <p v-if="insight.generated_at" class="text-[9px] mt-3 font-semibold" style="color: var(--wp-text-secondary);">
            Dihasilkan: {{ insight.generated_at }}
          </p>
        </div>

        <div v-else class="text-center py-8">
          <Icon name="heroicons:light-bulb" class="w-10 h-10 mx-auto mb-3" style="color: var(--wp-gold);" />
          <p class="text-xs" style="color: var(--wp-text-secondary);">Klik "Generate" untuk membuat insight AI</p>
        </div>
      </div>

      <!-- Recommendations under insight -->
      <div v-if="insight?.recommendations?.length" class="mt-4 space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider" style="color: var(--wp-navy);">Rekomendasi Terkait</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DecisionCard v-for="rec in (insight?.recommendations ?? [])" :key="'ins_' + rec.product_uuid + rec.action_type" :recommendation="rec" @action="handleAction" />
        </div>
      </div>
    </div>

    <!-- Tab: Riwayat -->
    <div v-else-if="activeTab === 'riwayat'">
      <div class="bg-white border shadow-sm" style="border-color: var(--wp-border);">
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 p-4 border-b" style="border-color: var(--wp-border);">
          <div class="text-center">
            <div class="text-lg font-black" style="color: var(--wp-success);">{{ doneCount }}</div>
            <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Dijalankan</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-black" style="color: var(--wp-error);">{{ rejectedCount }}</div>
            <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Ditolak</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-black" style="color: var(--wp-navy);">{{ history.length }}</div>
            <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Total</div>
          </div>
        </div>
        <!-- History list -->
        <div v-if="history.length > 0" class="divide-y" style="border-color: var(--wp-border);">
          <div
            v-for="entry in history"
            :key="entry.id"
            class="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                :style="{
                  backgroundColor: entry.status === 'done' ? '#ECFDF5' : entry.status === 'rejected' ? '#FEF2F2' : '#FEF3C7',
                  color: entry.status === 'done' ? '#059669' : entry.status === 'rejected' ? '#DC2626' : '#D97706',
                }"
              >
                {{ entry.status === 'done' ? '✓' : entry.status === 'rejected' ? '✕' : '?' }}
              </span>
              <div>
                <p class="text-xs font-bold" style="color: var(--wp-navy);">{{ entry.product_name }}</p>
                <p class="text-[10px]" style="color: var(--wp-text-secondary);">{{ entry.action_type }} &bull; {{ entry.date }}</p>
              </div>
            </div>
            <span
              class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              :style="{
                backgroundColor: entry.status === 'done' ? '#ECFDF5' : '#FEF2F2',
                color: entry.status === 'done' ? '#059669' : '#DC2626',
              }"
            >
              {{ entry.status === 'done' ? 'Dijalankan' : entry.status === 'rejected' ? 'Ditolak' : 'Ditunda' }}
            </span>
          </div>
        </div>
        <div v-else class="p-8 text-center">
          <Icon name="heroicons:clock" class="w-8 h-8 mx-auto mb-2" style="color: var(--wp-text-secondary);" />
          <p class="text-xs" style="color: var(--wp-text-secondary);">Belum ada riwayat keputusan</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDecisionSupport } from '~/composables/useDecisionSupport'
import DecisionCard from '~/components/DecisionCard.vue'
import type { Recommendation } from '~/composables/useDecisionSupport'

const activeTab = ref('rekomendasi')

const tabs = [
  { id: 'rekomendasi', label: 'Rekomendasi' },
  { id: 'insight', label: 'AI Insight' },
  { id: 'riwayat', label: 'Riwayat' },
]

const filterTabs = [
  { value: 'all', label: 'Semua' },
  { value: 'RESTOCK', label: 'Restock' },
  { value: 'OVERSTOCK', label: 'Overstock' },
  { value: 'PROMOTION', label: 'Promosi' },
  { value: 'PRICE_OPTIMIZATION', label: 'Harga' },
  { value: 'OPPORTUNITY', label: 'Peluang' },
]

const ACTION_COLORS: Record<string, { color: string }> = {
  RESTOCK: { color: '#DC2626' },
  OVERSTOCK: { color: '#EA580C' },
  PROMOTION: { color: '#D97706' },
  PRICE_OPTIMIZATION: { color: '#2563EB' },
  OPPORTUNITY: { color: '#059669' },
  PROMOTE: { color: '#059669' },
}

const {
  loading, insightLoading, error,
  criticalRecs, highRecs, mediumRecs, opportunityRecs, quickWins,
  restockCount, promoCount, criticalCount, highCount, opportunityCount,
  doneCount, rejectedCount, history,
  filterActionType, filterPriorityLevel,
  refresh, fetchInsight, loadHistory,
} = useDecisionSupport()

function onTabChange(tab: string) {
  if (tab === 'riwayat') loadHistory()
}

function handleAction(rec: Recommendation, cta: { label: string; action: string }) {
  if (cta.action === 'restock' || cta.action === 'add_stock') {
    navigateTo(`/inventory?highlight=${rec.product_uuid}`)
  } else if (cta.action === 'promo' || cta.action === 'ai_promo' || cta.action === 'bundle') {
    navigateTo(`/marketing?product=${rec.product_uuid}`)
  } else if (cta.action === 'caption') {
    navigateTo(`/marketing?tab=caption&product=${rec.product_uuid}`)
  } else if (cta.action === 'change_price' || cta.action === 'simulate_price') {
    navigateTo(`/inventory?highlight=${rec.product_uuid}&action=price`)
  } else if (cta.action === 'reduce_restock') {
    navigateTo(`/inventory?highlight=${rec.product_uuid}&action=reduce`)
  } else if (cta.action === 'supplier') {
    navigateTo(`/inventory?tab=supplier&product=${rec.product_uuid}`)
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
