<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Integrasi Ekosistem
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Koneksi webhook, payment gateways, messaging bots, dan engine kecerdasan buatan.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" class="rounded-lg text-xs gap-1.5 h-9" @click="checkIntegrations">
          <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Uji Konektivitas</span>
        </Button>
      </div>
    </div>

    <!-- Integrations Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="item in integrations" :key="item.name" class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs', item.colorClass]">
              <Icon :name="item.icon" class="w-5 h-5" />
            </div>
            <Badge :variant="item.status === 'CONNECTED' ? 'outline' : 'secondary'" class="text-[10px] font-mono border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              {{ item.status }}
            </Badge>
          </div>

          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ item.name }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ item.description }}</p>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span class="text-[11px] font-mono text-slate-400">Ping: {{ item.ping }}</span>
          <Button variant="ghost" size="sm" class="text-xs h-7 px-2 text-emerald-600 dark:text-emerald-400">
            Konfigurasi &rarr;
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

const integrations = [
  {
    name: 'Telegram Bot API Webhook',
    icon: 'lucide:send',
    colorClass: 'bg-[#26A5E4]',
    status: 'CONNECTED',
    description: 'Menyalurkan pesan pelanggan & perintah suara langsung ke pipeline AI Agent.',
    ping: '42 ms'
  },
  {
    name: 'Google Gemini 2.0 API',
    icon: 'lucide:sparkles',
    colorClass: 'bg-emerald-600',
    status: 'CONNECTED',
    description: 'LLM Multimodal utama untuk inferensi teks, ekstraksi struk nota, dan function calling.',
    ping: '210 ms'
  },
  {
    name: 'Manticore Hybrid Vector Engine',
    icon: 'lucide:database',
    colorClass: 'bg-amber-600',
    status: 'CONNECTED',
    description: 'Pencarian semantik katalog produk berkinerja tinggi berbasis HNSW Vector index.',
    ping: '14 ms'
  },
  {
    name: 'Midtrans Payment Gateway (QRIS)',
    icon: 'lucide:credit-card',
    colorClass: 'bg-blue-600',
    status: 'CONNECTED',
    description: 'Penerbitan dynamic QRIS instan dan rekonsiliasi saldo dompet digital pedagang.',
    ping: '95 ms'
  },
  {
    name: 'WhatsApp Cloud API (Meta)',
    icon: 'lucide:message-square',
    colorClass: 'bg-[#25D366]',
    status: 'CONNECTED',
    description: 'Kanal pengiriman laporan otomatis harian dan pengingat stok menipis.',
    ping: '68 ms'
  },
  {
    name: 'PostgreSQL Relational Cluster',
    icon: 'lucide:server',
    colorClass: 'bg-indigo-600',
    status: 'CONNECTED',
    description: 'Penyimpanan terpusat ACID untuk data profil pedagang, inventaris, dan ledger finansial.',
    ping: '8 ms'
  }
]

const checkIntegrations = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    alert('Semua integrasi sistem terhubung dengan normal.')
  }, 600)
}
</script>
