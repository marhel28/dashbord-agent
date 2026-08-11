<template>
  <div class="bg-white border border-[var(--wp-border)] rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-[var(--wp-gold)] group">
    <!-- Product Image -->
    <div class="aspect-[4/3] bg-slate-100 relative overflow-hidden">
      <img
        v-if="product.photo_url"
        :src="product.photo_url"
        :alt="product.product_name"
        class="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon name="heroicons:photo" class="w-10 h-10 text-slate-300" />
      </div>
      <!-- Category badge -->
      <span v-if="product.category" class="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90" style="color: var(--wp-navy);">
        {{ product.category }}
      </span>
      <!-- Stock indicator -->
      <span
        class="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
        :style="`background: ${product.stock_quantity > 10 ? '#10B981' : product.stock_quantity > 0 ? '#F59E0B' : '#EF4444'}`"
        :title="`Stok: ${product.stock_quantity}`"
      ></span>
    </div>

    <!-- Product Info -->
    <div class="p-3">
      <h3 class="text-xs font-bold truncate" style="color: var(--wp-text);">
        {{ product.product_name }}
      </h3>
      <div class="flex items-baseline justify-between mt-1.5">
        <span class="text-sm font-black" style="color: var(--wp-gold); font-family: var(--wp-font-mono, monospace);">
          Rp {{ formatPrice(product.price) }}
        </span>
        <span class="text-[10px] text-slate-400">/{{ product.unit }}</span>
      </div>

      <!-- Add Button -->
      <button
        @click="$emit('add', product)"
        :disabled="product.stock_quantity <= 0"
        class="mt-2.5 w-full py-1.5 rounded text-xs font-bold transition-all flex items-center justify-center gap-1"
        :style="product.stock_quantity > 0
          ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;'
          : 'background: #E2E8F0; color: #94A3B8; cursor: not-allowed;'"
      >
        <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
        {{ product.stock_quantity > 0 ? 'Tambah' : 'Habis' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicProduct } from '~/composables/usePublicApi'

defineProps<{
  product: PublicProduct
}>()

defineEmits<{
  add: [product: PublicProduct]
}>()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}
</script>
