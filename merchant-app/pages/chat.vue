<template>
  <div class="flex h-[calc(100vh-6rem)] w-full items-center justify-center animate-fade-in p-2 sm:p-4">
    <!-- Chat Container -->
    <div class="w-full max-w-4xl h-full flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden relative border" style="border-color: var(--wp-border);">
      
      <!-- Ambient Glow (Subtle Background Effect) -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>

      <!-- Header -->
      <div class="h-16 border-b px-6 flex items-center justify-between shrink-0 relative z-10 bg-white/80 backdrop-blur-md" style="border-color: var(--wp-border);">
        <div class="flex items-center gap-3">
          <!-- AI Avatar -->
          <div class="relative flex items-center justify-center w-10 h-10 rounded-xl shadow-sm" style="background: linear-gradient(135deg, var(--wp-navy), #1e293b);">
            <Icon name="heroicons:sparkles" class="w-5 h-5 text-amber-300" />
            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style="background: var(--wp-success);"></span>
          </div>
          <div>
            <h2 class="text-sm font-black tracking-tight" style="color: var(--wp-navy);">Nahkoeda AI</h2>
            <p class="text-[10px] font-bold" style="color: var(--wp-text-secondary);">Asisten Bisnis Pintar Anda</p>
          </div>
        </div>
        <button @click="clearChat" class="px-3 py-1.5 text-[10px] font-bold rounded-lg border transition hover:bg-slate-50 flex items-center gap-1.5" style="border-color: var(--wp-border); color: var(--wp-text-secondary);" title="Mulai Percakapan Baru">
          <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" /> Bersihkan
        </button>
      </div>

      <!-- Messages Area -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 relative z-10 custom-scrollbar scroll-smooth">
        
        <!-- Empty State / Welcome -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center animate-fade-in-up">
          <div class="w-20 h-20 mb-6 rounded-3xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105" style="background: linear-gradient(135deg, var(--wp-navy), #0f172a);">
            <Icon name="heroicons:sparkles" class="w-10 h-10 text-amber-300" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-black mb-3" style="color: var(--wp-navy);">Halo! Saya Nahkoeda AI.</h1>
          <p class="text-sm sm:text-base leading-relaxed mb-8" style="color: var(--wp-text-secondary);">
            Saya siap membantu memantau penjualan, mengecek stok, membuat laporan, dan memberikan ide bisnis cerdas untuk Anda.
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <button v-for="(ex, i) in exampleQuestions" :key="i" @click="sendMessage(ex)" class="group text-left p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 bg-white" style="border-color: var(--wp-border);">
              <div class="flex items-center gap-2 mb-1.5">
                <Icon :name="ex.icon" class="w-4 h-4 transition-colors group-hover:text-amber-500" style="color: var(--wp-text-secondary);" />
                <span class="text-xs font-bold" style="color: var(--wp-navy);">{{ ex.title }}</span>
              </div>
              <p class="text-[10px] leading-relaxed" style="color: var(--wp-text-secondary);">{{ ex.desc }}</p>
            </button>
          </div>
        </div>

        <!-- Chat Bubbles -->
        <div v-for="(msg, i) in messages" :key="i" :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']">
          <div :class="['flex gap-4 max-w-[85%] sm:max-w-[75%]', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row']">
            
            <!-- Avatar -->
            <div class="shrink-0 hidden sm:block">
              <div v-if="msg.role === 'agent'" class="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style="background: var(--wp-navy);">
                <Icon name="heroicons:sparkles" class="w-4 h-4 text-amber-300" />
              </div>
              <div v-else class="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
                <Icon name="heroicons:user" class="w-4 h-4 text-white" />
              </div>
            </div>

            <!-- Bubble Content -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2 px-1" :class="[msg.role === 'user' ? 'justify-end' : 'justify-start']">
                <span class="text-[10px] font-extrabold uppercase tracking-widest" :style="{ color: msg.role === 'user' ? 'var(--wp-text-secondary)' : 'var(--wp-navy)' }">
                  {{ msg.role === 'user' ? 'Anda' : 'Nahkoeda AI' }}
                </span>
                <span class="text-[9px] font-semibold text-slate-400">{{ msg.time }}</span>
                <span v-if="msg.agentsUsed && msg.agentsUsed.length" class="px-2 py-0.5 rounded text-[8px] font-bold border" style="background: rgba(212,168,67,0.05); color: var(--wp-gold-dark); border-color: rgba(212,168,67,0.2);">
                  <Icon name="heroicons:cpu-chip" class="w-3 h-3 inline align-text-bottom mr-0.5" />
                  {{ msg.agentsUsed.join(', ') }}
                </span>
              </div>
              
              <div
                :class="['p-4 sm:p-5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                  msg.role === 'user'
                    ? 'rounded-3xl rounded-tr-sm text-white'
                    : 'rounded-3xl rounded-tl-sm border text-slate-800 bg-white']"
                :style="msg.role === 'user'
                  ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));'
                  : 'border-color: var(--wp-border);'"
              >{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="sending" class="flex w-full justify-start animate-fade-in">
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
              <div class="p-4 sm:p-5 rounded-3xl rounded-tl-sm border bg-white flex items-center gap-2 h-14" style="border-color: var(--wp-border);">
                <div class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 0ms;"></div>
                <div class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 150ms;"></div>
                <div class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 300ms;"></div>
                <span class="text-[10px] font-bold text-slate-400 ml-2">Sedang berpikir...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 sm:p-6 bg-white relative z-10 border-t" style="border-color: var(--wp-border);">
        <div class="max-w-4xl mx-auto relative flex items-end gap-3 p-2 rounded-2xl border bg-slate-50 transition-colors focus-within:bg-white focus-within:border-[var(--wp-gold)] shadow-inner focus-within:shadow-md" style="border-color: var(--wp-border);">
          <textarea
            v-model="inputText"
            rows="1"
            placeholder="Tanyakan sesuatu pada Asisten AI..."
            class="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none text-sm py-3 px-3 text-slate-800 placeholder-slate-400 custom-scrollbar"
            @keydown.enter.prevent="sendMessage()"
            @input="autoResize"
            ref="textareaRef"
            :disabled="sending"
          ></textarea>
          
          <button
            @click="sendMessage()"
            :disabled="sending || !inputText.trim()"
            class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-sm mb-0.5"
            :class="inputText.trim() && !sending ? 'hover:scale-105 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'"
            :style="inputText.trim() && !sending
              ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;'
              : 'background: var(--wp-border); color: var(--wp-text-secondary);'"
          >
            <Icon name="heroicons:paper-airplane" class="w-5 h-5 -mt-0.5 ml-0.5" />
          </button>
        </div>
        <p class="text-[9px] text-center mt-3 font-semibold text-slate-400">
          Nahkoeda AI dapat membuat kesalahan. Harap periksa kembali informasi penting.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { api } from '~/utils/api'

interface Message {
  role: 'user' | 'agent'
  content: string
  time: string
  agentsUsed?: string[]
}

const messages = ref<Message[]>([])
const inputText = ref('')
const sending = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const exampleQuestions = [
  { icon: 'heroicons:banknotes', title: 'Ringkasan Penjualan', desc: '"Berapa total pendapatan saya minggu ini?"' },
  { icon: 'heroicons:archive-box', title: 'Cek Stok Menipis', desc: '"Barang apa saja yang stoknya hampir habis?"' },
  { icon: 'heroicons:megaphone', title: 'Ide Pemasaran', desc: '"Buatkan teks promosi untuk produk kopi bubuk."' },
  { icon: 'heroicons:chart-bar', title: 'Analisis Bisnis', desc: '"Bagaimana tren penjualan saya bulan ini?"' },
]

const now = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

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
  if (!msg || sending.value) return

  inputText.value = ''
  if (textareaRef.value) textareaRef.value.style.height = 'auto'
  
  messages.value.push({ role: 'user', content: msg, time: now() })
  await scrollToBottom()

  sending.value = true
  try {
    const result = await api.post('/agentic/chat', { message: msg })
    messages.value.push({
      role: 'agent',
      content: result.reply || 'Maaf, ada kendala teknis dari sistem.',
      time: now(),
      agentsUsed: result.agents_used || [],
    })
  } catch (err: any) {
    messages.value.push({
      role: 'agent',
      content: '⚠️ Maaf, layanan AI sedang tidak tersedia atau terputus. Silakan coba lagi nanti.\n\n' + (err.message || ''),
      time: now(),
    })
  } finally {
    sending.value = false
    await scrollToBottom()
  }
}

const clearChat = () => {
  if (messages.value.length === 0) return
  if (confirm('Anda yakin ingin menghapus seluruh riwayat percakapan saat ini?')) {
    messages.value = []
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
</style>
