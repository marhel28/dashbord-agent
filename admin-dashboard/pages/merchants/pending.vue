<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Menunggu Verifikasi
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tinjau dan setujui pedagang baru sebelum mereka dapat mulai bertransaksi di ekosistem.
        </p>
      </div>

      <div>
        <Button variant="outline" size="sm" class="text-xs h-9 gap-1.5 rounded-lg" @click="fetchMerchants">
          <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Segarkan Data</span>
        </Button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col">
      <div class="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-700/60 flex justify-between items-center bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <h2 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Antrean Persetujuan</h2>
          <Badge variant="secondary" class="font-mono text-[10px]">{{ total }} Menunggu</Badge>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700/60 tracking-wider">
            <tr>
              <th class="px-5 py-3.5">Pedagang</th>
              <th class="px-5 py-3.5">Kategori</th>
              <th class="px-5 py-3.5">Kontak</th>
              <th class="px-5 py-3.5">Tanggal Terdaftar</th>
              <th class="px-5 py-3.5 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr v-if="loading">
              <td colspan="5" class="px-5 py-16 text-center text-slate-400">
                <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                <p class="font-medium">Memuat pedagang yang tertunda...</p>
              </td>
            </tr>
            <tr v-else-if="merchants.length === 0">
              <td colspan="5" class="px-5 py-16 text-center text-slate-400">
                <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Icon name="lucide:check-circle-2" class="w-6 h-6" />
                </div>
                <p class="font-bold text-slate-900 dark:text-slate-100 text-sm">Semua antrean bersih!</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Tidak ada pedagang yang sedang menunggu verifikasi.</p>
              </td>
            </tr>
            <tr v-for="m in merchants" :key="m.uuid" class="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <Avatar class="h-9 w-9 shrink-0">
                    <AvatarImage v-if="m.photo_profile" :src="m.photo_profile" alt="Store" />
                    <AvatarFallback class="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-bold uppercase text-xs">
                      {{ m.name.charAt(0) }}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">{{ m.store_name || m.name }}</p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ m.store_name ? m.name : 'Nama Pemilik Belum Diatur' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 font-medium">
                <Badge variant="outline" class="text-[10px] uppercase font-bold border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  {{ m.category_store || 'TANPA KATEGORI' }}
                </Badge>
              </td>
              <td class="px-5 py-4 text-xs space-y-0.5 font-mono">
                <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Icon name="lucide:mail" class="w-3.5 h-3.5 text-slate-400 shrink-0"/>
                  <span>{{ m.email }}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300" v-if="m.phone_number">
                  <Icon name="lucide:phone" class="w-3.5 h-3.5 text-slate-400 shrink-0"/>
                  <span>{{ m.phone_number }}</span>
                </div>
              </td>
              <td class="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                {{ new Date(m.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex justify-end items-center gap-1.5">
                  <NuxtLink :to="`/merchants/${m.uuid}`">
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100" title="Lihat Detail">
                      <Icon name="lucide:eye" class="w-4 h-4" />
                    </Button>
                  </NuxtLink>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="rejectMerchant(m.uuid)" 
                    :disabled="actionLoading === m.uuid" 
                    class="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" 
                    title="Tolak"
                  >
                    <Icon name="lucide:x" class="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    @click="approveMerchant(m.uuid)" 
                    :disabled="actionLoading === m.uuid" 
                    class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-8 px-3 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <Icon v-if="actionLoading === m.uuid" name="lucide:loader-2" class="w-3 h-3 animate-spin" />
                    <Icon v-else name="lucide:check" class="w-3 h-3" />
                    <span>Setujui</span>
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900/40">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan <span class="font-bold text-slate-900 dark:text-slate-100">{{ merchants.length }}</span> dari <span class="font-bold text-slate-900 dark:text-slate-100">{{ total }}</span> pedagang tertunda
        </p>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="prevPage" :disabled="page === 1" class="text-xs rounded-lg">
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" @click="nextPage" :disabled="page >= totalPages" class="text-xs rounded-lg">
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'

const merchants = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const actionLoading = ref<string | null>(null)

const fetchMerchants = async () => {
  loading.value = true
  try {
    const res = await api.get(`/admin/merchants/pending?page=${page.value}&limit=10`)
    if (res && res.data) {
      merchants.value = res.data
      total.value = res.total
      totalPages.value = res.totalPages
    }
  } catch (err) {
    console.error("Failed to fetch pending merchants", err)
  } finally {
    loading.value = false
  }
}

const approveMerchant = async (uuid: string) => {
  if (!confirm("Apakah Anda yakin ingin menyetujui pedagang ini?")) return
  actionLoading.value = uuid
  try {
    await api.post(`/admin/merchants/${uuid}/approve`, {})
    fetchMerchants()
  } catch (err) {
    console.error("Failed to approve", err)
    alert("Gagal menyetujui pedagang")
  } finally {
    actionLoading.value = null
  }
}

const rejectMerchant = async (uuid: string) => {
  if (!confirm("Apakah Anda yakin ingin MENOLAK dan menghapus permintaan pedagang ini?")) return
  actionLoading.value = uuid
  try {
    await api.post(`/admin/merchants/${uuid}/reject`, {})
    fetchMerchants()
  } catch (err) {
    console.error("Failed to reject", err)
    alert("Gagal menolak pedagang")
  } finally {
    actionLoading.value = null
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchMerchants()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    fetchMerchants()
  }
}

onMounted(() => {
  fetchMerchants()
})
</script>
