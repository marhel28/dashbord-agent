<template>
  <div class="animate-fade-in max-w-4xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Notifikasi</h1>
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Semua pemberitahuan dan pembaruan sistem</p>
      </div>
      <div v-if="notifications.length > 0">
        <button @click="markAllAsRead" class="px-4 py-2 text-xs font-bold text-[var(--wp-navy)] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition rounded shadow-sm flex items-center gap-2">
          <Icon name="heroicons:check-badge" class="w-4 h-4" />
          <span>Tandai Semua Dibaca</span>
        </button>
      </div>
    </div>

    <!-- State: Kosong -->
    <div v-if="notifications.length === 0" class="bg-white dark:bg-slate-800 border border-[var(--wp-border)] rounded shadow-sm overflow-hidden p-12 text-center flex flex-col items-center justify-center">
      <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-300">
        <Icon name="heroicons:bell-slash" class="w-8 h-8" />
      </div>
      <h3 class="text-sm font-bold text-[var(--wp-navy)] dark:text-white mb-2">Belum Ada Notifikasi</h3>
      <p class="text-xs text-slate-500">Anda akan menerima pemberitahuan di sini ketika ada transaksi baru atau info lainnya.</p>
    </div>

    <!-- List Notifikasi -->
    <div v-else class="space-y-3">
      <div 
        v-for="notif in notifications" 
        :key="notif.id"
        @click="markAsRead(notif.id)"
        class="bg-white dark:bg-slate-800 border rounded shadow-sm p-4 md:p-5 flex gap-4 transition hover:shadow cursor-pointer relative overflow-hidden"
        :class="[notif.read ? 'border-[var(--wp-border)] opacity-80' : 'border-l-4 border-l-[var(--wp-navy)] border-[var(--wp-border)]']"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="[notif.type === 'NEW_TRANSACTION' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600']">
          <Icon :name="notif.type === 'NEW_TRANSACTION' ? 'heroicons:shopping-cart' : 'heroicons:banknotes'" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0 pr-6">
          <div class="flex justify-between items-start mb-1">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white" :class="{'opacity-75': notif.read}">
              {{ notif.title }}
            </h4>
            <span class="text-[9px] font-bold text-slate-400 whitespace-nowrap">{{ formatDate(notif.date) }}</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400" :class="{'opacity-75': notif.read}">
            {{ notif.message }}
          </p>
        </div>
        <!-- Unread Indicator -->
        <div v-if="!notif.read" class="absolute top-1/2 right-4 transform -translate-y-1/2 w-2 h-2 rounded-full" style="background: var(--wp-gold);"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '~/composables/useNotificationStore'
import { onMounted } from 'vue'

const { notifications, loadNotifications, markAsRead, markAllAsRead } = useNotificationStore()

onMounted(() => {
  loadNotifications()
})

const formatDate = (isoStr: string) => {
  try {
    const d = new Date(isoStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(d)
  } catch (e) {
    return isoStr
  }
}
</script>
