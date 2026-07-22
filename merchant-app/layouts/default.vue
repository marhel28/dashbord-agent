<template>
  <div class="min-h-screen font-sans flex flex-col lg:flex-row text-slate-900" style="background-color: var(--wp-bg, #F4F6F9);">
    <!-- ── Mobile Header Bar ── -->
    <header class="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--wp-border)] shrink-0 sticky top-0 z-[var(--wp-z-sticky)]">
      <div class="flex items-center gap-2">
        <img :src="logoSrc" class="w-8 h-8 object-contain" alt="Nahkoeda Logo" />
        <div>
          <span class="font-black text-sm tracking-tight block leading-none" style="color: var(--wp-navy);">Nahkoeda</span>
          <span class="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Agentic AI Bot</span>
        </div>
      </div>
      
      <!-- Logout / Mini User profile button for mobile header -->
      <div class="flex items-center gap-3">
        <NuxtLink to="/profile" v-if="user" class="flex items-center gap-2 hover:opacity-80 transition" title="Profil Saya">
          <div v-if="user.photo_profile" class="w-7 h-7 rounded-full overflow-hidden border border-[var(--wp-border)]">
             <img :src="user.photo_profile" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <span class="text-[10px] font-bold px-2.5 py-1 rounded" style="background: rgba(212,168,67,0.08); color: var(--wp-navy);">
            {{ user.name }}
          </span>
        </NuxtLink>
        <button @click="handleLogout" class="p-1.5 border hover:bg-slate-50 dark:hover:bg-slate-800 transition" style="border-color: var(--wp-border); border-radius: 4px;" title="Logout">
          <Icon name="heroicons:arrow-left-on-rectangle" class="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </header>

    <!-- ── Sidebar (Large Devices) ── -->
    <aside class="w-64 bg-white border-r border-[var(--wp-border)] p-0 flex flex-col justify-between hidden lg:flex shrink-0 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
      <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--wp-gold)] via-[var(--wp-gold-light)] to-[var(--wp-gold-dark)] opacity-80"></div>

      <div class="p-6 pl-7">
        <div class="flex items-center gap-3 mb-2">
          <img :src="logoSrc" class="w-10 h-10 object-contain shrink-0" alt="Nahkoeda Logo" />
          <div>
            <h2 class="font-black text-lg tracking-tight leading-none" style="color: var(--wp-navy);">Nahkoeda</h2>
            <p class="text-[7px] font-extrabold uppercase tracking-wider mt-1 text-slate-400">Agentic AI Bot untuk Membantu Warung</p>
          </div>
        </div>

        <!-- User Info -->
        <NuxtLink to="/profile" v-if="user" class="mt-5 p-3 flex items-center gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" style="background: rgba(212,168,67,0.06); border: 1px solid rgba(212,168,67,0.15); border-radius: 4px;" title="Lihat Profil">
          <div v-if="user.photo_profile" class="w-10 h-10 rounded overflow-hidden shrink-0">
             <img :src="user.photo_profile" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-10 h-10 flex shrink-0 items-center justify-center text-xs font-bold uppercase" style="background: var(--wp-navy); color: var(--wp-gold); border-radius: 4px;">
            {{ user.name?.charAt(0) || 'U' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-bold truncate" style="color: var(--wp-text);">{{ user.name }}</p>
            <p class="text-[10px] font-medium truncate" style="color: var(--wp-text-secondary);">{{ user.role === 'admin' ? 'Admin Utama' : user.store_name }}</p>
          </div>
        </NuxtLink>

        <nav class="mt-6 space-y-1">
          <NuxtLink to="/" exact-active-class="nav-active" class="nav-link">
            <Icon name="heroicons:rectangle-group" class="w-5 h-5" />
            <span>Beranda</span>
          </NuxtLink>

          <div class="pt-3 pb-1">
            <p class="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">AI Copilot</p>
            <NuxtLink to="/chat" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:sparkles" class="w-5 h-5" />
              <span>Asisten AI</span>
            </NuxtLink>
            <NuxtLink to="/skill-marketplace" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:building-storefront" class="w-5 h-5" />
              <span>Skill Marketplace</span>
            </NuxtLink>
            <NuxtLink to="/chat" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:book-open" class="w-5 h-5" />
              <span>Knowledge Base</span>
            </NuxtLink>
            <NuxtLink to="/memory" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:cpu-chip" class="w-5 h-5" />
              <span>Memory</span>
            </NuxtLink>
          </div>

          <div class="pt-3 pb-1">
            <p class="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bisnis & Operasional</p>
            <NuxtLink to="/sales-report" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:banknotes" class="w-5 h-5" />
              <span>Laporan Penjualan</span>
            </NuxtLink>
            <NuxtLink to="/inventory" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:archive-box" class="w-5 h-5" />
              <span>Stok Barang</span>
            </NuxtLink>
            <NuxtLink v-if="showCrm" to="/customers" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:user-group" class="w-5 h-5" />
              <span>Pelanggan (CRM)</span>
            </NuxtLink>
            <NuxtLink to="/finance" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:currency-dollar" class="w-5 h-5" />
              <span>Keuangan</span>
            </NuxtLink>
            <NuxtLink to="/marketing" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:megaphone" class="w-5 h-5" />
              <span>Pemasaran</span>
            </NuxtLink>
          </div>

          <div class="pt-3 pb-1">
            <p class="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Manajemen</p>
            <NuxtLink to="/analytics" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:chart-bar" class="w-5 h-5" />
              <span>Analitik</span>
            </NuxtLink>
            <NuxtLink to="/decision-support" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:light-bulb" class="w-5 h-5" />
              <span>Keputusan</span>
            </NuxtLink>
            <NuxtLink to="/operations" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:cog" class="w-5 h-5" />
              <span>Operasional</span>
            </NuxtLink>
            <NuxtLink to="/team" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:user-plus" class="w-5 h-5" />
              <span>Tim</span>
            </NuxtLink>
          </div>

          <div class="pt-3 pb-1">
            <p class="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Sistem</p>
            <NuxtLink to="/automation" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:command-line" class="w-5 h-5" />
              <span>Otomatisasi</span>
            </NuxtLink>
            <NuxtLink to="/konektor" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:puzzle-piece" class="w-5 h-5" />
              <span>Konektor</span>
            </NuxtLink>
            <NuxtLink to="/documents" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:document-text" class="w-5 h-5" />
              <span>Dokumen</span>
            </NuxtLink>
            <NuxtLink to="/monitoring" exact-active-class="nav-active" class="nav-link">
              <Icon name="heroicons:computer-desktop" class="w-5 h-5" />
              <span>Monitoring</span>
            </NuxtLink>
          </div>
        </nav>
      </div>

      <div class="p-6 pl-7 space-y-4 border-t border-[var(--wp-border)]">
        <button class="w-full py-3 text-xs font-bold shadow-sm transition flex items-center justify-center gap-2" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white; border-radius: 4px;">
          <Icon name="heroicons:plus" class="w-4 h-4" />
          <span>Tingkatkan Paket</span>
        </button>
        <div class="space-y-1">
          <NuxtLink to="/settings" exact-active-class="nav-active" class="nav-link">
            <Icon name="heroicons:cog-6-tooth" class="w-4 h-4" />
            <span>Settings</span>
          </NuxtLink>
          <NuxtLink to="/help" exact-active-class="nav-active" class="nav-link">
            <Icon name="heroicons:question-mark-circle" class="w-4 h-4" />
            <span>Help</span>
          </NuxtLink>
          <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-semibold transition text-left" style="color: var(--wp-text-secondary);">
            <Icon name="heroicons:arrow-left-on-rectangle" class="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- ── Main Area ── -->
    <div class="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
      <header class="h-16 bg-white/80 backdrop-blur-md border-b border-[var(--wp-border)] px-8 items-center justify-between shrink-0 sticky top-0 z-[var(--wp-z-sticky)] hidden lg:flex">
        <!-- Global Search -->
        <GlobalSearch />
        <div class="flex items-center gap-4">
          <span class="text-[11px] font-bold px-3.5 py-1.5 tracking-wide select-none" style="background: var(--wp-navy); color: white;">
            Asisten AI
          </span>
          <NuxtLink to="/notifikasi" class="relative p-2 transition" style="color: var(--wp-text-secondary);">
            <Icon name="heroicons:bell" class="w-5 h-5" />
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold text-white shadow" style="background: var(--wp-navy);">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </NuxtLink>
          <button class="p-2 transition" style="color: var(--wp-text-secondary);">
            <Icon name="heroicons:question-mark-circle" class="w-5 h-5" />
          </button>
          <NuxtLink to="/profile" class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shadow-sm select-none transition-transform hover:scale-105 border-2 border-transparent hover:border-[var(--wp-gold)]" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;" title="Profil Saya">
            <template v-if="user?.photo_profile">
              <img :src="user.photo_profile" alt="Profile" class="w-full h-full object-cover" />
            </template>
            <template v-else>
              {{ user?.name?.charAt(0) || 'U' }}
            </template>
          </NuxtLink>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 sm:p-8">
        <slot />
      </main>
    </div>

    <!-- ── Draggable Floating Telegram Action Button ── -->
    <div
      ref="telegramButton"
      @mousedown="startDrag"
      @touchstart="startDrag"
      class="fixed z-[999] flex items-center justify-center w-14 h-14 bg-[#26A5E4] hover:bg-[#208bbf] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 group cursor-move select-none"
      :style="{
        borderRadius: '9999px',
        boxShadow: '0 4px 16px rgba(38, 165, 228, 0.4)',
        left: position.x !== null ? position.x + 'px' : 'auto',
        top: position.y !== null ? position.y + 'px' : 'auto',
        right: position.x === null ? '24px' : 'auto',
        bottom: position.y === null ? '80px' : 'auto'
      }"
      title="Geser untuk memindahkan, klik untuk membuka Telegram Bot"
    >
      <a
        href="https://t.me/UmkmCopilotBot"
        target="_blank"
        rel="noopener noreferrer"
        class="w-full h-full flex items-center justify-center text-white"
        @click="handleTelegramClick"
      >
        <svg class="w-7 h-7 fill-current transition-transform group-hover:rotate-6" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.2-5.33 3.52-.5.35-.96.52-1.37.51-.45-.01-1.32-.26-1.97-.47-.8-.26-1.43-.4-1.38-.85.03-.24.36-.48.99-.74 3.89-1.69 6.48-2.8 7.78-3.33 3.69-1.52 4.46-1.78 4.96-1.79.11 0 .36.03.52.16.13.1.17.25.19.35.02.13.02.26 0 .39z"/>
        </svg>
      </a>
    </div>

    <!-- ── Bottom Navigation Bar (Mobile Devices only) ── -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[var(--wp-border)] flex items-center justify-around px-2 z-[var(--wp-z-sticky)]">
      <NuxtLink to="/" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:rectangle-group" class="w-5 h-5" />
        <span class="text-[9px] mt-0.5 font-bold uppercase tracking-wider">Beranda</span>
      </NuxtLink>
      <NuxtLink to="/chat" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:sparkles" class="w-5 h-5" />
        <span class="text-[9px] mt-0.5 font-bold uppercase tracking-wider">Asisten AI</span>
      </NuxtLink>
      <NuxtLink to="/skill-marketplace" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:building-storefront" class="w-5 h-5" />
        <span class="text-[9px] mt-0.5 font-bold uppercase tracking-wider">Market</span>
      </NuxtLink>
      <NuxtLink to="/inventory" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:archive-box" class="w-5 h-5" />
        <span class="text-[9px] mt-0.5 font-bold uppercase tracking-wider">Stok</span>
      </NuxtLink>
      <NuxtLink to="/notifikasi" exact-active-class="mobile-nav-active" class="mobile-nav-link relative">
        <Icon name="heroicons:bell" class="w-5 h-5" />
        <span v-if="unreadCount > 0" class="absolute top-1 right-1/4 translate-x-1/2 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold text-white shadow" style="background: var(--wp-navy);">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
        <span class="text-[9px] mt-0.5 font-bold uppercase tracking-wider">Notif</span>
      </NuxtLink>
      <NuxtLink to="/konektor" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:share" class="w-5 h-5" />
        <span class="text-[9px] mt-0.5 font-bold uppercase tracking-wider">Profil</span>
      </NuxtLink>
      <NuxtLink to="/sales-report" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:chart-bar" class="w-5 h-5" />
        <span class="text-[9px] mt-0.5 font-bold uppercase tracking-wider">Laporan</span>
      </NuxtLink>
      <NuxtLink to="/konektor" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:share" class="w-5 h-5" />
        <span class="text-[9px] mt-0.5 font-bold uppercase tracking-wider">Profil</span>
      </NuxtLink>
    </nav>

    <!-- ── Toast Notifications ── -->
    <div class="fixed top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
      <div v-for="toast in activeToasts" :key="toast.id" class="bg-white border-l-4 shadow-lg rounded p-4 pr-10 relative pointer-events-auto min-w-[300px] animate-fade-in-up" :style="`border-color: var(--wp-border); border-left-color: ${toast.type === 'NEW_TRANSACTION' ? 'var(--wp-navy)' : '#10B981'};`">
        <button @click="dismissToast(toast.id)" class="absolute top-2 right-2 text-slate-400 hover:text-slate-600">
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
        <h4 class="text-sm font-bold text-slate-800">{{ toast.title }}</h4>
        <p class="text-xs text-slate-600 mt-1">{{ toast.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useNotificationStore } from '~/composables/useNotificationStore'
import { navigateTo } from '#app'

const { user, isAuthenticated, checkAuth, logout: doLogout } = useAuth()
const { loadNotifications, addNotification, unreadCount } = useNotificationStore()
const colorMode = useColorMode()

const logoSrc = computed(() => {
  return colorMode.value === 'dark' ? '/logo_darkmode.png' : '/logo_lightmode.png'
})

const showCrm = computed(() => {
  if (!user.value) return false;
  // Hide CRM for Warung Kecil, but show for Toko Kelontong, Distributor, Toko Online, Grosir
  return user.value.store_type && user.value.store_type !== 'Warung Kecil';
})

// Draggable Telegram Floating Button logic
const position = reactive({
  x: null as number | null,
  y: null as number | null
})
const telegramButton = ref<HTMLElement | null>(null)
let isDragging = false
let dragStartTime = 0
let startOffset = { x: 0, y: 0 }

const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging = true
  dragStartTime = Date.now()
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  const rect = telegramButton.value?.getBoundingClientRect()
  if (rect) {
    startOffset.x = clientX - rect.left
    startOffset.y = clientY - rect.top
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging) return
  
  // Prevent scrolling on mobile during drag gesture
  if (event.cancelable) event.preventDefault()
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  // Constrain inside viewport boundaries
  const buttonWidth = 56 // w-14
  const buttonHeight = 56 // h-14
  let x = clientX - startOffset.x
  let y = clientY - startOffset.y
  
  x = Math.max(10, Math.min(window.innerWidth - buttonWidth - 10, x))
  y = Math.max(10, Math.min(window.innerHeight - buttonHeight - 10, y))
  
  position.x = x
  position.y = y
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
}

// Differentiate drag vs click action
const handleTelegramClick = (event: MouseEvent) => {
  const dragDuration = Date.now() - dragStartTime
  if (dragDuration > 200) {
    // It was a drag gesture, prevent link navigation
    event.preventDefault()
    event.stopPropagation()
  }
}

onMounted(() => {
  checkAuth()
  loadNotifications()
  if (!isAuthenticated.value) {
    navigateTo('/login')
  } else {
    connectWebSocket()
  }
})

const handleLogout = () => {
  if (ws) {
    ws.close()
    ws = null
  }
  doLogout()
}

// ── WebSocket & Notifications Logic ──
const activeToasts = ref<Array<{id: string, title: string, message: string, type: string}>>([])
let ws: WebSocket | null = null

const dismissToast = (id: string) => {
  activeToasts.value = activeToasts.value.filter(n => n.id !== id)
}

const showToast = (title: string, message: string, type: string = 'INFO') => {
  const id = Math.random().toString(36).substring(7)
  activeToasts.value.push({ id, title, message, type })
  setTimeout(() => dismissToast(id), 6000)
}

const connectWebSocket = () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  const wsUrl = `wss://cctv-api.desa-sidomukti.com/ws/notifications?token=${token}`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.title && data.message) {
        showToast(data.title, data.message, data.type)
        addNotification({ title: data.title, message: data.message, type: data.type })
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e)
    }
  }

  ws.onclose = () => {
    console.log('WebSocket disconnected')
    // Attempt reconnect after 5 seconds if still authenticated
    if (isAuthenticated.value) {
      setTimeout(connectWebSocket, 5000)
    }
  }
}
</script>

<style>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all 0.2s ease;
  color: var(--wp-text-secondary);
  text-decoration: none;
}
.nav-link:hover {
  background: var(--wp-bg);
  color: var(--wp-text);
}
.nav-link.nav-active {
  background: rgba(212, 168, 67, 0.10);
  color: #B8922E;
  font-weight: 700;
}
.dark-mode .nav-link.nav-active {
  background: rgba(232, 196, 106, 0.15);
  color: var(--wp-gold);
}
.nav-link.nav-active svg,
.nav-link.nav-active .icon {
  color: #D4A843;
}
.dark-mode .nav-link.nav-active svg,
.dark-mode .nav-link.nav-active .icon {
  color: var(--wp-gold);
}

/* Mobile Nav Styles */
.mobile-nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--wp-text-secondary);
  transition: all 0.15s ease;
  text-decoration: none;
  height: 100%;
}
.mobile-nav-link.mobile-nav-active {
  color: #B8922E;
}
.dark-mode .mobile-nav-link.mobile-nav-active {
  color: var(--wp-gold);
}
.mobile-nav-link.mobile-nav-active svg,
.mobile-nav-link.mobile-nav-active .icon {
  color: #D4A843;
}
.dark-mode .mobile-nav-link.mobile-nav-active svg,
.dark-mode .mobile-nav-link.mobile-nav-active .icon {
  color: var(--wp-gold);
}

/* Custom Scrollbar for Sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 10px;
}
.dark-mode .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255,255,255,0.1);
}
</style>
