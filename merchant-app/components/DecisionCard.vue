<template>
  <!-- Guard: only render if recommendation exists -->
  <div
    v-if="recommendation"
    class="bg-white border p-5 shadow-sm transition-all hover:shadow-md"
    :style="{ borderColor: 'var(--wp-border)' }"
  >

    <!-- Header: Action Badge + Priority -->
    <div class="flex items-start justify-between mb-3 mt-1">
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded"
          :style="{ backgroundColor: badgeBg, color: badgeColor }"
        >
          {{ actionTypeLabel }}
        </span>
        <span
          v-if="recommendation.priority_level === 'CRITICAL'"
          class="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded animate-pulse"
          style="background-color: #FEF2F2; color: #DC2626;"
        >
          CRITICAL
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-black" :style="{ color: priorityColor }">
          P{{ recommendation.priority }}
        </span>
      </div>
    </div>

    <!-- Product Name + Subtitle -->
    <h3 class="text-sm font-bold mb-0.5 uppercase" style="color: var(--wp-navy);">
      {{ recommendation.product_name }}
    </h3>
    <p class="text-[10px] font-semibold mb-3" style="color: var(--wp-text-secondary);">
      <template v-if="recommendation.metrics">
        Stok {{ recommendation.metrics.stock_qty ?? 0 }} pcs &bull;
        {{ (recommendation.metrics.days_of_inventory ?? 999) < 999 ? (recommendation.metrics.days_of_inventory ?? 0).toFixed(1) + ' hari persediaan' : 'tanpa pergerakan' }}
        &bull; Margin {{ (recommendation.metrics.margin_pct ?? 0).toFixed(0) }}%
      </template>
      <template v-else>Data metrik tidak tersedia</template>
    </p>

    <!-- Score Bars -->
    <div v-if="recommendation.scores" class="space-y-1.5 mb-3">
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-semibold uppercase tracking-wider w-14 shrink-0" style="color: var(--wp-text-secondary);">Impact</span>
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all" :style="{ width: `${recommendation.scores.impact ?? 0}%`, backgroundColor: 'var(--wp-error)' }" />
        </div>
        <span class="text-[10px] font-bold w-6 text-right" style="color: var(--wp-error);">{{ recommendation.scores.impact ?? 0 }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-semibold uppercase tracking-wider w-14 shrink-0" style="color: var(--wp-text-secondary);">Urgency</span>
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all" :style="{ width: `${recommendation.scores.urgency ?? 0}%`, backgroundColor: 'var(--wp-warning)' }" />
        </div>
        <span class="text-[10px] font-bold w-6 text-right" style="color: var(--wp-warning);">{{ recommendation.scores.urgency ?? 0 }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-semibold uppercase tracking-wider w-14 shrink-0" style="color: var(--wp-text-secondary);">Conf</span>
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all" :style="{ width: `${recommendation.confidence ?? 0}%`, backgroundColor: confidenceBarColor }" />
        </div>
        <span class="text-[10px] font-bold w-6 text-right" :style="{ color: confidenceBarColor }">{{ recommendation.confidence ?? 0 }}%</span>
      </div>
    </div>

    <!-- Expected Impact -->
    <div class="p-2.5 mb-3 rounded" :style="{ backgroundColor: impactBg }">
      <div class="flex items-center gap-1.5 mb-0.5">
        <Icon name="heroicons:currency-dollar" class="w-3.5 h-3.5" :style="{ color: impactIconColor }" />
        <span class="text-[9px] font-bold uppercase tracking-wider" :style="{ color: impactIconColor }">
          {{ impactLabel }}
        </span>
      </div>
      <p class="text-xs font-bold" :style="{ color: impactIconColor }">
        {{ impactText }}
      </p>
    </div>

    <!-- Expected Outcome -->
    <p v-if="recommendation.expected_outcome" class="text-[10px] leading-relaxed mb-3 px-1" style="color: var(--wp-text);">
      <span class="font-semibold">Hasil:</span> {{ recommendation.expected_outcome }}
    </p>

    <!-- Evidence (expandable) -->
    <div v-if="(recommendation.evidence || []).length > 0" class="mb-3">
      <button
        class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors"
        style="color: var(--wp-navy);"
        @click="showEvidence = !showEvidence"
      >
        <Icon :name="showEvidence ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-3 h-3" />
        Mengapa? ({{ (recommendation.evidence || []).length }} alasan)
      </button>
      <div v-if="showEvidence" class="mt-2 pl-4 space-y-1">
        <div
          v-for="(ev, i) in (recommendation.evidence || [])"
          :key="i"
          class="text-[10px] flex items-start gap-1.5"
          style="color: var(--wp-text-secondary);"
        >
          <Icon name="heroicons:check-circle" class="w-3 h-3 shrink-0 mt-0.5" style="color: var(--wp-success);" />
          <span>{{ ev }}</span>
        </div>
        <!-- Confidence Factors -->
        <div v-if="(recommendation.confidence_factors || []).length > 0" class="pt-2 mt-2 border-t" style="border-color: var(--wp-border);">
          <p class="text-[9px] font-bold uppercase tracking-wider mb-1" style="color: var(--wp-text-secondary);">
            Confidence Factors:
          </p>
          <div
            v-for="(cf, i) in (recommendation.confidence_factors || [])"
            :key="i"
            class="text-[10px]"
            style="color: var(--wp-text-secondary);"
          >
            &bull; {{ cf }}
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendation Text -->
    <div v-if="recommendation.recommendation_text" class="mb-3 p-2 bg-slate-50 rounded">
      <p class="text-[10px] font-semibold" style="color: var(--wp-navy);">
        {{ recommendation.recommendation_text }}
      </p>
    </div>

    <!-- Multi-CTA Buttons -->
    <div v-if="(recommendation.cta || []).length > 0" class="flex gap-2 flex-wrap">
      <button
        v-for="cta in (recommendation.cta || [])"
        :key="cta.action"
        class="flex-1 min-w-[80px] py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-[0.98] rounded"
        :style="{ backgroundColor: ctaColor }"
        @click="$emit('action', recommendation, cta)"
      >
        {{ cta.label }}
      </button>
    </div>

    <!-- Data Freshness -->
    <div class="flex items-center justify-end mt-2 pt-2 border-t" style="border-color: var(--wp-border);">
      <span class="text-[9px] font-semibold flex items-center gap-1" style="color: var(--wp-text-secondary);">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {{ recommendation.data_freshness || 'Data terbaru' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Recommendation } from '~/composables/useDecisionSupport'

const props = defineProps<{
  recommendation: Recommendation
}>()

defineEmits<{
  action: [recommendation: Recommendation, cta: { label: string; action: string }]
}>()

const showEvidence = ref(false)

// ── Action type styling ──────────────────────────────────────────

interface ActionStyle {
  bg: string
  color: string
  cta: string
  label: string
  accent: string
  impactBg: string
  impactIcon: string
  impactLabel: string
}

const ACTION_STYLES: Record<string, ActionStyle> = {
  RESTOCK: {
    bg: '#FEF2F2', color: '#DC2626', cta: '#DC2626', label: 'Restock',
    accent: '#DC2626', impactBg: '#FEF2F2', impactIcon: '#DC2626',
    impactLabel: 'Potensi Kehilangan',
  },
  OVERSTOCK: {
    bg: '#FFF7ED', color: '#EA580C', cta: '#EA580C', label: 'Overstock',
    accent: '#EA580C', impactBg: '#FFF7ED', impactIcon: '#EA580C',
    impactLabel: 'Modal Tertahan',
  },
  PROMOTION: {
    bg: '#FEF3C7', color: '#D97706', cta: '#D97706', label: 'Promosi',
    accent: '#D97706', impactBg: '#FEF3C7', impactIcon: '#D97706',
    impactLabel: 'Potensi Recovery',
  },
  PRICE_OPTIMIZATION: {
    bg: '#EFF6FF', color: '#2563EB', cta: '#2563EB', label: 'Optimasi Harga',
    accent: '#2563EB', impactBg: '#EFF6FF', impactIcon: '#2563EB',
    impactLabel: 'Potensi Laba',
  },
  OPPORTUNITY: {
    bg: '#ECFDF5', color: '#059669', cta: '#059669', label: 'Peluang',
    accent: '#059669', impactBg: '#ECFDF5', impactIcon: '#059669',
    impactLabel: 'Potensi Revenue',
  },
  PROMOTE: {
    bg: '#ECFDF5', color: '#059669', cta: '#059669', label: 'Promosikan',
    accent: '#059669', impactBg: '#ECFDF5', impactIcon: '#059669',
    impactLabel: 'Potensi Growth',
  },
}

const defaultStyle: ActionStyle = {
  bg: '#F1F5F9', color: '#64748B', cta: '#64748B', label: 'Lainnya',
  accent: '#64748B', impactBg: '#F8FAFC', impactIcon: '#64748B',
  impactLabel: 'Dampak',
}

const style = computed(() => ACTION_STYLES[props.recommendation.action_type] ?? defaultStyle)

const badgeBg = computed(() => style.value.bg)
const badgeColor = computed(() => style.value.color)
const ctaColor = computed(() => style.value.cta)
const actionTypeLabel = computed(() => style.value.label)
const accentColor = computed(() => style.value.accent)
const impactBg = computed(() => style.value.impactBg)
const impactIconColor = computed(() => style.value.impactIcon)
const impactLabel = computed(() => style.value.impactLabel)

const priorityColor = computed(() => {
  const p = props.recommendation.priority ?? 0
  if (p >= 80) return 'var(--wp-error)'
  if (p >= 60) return 'var(--wp-warning)'
  if (p >= 40) return '#3B82F6'
  return 'var(--wp-success)'
})

const confidenceBarColor = computed(() => {
  const c = props.recommendation.confidence ?? 0
  if (c >= 80) return 'var(--wp-success)'
  if (c >= 50) return 'var(--wp-warning)'
  return 'var(--wp-error)'
})

const impactText = computed(() => {
  const rp = props.recommendation.expected_impact_rupiah
  if (!rp || typeof rp !== 'number' || rp <= 0) return 'Perlu analisis lanjut'
  return `Rp ${rp.toLocaleString('id-ID')}`
})
</script>
