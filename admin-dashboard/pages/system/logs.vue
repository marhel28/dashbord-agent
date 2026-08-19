<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/system" class="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors bg-white dark:bg-slate-900 shadow-2xs">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Log Sistem & Audit Daemon
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Streaming log runtime backend, event autentikasi, dan audit error database.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" class="rounded-lg text-xs gap-1.5 h-9" @click="refreshLogs">
          <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Segarkan Log</span>
        </Button>
      </div>
    </div>

    <!-- Logs Container -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden flex flex-col font-mono">
      <div class="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
        <div class="flex items-center gap-2 font-sans">
          <h2 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Console Output</h2>
          <Badge variant="outline" class="text-[10px] font-mono">Live</Badge>
        </div>
      </div>

      <div class="p-4 space-y-2 text-xs bg-slate-950 text-slate-200 overflow-x-auto max-h-[550px] custom-scrollbar">
        <div v-for="(log, i) in logs" :key="i" class="flex items-start gap-3 py-1 hover:bg-slate-900/60 px-2 rounded">
          <span class="text-slate-500 shrink-0 select-none">{{ log.time }}</span>
          <span :class="['px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0', log.levelClass]">{{ log.level }}</span>
          <span class="text-emerald-400 shrink-0">[{{ log.service }}]</span>
          <span class="text-slate-300">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

const logs = [
  { time: '14:35:10.102', level: 'INFO', levelClass: 'bg-emerald-950 text-emerald-400 border border-emerald-800', service: 'FastAPI', message: 'POST /api/v1/telegram/webhook 200 OK (38ms)' },
  { time: '14:35:08.840', level: 'INFO', levelClass: 'bg-emerald-950 text-emerald-400 border border-emerald-800', service: 'Manticore', message: 'HNSW vector search query executed in 4.2ms (3 results)' },
  { time: '14:34:55.201', level: 'INFO', levelClass: 'bg-emerald-950 text-emerald-400 border border-emerald-800', service: 'Auth', message: 'Admin session refreshed for admin@nahkoda.id' },
  { time: '14:34:20.912', level: 'WARN', levelClass: 'bg-amber-950 text-amber-400 border border-amber-800', service: 'Scheduler', message: 'Merchant restock alert routine completed in 1.4s (3 notifications queued)' },
  { time: '14:33:02.110', level: 'INFO', levelClass: 'bg-emerald-950 text-emerald-400 border border-emerald-800', service: 'FastAPI', message: 'GET /api/v1/admin/merchants?limit=1000 200 OK (82ms)' },
  { time: '14:32:41.512', level: 'INFO', levelClass: 'bg-emerald-950 text-emerald-400 border border-emerald-800', service: 'AI-Agent', message: 'Gemini function call: create_transaction executed successfully' },
  { time: '14:31:18.004', level: 'INFO', levelClass: 'bg-emerald-950 text-emerald-400 border border-emerald-800', service: 'DB', message: 'PostgreSQL connection pool healthy (active: 4, idle: 16)' }
]

const refreshLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 400)
}
</script>
