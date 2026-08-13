<template>
  <div class="px-4 sm:px-6 py-4 max-w-5xl mx-auto">
    <!-- Search Bar -->
    <div class="relative mb-4">
      <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari produk..."
        class="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[var(--wp-border)] text-sm focus:outline-none focus:border-[var(--wp-gold)] transition"
        style="background: white; color: var(--wp-text);"
      />
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        aria-label="Hapus pencarian"
      >
        <Icon name="heroicons:x-mark" class="w-4 h-4" />
      </button>
    </div>

    <!-- Category Chips -->
    <div v-if="categories.length > 0" class="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
      <button
        @click="selectedCategory = ''"
        class="shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold transition whitespace-nowrap flex items-center justify-center"
        :style="selectedCategory === ''
          ? 'background: var(--wp-navy); color: white;'
          : 'background: white; color: var(--wp-text-secondary); border: 1px solid var(--wp-border);'"
      >
        Semua
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        @click="selectedCategory = cat"
        class="shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold transition whitespace-nowrap flex items-center justify-center"
        :style="selectedCategory === cat
          ? 'background: var(--wp-navy); color: white;'
          : 'background: white; color: var(--wp-text-secondary); border: 1px solid var(--wp-border);'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div v-for="n in 8" :key="n" class="bg-white border border-[var(--wp-border)] rounded-lg overflow-hidden animate-pulse">
        <div class="aspect-[4/3] bg-slate-200"></div>
        <div class="p-3 space-y-2">
          <div class="h-3 bg-slate-200 rounded w-3/4"></div>
          <div class="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else-if="displayProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <ProductCard
        v-for="product in displayProducts"
        :key="product.uuid"
        :product="product"
        @add="$emit('add', $event)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <Icon name="heroicons:shopping-bag" class="w-12 h-12 mx-auto text-slate-300" />
      <p class="text-sm font-bold mt-3" style="color: var(--wp-text-secondary);">
        {{ searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk' }}
      </p>
      <p class="text-xs mt-1 text-slate-400">
        {{ searchQuery ? 'Coba kata kunci lain' : 'Pedagang belum menambahkan produk' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PublicProduct } from '~/composables/usePublicApi'
import ProductCard from './ProductCard.vue'

const props = defineProps<{
  products: PublicProduct[]
  loading: boolean
  merchantUuid: string
}>()

defineEmits<{
  add: [product: PublicProduct]
}>()

const searchQuery = ref('')
const selectedCategory = ref('')

// Derive categories from products
const categories = computed(() => {
  const cats = new Set<string>()
  props.products.forEach(p => {
    if (p.category) cats.add(p.category)
  })
  return Array.from(cats).sort()
})

// Client-side relevance scoring (AND semantics, field-weighted)
function scoreProduct(product: PublicProduct, words: string[]): number {
  const name = product.product_name.toLowerCase()
  const cat = (product.category ?? '').toLowerCase()
  const desc = (product.description ?? '').toLowerCase()
  const unit = product.unit.toLowerCase()
  let total = 0
  for (const w of words) {
    let ws = 0
    if (name.includes(w)) {
      ws = 10
      if (name.startsWith(w)) ws += 3
    } else if (cat.includes(w)) {
      ws = 4
    } else if (desc.includes(w)) {
      ws = 2
    } else if (unit.includes(w)) {
      ws = 1
    } else {
      return 0 // AND semantics: one word misses → exclude
    }
    total += ws
  }
  return total
}

// Combine category + search filters (intersection, not either/or)
const displayProducts = computed(() => {
  let pool = props.products

  // Category filter first (narrows the pool)
  if (selectedCategory.value) {
    pool = pool.filter(p => p.category === selectedCategory.value)
  }

  // Search filter over the (already category-filtered) pool
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return pool
  const words = q.split(/\s+/).filter(Boolean)
  return pool
    .map(p => ({ p, s: scoreProduct(p, words) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map(x => x.p)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
