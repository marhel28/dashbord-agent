<template>
  <div class="space-y-8 animate-fade-in">
    <!-- ═══════════ HEADER ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-navy);">Agen AI</h1>
        <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">
          {{ agents.length }} agen spesialis — masing-masing memiliki ingatan tentang bisnis Anda.
        </p>
      </div>
      <NuxtLink
        to="/agents/workspace"
        class="px-5 py-2.5 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
        style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));"
      >
        <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
        <span>Buka Obrolan</span>
      </NuxtLink>
    </div>

    <!-- ═══════════ AGENT CARDS ═══════════ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
      <div
        v-for="agent in agents" :key="agent.id"
        class="bg-white border rounded-2xl p-6 shadow-sm transition-all duration-200 group hover:shadow-md hover:-translate-y-0.5 flex flex-col"
        style="border-color: var(--wp-border);"
      >
        <!-- Header -->
        <div class="flex items-start gap-4 mb-5">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition group-hover:scale-105"
            :style="{ background: agent.bg }"
          >
            <Icon :name="agent.icon" class="w-6 h-6" :style="{ color: agent.color }" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base font-extrabold tracking-tight" style="color: var(--wp-navy);">{{ agent.name }}</h3>
            <p class="text-xs mt-1 leading-relaxed" style="color: var(--wp-text-secondary);">{{ agent.description }}</p>
          </div>
        </div>

        <!-- Capabilities -->
        <div class="space-y-1.5 mb-4">
          <p class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Kemampuan</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="cap in agent.capabilities" :key="cap"
              class="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
              :style="{ background: agent.bg, color: agent.color }"
            >{{ cap }}</span>
          </div>
        </div>

        <!-- Memory -->
        <div class="mb-5 flex-1">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Memori</p>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full"
              :style="{ background: agent.bg, color: agent.color }"
            >{{ agent.memory_count ?? '…' }} entri</span>
          </div>

          <!-- Loading -->
          <div v-if="agent._loadingMemories" class="flex items-center gap-1.5 py-2">
            <div class="w-3 h-3 rounded-full border-2 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
            <span class="text-[9px]" style="color: var(--wp-text-secondary);">Memuat…</span>
          </div>

          <!-- Memory snippets with importance badges -->
          <div v-else-if="agent._memories && agent._memories.length > 0" class="space-y-1.5">
            <div
              v-for="(m, mi) in agent._memories.slice(0, 3)" :key="mi"
              class="text-[10px] leading-relaxed px-2.5 py-1.5 rounded-lg border group/mem relative"
              style="border-color: var(--wp-border); color: var(--wp-text-secondary); background: var(--wp-bg);"
            >
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="inline-flex items-center px-1 py-px rounded text-[7px] font-bold" :class="importanceClass(m.importance)">⭐{{ m.importance }}</span>
                <span class="text-[7px] opacity-60">{{ relativeTime(m.created_at) }}</span>
              </div>
              <p class="line-clamp-2">{{ m.text }}</p>
              <button
                @click.stop="deleteMemory(agent, m)"
                class="absolute top-1 right-1 p-1 rounded opacity-0 group-hover/mem:opacity-100 transition hover:bg-red-50"
                title="Hapus memori"
              >
                <Icon name="heroicons:trash" class="w-3 h-3" style="color: #DC2626;" />
              </button>
            </div>
          </div>

          <!-- No memories -->
          <div v-else-if="agent._memories && agent._memories.length === 0" class="py-2">
            <p class="text-[9px] italic" style="color: var(--wp-text-secondary);">Belum ada memori — mulai obrolan!</p>
          </div>

          <div class="flex items-center gap-2 mt-1.5">
            <button
              @click="toggleMemories(agent)"
              class="text-[9px] font-bold transition hover:underline"
              :style="{ color: agent.color }"
            >
              {{ agent._memories ? 'Segarkan' : 'Tampilkan memori' }}
            </button>
            <button
              v-if="agent._memories && agent._memories.length > 0"
              @click="openMemoryModal(agent)"
              class="text-[9px] font-bold transition hover:underline"
              :style="{ color: agent.color }"
            >
              Lihat semua
            </button>
          </div>
        </div>

        <!-- CTA -->
        <NuxtLink
          :to="`/agents/workspace?agent=${agent.id}`"
          class="w-full py-2.5 text-xs font-bold rounded-xl text-center transition border block"
          :style="{ borderColor: agent.color, color: agent.color }"
        >
          Chat dengan {{ agent.name.split(' ')[0] }}
        </NuxtLink>
      </div>
    </div>

    <!-- ═══════════ HOW IT WORKS ═══════════ -->
    <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
      <h2 class="text-base font-bold mb-4" style="color: var(--wp-text);">Cara Kerja</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div v-for="(step, i) in steps" :key="i" class="flex gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5" style="background: var(--wp-navy); color: var(--wp-gold);">{{ i + 1 }}</div>
          <div>
            <p class="text-xs font-bold" style="color: var(--wp-text);">{{ step.title }}</p>
            <p class="text-[10px] mt-0.5 leading-relaxed" style="color: var(--wp-text-secondary);">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ MEMORY MODAL ═══════════ -->
    <Teleport to="body">
      <div
        v-if="modalAgent"
        class="fixed inset-0 z-[var(--wp-z-modal)] flex items-center justify-center px-4"
        style="background: rgba(15,26,46,0.4); backdrop-filter: blur(4px);"
        @click.self="modalAgent = null"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in-up" style="border: 1px solid var(--wp-border);">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b rounded-t-2xl" style="border-color: var(--wp-border);">
            <div>
              <h2 class="text-base font-extrabold" style="color: var(--wp-navy);">{{ modalAgent.name }} — Memori</h2>
              <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">{{ modalAgent.memory_count ?? 0 }} total entri</p>
            </div>
            <button @click="modalAgent = null" class="p-2 rounded-xl transition hover:bg-slate-100">
              <Icon name="heroicons:x-mark" class="w-5 h-5" style="color: var(--wp-text-secondary);" />
            </button>
          </div>

          <!-- Filter + sort bar -->
          <div class="flex items-center gap-3 px-6 py-3 border-b" style="border-color: var(--wp-border); background: var(--wp-bg);">
            <input
              v-model="memoryFilter"
              type="text"
              placeholder="Filter memori…"
              class="flex-1 px-3 py-2 rounded-lg text-xs outline-none border"
              style="background: white; border-color: var(--wp-border); color: var(--wp-text);"
            />
            <select v-model="memorySort" class="px-3 py-2 rounded-lg text-xs border outline-none" style="background: white; border-color: var(--wp-border); color: var(--wp-text);">
              <option value="created_at">Terbaru</option>
              <option value="importance">Kepentingan tertinggi</option>
              <option value="access_count">Paling sering diakses</option>
            </select>
            <button
              @click="refreshModalMemories()"
              class="px-3 py-2 text-xs font-bold rounded-lg border transition hover:bg-slate-100"
              style="border-color: var(--wp-border); color: var(--wp-text-secondary);"
            >Segarkan</button>
          </div>

          <!-- Memory list -->
          <div class="flex-1 overflow-y-auto p-4 space-y-2">
            <div
              v-for="m in filteredModalMemories" :key="m.id"
              class="p-3 rounded-xl border text-xs space-y-1.5 group/mem transition hover:border-[var(--wp-gold-light)]"
              style="border-color: var(--wp-border); background: var(--wp-bg);"
            >
              <!-- Meta row -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold" :class="importanceClass(m.importance)">
                    ⭐ {{ m.importance }}/5
                  </span>
                  <span class="text-[8px]" style="color: var(--wp-text-secondary);">{{ relativeTime(m.created_at) }}</span>
                  <span v-if="m.access_count > 0" class="text-[8px]" style="color: var(--wp-text-secondary);">· dibaca {{ m.access_count }}×</span>
                  <span v-if="m.evaluation_quality" class="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                    :style="m.evaluation_quality === 'baik' ? { background: '#F0FDF4', color: '#059669' } : m.evaluation_quality === 'kurang' ? { background: '#FEF2F2', color: '#DC2626' } : { background: '#F1F5F9', color: '#64748B' }"
                  >{{ m.evaluation_quality }}</span>
                  <span v-if="m.consolidated_from > 0" class="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style="background: rgba(139,92,246,0.08); color: #8B5CF6;">
                    💡 dikonsolidasi {{ m.consolidated_from }}×
                  </span>
                </div>
                <button
                  @click="deleteMemoryFromModal(m)"
                  class="opacity-0 group-hover/mem:opacity-100 transition px-2 py-1 rounded-lg text-[8px] font-bold hover:bg-red-50"
                  style="color: #DC2626;"
                >Hapus</button>
              </div>

              <!-- Tags -->
              <div v-if="m.tags && m.tags.length" class="flex flex-wrap gap-1">
                <span v-for="tag in m.tags" :key="tag" class="px-1.5 py-0.5 rounded text-[7px] font-semibold" style="background: rgba(59,130,246,0.06); color: #3B82F6;">{{ tag }}</span>
              </div>

              <!-- Content -->
              <p class="leading-relaxed" style="color: var(--wp-text);">{{ m.text }}</p>
            </div>

            <div v-if="filteredModalMemories.length === 0" class="text-center py-8">
              <p class="text-xs" style="color: var(--wp-text-secondary);">Tidak ada memori yang cocok dengan filter.</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'

interface MemoryEntry {
  id: string; text: string; agent: string; created_at: string
  importance: number; decay_factor: number
  last_accessed: string; access_count: number
  tags: string[]; evaluation_quality: string
  had_action: boolean; had_chart: boolean; had_pdf: boolean
  consolidated_from: number; source_agent: string
}

interface AgentDef {
  id: string; name: string; icon: string; description: string
  capabilities: string[]; color: string; bg: string
  memory_count?: number
  _memories?: MemoryEntry[] | null
  _loadingMemories?: boolean
}

const agents = ref<AgentDef[]>([])
const modalAgent = ref<AgentDef | null>(null)
const memoryFilter = ref('')
const memorySort = ref('created_at')

const fallbackAgents: AgentDef[] = [
  { id: 'orchestrator', name: 'Orchestrator', icon: 'heroicons:sparkles', description: 'AI Copilot brain — routes questions, remembers your preferences, learns your business style over time.', capabilities: ['Auto-routing ke agent tepat', 'Mengingat preferensi & gaya', 'Multi-agent orchestration', 'Learning from past sessions'], color: '#D4A843', bg: 'rgba(212,168,67,0.08)' },
  { id: 'finance', name: 'Finance Agent', icon: 'heroicons:banknotes', description: 'Analisis keuangan, omzet, profit margin, cashflow, dan prediksi penjualan.', capabilities: ['Laporan omzet & profit', 'Analisis margin per produk', 'Prediksi penjualan', 'Monitoring cashflow'], color: '#059669', bg: 'rgba(5,150,105,0.06)' },
  { id: 'stock', name: 'Stock Agent', icon: 'heroicons:archive-box', description: 'Manajemen inventaris, cek & ubah harga, tracking stok real-time.', capabilities: ['Cek stok & harga', 'Ubah harga jual', 'Tambah/kurangi stok', 'Peringatan stok menipis'], color: '#D4A843', bg: 'rgba(212,168,67,0.08)' },
  { id: 'marketing', name: 'Marketing Agent', icon: 'heroicons:megaphone', description: 'Strategi pemasaran, copywriting, ide promosi & bundling.', capabilities: ['Ide promo & bundling', 'Copywriting caption', 'Fast/slow moving analysis', 'Strategi pelanggan'], color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
  { id: 'research', name: 'Research Agent', icon: 'heroicons:globe-alt', description: 'Riset harga pasar, tren industri, analisis kompetitor.', capabilities: ['Cek harga pasar', 'Analisis tren & berita', 'Perbandingan kompetitor', 'Riset regulasi & pajak'], color: '#3B82F6', bg: 'rgba(59,130,246,0.06)' },
]

const steps = [
  { title: 'Anda Bertanya', desc: 'Ketik pertanyaan dalam bahasa Indonesia — "berapa stok beras?" atau "bagaimana omzet minggu ini?"' },
  { title: 'Rute AI', desc: 'Orkestrator memilih agen terbaik — Finance, Stock, Marketing, atau Research — seketika.' },
  { title: 'Anda Mendapat Hasil', desc: 'Dapatkan jawaban dengan data nyata dari database, grafik, dan insight Anda.' },
]

// ── Helpers ──
const importanceClass = (imp: number) => {
  if (imp >= 5) return 'bg-amber-100 text-amber-800'
  if (imp >= 4) return 'bg-green-100 text-green-700'
  if (imp >= 3) return 'bg-blue-100 text-blue-700'
  if (imp >= 2) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-500'
}

const relativeTime = (iso: string) => {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins}m lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}h lalu`
  return new Date(iso).toLocaleDateString('id-ID')
}

// ── Memory fetching ──
const toggleMemories = async (agent: AgentDef) => {
  if (agent._memories && agent._memories.length > 0) {
    agent._memories = null; return
  }
  agent._loadingMemories = true
  try {
    const result = await api.get(`/agentic/agents/${agent.id}/memory`, { params: { limit: '8', sort_by: 'importance' } })
    agent._memories = result.memories || []
    agent.memory_count = result.total ?? agent.memory_count
  } catch {
    agent._memories = []
  } finally {
    agent._loadingMemories = false
  }
}

const openMemoryModal = async (agent: AgentDef) => {
  modalAgent.value = agent
  memoryFilter.value = ''
  memorySort.value = 'created_at'
  if (!agent._memories || agent._memories.length < 8) {
    agent._loadingMemories = true
    try {
      const result = await api.get(`/agentic/agents/${agent.id}/memory`, { params: { limit: '50', sort_by: 'created_at' } })
      agent._memories = result.memories || []
      agent.memory_count = result.total ?? agent.memory_count
    } catch { /* keep existing */ }
    finally { agent._loadingMemories = false }
  }
}

const refreshModalMemories = async () => {
  if (!modalAgent.value) return
  const agent = modalAgent.value
  agent._loadingMemories = true
  try {
    const result = await api.get(`/agentic/agents/${agent.id}/memory`, { params: { limit: '50', sort_by: memorySort.value } })
    agent._memories = result.memories || []
    agent.memory_count = result.total ?? agent.memory_count
  } catch { /* keep existing */ }
  finally { agent._loadingMemories = false }
}

const filteredModalMemories = computed(() => {
  let list = [...(modalAgent.value?._memories || [])]
  if (memoryFilter.value.trim()) {
    const q = memoryFilter.value.toLowerCase()
    list = list.filter(m =>
      m.text.toLowerCase().includes(q) ||
      m.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
      (m.evaluation_quality || '').toLowerCase().includes(q)
    )
  }
  if (memorySort.value === 'importance') {
    list.sort((a, b) => b.importance - a.importance)
  } else if (memorySort.value === 'access_count') {
    list.sort((a, b) => b.access_count - a.access_count)
  } else {
    list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  }
  return list
})

// ── Delete ──
const deleteMemory = async (agent: AgentDef, memory: MemoryEntry) => {
  if (!confirm(`Hapus memori ini?`)) return
  try {
    await api.delete(`/agentic/agents/${agent.id}/memory/${memory.id}`)
    if (agent._memories) {
      agent._memories = agent._memories.filter(m => m.id !== memory.id)
      agent.memory_count = Math.max(0, (agent.memory_count || 1) - 1)
    }
  } catch (e) { console.error('Delete failed:', e) }
}

const deleteMemoryFromModal = async (memory: MemoryEntry) => {
  if (!modalAgent.value) return
  await deleteMemory(modalAgent.value, memory)
}

// ── Init ──
onMounted(async () => {
  try {
    const result = await api.get('/agentic/agents')
    agents.value = (result || []) as AgentDef[]
  } catch {
    agents.value = fallbackAgents
  }
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
