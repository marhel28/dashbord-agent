<template>
  <div class="fixed z-[90] bottom-20 md:bottom-6 right-4 md:right-6 select-none font-sans">
    <!-- ═══════════ 1. FLOATING ACTION BUTTON (3D AVATAR TRIGGER) ═══════════ -->
    <Transition name="fab-scale">
      <button
        v-if="!isOpen"
        @click="toggleChat"
        class="w-14 h-14 rounded-full bg-gradient-to-br from-[#003B32] via-[#047857] to-[#065f46] text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative border-2 border-emerald-300/40 cursor-pointer overflow-visible"
        :style="{
          boxShadow: '0 10px 25px -3px rgba(4, 120, 87, 0.5), 0 4px 12px rgba(0, 0, 0, 0.25)'
        }"
        title="Buka Asisten AI Nahkoda"
      >
        <!-- 3D Popout Avatar Head Image -->
        <div class="relative w-12 h-12 flex items-center justify-center -translate-y-0.5">
          <img
            src="/agent-avatar/nahkoda-head.png"
            alt="Nahkoda AI 3D Copilot"
            class="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform"
          />
        </div>

        <!-- Pulsing 3D Status Indicator Badge -->
        <span class="absolute -top-1 -right-1 flex h-4 w-4">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-black text-white items-center justify-center shadow-md border border-white dark:border-slate-900">
            <Icon name="lucide:sparkles" class="w-2.5 h-2.5 text-white" />
          </span>
        </span>
      </button>
    </Transition>

    <!-- ═══════════ 2. FLOATING CHAT WORKSPACE (POPOVER) ═══════════ -->
    <Transition name="chat-pop">
      <div
        v-if="isOpen"
        class="w-[calc(100vw-2rem)] sm:w-96 h-[540px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative"
      >
        <!-- ── Header ── -->
        <div class="p-3.5 bg-gradient-to-r from-[#003B32] to-[#047857] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-0.5 overflow-hidden">
              <img src="/agent-avatar/nahkoda-head.png" alt="Nahkoda Copilot" class="w-full h-full object-contain filter drop-shadow-xs" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="text-xs font-bold leading-none tracking-tight">Nahkoda Copilot</h3>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p class="text-[10px] text-emerald-200/80 mt-0.5 font-medium leading-none">
                {{ contextSubtitle }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <!-- Fullscreen / Expand to /chat -->
            <button
              @click="expandToFullChat"
              class="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Buka Halaman Penuh"
            >
              <Icon name="lucide:maximize-2" class="w-3.5 h-3.5" />
            </button>

            <!-- Voice Mode Toggle -->
            <button
              @click="toggleVoiceMode"
              class="p-1.5 rounded-lg transition-colors"
              :class="voiceMode ? 'text-emerald-300 bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'"
              :title="voiceMode ? 'Suara Aktif' : 'Mode Teks'"
            >
              <Icon :name="voiceMode ? 'lucide:volume-2' : 'lucide:volume-x'" class="w-3.5 h-3.5" />
            </button>

            <!-- Minimize / Close Button -->
            <button
              @click="isOpen = false"
              class="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Tutup Widget"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- ── Messages Scroll Area ── -->
        <div ref="chatScrollContainer" class="flex-1 overflow-y-auto p-3.5 space-y-4 bg-slate-50/60 dark:bg-slate-950/60 custom-scrollbar text-xs">
          
          <!-- Context-Aware Initial Greeting Pill -->
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div class="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
              <Icon name="lucide:sparkles" class="w-3.5 h-3.5" />
              <span>Konteks Halaman: {{ currentPageLabel }}</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {{ contextGreeting }}
            </p>

            <!-- Quick Action Chips for Current Route -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <button
                v-for="(chip, idx) in currentContextPrompts"
                :key="idx"
                @click="sendPrompt(chip.prompt)"
                class="px-2.5 py-1 rounded-md bg-emerald-50 text-[#047857] hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 text-[10px] font-semibold transition-all text-left flex items-center gap-1"
              >
                <Icon :name="chip.icon" class="w-3 h-3 shrink-0" />
                <span>{{ chip.label }}</span>
              </button>
            </div>
          </div>

          <!-- Chat Messages -->
          <div v-for="(msg, i) in messages" :key="i" class="flex flex-col gap-1">
            <div :class="['flex items-center gap-1.5 px-1', msg.role === 'user' ? 'justify-end' : 'justify-start']">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {{ msg.role === 'user' ? 'Anda' : 'Nahkoda AI' }}
              </span>
              <span class="text-[9px] font-mono text-slate-400">{{ msg.time }}</span>

              <button
                v-if="msg.role === 'agent' && msg.audioUrl"
                @click="playAudio(msg.audioUrl)"
                class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-0.5"
                title="Dengarkan Suara"
              >
                <Icon name="lucide:volume-2" class="w-2.5 h-2.5" />
              </button>
            </div>

            <!-- Message Bubble -->
            <div
              :class="['p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap shadow-2xs transition-all max-w-[90%]',
                msg.role === 'user'
                  ? 'bg-[#047857] text-white self-end rounded-tr-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 self-start rounded-tl-xs']"
            >
              <span>{{ msg.content }}</span>

              <!-- Embedded Action CTA Parser (If response mentions specific actions) -->
              <div v-if="msg.role === 'agent' && hasActionableSuggestion(msg.content)" class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                <button
                  v-for="(action, aIdx) in getActionableSuggestions(msg.content)"
                  :key="aIdx"
                  @click="triggerAction(action.route, action.actionPrompt)"
                  class="px-2.5 py-1 rounded-md bg-[#047857] text-white hover:bg-[#065f46] text-[10px] font-bold shadow-xs flex items-center gap-1 transition-all"
                >
                  <Icon :name="action.icon" class="w-3 h-3" />
                  <span>{{ action.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isSending" class="flex items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 w-fit">
            <span class="w-1.5 h-1.5 bg-[#047857] rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
            <span class="w-1.5 h-1.5 bg-[#047857] rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
            <span class="w-1.5 h-1.5 bg-[#047857] rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
            <span class="text-[10px] text-slate-400 ml-1 font-medium">Sedang memproses...</span>
          </div>
        </div>

        <!-- ── Footer Input Area ── -->
        <div class="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
          <!-- Voice Stop Button if speaking -->
          <div v-if="isSpeaking" class="flex justify-between items-center px-2 py-1 bg-amber-50 rounded-md text-[10px] text-amber-800 border border-amber-200">
            <span class="font-medium">AI sedang berbicara...</span>
            <button @click="stopAudio" class="font-bold underline text-amber-900">Hentikan</button>
          </div>

          <form @submit.prevent="sendPrompt()" class="flex items-center gap-1.5">
            <!-- Voice Input Button -->
            <button
              type="button"
              @click="handleMicClick"
              :disabled="isSending"
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              :class="isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
              :title="isRecording ? 'Berhenti merekam' : 'Rekam suara'"
            >
              <Icon :name="isRecording ? 'lucide:square' : 'lucide:mic'" class="w-4 h-4" />
            </button>

            <!-- Text Input -->
            <input
              v-model="inputMessage"
              type="text"
              :disabled="isSending || isRecording"
              :placeholder="isRecording ? 'Mendengarkan...' : 'Perintahkan AI Copilot...'"
              class="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:border-[#047857] text-slate-900 dark:text-slate-100"
            />

            <!-- Send Button -->
            <button
              type="submit"
              :disabled="!inputMessage.trim() || isSending || isRecording"
              class="w-8 h-8 rounded-lg bg-[#047857] hover:bg-[#065f46] text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-xs"
            >
              <Icon name="lucide:send" class="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAiAssistant } from '~/composables/useAiAssistant'

const route = useRoute()
const router = useRouter()

const isOpen = ref(false)
const inputMessage = ref('')
const chatScrollContainer = ref<HTMLElement | null>(null)

const {
  messages,
  isSending,
  isSpeaking,
  isRecording,
  voiceMode,
  sendMessage: _sendMessage,
  startRecording,
  stopRecording,
  toggleVoiceMode: _toggleVoiceMode,
  playAudio,
  stopAudio
} = useAiAssistant()

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

const toggleVoiceMode = () => {
  _toggleVoiceMode()
}

const handleMicClick = () => {
  if (isSpeaking.value) {
    stopAudio()
    return
  }
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight
  }
}

watch(() => messages.value.length, () => {
  scrollToBottom()
})

const sendPrompt = async (text?: string) => {
  const query = (text || inputMessage.value).trim()
  if (!query || isSending.value) return

  inputMessage.value = ''
  await _sendMessage(query)
  scrollToBottom()
}

const expandToFullChat = () => {
  isOpen.value = false
  router.push('/chat')
}

// ── Context-Aware Helpers based on route.path ──
const currentPageLabel = computed(() => {
  const path = route.path
  if (path.includes('/inventory')) return 'Produk & Stok'
  if (path.includes('/sales-report')) return 'Laporan Penjualan'
  if (path.includes('/finance')) return 'Keuangan'
  if (path.includes('/marketing')) return 'Pemasaran'
  if (path.includes('/decision-support')) return 'AI Insights'
  if (path.includes('/automation')) return 'Otomatisasi'
  if (path.includes('/dompet')) return 'Dompet & Kas'
  return 'Ringkasan Dashboard'
})

const contextSubtitle = computed(() => {
  return `Aktif di modul ${currentPageLabel.value}`
})

const contextGreeting = computed(() => {
  const path = route.path
  if (path.includes('/inventory')) {
    return 'Saya dapat membantu memeriksa stok menipis, memprediksi kebutuhan restock barang, atau menghitung nilai persediaan.'
  }
  if (path.includes('/sales-report')) {
    return 'Ingin melihat ringkasan omset penjualan hari ini, produk paling laris, atau perbandingan performa kasir?'
  }
  if (path.includes('/marketing')) {
    return 'Saya siap membuatkan ide promo bundling, diskon akhir pekan, atau merancang konten poster produk toko Anda.'
  }
  if (path.includes('/finance') || path.includes('/dompet')) {
    return 'Butuh perhitungan laba bersih, estimasi arus kas, atau rincian pengeluaran operasional warung?'
  }
  return 'Halo! Saya asisten Nahkoda AI. Ketik pertanyaan atau pilih aksi cepat berikut untuk memulai.'
})

const currentContextPrompts = computed(() => {
  const path = route.path
  if (path.includes('/inventory')) {
    return [
      { label: 'Cek Stok Menipis', prompt: 'Barang apa saja yang stoknya hampir habis dan perlu segera di-restock?', icon: 'lucide:alert-triangle' },
      { label: 'Estimasi Nilai Stok', prompt: 'Berapa total estimasi nilai persediaan stok barang di toko saat ini?', icon: 'lucide:boxes' }
    ]
  }
  if (path.includes('/sales-report')) {
    return [
      { label: 'Ringkasan Omset', prompt: 'Berapa total pendapatan penjualan toko saya minggu ini?', icon: 'lucide:trending-up' },
      { label: 'Produk Terlaris', prompt: 'Apa saja 5 produk yang paling banyak terjual belakangan ini?', icon: 'lucide:award' }
    ]
  }
  if (path.includes('/marketing')) {
    return [
      { label: 'Ide Promo Bundling', prompt: 'Buatkan ide promo bundling hemat untuk produk sembako dan minuman.', icon: 'lucide:megaphone' },
      { label: 'Caption WhatsApp', prompt: 'Buatkan teks promosi WhatsApp ramah untuk pelanggan toko saya.', icon: 'lucide:message-circle' }
    ]
  }
  return [
    { label: 'Cek Performa Toko', prompt: 'Bagaimana ringkasan kesehatan bisnis toko saya saat ini?', icon: 'lucide:activity' },
    { label: 'Rekomendasi AI', prompt: 'Apa keputusan paling mendesak yang harus saya ambil hari ini?', icon: 'lucide:lightbulb' }
  ]
})

// ── Actionable Suggestions in AI Chat Bubbles ──
const hasActionableSuggestion = (content: string) => {
  if (!content) return false
  const lower = content.toLowerCase()
  return lower.includes('stok') || lower.includes('promo') || lower.includes('penjualan') || lower.includes('laporan')
}

const getActionableSuggestions = (content: string) => {
  const lower = content.toLowerCase()
  const list = []
  if (lower.includes('stok')) {
    list.push({ label: 'Buka Stok Barang', route: '/inventory', icon: 'lucide:package', actionPrompt: '' })
  }
  if (lower.includes('promo') || lower.includes('pemasaran')) {
    list.push({ label: 'Buka Menu Pemasaran', route: '/marketing', icon: 'lucide:megaphone', actionPrompt: '' })
  }
  if (lower.includes('penjualan') || lower.includes('pendapatan')) {
    list.push({ label: 'Lihat Laporan Penjualan', route: '/sales-report', icon: 'lucide:receipt-text', actionPrompt: '' })
  }
  return list
}

const triggerAction = (targetRoute: string, _prompt?: string) => {
  isOpen.value = false
  router.push(targetRoute)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.12);
  border-radius: 10px;
}

/* Transitions */
.fab-scale-enter-active,
.fab-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fab-scale-enter-from,
.fab-scale-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

.chat-pop-enter-active,
.chat-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-pop-enter-from,
.chat-pop-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}
</style>
