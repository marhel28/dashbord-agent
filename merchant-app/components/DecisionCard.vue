<template>
  <div
    class="bg-white border p-5 shadow-sm transition-all hover:shadow-md"
    :style="{ borderColor: 'var(--wp-border)' }"
  >
    <!-- Header: Action Badge + Priority -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded"
          :style="{ backgroundColor: badgeBg, color: badgeColor }"
        >
          {{ actionTypeLabel }}
        </span>
        <span class="text-[10px] font-semibold" style="color: var(--wp-text-secondary);">
          Priority {{ recommendation.priority }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-[10px] font-semibold" style="color: var(--wp-text-secondary);">
          Confidence
        </span>
        <span
          class="text-xs font-bold"
          :style="{ color: confidenceColor }"
        >
          {{ recommendation.confidence }}%
        </span>
      </div>
    </div>

    <!-- Product Name -->
    <h3 class="text-sm font-bold mb-1 uppercase" style="color: var(--wp-navy);">
      {{ recommendation.product_name }}
    </h3>

    <!-- Reason -->
    <p class="text-xs leading-relaxed mb-3" style="color: var(--wp-text-secondary);">
      {{ recommendation.reason }}
    </p>

    <!-- Score Bars -->
    <div class="space-y-2 mb-4">
      <!-- Impact -->
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-semibold uppercase tracking-wider w-16 shrink-0" style="color: var(--wp-text-secondary);">Impact</span>
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full" :style="{ width: `${recommendation.scores.impact}%`, backgroundColor: 'var(--wp-error)' }" />
        </div>
        <span class="text-[10px] font-bold w-6 text-right" style="color: var(--wp-error);">{{ recommendation.scores.impact }}</span>
      </div>
      <!-- Urgency -->
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-semibold uppercase tracking-wider w-16 shrink-0" style="color: var(--wp-text-secondary);">Urgency</span>
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full" :style="{ width: `${recommendation.scores.urgency}%`, backgroundColor: 'var(--wp-warning)' }" />
        </div>
        <span class="text-[10px] font-bold w-6 text-right" style="color: var(--wp-warning);">{{ recommendation.scores.urgency }}</span>
      </div>
      <!-- Confidence -->
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-semibold uppercase tracking-wider w-16 shrink-0" style="color: var(--wp-text-secondary);">Confidence</span>
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full" :style="{ width: `${recommendation.scores.confidence}%`, backgroundColor: 'var(--wp-success)' }" />
        </div>
        <span class="text-[10px] font-bold w-6 text-right" style="color: var(--wp-success);">{{ recommendation.scores.confidence }}</span>
      </div>
    </div>

    <!-- Metrics Row -->
    <div class="grid grid-cols-3 gap-2 mb-4 p-2 bg-slate-50 rounded text-center">
      <div>
        <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Stok</div>
        <div class="text-xs font-bold" style="color: var(--wp-navy);">{{ recommendation.metrics.stock_qty }} pcs</div>
      </div>
      <div>
        <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Hari Habis</div>
        <div class="text-xs font-bold" style="color: var(--wp-navy);">{{ recommendation.metrics.days_of_inventory.toFixed(1) }}</div>
      </div>
      <div>
        <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Margin</div>
        <div class="text-xs font-bold" style="color: var(--wp-navy);">{{ recommendation.metrics.margin_pct.toFixed(0) }}%</div>
      </div>
    </div>

    <!-- CTA Button -->
    <button
      class="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-[0.98] rounded"
      :style="{ backgroundColor: ctaColor }"
      @click="$emit('action', recommendation)"
    >
      {{ recommendation.cta.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recommendation } from '~/composables/useDecisionSupport'

const props = defineProps<{
  recommendation: Recommendation
}>()

defineEmits<{
  action: [recommendation: Recommendation]
}>()

// ── Action type styling ──────────────────────────────────────────

interface ActionStyle {
  bg: string
  color: string
  cta: string
  label: string
}

const ACTION_STYLES: Record<string, ActionStyle> = {
  RESTOCK: {
    bg: '#FEF2F2',
    color: '#DC2626',
    cta: '#DC2626',
    label: 'Restock',
  },
  OVERSTOCK: {
    bg: '#FFF7ED',
    color: '#EA580C',
    cta: '#EA580C',
    label: 'Overstock',
  },
  PROMOTION: {
    bg: '#FEF3C7',
    color: '#D97706',
    cta: '#D97706',
    label: 'Promosi',
  },
  PRICE_OPTIMIZATION: {
    bg: '#EFF6FF',
    color: '#2563EB',
    cta: '#2563EB',
    label: 'Optimasi Harga',
  },
  OPPORTUNITY: {
    bg: '#ECFDF5',
    color: '#059669',
    cta: '#059669',
    label: 'Peluang',
  },
  PROMOTE: {
    bg: '#ECFDF5',
    color: '#059669',
    cta: '#059669',
    label: 'Promosikan',
  },
}

const defaultStyle: ActionStyle = {
  bg: '#F1F5F9',
  color: '#64748B',
  cta: '#64748B',
  label: 'Lainnya',
}

const style = computed(() => ACTION_STYLES[props.recommendation.action_type] ?? defaultStyle)

const badgeBg = computed(() => style.value.bg)
const badgeColor = computed(() => style.value.color)
const ctaColor = computed(() => style.value.cta)
const actionTypeLabel = computed(() => style.value.label)

const confidenceColor = computed(() => {
  const c = props.recommendation.confidence
  if (c >= 80) return 'var(--wp-success)'
  if (c >= 50) return 'var(--wp-warning)'
  return 'var(--wp-error)'
})
</script>
