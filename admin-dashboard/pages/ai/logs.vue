<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/ai" class="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors bg-white dark:bg-slate-900 shadow-2xs">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Log Aktivitas AI & Inferensi
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit eksekusi prompt pengguna, respons model LLM, dan jejak function calling.
          </p>
        </div>
      </div>

      <Button variant="outline" size="sm" class="rounded-lg text-xs gap-1.5 h-9" @click="refreshLogs">
        <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span>Live Stream</span>
      </Button>
    </div>

    <!-- Logs Table Container -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col">
      <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Streaming Jejak Inferensi</h2>
          <Badge variant="outline" class="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
            Realtime
          </Badge>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700/60 tracking-wider">
            <tr>
              <th class="px-5 py-3.5">Waktu</th>
              <th class="px-5 py-3.5">Merchant</th>
              <th class="px-5 py-3.5">Agen / Fitur</th>
              <th class="px-5 py-3.5">Prompt Ringkas</th>
              <th class="px-5 py-3.5">Model</th>
              <th class="px-5 py-3.5 text-right">Latensi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
              <td class="px-5 py-4 whitespace-nowrap text-slate-400 text-[11px]">{{ log.time }}</td>
              <td class="px-5 py-4 font-sans font-semibold text-slate-900 dark:text-slate-100">{{ log.merchant }}</td>
              <td class="px-5 py-4">
                <Badge variant="secondary" class="text-[10px]">{{ log.feature }}</Badge>
              </td>
              <td class="px-5 py-4 font-sans text-slate-600 dark:text-slate-300 max-w-xs truncate">{{ log.prompt }}</td>
              <td class="px-5 py-4 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">{{ log.model }}</td>
              <td class="px-5 py-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">{{ log.latency }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

const logs = [
  { id: 1, time: '14:32:05', merchant: 'Toko Berkah Sejahtera', feature: 'Kasir Audio Bot', prompt: '"Catat telur 2 kilo sama beras 5 kilo ya bot"', model: 'gemini-2.0-flash', latency: '420ms' },
  { id: 2, time: '14:31:44', merchant: 'Warung Bu Siti', feature: 'OCR Scan Nota', prompt: '[Image: nota_belanja_supplier.jpg]', model: 'gemini-2.0-flash', latency: '980ms' },
  { id: 3, time: '14:30:12', merchant: 'Kelontong Jaya Mandiri', feature: 'Stock Advisory', prompt: '"Cek barang apa yang mau habis minggu ini"', model: 'gemini-2.0-flash', latency: '540ms' },
  { id: 4, time: '14:28:50', merchant: 'Toko Madura 24 Jam', feature: 'Financial Summary', prompt: '"Bikinin ringkasan omzet kemarin"', model: 'gemini-1.5-pro', latency: '1240ms' },
  { id: 5, time: '14:25:31', merchant: 'Kios Buah Segar', feature: 'Auto-Cataloging', prompt: '"Tambahkan mangga harum manis harga 25rb per kg"', model: 'gemini-2.0-flash', latency: '380ms' }
]

const refreshLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 400)
}
</script>
