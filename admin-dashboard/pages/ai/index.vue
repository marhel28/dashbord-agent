<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          AI & Agentic Systems
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitoring armada bot agen AI, performa inferensi, dan orkestrasi tool calling.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" class="rounded-lg text-xs gap-1.5 h-9" @click="fetchAiMetrics">
          <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Segarkan Metrik</span>
        </Button>
      </div>
    </div>

    <!-- AI KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Kueri AI</span>
          <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Icon name="lucide:sparkles" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          142,890
        </div>
        <p class="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Icon name="lucide:trending-up" class="w-3.5 h-3.5" />
          <span>+24% pekan ini</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rata-rata Latensi</span>
          <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Icon name="lucide:zap" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          680 ms
        </div>
        <p class="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Icon name="lucide:check" class="w-3.5 h-3.5" />
          <span>Gemini 2.0 Flash Fast</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tool Call Success</span>
          <div class="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Icon name="lucide:wrench" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          99.4%
        </div>
        <p class="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
          <Icon name="lucide:check-circle-2" class="w-3.5 h-3.5" />
          <span>Akurasi Tinggi</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Bots</span>
          <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Icon name="lucide:bot" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          4 Agen
        </div>
        <p class="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Semua Online</span>
        </p>
      </div>
    </div>

    <!-- Active Agents Roster -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Armada Agen AI Aktif</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Spesialisasi dan status inferensi agen kustom.</p>
        </div>
      </div>

      <div class="divide-y divide-slate-100 dark:divide-slate-700/60">
        <div v-for="agent in agents" :key="agent.name" class="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
          <div class="flex items-start gap-3.5">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-white', agent.colorClass]">
              <Icon :name="agent.icon" class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ agent.name }}</h3>
                <Badge variant="outline" class="text-[10px] font-mono border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  {{ agent.status }}
                </Badge>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ agent.description }}</p>
              <div class="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-mono">
                <span>Model: {{ agent.model }}</span>
                <span>•</span>
                <span>Calls: {{ agent.calls }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" class="text-xs rounded-lg h-8 gap-1">
              <Icon name="lucide:activity" class="w-3.5 h-3.5 text-emerald-600" />
              <span>Lihat Log</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

const agents = [
  {
    name: 'Telegram Kasir Copilot Bot',
    icon: 'lucide:bot',
    colorClass: 'bg-[#26A5E4]',
    status: 'ONLINE',
    description: 'Menangani pencatatan transaksi kasir instan via percakapan teks & suara Telegram.',
    model: 'gemini-2.0-flash',
    calls: '88,210 requests'
  },
  {
    name: 'Auto-Restock & Inventory Agent',
    icon: 'lucide:boxes',
    colorClass: 'bg-emerald-600',
    status: 'ONLINE',
    description: 'Menganalisis pergerakan stok kritis dan memberikan rekomendasi kulakan optimal.',
    model: 'gemini-2.0-flash',
    calls: '24,110 requests'
  },
  {
    name: 'Vision OCR Receipt Scanner',
    icon: 'lucide:scan-line',
    colorClass: 'bg-purple-600',
    status: 'ONLINE',
    description: 'Mengekstrak total harga dan item belanja dari struk nota fisik yang difoto pedagang.',
    model: 'gemini-2.0-flash (Multimodal)',
    calls: '19,430 requests'
  },
  {
    name: 'Financial Advisory Engine',
    icon: 'lucide:trending-up',
    colorClass: 'bg-amber-600',
    status: 'ONLINE',
    description: 'Memberikan wawasan tren profitabilitas dan kalkulasi laba rugi mingguan otomatis.',
    model: 'gemini-1.5-pro',
    calls: '11,140 requests'
  }
]

const fetchAiMetrics = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}
</script>
