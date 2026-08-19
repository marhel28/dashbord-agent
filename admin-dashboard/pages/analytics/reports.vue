<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header with Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Ekspor Laporan & Otomatisasi</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Buat, unduh, dan jadwalkan pengiriman berkas audit ekosistem secara berkala.</p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 custom-scrollbar">
      <NuxtLink to="/analytics" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Overview</NuxtLink>
      <NuxtLink to="/analytics/finance" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Keuangan</NuxtLink>
      <NuxtLink to="/analytics/merchants" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Pedagang</NuxtLink>
      <NuxtLink to="/analytics/ai-usage" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Penggunaan AI</NuxtLink>
      <NuxtLink to="/analytics/catalog" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap">Katalog Produk</NuxtLink>
      <NuxtLink to="/analytics/reports" class="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg whitespace-nowrap shadow-xs">Laporan</NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Report Generators List -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Merchant Export Card -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs flex items-start gap-4 hover:border-emerald-500/50 transition-all">
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Icon name="lucide:users" class="w-7 h-7" />
          </div>
          <div class="flex-1">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Master Data Pedagang Terpadu (CSV)</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">Ekspor seluruh data pedagang terdaftar, status verifikasi, koordinat GPS, dan akumulasi omzet ke format spreadsheet siap olah.</p>
            
            <div v-if="merchantExportState === 'idle'" class="flex gap-2">
              <Button size="sm" @click="triggerMerchantExport" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg gap-2 shadow-xs">
                <Icon name="lucide:play" class="w-3.5 h-3.5" />
                <span>Buat Berkas Sekarang</span>
              </Button>
            </div>
            
            <div v-else-if="merchantExportState === 'processing'" class="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <span>Memproses berkas via background worker...</span>
            </div>
            
            <div v-else-if="merchantExportState === 'done'" class="flex gap-2">
              <a :href="merchantDownloadUrl" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs">
                <Icon name="lucide:download" class="w-3.5 h-3.5" />
                <span>Unduh File CSV</span>
              </a>
              <Button variant="outline" size="sm" @click="merchantExportState = 'idle'" class="text-xs rounded-lg">
                Tutup
              </Button>
            </div>
          </div>
        </div>

        <!-- Financial Export Card -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs flex items-start gap-4 hover:border-blue-500/50 transition-all">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Icon name="lucide:banknote" class="w-7 h-7" />
          </div>
          <div class="flex-1">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Laporan Rekonsiliasi Finansial & Fee</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">Rekapitulasi total GMV, biaya transaksi, dan riwayat penarikan dana dompet digital pedagang.</p>
            <Button variant="outline" size="sm" class="text-xs rounded-lg gap-1.5">
              <Icon name="lucide:file-text" class="w-3.5 h-3.5" />
              <span>Generate PDF Rekapitulasi</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Right Column: Scheduled Reports -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs space-y-4">
          <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Icon name="lucide:clock" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Jadwal Rutinitas Otomatis</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Laporan otomatis disiapkan oleh daemon background scheduler dan dikirim ke kanal admin.</p>
          
          <div class="space-y-3">
            <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Laporan Pagi (08:00 WIB)</span>
                <Badge variant="outline" class="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">AKTIF</Badge>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Ringkasan transaksi ekosistem hari kemarin.</p>
            </div>

            <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Rekap Mingguan (Senin 07:00)</span>
                <Badge variant="outline" class="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">AKTIF</Badge>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Performa 7 hari terakhir seluruh toko aktif.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '~/utils/api'

const merchantExportState = ref<'idle' | 'processing' | 'done'>('idle')
const merchantDownloadUrl = ref('')

const triggerMerchantExport = async () => {
  merchantExportState.value = 'processing'
  try {
    const res = await api.post('/admin/merchants/export-csv', {})
    if (res && res.task_id) {
      pollExport(res.task_id)
    } else {
      merchantExportState.value = 'idle'
      alert('Gagal memulai tugas ekspor.')
    }
  } catch (e) {
    console.error(e)
    merchantExportState.value = 'idle'
  }
}

const pollExport = async (taskId: string) => {
  try {
    const res = await api.get(`/admin/merchants/export-csv/status/${taskId}`)
    if (res.status === 'completed') {
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      merchantDownloadUrl.value = URL.createObjectURL(blob)
      merchantExportState.value = 'done'
    } else {
      setTimeout(() => pollExport(taskId), 2000)
    }
  } catch (err) {
    console.error(err)
    merchantExportState.value = 'idle'
  }
}
</script>
