<template>
  <div class="min-h-screen font-sans flex flex-col md:flex-row text-foreground bg-background">
    <!-- ── Mobile Header Bar ── -->
    <header class="md:hidden flex items-center justify-between px-4 py-3 border-b border-border shrink-0 sticky top-0 z-50 pt-safe bg-card">
      <div class="flex items-center gap-2">
        <img :src="logoSrc" class="w-8 h-8 object-contain" alt="Nahkoda AI Logo" />
        <div>
          <span class="font-black text-sm tracking-tight block leading-none text-secondary">Nahkoda AI</span>
          <span class="text-[7px] font-bold text-muted-foreground uppercase tracking-widest block mt-0.5">Business Copilot</span>
        </div>
      </div>

      <!-- Logout / Mini User profile button for mobile header -->
      <div class="flex items-center gap-3">
        <NuxtLink to="/profile" v-if="user" class="flex items-center gap-2 hover:opacity-80 transition" title="Profil Saya">
          <Avatar v-if="user.photo_profile" class="w-7 h-7">
            <AvatarImage :src="user.photo_profile" alt="Profile" />
          </Avatar>
          <span class="text-[10px] font-bold px-2.5 py-1 rounded bg-accent text-accent-foreground">
            {{ user.name }}
          </span>
        </NuxtLink>
        <button @click="handleLogout" class="p-1.5 border border-border rounded hover:bg-muted transition" title="Logout">
          <Icon name="heroicons:arrow-left-on-rectangle" class="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>

    <!-- ── Sidebar (Desktop Devices >= 768px) ── -->
    <aside class="w-[232px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-0 flex flex-col justify-between hidden md:flex shrink-0 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
      <div>
        <!-- Brand Header (Dark Green Accent Box) -->
        <div class="p-5 bg-[#003B32] text-white flex items-center gap-3">
          <img :src="logoSrc" class="w-8 h-8 object-contain shrink-0" alt="Nahkoda AI Logo" />
          <div>
            <h2 class="font-bold text-sm tracking-tight leading-none text-white">Nahkoda</h2>
            <p class="text-[10px] font-medium text-emerald-300 mt-0.5">Business Copilot</p>
          </div>
        </div>

        <div class="p-4 space-y-5">
          <!-- User Store Card -->
          <NuxtLink to="/profile" v-if="user" class="p-2.5 flex items-center gap-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-lg" title="Lihat Profil">
            <Avatar v-if="user.photo_profile" class="h-8 w-8 shrink-0 rounded-full">
              <AvatarImage :src="user.photo_profile" alt="Profile" />
            </Avatar>
            <Avatar v-else class="h-8 w-8 shrink-0 rounded-full">
              <AvatarFallback class="bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                {{ user.name?.charAt(0) || 'U' }}
              </AvatarFallback>
            </Avatar>
            <div class="overflow-hidden">
              <p class="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">{{ user.name }}</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ user.role === 'admin' ? 'Admin Utama' : user.store_name }}</p>
            </div>
          </NuxtLink>

          <nav class="space-y-5">
            <!-- OVERVIEW -->
            <div>
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">OVERVIEW</p>
              <div class="space-y-0.5">
                <NuxtLink to="/dashboard" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:layout-dashboard" class="w-4 h-4" />
                  <span>Dashboard</span>
                </NuxtLink>
              </div>
            </div>

            <!-- BUSINESS -->
            <div>
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">BUSINESS</p>
              <div class="space-y-0.5">
                <NuxtLink to="/inventory" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:package" class="w-4 h-4" />
                  <span>Produk & Stok</span>
                </NuxtLink>
                <NuxtLink to="/sales-report" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:receipt-text" class="w-4 h-4" />
                  <span>Penjualan</span>
                </NuxtLink>
                <NuxtLink to="/finance" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:circle-dollar-sign" class="w-4 h-4" />
                  <span>Keuangan</span>
                </NuxtLink>
                <NuxtLink to="/dompet" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:wallet" class="w-4 h-4" />
                  <span>Dompet</span>
                </NuxtLink>
                <NuxtLink to="/marketing" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:megaphone" class="w-4 h-4" />
                  <span>Pemasaran</span>
                </NuxtLink>
                <NuxtLink v-if="showCrm" to="/customers" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:users" class="w-4 h-4" />
                  <span>Pelanggan</span>
                </NuxtLink>
              </div>
            </div>

            <!-- COPILOT -->
            <div>
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">COPILOT</p>
              <div class="space-y-0.5">
                <NuxtLink to="/chat" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:sparkles" class="w-4 h-4" />
                  <span>Asisten AI</span>
                </NuxtLink>
                <NuxtLink to="/decision-support" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:lightbulb" class="w-4 h-4" />
                  <span>AI Insights</span>
                </NuxtLink>
                <NuxtLink to="/automation" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:bot" class="w-4 h-4" />
                  <span>Otomatisasi</span>
                </NuxtLink>
                <NuxtLink to="/memory" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:cpu" class="w-4 h-4" />
                  <span>Memory</span>
                </NuxtLink>
              </div>
            </div>

            <!-- SYSTEM -->
            <div>
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">SYSTEM</p>
              <div class="space-y-0.5">
                <NuxtLink to="/konektor" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:plug" class="w-4 h-4" />
                  <span>Integrasi</span>
                </NuxtLink>
                <NuxtLink to="/documents" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:file-text" class="w-4 h-4" />
                  <span>Dokumen</span>
                </NuxtLink>
                <NuxtLink to="/settings" exact-active-class="sidebar-clean-active" class="sidebar-clean-link">
                  <Icon name="lucide:settings" class="w-4 h-4" />
                  <span>Pengaturan</span>
                </NuxtLink>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div class="p-4 border-t border-slate-200 dark:border-slate-800">
        <button @click="handleLogout" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-950/40">
          <Icon name="lucide:log-out" class="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <!-- ── Main Area ── -->
    <div class="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
      <header class="h-16 bg-card/80 backdrop-blur-md border-b border-border px-8 items-center justify-between shrink-0 sticky top-0 z-50 hidden md:flex">
        <!-- Global Search -->
        <GlobalSearch />
        <div class="flex items-center gap-4">
          <Badge variant="secondary" class="tracking-wide">Asisten AI</Badge>
          <NuxtLink to="/notifikasi" class="relative p-2 transition text-muted-foreground hover:text-foreground">
            <Icon name="heroicons:bell" class="w-5 h-5" />
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold text-secondary-foreground shadow bg-secondary">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </NuxtLink>
          <button class="p-2 transition text-muted-foreground hover:text-foreground">
            <Icon name="heroicons:question-mark-circle" class="w-5 h-5" />
          </button>
          <NuxtLink to="/profile" class="ring-2 ring-transparent hover:ring-primary rounded-full transition-transform hover:scale-105" title="Profil Saya">
            <Avatar class="h-8 w-8">
              <AvatarImage v-if="user?.photo_profile" :src="user.photo_profile" alt="Profile" />
              <AvatarFallback class="bg-primary text-primary-foreground text-xs font-bold">
                {{ user?.name?.charAt(0) || 'U' }}
              </AvatarFallback>
            </Avatar>
          </NuxtLink>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 md:pb-6" :style="{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }">
        <slot />
      </main>
    </div>

    <!-- ── Global Agentic AI Floating Chatbot Widget ── -->
    <FloatingChatWidget />

    <!-- ── Draggable Floating Telegram Action Button ── -->
    <div
      ref="telegramButton"
      @mousedown="startDrag"
      @touchstart="startDrag"
      class="fixed z-40 flex items-center justify-center w-14 h-14 bg-[#26A5E4] hover:bg-[#208bbf] text-white shadow-xl transition-transform hover:scale-105 active:scale-95 group cursor-move select-none bottom-20 md:bottom-6"
      :style="{
        borderRadius: '9999px',
        boxShadow: '0 8px 24px rgba(38, 165, 228, 0.4)',
        left: position.x !== null ? position.x + 'px' : 'auto',
        top: position.y !== null ? position.y + 'px' : 'auto',
        right: position.x === null ? '90px' : 'auto',
        bottom: position.y === null ? '24px' : 'auto'
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

    <!-- ── Mobile Bottom Navigation Bar (< 768px) ── -->
    <MobileBottomNav @logout="handleLogout" :show-crm="showCrm" :is-expert="isExpert" />

    <!-- ── Toast Notifications ── -->
    <div class="fixed top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
      <div v-for="toast in activeToasts" :key="toast.id" class="bg-card border-l-4 border-border shadow-lg rounded-md p-4 pr-10 relative pointer-events-auto min-w-[300px] animate-fade-in-up" :style="`border-left-color: ${toast.type === 'NEW_TRANSACTION' ? 'var(--secondary)' : 'var(--success)'};`">
        <button @click="dismissToast(toast.id)" class="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
        <h4 class="text-sm font-bold text-card-foreground">{{ toast.title }}</h4>
        <p class="text-xs text-muted-foreground mt-1">{{ toast.message }}</p>
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

// Store mode: 'basic' hides Tim, Operasional, Monitoring. 'expert' shows all.
const storeMode = ref<'basic' | 'expert'>('basic')
onMounted(() => {
  const saved = localStorage.getItem('store_mode')
  if (saved === 'basic' || saved === 'expert') {
    storeMode.value = saved
  }
})
const isExpert = computed(() => storeMode.value === 'expert')

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

// ── JWT expiry check (token valid for 1 hour) ──
const isTokenValid = (token) => {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // convert to ms
    return Date.now() < exp
  } catch {
    return false
  }
}

const connectWebSocket = () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  // Don't connect with expired token — will cause infinite reconnect loop
  if (!isTokenValid(token)) {
    console.log('WebSocket: token expired, skipping connection')
    return
  }

  const wsUrl = `wss://cctv-api.desa-sidomukti.com/ws/notifications?token=${token}`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      // Handle token_expired error from server
      if (data.type === 'error' && data.code === 'token_expired') {
        console.log('WebSocket: server reported token expired')
        ws?.close()
        return
      }
      if (data.title && data.message) {
        showToast(data.title, data.message, data.type)
        addNotification({ title: data.title, message: data.message, type: data.type })
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e)
    }
  }

  ws.onclose = (event) => {
    console.log(`WebSocket disconnected (code: ${event.code})`)
    // Don't reconnect if token is expired (code 1008 = policy violation)
    if (event.code === 1008) {
      console.log('WebSocket: auth failed, not reconnecting')
      return
    }
    // Attempt reconnect after 5 seconds if still authenticated
    if (isAuthenticated.value) {
      setTimeout(connectWebSocket, 5000)
    }
  }
}
</script>

<style>
.sidebar-clean-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.15s ease;
  color: #475569; /* slate-600 */
  text-decoration: none;
}
.sidebar-clean-link:hover {
  background: #f1f5f9; /* slate-100 */
  color: #0f172a; /* slate-900 */
}
.dark .sidebar-clean-link {
  color: #94a3b8;
}
.dark .sidebar-clean-link:hover {
  background: #1e293b;
  color: #f8fafc;
}
.sidebar-clean-link.sidebar-clean-active {
  background: #d1fae5; /* emerald-100 (#D1FAE5) */
  color: #047857; /* emerald-700 (#047857) */
  font-weight: 600;
}
.sidebar-clean-link.sidebar-clean-active svg,
.sidebar-clean-link.sidebar-clean-active .icon {
  color: #047857;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.15s ease;
  color: var(--muted-foreground);
  text-decoration: none;
}
.nav-link:hover {
  background: var(--muted);
  color: var(--foreground);
}
.nav-link.nav-active {
  background: var(--accent);
  color: var(--accent-foreground);
  font-weight: 600;
}
.nav-link.nav-active svg,
.nav-link.nav-active .icon {
  color: var(--primary);
}

/* Mobile Nav Styles */
.mobile-nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--muted-foreground);
  transition: all 0.15s ease;
  text-decoration: none;
  height: 100%;
}
.mobile-nav-link.mobile-nav-active {
  color: var(--sidebar-accent-foreground);
}
.mobile-nav-link.mobile-nav-active svg,
.mobile-nav-link.mobile-nav-active .icon {
  color: var(--sidebar-primary);
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
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255,255,255,0.1);
}
</style>
