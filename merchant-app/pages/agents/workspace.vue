<template>
  <div class="flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl border bg-white animate-fade-in" style="border-color: var(--wp-border);">
    <!-- ═══════════ SIDEBAR ═══════════ -->
    <div class="w-72 flex flex-col shrink-0 border-r" style="border-color: var(--wp-border);">
      <div class="p-4 flex items-center justify-between border-b" style="border-color: var(--wp-border);">
        <h2 class="text-sm font-extrabold" style="color: var(--wp-text);">Chat Agen</h2>
        <NuxtLink to="/agents" class="p-1.5 rounded-lg border transition hover:bg-slate-50" style="border-color: var(--wp-border); color: var(--wp-text-secondary);" title="Kembali ke daftar agen">
          <Icon name="heroicons:arrow-left" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Agent selector -->
      <div class="p-3 border-b space-y-2" style="border-color: var(--wp-border); background: var(--wp-bg);">
        <p class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Agen Aktif</p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="a in quickAgents" :key="a.id"
            @click="activeAgent = a.id"
            :class="['px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all',
              activeAgent === a.id ? 'text-white shadow-sm' : 'border']"
            :style="activeAgent === a.id
              ? { background: a.color, color: 'white' }
              : { borderColor: a.color, color: a.color, background: a.bg }"
          >{{ a.label }}</button>
        </div>
      </div>

      <!-- Session list -->
      <div class="flex-1 overflow-y-auto divide-y" style="border-color: #F8FAFC;">
        <div class="p-3 text-center">
          <p class="text-[10px] font-bold" style="color: var(--wp-text-secondary);">
            {{ messages.length > 0 ? `${messages.length} pesan` : 'Percakapan baru' }}
          </p>
        </div>
        <div v-if="messages.length === 0" class="p-6 text-center">
          <Icon name="heroicons:sparkles" class="w-8 h-8 mx-auto mb-2" style="color: var(--wp-gold);" />
          <p class="text-xs font-medium" style="color: var(--wp-text-secondary);">Mulai percakapan — AI akan merutekan pertanyaan Anda ke agen yang tepat.</p>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="p-3 border-t space-y-2" style="border-color: var(--wp-border);">
        <button @click="clearChat" class="w-full py-2 text-[10px] font-bold rounded-lg border transition hover:bg-slate-50" style="border-color: var(--wp-border); color: var(--wp-text-secondary);">
          <Icon name="heroicons:trash" class="w-3.5 h-3.5 inline mr-1" /> Hapus Chat
        </button>
      </div>
    </div>

    <!-- ═══════════ CHAT AREA ═══════════ -->
    <div class="flex-1 flex flex-col min-w-0" style="background: var(--wp-bg);">
      <!-- Chat header -->
      <div class="h-14 bg-white border-b px-5 flex items-center justify-between shrink-0" style="border-color: var(--wp-border);">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--wp-navy);">
            <Icon name="heroicons:sparkles" class="w-4 h-4" style="color: var(--wp-gold);" />
          </div>
          <div>
            <h3 class="text-xs font-extrabold" style="color: var(--wp-text);">AI Copilot</h3>
            <p class="text-[9px] font-semibold" style="color: var(--wp-success);">
              <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" style="background: var(--wp-success);"></span>
              {{ activeAgent === 'auto' ? 'Auto-routing' : quickAgents.find(a => a.id === activeAgent)?.label || 'Siap' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-[10px] font-bold" style="color: var(--wp-text-secondary);">
          <Icon name="heroicons:bolt" class="w-3.5 h-3.5" style="color: var(--wp-gold);" />
          <span>{{ messages.length }} pesan</span>
        </div>
      </div>

      <!-- Messages -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-5 space-y-5">
        <!-- Welcome -->
        <div v-if="messages.length === 0" class="flex justify-center pt-12">
          <div class="text-center max-w-sm">
            <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style="background: rgba(212,168,67,0.08);">
              <Icon name="heroicons:sparkles" class="w-8 h-8" style="color: var(--wp-gold);" />
            </div>
            <h3 class="text-sm font-extrabold" style="color: var(--wp-text);">AI Copilot siap membantu</h3>
            <p class="text-xs mt-2" style="color: var(--wp-text-secondary);">Tanya apa saja tentang bisnis Anda — stok, keuangan, marketing, atau riset pasar.</p>
            <div class="flex flex-wrap gap-2 justify-center mt-4">
              <button v-for="ex in exampleQuestions" :key="ex" @click="sendMessage(ex)" class="px-3 py-1.5 border text-[10px] font-bold rounded-xl transition hover:bg-slate-50" style="border-color: var(--wp-border); color: var(--wp-text-secondary);">{{ ex }}</button>
            </div>
          </div>
        </div>

        <!-- Message bubbles -->
        <div v-for="(msg, i) in messages" :key="i" :class="['flex flex-col gap-1', msg.role === 'user' ? 'items-end' : 'items-start']" :style="{ animation: 'fadeInUp 0.3s ease-out both', animationDelay: '0.05s' }">
          <!-- Sender label -->
          <div class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-1" style="color: var(--wp-text-secondary);">
            <template v-if="msg.role === 'user'">
              <span>{{ msg.time }}</span><span>•</span><span>Anda</span>
            </template>
            <template v-else>
              <Icon name="heroicons:sparkles" class="w-3 h-3" style="color: var(--wp-gold);" />
              <span style="color: var(--wp-gold-dark);">AI Copilot</span>
              <span>•</span><span>{{ msg.time }}</span>
              <span v-if="msg.agentsUsed && msg.agentsUsed.length" class="ml-1 px-1.5 py-0.5 rounded text-[7px] font-bold" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
                {{ msg.agentsUsed.join(', ') }}
              </span>
            </template>
          </div>
          <!-- Bubble -->
          <div
            :class="['max-w-[75%] rounded-2xl shadow-sm p-4 text-xs leading-relaxed whitespace-pre-wrap',
              msg.role === 'user'
                ? 'rounded-tr-none text-white'
                : 'rounded-tl-none border text-[var(--wp-text)]']"
            :style="msg.role === 'user'
              ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;'
              : 'background: white; border-color: var(--wp-border);'"
          >{{ msg.content }}</div>
        </div>

        <!-- Typing indicator -->
        <div v-if="sending" class="flex items-center gap-2 pl-1 text-[10px] font-bold" style="color: var(--wp-text-secondary);">
          <Icon name="heroicons:sparkles" class="w-4 h-4 animate-pulse" style="color: var(--wp-gold);" />
          <span>AI berpikir…</span>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t shrink-0 flex items-center gap-3" style="background: white; border-color: var(--wp-border);">
        <input
          v-model="inputText"
          type="text"
          placeholder="Tanya tentang bisnis Anda…"
          class="flex-1 px-4 py-3 rounded-xl text-xs outline-none transition border"
          style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);"
          @keydown.enter="sendMessage()"
          :disabled="sending"
        />
        <button
          @click="sendMessage()"
          :disabled="sending || !inputText.trim()"
          class="p-2.5 rounded-xl transition shadow-sm"
          :style="inputText.trim() && !sending
            ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;'
            : 'background: var(--wp-bg); color: var(--wp-text-secondary);'"
        >
          <Icon name="heroicons:paper-airplane" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '~/utils/api'

const route = useRoute()

interface Message {
  role: 'user' | 'agent'
  content: string
  time: string
  agentsUsed?: string[]
  routingMode?: string
}

const messages = ref<Message[]>([])
const inputText = ref('')
const sending = ref(false)
const activeAgent = ref('auto')
const chatContainer = ref<HTMLElement | null>(null)

const quickAgents = [
  { id: 'auto', label: 'Auto', color: '#D4A843', bg: 'rgba(212,168,67,0.08)' },
  { id: 'orchestrator', label: 'Orchestrator', color: '#D4A843', bg: 'rgba(212,168,67,0.08)' },
  { id: 'finance', label: 'Finance', color: '#059669', bg: 'rgba(5,150,105,0.06)' },
  { id: 'stock', label: 'Stock', color: '#B8922E', bg: 'rgba(212,168,67,0.06)' },
  { id: 'marketing', label: 'Marketing', color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
  { id: 'research', label: 'Research', color: '#3B82F6', bg: 'rgba(59,130,246,0.06)' },
]

const exampleQuestions = [
  'Berapa stok beras premium?',
  'Bagaimana omzet minggu ini?',
  'Buatkan ide promo untuk kopi',
  'Cek harga pasar minyak goreng',
]

const now = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async (text?: string) => {
  const msg = (text || inputText.value).trim()
  if (!msg || sending.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: msg, time: now() })
  await scrollToBottom()

  sending.value = true
  try {
    const result = await api.post('/agentic/chat', { message: msg })
    messages.value.push({
      role: 'agent',
      content: result.reply || 'Maaf, ada kendala teknis.',
      time: now(),
      agentsUsed: result.agents_used || [],
      routingMode: result.routing_mode,
    })
  } catch (err: any) {
    messages.value.push({
      role: 'agent',
      content: '⚠️ Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.\n\n' + (err.message || ''),
      time: now(),
    })
  } finally {
    sending.value = false
    await scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
}

// Pre-select agent from query param
onMounted(() => {
  const agentParam = route.query.agent as string
  if (agentParam && quickAgents.some(a => a.id === agentParam)) {
    activeAgent.value = agentParam
  }
})
</script>
