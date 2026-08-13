<template>
  <div class="flex h-[calc(100vh-6rem)] w-full items-center justify-center animate-fade-in p-2 sm:p-4">
    <div class="w-full max-w-4xl h-full flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden relative border" style="border-color: var(--wp-border);">

      <!-- Ambient Glow -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>

      <!-- Header -->
      <div class="h-16 border-b px-6 flex items-center justify-between shrink-0 relative z-10 bg-white/80 backdrop-blur-md" style="border-color: var(--wp-border);">
        <div class="flex items-center gap-3">
          <!-- Agent Avatar (animated) -->
          <AgentAvatar :state="agentState" :is-speaking="isSpeaking" :show-label="false" />
          <div>
            <h2 class="text-sm font-black tracking-tight" style="color: var(--wp-navy);">Nahkoeda AI</h2>
            <p class="text-[10px] font-bold" style="color: var(--wp-text-secondary);">
              {{ voiceMode ? '🎙️ Mode Suara' : '📝 Mode Teks' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Stop Audio Interruption Button -->
          <button
            v-if="isSpeaking"
            @click="stopAudio"
            class="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-red-300 bg-red-50 text-red-600 transition hover:bg-red-100 flex items-center gap-1.5 animate-pulse"
            title="Hentikan suara agen"
          >
            <Icon name="heroicons:stop-solid" class="w-3.5 h-3.5 text-red-600" />
            <span>Hentikan Suara</span>
          </button>
          <!-- Voice Mode Toggle -->
          <button
            @click="toggleVoiceMode"
            class="px-3 py-1.5 text-[10px] font-bold rounded-lg border transition hover:bg-slate-50 flex items-center gap-1.5"
            style="border-color: var(--wp-border); color: var(--wp-text-secondary);"
            :title="voiceMode ? 'Matikan suara (klik untuk matikan)' : 'Aktifkan suara (klik untuk aktifkan)'"
          >
            <Icon :name="voiceMode ? 'heroicons:microphone' : 'heroicons:musical-note'" class="w-3.5 h-3.5" />
            {{ voiceMode ? 'Suara' : 'Teks' }}
          </button>
          <!-- Clear -->
          <button @click="clearChat" class="px-3 py-1.5 text-[10px] font-bold rounded-lg border transition hover:bg-slate-50 flex items-center gap-1.5" style="border-color: var(--wp-border); color: var(--wp-text-secondary);" title="Mulai Percakapan Baru">
            <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" /> Bersihkan
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 sm:p-8 relative z-10 custom-scrollbar scroll-smooth">

        <!-- Empty State / Welcome -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center animate-fade-in-up py-4">
          <!-- Large prominent avatar in center -->
          <div class="mb-5 flex flex-col items-center justify-center">
            <div class="p-2 rounded-3xl bg-slate-50 border border-slate-200/60 shadow-lg">
              <AgentAvatar :state="isSpeaking ? 'talking' : 'idle'" :is-speaking="isSpeaking" :show-label="true" />
            </div>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black mb-2" style="color: var(--wp-navy);">Halo! Saya Nahkoeda AI.</h1>
          <p class="text-sm leading-relaxed mb-1" style="color: var(--wp-text-secondary);">
            Saya asisten kecerdasan buatan toko Anda. Tanyakan stok, tren penjualan, atau ide bisnis.
          </p>
          <p class="text-xs font-bold mb-6" style="color: var(--wp-gold);">
            {{ voiceMode ? '🎙️ Mode Suara Aktif' : '📝 Mode Teks' }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <button v-for="(ex, i) in exampleQuestions" :key="i" @click="sendMessage(ex.text)" class="group text-left p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 bg-white" style="border-color: var(--wp-border);">
              <div class="flex items-center gap-2 mb-1.5">
                <Icon :name="ex.icon" class="w-4 h-4 transition-colors group-hover:text-amber-500" style="color: var(--wp-text-secondary);" />
                <span class="text-xs font-bold" style="color: var(--wp-navy);">{{ ex.title }}</span>
              </div>
              <p class="text-[10px] leading-relaxed" style="color: var(--wp-text-secondary);">{{ ex.desc }}</p>
            </button>
          </div>
        </div>

        <TransitionGroup name="chat-list" tag="div" class="space-y-8 flex flex-col w-full min-h-full justify-end">
          <!-- Chat Bubbles -->
          <div v-for="(msg, i) in messages" :key="'msg-'+i" :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div :class="['flex gap-4 max-w-[85%] sm:max-w-[75%]', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row']">

              <!-- Avatar -->
              <div class="shrink-0 hidden sm:block">
                <div v-if="msg.role === 'agent'" class="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm overflow-hidden" style="background: var(--wp-navy);">
                  <Icon name="heroicons:sparkles" class="w-4 h-4 text-amber-300" />
                </div>
                <div v-else class="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
                  <Icon name="heroicons:user" class="w-4 h-4 text-white;" />
                </div>
              </div>

              <!-- Bubble Content -->
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-2 px-1" :class="[msg.role === 'user' ? 'justify-end' : 'justify-start']">
                  <span class="text-[10px] font-extrabold uppercase tracking-widest" :style="{ color: msg.role === 'user' ? 'var(--wp-text-secondary)' : 'var(--wp-navy)' }">
                    {{ msg.role === 'user' ? 'Anda' : 'Nahkoeda AI' }}
                  </span>
                  <span class="text-[9px] font-semibold text-slate-400">{{ msg.time }}</span>
                  <!-- Audio indicator for agent messages -->
                  <button
                    v-if="msg.role === 'agent' && msg.audioUrl"
                    @click="playAudio(msg.audioUrl)"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                    style="background: #FEF3C7; color: #D97706;"
                    title="Putar suara"
                  >
                    <Icon name="heroicons:speaker-wave" class="w-3 h-3" />
                  </button>
                </div>

                <div
                  :class="['p-4 sm:p-5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm message-bubble',
                    msg.role === 'user'
                      ? 'rounded-3xl rounded-tr-sm text-white'
                      : 'rounded-3xl rounded-tl-sm border text-slate-800 bg-white agent-msg']"
                  :style="msg.role === 'user'
                    ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));'
                    : 'border-color: var(--wp-border);'"
                ><span class="msg-text">{{ msg.content }}</span></div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator (with avatar state) -->
          <div v-if="isSending" key="typing-indicator" class="flex w-full justify-start">
            <div class="flex gap-4 max-w-[85%] sm:max-w-[75%] flex-row">
              <div class="shrink-0 hidden sm:block">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style="background: var(--wp-navy);">
                  <Icon name="heroicons:sparkles" class="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-2 px-1 justify-start">
                  <span class="text-[10px] font-extrabold uppercase tracking-widest" style="color: var(--wp-navy);">Nahkoeda AI</span>
                </div>
                <div class="p-4 sm:p-5 rounded-3xl rounded-tl-sm border bg-white flex items-center gap-3 h-14" style="border-color: var(--wp-border);">
                  <AgentAvatar state="thinking" :is-speaking="false" :show-label="false" />
                  <div class="flex gap-1">
                    <span class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
                    <span class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
                    <span class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Input Area -->
      <div class="p-4 sm:p-6 bg-white relative z-10 border-t" style="border-color: var(--wp-border);">
        <!-- Error message -->
        <div v-if="error" class="max-w-4xl mx-auto mb-2 p-2 rounded-lg text-[10px] font-bold text-center" style="background-color: #FEF2F2; color: #DC2626;">
          {{ error }}
          <button @click="error = null" class="ml-2 underline">Tutup</button>
        </div>

        <div class="max-w-4xl mx-auto relative flex items-end gap-3 p-2 rounded-2xl border bg-slate-50 transition-colors focus-within:bg-white focus-within:border-[var(--wp-gold)] shadow-inner focus-within:shadow-md" style="border-color: var(--wp-border);">
          <!-- Mic / Audio Stop button (voice input & interruption) -->
          <button
            v-if="voiceMode"
            @click="handleMicClick"
            :disabled="isSending"
            class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-sm mb-0.5"
            :class="isSpeaking ? 'bg-amber-500 text-white animate-pulse hover:bg-amber-600' : isRecording ? 'bg-red-600 text-white animate-pulse' : 'hover:scale-105'"
            :style="!isSpeaking && !isRecording ? 'background: linear-gradient(135deg, var(--wp-navy), #1e293b); color: white;' : ''"
            :title="isSpeaking ? 'Hentikan AI berbicara' : isRecording ? 'Berhenti merekam' : 'Mulai rekam suara'"
          >
            <Icon :name="isSpeaking ? 'heroicons:speaker-x-mark' : isRecording ? 'heroicons:stop' : 'heroicons:microphone'" class="w-5 h-5" />
          </button>

          <textarea
            v-model="inputText"
            rows="1"
            :placeholder="isRecording ? '🎙️ Merekam...' : 'Tanyakan sesuatu pada Asisten AI...'"
            class="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none text-sm py-3 px-3 text-slate-800 placeholder-slate-400 custom-scrollbar"
            @keydown.enter.prevent="sendMessage()"
            @input="autoResize"
            ref="textareaRef"
            :disabled="isSending || isRecording"
          ></textarea>

          <button
            @click="sendMessage()"
            :disabled="isSending || !inputText.trim() || isRecording"
            class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-sm mb-0.5"
            :class="inputText.trim() && !sending && !isRecording ? 'hover:scale-105 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'"
            :style="inputText.trim() && !sending && !isRecording
              ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;'
              : 'background: var(--wp-border); color: var(--wp-text-secondary);'"
          >
            <Icon name="heroicons:paper-airplane" class="w-5 h-5 -mt-0.5 ml-0.5" />
          </button>
        </div>

        <p class="text-[9px] text-center mt-3 font-semibold text-slate-400">
          {{ voiceMode ? '🎙️ Mode Suara aktif — klik mikrofon untuk bicara, atau ketik pesan' : '📝 Mode Teks — ketik pesan Anda' }}
        </p>
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
