<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. HEADER & GLOBAL ACTIONS ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Pusat Notifikasi</h1>
          <span v-if="unreadCount > 0" class="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {{ unreadCount }} Baru
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pantau aktivitas transaksi toko, peringatan stok, dan rekomendasi AI Copilot.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          v-if="notifications.length > 0"
          variant="outline"
          size="sm"
          class="rounded-lg text-xs font-medium h-9 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
          @click="markAllAsRead"
        >
          <Icon name="lucide:check-check" class="w-3.5 h-3.5 text-[#047857]" />
          <span>Tandai Semua Dibaca</span>
        </Button>
      </div>
    </div>

    <!-- ═══════════ 2. TABS FILTER ═══════════ -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        @click="activeCategory = tab.id"
        :class="['px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
          activeCategory === tab.id ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800']"
      >
        <Icon :name="tab.icon" class="w-3.5 h-3.5" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- ═══════════ 3. STATE: EMPTY ═══════════ -->
    <div v-if="filteredNotifications.length === 0" class="p-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        <Icon name="lucide:bell-off" class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Tidak Ada Notifikasi</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm">
          Semua pemberitahuan dan pembaruan sistem toko Anda akan muncul di sini.
        </p>
      </div>
    </div>

    <!-- ═══════════ 4. NOTIFICATION LIST (SEAMLESS CARD LIST) ═══════════ -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
      <div
        v-for="notif in filteredNotifications"
        :key="notif.id"
        @click="handleNotificationClick(notif)"
        :class="['p-4 sm:p-5 flex gap-4 transition-all cursor-pointer relative group',
          notif.read ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40' : 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70']"
      >
        <!-- Unread Indicator Pulse Dot -->
        <div v-if="!notif.read" class="absolute top-5 left-2 w-2 h-2 rounded-full bg-[#047857]"></div>

        <!-- Category Icon Badge -->
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs', getBadgeStyle(notif.type)]">
          <Icon :name="getBadgeIcon(notif.type)" class="w-5 h-5" />
        </div>

        <!-- Main Content Body -->
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between gap-2">
            <h4 :class="['text-xs sm:text-sm font-bold truncate', notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100']">
              {{ notif.title }}
            </h4>
            <span class="text-[11px] font-mono text-slate-400 shrink-0">
              {{ formatRelativeTime(notif.date) }}
            </span>
          </div>

          <!-- Message with Currency Formatter -->
          <p :class="['text-xs leading-relaxed', notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium']">
            {{ formatMessageContent(notif.message) }}
          </p>

          <!-- Action CTA Inline Button (If applicable) -->
          <div v-if="notif.type === 'AI_COPILOT' || notif.type === 'STOCK_ALERT'" class="pt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              class="h-7 text-[11px] font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              @click.stop="executeNotifAction(notif)"
            >
              <Icon name="lucide:sparkles" class="w-3 h-3" />
              <span>{{ notif.type === 'AI_COPILOT' ? 'Buat Promo AI' : 'Restock Produk' }}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from '~/components/ui/button.vue'
import { useNotificationStore, type AppNotification } from '~/composables/useNotificationStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const { notifications, loadNotifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore()

const activeCategory = ref('ALL')

const filterTabs = [
  { id: 'ALL', label: 'Semua Notifikasi', icon: 'lucide:bell' },
  { id: 'NEW_TRANSACTION', label: 'Transaksi', icon: 'lucide:shopping-cart' },
  { id: 'STOCK_ALERT', label: 'Stok Barang', icon: 'lucide:package' },
  { id: 'AI_COPILOT', label: 'AI Copilot', icon: 'lucide:sparkles' }
]

onMounted(() => {
  loadNotifications()
})

const filteredNotifications = computed(() => {
  if (activeCategory.value === 'ALL') return notifications.value
  return notifications.value.filter(n => n.type === activeCategory.value)
})

// Currency Formatter & Raw Float Cleanup helper (p0 Requirement)
const formatMessageContent = (msg: string) => {
  if (!msg) return ''
  // Regex to detect "Rp 13000.0" or "Rp 13000" and convert into "Rp 13.000"
  return msg.replace(/Rp\s*(\d+(?:\.\d+)?)/gi, (match, p1) => {
    const val = parseFloat(p1)
    if (isNaN(val)) return match
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(val))
  })
}

// Relative time helper (p1 Requirement)
const formatRelativeTime = (isoStr: string) => {
  if (!isoStr) return ''
  try {
    const diffMs = Date.now() - new Date(isoStr).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins} mnt lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} hari lalu`
    return new Date(isoStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  } catch (e) {
    return isoStr
  }
}

const getBadgeStyle = (type: string) => {
  switch (type) {
    case 'NEW_TRANSACTION':
      return 'bg-emerald-50 text-[#047857] dark:bg-emerald-950 dark:text-emerald-300'
    case 'STOCK_ALERT':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    case 'AI_COPILOT':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
  }
}

const getBadgeIcon = (type: string) => {
  switch (type) {
    case 'NEW_TRANSACTION': return 'lucide:shopping-bag'
    case 'STOCK_ALERT': return 'lucide:alert-triangle'
    case 'AI_COPILOT': return 'lucide:sparkles'
    default: return 'lucide:bell'
  }
}

const handleNotificationClick = (notif: AppNotification) => {
  markAsRead(notif.id)
  if (notif.type === 'NEW_TRANSACTION') {
    router.push('/sales-report')
  } else if (notif.type === 'STOCK_ALERT') {
    router.push('/inventory')
  } else if (notif.type === 'AI_COPILOT') {
    router.push('/marketing')
  }
}

const executeNotifAction = (notif: AppNotification) => {
  markAsRead(notif.id)
  if (notif.type === 'AI_COPILOT') {
    router.push('/marketing')
  } else if (notif.type === 'STOCK_ALERT') {
    router.push('/inventory')
  }
}
</script>
