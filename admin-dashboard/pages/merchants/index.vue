<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Database Pedagang
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola, cari, dan ekspor semua data pedagang yang terdaftar di ekosistem.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink to="/merchants/new">
          <Button class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs h-9 px-4 shadow-xs shadow-emerald-900/20 flex items-center gap-2">
            <Icon name="lucide:user-plus" class="w-4 h-4" />
            <span>+ Tambah Pedagang</span>
          </Button>
        </NuxtLink>
        <Button 
          @click="exportCSV" 
          :disabled="exporting" 
          variant="outline"
          class="rounded-lg text-xs h-9 px-4 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
        >
          <Icon v-if="exporting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:download" class="w-4 h-4" />
          <span>{{ exporting ? 'Mengekspor...' : 'Ekspor CSV' }}</span>
        </Button>
      </div>
    </div>

    <!-- Native Table Container -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col">
      <!-- Search & Filters -->
      <div class="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Daftar Utama Pedagang</h2>
            <Badge variant="outline" class="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
              {{ totalCount }} Pedagang
            </Badge>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola dan telusuri seluruh mitra pedagang terdaftar secara presisi.</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative">
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              v-model="gridSearch" 
              placeholder="Cari nama toko, pemilik, telepon..." 
              class="pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg w-64 sm:w-72 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-2xs" 
            />
          </div>

          <Button variant="outline" size="sm" class="rounded-lg h-9 w-9 p-0 border-slate-200 dark:border-slate-700" @click="fetchMerchants" title="Refresh Data">
            <Icon name="lucide:refresh-cw" class="w-4 h-4" :class="{'animate-spin': loading}" />
          </Button>
        </div>
      </div>
      
      <!-- Table Body -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead class="bg-slate-50/90 dark:bg-slate-900/80 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-700/60 tracking-wider">
            <tr>
              <th class="px-5 py-3.5">Nama Toko & Email</th>
              <th class="px-5 py-3.5">Pemilik</th>
              <th class="px-5 py-3.5">Kategori</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5">Kontak</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr v-if="loading" v-for="i in 5" :key="i">
              <td colspan="6" class="px-5 py-4">
                <Skeleton class="h-8 w-full rounded" />
              </td>
            </tr>

            <tr v-else-if="paginatedMerchants.length === 0">
              <td colspan="6" class="px-5 py-12 text-center text-slate-400">
                <Icon name="lucide:search-x" class="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>Tidak ada pedagang yang cocok dengan kata kunci pencarian.</span>
              </td>
            </tr>

            <tr 
              v-else 
              v-for="m in paginatedMerchants" 
              :key="m.uuid || m.id" 
              class="hover:bg-slate-50/70 dark:hover:bg-slate-700/25 transition-colors cursor-pointer"
              @click="navigateTo(`/merchants/${m.uuid || m.id}`)"
            >
              <!-- Nama Toko -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 border"
                    :style="{ 
                      backgroundColor: getAvatarColor(m.store_name || m.name).bg, 
                      color: getAvatarColor(m.store_name || m.name).text, 
                      borderColor: getAvatarColor(m.store_name || m.name).border 
                    }"
                  >
                    {{ getInitials(m.store_name || m.name) }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-900 dark:text-slate-100 truncate text-[13px]">
                      {{ m.store_name || m.name || 'Merchant Tanpa Nama' }}
                    </div>
                    <div class="text-[11px] text-slate-400 truncate">
                      {{ m.email || m.phone_number || 'Belum ada email' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Pemilik -->
              <td class="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                {{ m.name || '-' }}
              </td>

              <!-- Kategori -->
              <td class="px-5 py-3.5">
                <span v-if="m.category_store" class="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase rounded border border-emerald-500/20">
                  {{ m.category_store }}
                </span>
                <span v-else class="text-slate-400 italic text-[11px]">Tanpa Kategori</span>
              </td>

              <!-- Status -->
              <td class="px-5 py-3.5">
                <span v-if="m.is_verified === false || m.status === 'pending'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-xs"></span>
                  MENUNGGU
                </span>
                <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs"></span>
                  TERVERIFIKASI
                </span>
              </td>

              <!-- Kontak -->
              <td class="px-5 py-3.5 font-mono text-[11.5px] text-slate-600 dark:text-slate-300">
                {{ m.phone_number || '-' }}
              </td>

              <!-- Aksi -->
              <td class="px-5 py-3.5 text-right" @click.stop>
                <NuxtLink :to="`/merchants/${m.uuid || m.id}`">
                  <Button variant="outline" size="sm" class="text-xs h-7 px-2.5 rounded-md gap-1 bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50">
                    <span>Detail</span>
                    <Icon name="lucide:arrow-right" class="w-3 h-3" />
                  </Button>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Menampilkan <span class="font-bold text-slate-900 dark:text-slate-100">{{ (currentPage - 1) * pageSize + 1 }}</span> - 
          <span class="font-bold text-slate-900 dark:text-slate-100">{{ Math.min(currentPage * pageSize, filteredMerchants.length) }}</span> dari 
          <span class="font-bold text-slate-900 dark:text-slate-100">{{ filteredMerchants.length }}</span> pedagang
        </div>

        <div class="flex items-center gap-1.5 self-center sm:self-auto">
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === 1" 
            @click="currentPage--"
            class="h-8 px-2.5 rounded-lg text-xs"
          >
            &larr; Prev
          </Button>

          <span class="px-3 py-1 font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage >= totalPages" 
            @click="currentPage++"
            class="h-8 px-2.5 rounded-lg text-xs"
          >
            Next &rarr;
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'

const merchants = ref<any[]>([])
const loading = ref(true)
const gridSearch = ref('')
const exporting = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)

const filteredMerchants = computed(() => {
  if (!gridSearch.value.trim()) return merchants.value
  const q = gridSearch.value.toLowerCase().trim()
  return merchants.value.filter(m => 
    (m.store_name || '').toLowerCase().includes(q) ||
    (m.name || '').toLowerCase().includes(q) ||
    (m.email || '').toLowerCase().includes(q) ||
    (m.phone_number || '').includes(q) ||
    (m.category_store || '').toLowerCase().includes(q)
  )
})

const totalCount = computed(() => filteredMerchants.value.length)
const totalPages = computed(() => Math.ceil(filteredMerchants.value.length / pageSize.value) || 1)

const paginatedMerchants = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredMerchants.value.slice(start, start + pageSize.value)
})

const getInitials = (name: string) => {
  if (!name) return 'TK'
  return (name.replace(/^(Toko|Warung|Kios)\s+/i, '').substring(0, 2) || 'TK').toUpperCase()
}

const getAvatarColor = (name: string) => {
  const palettes = [
    { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
    { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
    { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.3)' }
  ]
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palettes[Math.abs(hash) % palettes.length]
}

const fetchMerchants = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/admin/merchants?limit=1000')
    if (res && res.data) {
      merchants.value = res.data
    }
  } catch (err) {
    console.error("Failed to load merchants", err)
  } finally {
    loading.value = false
  }
}

const exportCSV = async () => {
  exporting.value = true
  try {
    const res: any = await api.post('/admin/merchants/export-csv', {})
    if (res && res.task_id) {
      pollExport(res.task_id)
    } else {
      exporting.value = false
      alert('Gagal memulai tugas ekspor.')
    }
  } catch (e) {
    console.error(e)
    exporting.value = false
  }
}

const pollExport = async (taskId: string) => {
  try {
    const res: any = await api.get(`/admin/merchants/export-csv/status/${taskId}`)
    if (res.status === 'completed') {
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', `merchants_export_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      exporting.value = false
    } else {
      setTimeout(() => pollExport(taskId), 2000)
    }
  } catch (err) {
    console.error(err)
    exporting.value = false
  }
}

onMounted(() => {
  fetchMerchants()
})
</script>
