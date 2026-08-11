<template>
  <div class="px-4 sm:px-6 py-4 max-w-5xl mx-auto">
    <!-- Search Bar -->
    <div class="relative mb-4">
      <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari produk..."
        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--wp-border)] text-sm focus:outline-none focus:border-[var(--wp-gold)] transition"
        style="background: white; color: var(--wp-text);"
      />
    </div>

    <!-- Category Chips -->
    <div v-if="categories.length > 0" class="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
      <button
        @click="selectedCategory = ''"
        class="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap"
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
        class="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap"
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
import { ref, computed, watch } from 'vue'
import type { PublicProduct } from '~/composables/usePublicApi'
import { publicApi } from '~/composables/usePublicApi'
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
const searchResults = ref<PublicProduct[]>([])
const searching = ref(false)

// Derive categories from products
const categories = computed(() => {
  const cats = new Set<string>()
  props.products.forEach(p => {
    if (p.category) cats.add(p.category)
  })
  return Array.from(cats).sort()
})

// Filter products by category and search
const displayProducts = computed(() => {
  if (searchQuery.value.trim() && searchResults.value.length > 0) {
    return searchResults.value
  }
  if (selectedCategory.value) {
    return props.products.filter(p => p.category === selectedCategory.value)
  }
  return props.products
})

// Debounced search
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!val.trim()) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      const results = await publicApi.searchProducts(props.merchantUuid, val.trim())
      searchResults.value = results
    } catch {
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 400)
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
