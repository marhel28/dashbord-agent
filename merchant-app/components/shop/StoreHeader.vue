<template>
  <div class="relative overflow-hidden" style="background: linear-gradient(135deg, var(--wp-navy) 0%, #1a2d4d 100%);">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 right-0 w-64 h-64 rounded-full" style="background: var(--wp-gold); transform: translate(30%, -30%);"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 rounded-full" style="background: var(--wp-gold); transform: translate(-30%, 30%);"></div>
    </div>
    <div class="relative px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <!-- Store Photo -->
        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg shrink-0 bg-white">
          <img
            v-if="merchant?.photo_profile"
            :src="merchant.photo_profile"
            :alt="merchant.store_name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-3xl font-black" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;">
            {{ merchant?.store_name?.charAt(0) || 'T' }}
          </div>
        </div>

        <!-- Store Info -->
        <div class="flex-1 text-center sm:text-left">
          <div class="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-black text-white">{{ merchant?.store_name || 'Toko' }}</h1>
            <span v-if="merchant?.is_verified" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style="background: rgba(16, 185, 129, 0.2); color: #6EE7B7;">
              <Icon name="heroicons:check-badge" class="w-3.5 h-3.5" />
              Terverifikasi
            </span>
          </div>
          <p class="text-sm text-white/70 mt-1 max-w-md">{{ merchant?.description || '' }}</p>
          <div class="flex items-center justify-center sm:justify-start gap-3 mt-3 flex-wrap">
            <span class="inline-flex items-center gap-1 text-xs text-white/60">
              <Icon name="heroicons:map-pin" class="w-3.5 h-3.5" />
              {{ merchant?.address || '' }}
            </span>
            <span v-if="merchant?.category_store" class="text-[10px] font-bold px-2 py-0.5 rounded" style="background: rgba(212, 168, 67, 0.2); color: var(--wp-gold);">
              {{ merchant.category_store }}
            </span>
            <span v-if="merchant?.store_type" class="text-[10px] font-bold px-2 py-0.5 rounded" style="background: rgba(255,255,255,0.1); color: white;">
              {{ merchant.store_type }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicMerchantProfile } from '~/composables/usePublicApi'

defineProps<{
  merchant: PublicMerchantProfile | null
}>()
</script>
