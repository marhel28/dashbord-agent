<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Status & Kesehatan Sistem
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitoring infrastruktur mikroservis, performa database, dan metrik latensi cloud.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" class="rounded-lg text-xs gap-1.5 h-9" @click="refreshHealth">
          <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Refresh Status</span>
        </Button>
      </div>
    </div>

    <!-- Health Overview Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uptime Sistem</span>
          <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Icon name="lucide:activity" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          99.98%
        </div>
        <p class="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Operational Normal</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Beban CPU Server</span>
          <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Icon name="lucide:cpu" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          18.4%
        </div>
        <p class="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Icon name="lucide:check" class="w-3.5 h-3.5" />
          <span>4 vCPU Berjalan Mulus</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">RAM Terpakai</span>
          <div class="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Icon name="lucide:hard-drive" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          3.2 / 8.0 GB
        </div>
        <p class="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
          <span>40% Alokasi Aman</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Penyimpanan SSD</span>
          <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Icon name="lucide:database" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          28.6 GB / 100 GB
        </div>
        <p class="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span>71.4 GB Tersedia</span>
        </p>
      </div>
    </div>

    <!-- Microservices Status Table -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Daftar Layanan Infrastruktur</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Komponen backend dan status daemon background.</p>
        </div>
      </div>

      <div class="divide-y divide-slate-100 dark:divide-slate-700/60">
        <div v-for="s in services" :key="s.name" class="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <div>
              <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ s.name }}</h4>
              <p class="text-[11px] text-slate-400 font-mono">{{ s.endpoint }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs font-mono">
            <span class="text-slate-500 dark:text-slate-400">{{ s.latency }}</span>
            <Badge variant="outline" class="text-[10px] font-mono border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              HEALTHY
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

const services = [
  { name: 'FastAPI Backend Core', endpoint: 'http://localhost:8000/api/v1/health', latency: '12 ms' },
  { name: 'PostgreSQL Relational DB', endpoint: 'postgres:5432/umkm_db', latency: '4 ms' },
  { name: 'Manticore Hybrid Vector Engine', endpoint: 'http://localhost:9308', latency: '8 ms' },
  { name: 'Telegram Bot Webhook Worker', endpoint: 'worker:telegram-daemon', latency: '15 ms' },
  { name: 'Cron Automation Scheduler', endpoint: 'service:apscheduler', latency: '2 ms' }
]

const refreshHealth = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 400)
}
</script>
