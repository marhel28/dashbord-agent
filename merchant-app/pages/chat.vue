<template>
  <div class="flex h-[calc(100vh-6rem)] w-full items-center justify-center animate-fade-in p-2 sm:p-4 max-w-7xl mx-auto">
    <!-- Main Chat Workspace Card -->
    <div class="w-full max-w-4xl h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden relative">

      <!-- ═══════════ HEADER ═══════════ -->
      <div class="h-16 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#003B32] text-emerald-300 shadow-xs">
            <Icon name="lucide:bot" class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Nahkoda Copilot AI</h2>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Online
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Asisten bisnis cerdas toko Anda
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Audio Interruption Stop Button -->
          <Button
            v-if="isSpeaking"
            @click="stopAudio"
            size="sm"
            variant="destructive"
            class="h-8 text-[11px] font-semibold gap-1.5 animate-pulse rounded-lg"
          >
            <Icon name="lucide:square" class="w-3.5 h-3.5" />
            <span>Hentikan Suara</span>
          </Button>

          <!-- Voice / Text Mode Toggle -->
          <Button
            @click="toggleVoiceMode"
            size="sm"
            variant="outline"
            class="h-8 text-[11px] font-semibold gap-1.5 rounded-lg border-slate-200 dark:border-slate-800"
          >
            <Icon :name="voiceMode ? 'lucide:mic' : 'lucide:volume-2'" class="w-3.5 h-3.5 text-emerald-600" />
            <span>{{ voiceMode ? 'Suara Aktif' : 'Mode Teks' }}</span>
          </Button>

          <!-- Clear Chat -->
          <Button
            @click="clearChat"
            size="sm"
            variant="ghost"
            class="h-8 text-[11px] font-semibold gap-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
            title="Bersihkan Percakapan"
          >
            <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
            <span>Bersihkan</span>
          </Button>
        </div>
      </div>

      <!-- ═══════════ MESSAGES AREA ═══════════ -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 sm:p-6 relative z-10 custom-scrollbar scroll-smooth space-y-6">

        <!-- Clean Professional Empty State -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center py-8 space-y-6">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003B32] to-[#047857] text-white flex items-center justify-center shadow-md">
            <Icon name="lucide:sparkles" class="w-8 h-8 text-emerald-300" />
          </div>

          <div class="space-y-1.5">
            <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">Halo! Saya Asisten AI Nahkoda</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Saya siap membantu Anda menganalisis penjualan, memeriksa stok barang, merancang promosi produk, atau menjawab pertanyaan bisnis toko Anda.
            </p>
          </div>

          <!-- Interactive Suggestion Pills -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
            <button
              v-for="(ex, i) in exampleQuestions"
              :key="i"
              @click="sendMessage(ex.text)"
              class="group text-left p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 hover:border-emerald-300 transition-all text-xs space-y-1"
            >
              <div class="flex items-center gap-2">
                <Icon :name="ex.icon" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span class="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{{ ex.title }}</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{{ ex.desc }}</p>
            </button>
          </div>
        </div>

        <!-- Chat Messages List -->
        <TransitionGroup v-else name="chat-list" tag="div" class="space-y-6 flex flex-col w-full">
          <div v-for="(msg, i) in messages" :key="'msg-'+i" :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div :class="['flex gap-3 max-w-[85%] sm:max-w-[75%]', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row']">

              <!-- Avatar Icon -->
              <div class="shrink-0 hidden sm:block">
                <div v-if="msg.role === 'agent'" class="w-8 h-8 rounded-xl flex items-center justify-center bg-[#003B32] text-emerald-300 shadow-xs">
                  <Icon name="lucide:bot" class="w-4 h-4" />
                </div>
                <div v-else class="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
                  <Icon name="lucide:user" class="w-4 h-4" />
                </div>
              </div>

              <!-- Message Bubble Content -->
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 px-1" :class="[msg.role === 'user' ? 'justify-end' : 'justify-start']">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {{ msg.role === 'user' ? 'Anda' : 'Nahkoda AI' }}
                  </span>
                  <span class="text-[10px] font-mono text-slate-400">{{ msg.time }}</span>

                  <button
                    v-if="msg.role === 'agent' && msg.audioUrl"
                    @click="playAudio(msg.audioUrl)"
                    class="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1 hover:bg-emerald-100"
                    title="Putar Suara"
                  >
                    <Icon name="lucide:volume-2" class="w-3 h-3" />
                  </button>
                </div>

                <!-- DISTINCT CHAT BUBBLES -->
                <div
                  :class="['p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap rounded-2xl shadow-2xs transition-all',
                    msg.role === 'user'
                      ? 'bg-[#047857] text-white rounded-tr-xs font-sans'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs']"
                >
                  <span>{{ msg.content }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isSending" key="typing-indicator" class="flex w-full justify-start">
            <div class="flex gap-3 max-w-[85%] sm:max-w-[75%] flex-row">
              <div class="shrink-0 hidden sm:block">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-[#003B32] text-emerald-300 shadow-xs">
                  <Icon name="lucide:bot" class="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Nahkoda AI</span>
                <div class="p-4 rounded-2xl rounded-tl-xs border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center gap-2 h-10">
                  <span class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
                  <span class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
                  <span class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- ═══════════ FOOTER / INPUT AREA ═══════════ -->
      <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative z-10">
        <div v-if="error" class="max-w-4xl mx-auto mb-2 p-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 flex justify-between items-center">
          <span>{{ error }}</span>
          <button @click="error = null" class="font-bold underline">Tutup</button>
        </div>

        <div class="max-w-4xl mx-auto relative flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-emerald-500 transition-all shadow-2xs">
          <!-- Integrated Microphone Button -->
          <button
            @click="handleMicClick"
            :disabled="isSending"
            class="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all"
            :class="isSpeaking ? 'bg-amber-500 text-white animate-pulse' : isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'"
            :title="isSpeaking ? 'Hentikan AI berbicara' : isRecording ? 'Berhenti merekam' : 'Mulai rekam suara'"
          >
            <Icon :name="isSpeaking ? 'lucide:volume-x' : isRecording ? 'lucide:square' : 'lucide:mic'" class="w-4 h-4" />
          </button>

          <textarea
            v-model="inputText"
            rows="1"
            :placeholder="isRecording ? 'Merekam suara Anda…' : 'Ketik pertanyaan atau perintah untuk Nahkoda AI…'"
            class="flex-1 max-h-28 min-h-[38px] bg-transparent resize-none outline-none text-xs sm:text-sm py-2 px-1 text-slate-900 dark:text-slate-100 placeholder-slate-400 custom-scrollbar"
            @keydown.enter.prevent="sendMessage()"
            @input="autoResize"
            ref="textareaRef"
            :disabled="isSending || isRecording"
          ></textarea>

          <!-- Primary Send Button -->
          <button
            @click="sendMessage()"
            :disabled="isSending || !inputText.trim() || isRecording"
            class="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all"
            :class="inputText.trim() && !isSending && !isRecording
              ? 'bg-[#047857] hover:bg-[#065f46] text-white shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'"
          >
            <Icon name="lucide:send" class="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  alias: ['/copilot']
})
import { ref, nextTick, onMounted } from 'vue'
import { api } from '~/utils/api'
import AgentAvatar from '~/components/AgentAvatar.vue'
import Button from '~/components/ui/button.vue'
import type { AgentState } from '~/composables/useAiAssistant'
import { useAiAssistant } from '~/composables/useAiAssistant'

const {
  messages,
  isSending,
  isSpeaking,
  isRecording,
  voiceMode,
  agentState,
  error,
  sendMessage: _sendMessage,
  startRecording: _startRecording,
  stopRecording: _stopRecording,
  toggleVoiceMode: _toggleVoiceMode,
  playAudio,
  stopAudio,
  clearChat: _clearChat,
} = useAiAssistant()

const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const exampleQuestions = [
  { icon: 'heroicons:banknotes', title: 'Ringkasan Penjualan', text: 'Berapa total pendapatan saya minggu ini?' },
  { icon: 'heroicons:archive-box', title: 'Cek Stok Menipis', text: 'Barang apa saja yang stoknya hampir habis?' },
  { icon: 'heroicons:megaphone', title: 'Ide Pemasaran', text: 'Buatkan teks promosi untuk produk kopi bubuk.' },
  { icon: 'heroicons:chart-bar', title: 'Analisis Bisnis', text: 'Bagaimana tren penjualan saya bulan ini?' },
]

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
}

const sendMessage = async (text?: string) => {
  const msg = (text || inputText.value).trim()
  if (!msg || isSending.value) return

  inputText.value = ''
  if (textareaRef.value) textareaRef.value.style.height = 'auto'

  await _sendMessage(msg)
  await scrollToBottom()
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

const startRecording = async () => {
  agentState.value = 'explaining'
  await _startRecording()
}

const stopRecording = async () => {
  agentState.value = 'thinking'
  await _stopRecording()
}

const toggleVoiceMode = () => {
  _toggleVoiceMode()
}

const clearChat = () => {
  if (messages.value.length === 0) return
  if (confirm('Anda yakin ingin menghapus seluruh riwayat percakapan saat ini?')) {
    _clearChat()
  }
}

onMounted(() => {
  autoResize()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 10px;
}
textarea.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

/* Chat List Transitions */
.chat-list-move,
.chat-list-enter-active,
.chat-list-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.chat-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chat-list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.chat-list-leave-active {
  position: absolute;
}

/* Agent text reveal animation */
@keyframes text-reveal {
  0% {
    opacity: 0;
    transform: translateY(8px);
    clip-path: inset(0 100% 0 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
  }
}

.agent-msg .msg-text {
  display: inline-block;
  animation: text-reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* Message Bubble Entry */
@keyframes bubble-pop {
  0% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.message-bubble {
  animation: bubble-pop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
</style>
