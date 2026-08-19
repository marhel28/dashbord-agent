<template>
  <div class="min-h-screen font-sans flex flex-col lg:flex-row text-foreground bg-background">
    <!-- ── Mobile Header Bar (< 1024px) ── -->
    <header class="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border shrink-0 sticky top-0 z-50 pt-safe bg-card">
      <div class="flex items-center gap-2">
        <img :src="logoSrc" class="w-8 h-8 object-contain" alt="Nahkoda AI Logo" />
        <div>
          <span class="font-black text-sm tracking-tight block leading-none text-secondary">Nahkoda</span>
          <span class="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mt-0.5">Admin Copilot</span>
        </div>
      </div>

      <!-- User & Logout for mobile header -->
      <div class="flex items-center gap-2.5">
        <!-- Quick Theme Toggle -->
        <button 
          @click="toggleTheme" 
          class="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
          :title="colorMode.value === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'"
        >
          <Icon v-if="colorMode.value === 'dark'" name="lucide:sun" class="w-4 h-4 text-amber-400" />
          <Icon v-else name="lucide:moon" class="w-4 h-4 text-slate-600" />
        </button>

        <NuxtLink to="/profile" v-if="user" class="flex items-center gap-2 hover:opacity-80 transition" title="Profil Saya">
          <Avatar class="w-7 h-7">
            <AvatarImage v-if="user.photo_profile" :src="user.photo_profile" alt="Profile" />
            <AvatarFallback class="bg-primary text-primary-foreground text-[10px] font-bold">
              {{ user.name?.charAt(0) || 'A' }}
            </AvatarFallback>
          </Avatar>
        </NuxtLink>

        <button @click="handleLogout" class="p-1.5 border border-border rounded-lg hover:bg-muted transition text-muted-foreground hover:text-red-600" title="Logout">
          <Icon name="heroicons:arrow-left-on-rectangle" class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- ── Sidebar (Desktop Devices >= 1024px) with Minimize / Expand ── -->
    <aside 
      :class="[
        'bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-0 flex flex-col justify-between hidden lg:flex shrink-0 sticky top-0 h-screen overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out z-30',
        isSidebarCollapsed ? 'w-[70px]' : 'w-[240px]'
      ]"
    >
      <div>
        <!-- Brand Header with Minimize Toggle -->
        <div :class="['p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between transition-all', isSidebarCollapsed ? 'px-3 justify-center flex-col gap-2' : 'px-5']">
          <div class="flex items-center gap-3 overflow-hidden">
            <img :src="logoSrc" class="w-8 h-8 object-contain shrink-0" alt="Nahkoda AI Logo" />
            <div v-if="!isSidebarCollapsed" class="transition-opacity duration-200">
              <h2 class="font-bold text-sm tracking-tight leading-none text-slate-900 dark:text-white">Nahkoda</h2>
              <p class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Admin Copilot</p>
            </div>
          </div>

          <!-- Minimize Toggle Button -->
          <button 
            @click="toggleSidebar" 
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition shrink-0"
            :title="isSidebarCollapsed ? 'Perluas Menu Sidebar' : 'Kecilkan Menu Sidebar'"
          >
            <Icon :name="isSidebarCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" class="w-4 h-4" />
          </button>
        </div>

        <div :class="['space-y-5', isSidebarCollapsed ? 'p-2' : 'p-4']">
          <!-- User Profile Card -->
          <NuxtLink 
            to="/profile" 
            v-if="user" 
            :class="[
              'flex items-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-lg',
              isSidebarCollapsed ? 'p-1.5 justify-center' : 'p-2.5 gap-3'
            ]" 
            :title="user.name"
          >
            <Avatar class="h-8 w-8 shrink-0 rounded-full">
              <AvatarImage v-if="user.photo_profile" :src="user.photo_profile" alt="Profile" />
              <AvatarFallback class="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-bold uppercase">
                {{ user.name?.charAt(0) || 'A' }}
              </AvatarFallback>
            </Avatar>
            <div v-if="!isSidebarCollapsed" class="overflow-hidden">
              <p class="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">{{ user.name }}</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ user.role === 'admin' ? 'Super Admin' : 'Admin Platform' }}</p>
            </div>
          </NuxtLink>

          <!-- Navigation Links -->
          <nav class="space-y-4">
            <!-- OVERVIEW -->
            <div>
              <p v-if="!isSidebarCollapsed" class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">OVERVIEW</p>
              <div v-else class="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-1"></div>
              <div class="space-y-0.5">
                <NuxtLink 
                  to="/" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="Command Center"
                >
                  <Icon name="lucide:layout-dashboard" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">Command Center</span>
                </NuxtLink>
              </div>
            </div>

            <!-- MERCHANTS -->
            <div>
              <p v-if="!isSidebarCollapsed" class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">MERCHANTS</p>
              <div v-else class="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-1"></div>
              <div class="space-y-0.5">
                <NuxtLink 
                  to="/merchants" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="Semua Pedagang"
                >
                  <Icon name="lucide:store" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">Semua Pedagang</span>
                </NuxtLink>
                <NuxtLink 
                  to="/merchants/new" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="Tambah Pedagang"
                >
                  <Icon name="lucide:user-plus" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">Tambah Pedagang</span>
                </NuxtLink>
                <NuxtLink 
                  to="/merchants/pending" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="Verifikasi Pending"
                >
                  <Icon name="lucide:clock" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">Verifikasi Pending</span>
                </NuxtLink>
                <NuxtLink 
                  to="/merchants/map" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="Peta Sebaran Nasional"
                >
                  <Icon name="lucide:map-pin" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">Peta Sebaran</span>
                </NuxtLink>
              </div>
            </div>

            <!-- PLATFORM & AI -->
            <div>
              <p v-if="!isSidebarCollapsed" class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">PLATFORM & AI</p>
              <div v-else class="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-1"></div>
              <div class="space-y-0.5">
                <NuxtLink 
                  to="/ai" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="AI & Agents"
                >
                  <Icon name="lucide:sparkles" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">AI & Agents</span>
                </NuxtLink>
                <NuxtLink 
                  to="/analytics" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="Data & Analitik"
                >
                  <Icon name="lucide:bar-chart-3" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">Data & Analitik</span>
                </NuxtLink>
                <NuxtLink 
                  to="/integrations" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="Integrasi & Konektor"
                >
                  <Icon name="lucide:plug" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">Integrasi & Konektor</span>
                </NuxtLink>
                <NuxtLink 
                  to="/system" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="System Health"
                >
                  <Icon name="lucide:server" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">System Health</span>
                </NuxtLink>
              </div>
            </div>

            <!-- SETTINGS -->
            <div>
              <p v-if="!isSidebarCollapsed" class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">SYSTEM</p>
              <div v-else class="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-1"></div>
              <div class="space-y-0.5">
                <NuxtLink 
                  to="/settings" 
                  exact-active-class="sidebar-clean-active" 
                  :class="['sidebar-clean-link', isSidebarCollapsed ? 'justify-center px-0' : '']"
                  title="Pengaturan"
                >
                  <Icon name="lucide:settings" class="w-4 h-4 shrink-0" />
                  <span v-if="!isSidebarCollapsed">Pengaturan</span>
                </NuxtLink>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <!-- Sidebar Bottom Action -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-800">
        <button 
          @click="handleLogout" 
          :class="[
            'w-full flex items-center rounded-lg text-xs font-medium transition text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-950/40',
            isSidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          ]"
          title="Keluar"
        >
          <Icon name="lucide:log-out" class="w-4 h-4 shrink-0" />
          <span v-if="!isSidebarCollapsed">Keluar</span>
        </button>
      </div>
    </aside>

    <!-- ── Main Workspace Area ── -->
    <div :class="['flex-1 flex flex-col min-w-0 pb-20 lg:pb-0', $route.path === '/merchants/map' ? 'h-screen overflow-hidden' : '']">
      <!-- Desktop Header Bar (Hidden on /merchants/map for full map height) -->
      <header v-if="$route.path !== '/merchants/map'" class="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 items-center justify-between shrink-0 sticky top-0 z-40 hidden lg:flex">
        <!-- Global Search -->
        <div class="flex items-center gap-3">
          <button 
            @click="toggleSidebar"
            class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            :title="isSidebarCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'"
          >
            <Icon :name="isSidebarCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" class="w-4 h-4" />
          </button>
          <GlobalSearch />
        </div>

        <div class="flex items-center gap-3">
          <div class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Admin Center</span>
          </div>

          <!-- Quick Theme Toggle -->
          <button 
            @click="toggleTheme" 
            class="p-2 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800" 
            :title="colorMode.value === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'"
          >
            <Icon v-if="colorMode.value === 'dark'" name="lucide:sun" class="w-5 h-5 text-amber-400" />
            <Icon v-else name="lucide:moon" class="w-5 h-5 text-slate-600" />
          </button>

          <NuxtLink to="/profile" class="ring-2 ring-transparent hover:ring-primary rounded-full transition-transform hover:scale-105" title="Profil Saya">
            <Avatar class="h-8 w-8">
              <AvatarImage v-if="user?.photo_profile" :src="user.photo_profile" alt="Profile" />
              <AvatarFallback class="bg-primary text-primary-foreground text-xs font-bold">
                {{ user?.name?.charAt(0) || 'A' }}
              </AvatarFallback>
            </Avatar>
          </NuxtLink>
        </div>
      </header>

      <main :class="$route.path === '/merchants/map' ? 'flex-1 overflow-hidden p-0 h-full w-full' : 'flex-1 overflow-y-auto p-4 sm:p-8'">
        <slot />
      </main>
    </div>

    <!-- ── Draggable Floating Telegram Action Button ── -->
    <div
      v-if="$route.path !== '/merchants/map'"
      ref="telegramButton"
      @mousedown="startDrag"
      @touchstart="startDrag"
      class="fixed z-40 flex items-center justify-center w-14 h-14 bg-[#26A5E4] hover:bg-[#208bbf] text-white shadow-xl transition-transform hover:scale-105 active:scale-95 group cursor-move select-none bottom-20 lg:bottom-6"
      :style="{
        borderRadius: '9999px',
        boxShadow: '0 8px 24px rgba(38, 165, 228, 0.4)',
        left: position.x !== null ? position.x + 'px' : 'auto',
        top: position.y !== null ? position.y + 'px' : 'auto',
        right: position.x === null ? '24px' : 'auto',
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

    <!-- ── Mobile Bottom Navigation Bar (< 1024px) ── -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50">
      <NuxtLink to="/" exact-active-class="text-primary" class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
        <Icon name="heroicons:rectangle-group" class="w-5 h-5" />
        <span>Home</span>
      </NuxtLink>
      <NuxtLink to="/merchants" exact-active-class="text-primary" class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" :class="{ 'text-primary': $route.path.startsWith('/merchants') }">
        <Icon name="heroicons:building-storefront" class="w-5 h-5" />
        <span>Pedagang</span>
      </NuxtLink>
      <NuxtLink to="/ai" exact-active-class="text-primary" class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" :class="{ 'text-primary': $route.path.startsWith('/ai') }">
        <Icon name="heroicons:sparkles" class="w-5 h-5" />
        <span>AI</span>
      </NuxtLink>
      <NuxtLink to="/analytics" exact-active-class="text-primary" class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" :class="{ 'text-primary': $route.path.startsWith('/analytics') }">
        <Icon name="heroicons:chart-bar" class="w-5 h-5" />
        <span>Analitik</span>
      </NuxtLink>
      <NuxtLink to="/settings" exact-active-class="text-primary" class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" :class="{ 'text-primary': $route.path.startsWith('/settings') }">
        <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
        <span>Setelan</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user, isAuthenticated, checkAuth, logout: doLogout } = useAuth()
const colorMode = useColorMode()

// Sidebar Minimize / Expand state
const isSidebarCollapsed = ref(false)
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  if (typeof window !== 'undefined') {
    localStorage.setItem('nahkoda_sidebar_collapsed', isSidebarCollapsed.value ? 'true' : 'false')
    // Trigger window resize so charts / maps re-fit smoothly
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 320)
  }
}

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const logoSrc = computed(() => {
  return colorMode.value === 'dark' ? '/logo_darkmode.png' : '/logo_lightmode.png'
})

// Draggable Telegram Floating Button logic
const position = reactive({
  x: null as number | null,
  y: null as number | null
})

let isDragging = false
let startOffset = { x: 0, y: 0 }
let dragStartTime = 0

const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging = true
  dragStartTime = Date.now()
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  const button = event.currentTarget as HTMLElement
  if (button) {
    const rect = button.getBoundingClientRect()
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
  
  if (event.cancelable) event.preventDefault()
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  const buttonWidth = 56
  const buttonHeight = 56
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

const handleTelegramClick = (event: MouseEvent) => {
  const dragDuration = Date.now() - dragStartTime
  if (dragDuration > 200) {
    event.preventDefault()
    event.stopPropagation()
  }
}

onMounted(() => {
  checkAuth()
  if (!isAuthenticated.value) {
    navigateTo('/login')
  }

  // Restore saved sidebar collapsed preference
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nahkoda_sidebar_collapsed')
    if (saved === 'true') {
      isSidebarCollapsed.value = true
    }
  }
})

const handleLogout = () => {
  doLogout()
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
  background: #d1fae5; /* emerald-100 */
  color: #047857; /* emerald-700 */
  font-weight: 700;
  border-left: 3.5px solid #10b981;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}
.sidebar-clean-link.sidebar-clean-active svg,
.sidebar-clean-link.sidebar-clean-active .icon {
  color: #047857;
}
.dark .sidebar-clean-link.sidebar-clean-active {
  background: rgba(16, 185, 129, 0.14); /* Soft translucent glow */
  color: #34d399; /* Emerald 400 */
  font-weight: 700;
  border-left: 3.5px solid #10b981;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}
.dark .sidebar-clean-link.sidebar-clean-active svg,
.dark .sidebar-clean-link.sidebar-clean-active .icon {
  color: #34d399;
}
</style>
