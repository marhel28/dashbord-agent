<template>
  <div class="relative w-full max-w-sm" ref="searchContainer">
    <Icon name="lucide:search" class="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
    <input 
      type="text" 
      v-model="searchQuery"
      @focus="isFocused = true"
      placeholder="Cari menu, pedagang, wilayah, atau status..." 
      class="w-full pl-10 pr-10 py-2 rounded-lg text-xs transition border outline-none bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20" 
      @keydown.esc="closeSearch"
    />
    <button v-if="searchQuery" @click="clearSearch" class="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
      <Icon name="lucide:x" class="w-4 h-4" />
    </button>

    <!-- Dropdown -->
    <div 
      v-if="isFocused && searchQuery.trim().length >= 2" 
      class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[1050] max-h-96 flex flex-col"
    >
      <div v-if="isLoading" class="p-4 flex items-center justify-center text-slate-400">
        <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin text-emerald-500" />
      </div>

      <div v-else class="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
        <!-- Hasil Menu / Pintasan -->
        <div v-if="menuResults.length > 0">
          <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
            Navigasi Pintas
          </div>
          <ul>
            <li v-for="menu in menuResults" :key="menu.path">
              <NuxtLink :to="menu.path" @click="closeSearch" class="flex items-center gap-3 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <Icon :name="menu.icon" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ menu.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Hasil Merchant / Toko dengan Informasi Lengkap -->
        <div v-if="merchantResults.length > 0">
          <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
            Data Mitra Pedagang
          </div>
          <ul>
            <li v-for="m in merchantResults" :key="m.uuid">
              <button @click="goToMerchant(m)" class="w-full text-left flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <div class="flex-1 min-w-0 pr-3">
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ m.store_name || m.name }}</h4>
                    <span v-if="m.category_store" class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {{ m.category_store }}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                    {{ m.address || m.phone_number || m.email || 'Jawa Tengah' }}
                  </p>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border" :class="m.is_verified !== false ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-500/20'">
                    {{ m.is_verified !== false ? 'VERIFIED' : 'PENDING' }}
                  </span>
                </div>
              </button>
            </li>
          </ul>
        </div>

        <!-- State: Tidak ada hasil -->
        <div v-if="menuResults.length === 0 && merchantResults.length === 0" class="p-6 text-center text-slate-500 dark:text-slate-400">
          <Icon name="lucide:search-x" class="w-7 h-7 mx-auto mb-1.5 opacity-40" />
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
const merchantResults = ref<any[]>([])

const menus = [
  { name: 'Command Center', path: '/', icon: 'lucide:layout-dashboard' },
  { name: 'Semua Pedagang', path: '/merchants', icon: 'lucide:store' },
  { name: '+ Tambah Pedagang Baru', path: '/merchants/new', icon: 'lucide:user-plus' },
  { name: 'Verifikasi Menunggu (Pending Queue)', path: '/merchants/pending', icon: 'lucide:shield-alert' },
  { name: 'Peta Sebaran & Klaster', path: '/merchants/map', icon: 'lucide:map' },
  { name: 'AI & Bot Copilot Systems', path: '/ai', icon: 'lucide:sparkles' },
  { name: 'Pusat Analitik Bisnis', path: '/analytics', icon: 'lucide:bar-chart-3' },
  { name: 'Integrasi Ekosistem & Webhook', path: '/integrations', icon: 'lucide:share-2' },
  { name: 'Kesehatan & Status Sistem', path: '/system', icon: 'lucide:server' },
  { name: 'Pengaturan Admin', path: '/settings', icon: 'lucide:settings' },
  { name: 'Profil Administrator', path: '/profile', icon: 'lucide:user' },
]

const menuResults = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return menus.filter(m => m.name.toLowerCase().includes(q))
})

let searchTimeout: any = null

watch(searchQuery, (newVal) => {
  const q = newVal.trim()
  merchantResults.value = []
  
  if (searchTimeout) clearTimeout(searchTimeout)

  if (q.length < 2) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const data: any = await api.get(`/admin/merchants?q=${encodeURIComponent(q)}&limit=6`)
      merchantResults.value = data?.data || data?.merchants || data || []
    } catch (e) {
      merchantResults.value = []
    } finally {
      isLoading.value = false
    }
  }, 300)
})

const closeSearch = () => {
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

const clearSearch = () => {
  searchQuery.value = ''
  isFocused.value = false
}

const goToMerchant = (m: any) => {
  clearSearch()
  router.push(`/merchants/${m.uuid || m.id}`)
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
