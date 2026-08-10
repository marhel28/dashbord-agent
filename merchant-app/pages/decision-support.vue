<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="border-b pb-4" style="border-color: var(--wp-navy);">
      <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Keputusan</h1>
      <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
        Rekomendasi tindakan bisnis berdasarkan data toko Anda.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white border p-12 shadow-sm flex flex-col items-center justify-center" style="border-color: var(--wp-border);">
      <div class="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin mb-4" style="border-top-color: var(--wp-gold);" />
      <p class="text-xs font-semibold" style="color: var(--wp-text-secondary);">Menganalisis data bisnis Anda...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white border p-8 shadow-sm text-center" style="border-color: var(--wp-border);">
      <Icon name="heroicons:exclamation-triangle" class="w-10 h-10 mx-auto mb-3" style="color: var(--wp-error);" />
      <p class="text-sm font-bold mb-2" style="color: var(--wp-navy);">Gagal Memuat Rekomendasi</p>
      <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">{{ error }}</p>
      <button
        class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white rounded"
        style="background-color: var(--wp-gold);"
        @click="refresh"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="recommendations.length === 0" class="bg-white border p-12 shadow-sm flex flex-col items-center justify-center" style="border-color: var(--wp-border);">
      <Icon name="heroicons:check-circle" class="w-12 h-12 text-emerald-400 mb-4" />
      <h2 class="text-sm font-bold uppercase tracking-wider mb-2" style="color: var(--wp-navy);">Semua Baik-Baik Saja</h2>
      <p class="text-xs text-center max-w-md leading-relaxed" style="color: var(--wp-text-secondary);">
        Tidak ada rekomendasi mendesak saat ini. Stok dan penjualan dalam kondisi sehat.
      </p>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Summary Banner -->
      <div class="bg-white border p-4 shadow-sm" style="border-color: var(--wp-border);">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-bold" style="color: var(--wp-navy);">
              {{ data?.total ?? 0 }} Rekomendasi Tindakan
            </p>
            <p class="text-[10px] font-semibold mt-0.5" style="color: var(--wp-text-secondary);">
              Berdasarkan analisis data penjualan, stok, dan keuangan
            </p>
          </div>
          <button
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded flex items-center gap-1.5 transition-all hover:bg-slate-50"
            style="border-color: var(--wp-border); color: var(--wp-navy);"
            @click="refresh"
          >
            <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
        <!-- Quick Stats -->
        <div class="grid grid-cols-3 gap-3 mt-3 pt-3 border-t" style="border-color: var(--wp-border);">
          <div class="text-center">
            <div class="text-lg font-black" style="color: var(--wp-error);">{{ restockCount }}</div>
            <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Restock</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-black" style="color: var(--wp-warning);">{{ promoCount }}</div>
            <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Promosi</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-black" style="color: var(--wp-success);">{{ priceCount }}</div>
            <div class="text-[9px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Optimasi Harga</div>
          </div>
        </div>
      </div>

      <!-- High Priority Section -->
      <div v-if="highPriority.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-2 h-2 rounded-full" style="background-color: var(--wp-error);" />
          <h2 class="text-xs font-bold uppercase tracking-wider" style="color: var(--wp-error);">
            Prioritas Tinggi ({{ highPriority.length }})
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DecisionCard
            v-for="rec in highPriority"
            :key="rec.product_uuid + rec.action_type"
            :recommendation="rec"
            @action="handleAction"
          />
        </div>
      </div>

      <!-- Medium Priority Section -->
      <div v-if="mediumPriority.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-2 h-2 rounded-full" style="background-color: var(--wp-warning);" />
          <h2 class="text-xs font-bold uppercase tracking-wider" style="color: var(--wp-warning);">
            Perlu Tindakan ({{ mediumPriority.length }})
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DecisionCard
            v-for="rec in mediumPriority"
            :key="rec.product_uuid + rec.action_type"
            :recommendation="rec"
            @action="handleAction"
          />
        </div>
      </div>

      <!-- Low Priority Section -->
      <div v-if="lowPriority.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-2 h-2 rounded-full" style="background-color: #3B82F6;" />
          <h2 class="text-xs font-bold uppercase tracking-wider" style="color: #3B82F6;">
            Optimasi ({{ lowPriority.length }})
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DecisionCard
            v-for="rec in lowPriority"
            :key="rec.product_uuid + rec.action_type"
            :recommendation="rec"
            @action="handleAction"
          />
        </div>
      </div>

      <!-- Opportunities Section -->
      <div v-if="opportunities.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-2 h-2 rounded-full" style="background-color: var(--wp-success);" />
          <h2 class="text-xs font-bold uppercase tracking-wider" style="color: var(--wp-success);">
            Peluang ({{ opportunities.length }})
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DecisionCard
            v-for="rec in opportunities"
            :key="rec.product_uuid + rec.action_type"
            :recommendation="rec"
            @action="handleAction"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDecisionSupport } from '~/composables/useDecisionSupport'
import DecisionCard from '~/components/DecisionCard.vue'
import type { Recommendation } from '~/composables/useDecisionSupport'

const {
  data,
  loading,
  error,
  recommendations,
  highPriority,
  mediumPriority,
  lowPriority,
  opportunities,
  restockCount,
  promoCount,
  priceCount,
  refresh,
} = useDecisionSupport()

function handleAction(rec: Recommendation) {
  // Route to the appropriate action based on CTA type
  switch (rec.cta.action) {
    case 'restock':
      navigateTo(`/inventory?highlight=${rec.product_uuid}`)
      break
    case 'promo':
      navigateTo(`/marketing?product=${rec.product_uuid}`)
      break
    case 'promote':
      navigateTo(`/marketing?product=${rec.product_uuid}`)
      break
    case 'price_analysis':
      navigateTo(`/inventory?highlight=${rec.product_uuid}`)
      break
    case 'view_product':
      navigateTo(`/inventory?highlight=${rec.product_uuid}`)
      break
    default:
      navigateTo(`/inventory?highlight=${rec.product_uuid}`)
  }
}

onMounted(() => {
  refresh()
})
</script>
