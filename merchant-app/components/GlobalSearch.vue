<template>
  <div class="relative w-full max-w-sm" ref="searchContainer">
    <Icon name="heroicons:magnifying-glass" class="absolute left-3.5 top-2.5 w-4 h-4" style="color: var(--wp-text-secondary);" />
    <input 
      type="text" 
      v-model="searchQuery"
      @focus="isFocused = true"
      placeholder="Cari menu, barang, atau bantuan..." 
      class="w-full pl-10 pr-10 py-2 rounded text-xs transition border outline-none focus:border-[var(--wp-gold)]" 
      style="background-color: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);" 
      @keydown.esc="closeSearch"
    />
    <button v-if="searchQuery" @click="clearSearch" class="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition">
      <Icon name="heroicons:x-mark" class="w-4 h-4" />
    </button>

    <!-- Dropdown -->
    <div 
      v-if="isFocused && searchQuery.trim().length >= 2" 
      class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-[var(--wp-border)] rounded-md shadow-xl overflow-hidden z-[1050] max-h-96 flex flex-col"
    >
      <div v-if="isLoading" class="p-4 flex items-center justify-center text-slate-400">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
      </div>

      <div v-else class="overflow-y-auto">
        <!-- Hasil Menu / Pintasan -->
        <div v-if="menuResults.length > 0" class="border-b border-[var(--wp-border)]">
          <div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50">
            Menu Navigasi
          </div>
          <ul>
            <li v-for="menu in menuResults" :key="menu.path">
              <NuxtLink :to="menu.path" @click="closeSearch" class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <Icon :name="menu.icon" class="w-4 h-4 text-slate-400" />
                <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ menu.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Hasil Barang / Stok -->
        <div v-if="productResults.length > 0">
          <div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50">
            Saran Barang
          </div>
          <ul>
            <li v-for="prod in productResults" :key="prod.uuid">
              <button @click="goToProduct(prod)" class="w-full text-left flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <div class="flex-1 min-w-0 pr-4">
                  <h4 class="text-xs font-bold text-slate-800 dark:text-white truncate">{{ prod.name }}</h4>
                  <p class="text-[10px] text-slate-500 truncate">{{ prod.category_name || 'Tanpa Kategori' }}</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-xs font-bold text-emerald-600">Rp {{ prod.selling_price.toLocaleString('id-ID') }}</span>
                  <p class="text-[10px] text-slate-400">Stok: {{ prod.quantity }}</p>
                </div>
              </button>
            </li>
          </ul>
        </div>

        <!-- State: Tidak ada hasil -->
        <div v-if="menuResults.length === 0 && productResults.length === 0" class="p-6 text-center text-slate-500">
          <Icon name="heroicons:magnifying-glass" class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-xs">Tidak ditemukan hasil untuk "<strong>{{ searchQuery }}</strong>"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '~/utils/api'

const router = useRouter()
const searchContainer = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const isFocused = ref(false)
const isLoading = ref(false)

const productResults = ref<any[]>([])

// Daftar menu statis untuk dicari
const menus = [
  { name: 'Beranda / Dashboard', path: '/', icon: 'heroicons:home' },
  { name: 'Stok Barang (Inventory)', path: '/inventory', icon: 'heroicons:archive-box' },
  { name: 'Laporan Penjualan', path: '/sales-report', icon: 'heroicons:chart-bar' },
  { name: 'Keuangan (Finance)', path: '/finance', icon: 'heroicons:banknotes' },
  { name: 'Toko AI / Skill Market', path: '/skill-marketplace', icon: 'heroicons:building-storefront' },
  { name: 'Chat AI Asisten', path: '/chat', icon: 'heroicons:sparkles' },
  { name: 'Pengaturan (Settings)', path: '/settings', icon: 'heroicons:cog-6-tooth' },
  { name: 'Bantuan (Help / FAQ)', path: '/help', icon: 'heroicons:question-mark-circle' },
  { name: 'Profil Pengguna', path: '/profile', icon: 'heroicons:user' },
  { name: 'Notifikasi', path: '/notifikasi', icon: 'heroicons:bell' },
]

// Filter menu berdasarkan kata kunci
const menuResults = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return menus.filter(m => m.name.toLowerCase().includes(q))
})

// Debounce state
let searchTimeout: any = null

watch(searchQuery, (newVal) => {
  const q = newVal.trim()
  productResults.value = [] // Reset result
  
  if (searchTimeout) clearTimeout(searchTimeout)

  if (q.length < 2) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const data = await api.get(`/stocks/suggest`, { params: { q } })
      productResults.value = data || []
    } catch (e) {
      console.error('Failed to search products:', e)
      productResults.value = []
    } finally {
      isLoading.value = false
    }
  }, 350)
})

const closeSearch = () => {
  // Give time for click events on links to trigger before closing
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

const clearSearch = () => {
  searchQuery.value = ''
  isFocused.value = false
}

const goToProduct = (product: any) => {
  clearSearch()
  router.push({ path: '/inventory', query: { search: product.name } })
}

const handleClickOutside = (event: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    isFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
