<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. HEADER & TEACH AI CTA ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Buku Pengetahuan AI (Memory Bank)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Aturan bisnis, preferensi toko, dan catatan penting yang diingat oleh Business Copilot.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9 px-4 shadow-xs"
          @click="showAddModal = true"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span>+ Ajari Copilot Baru</span>
        </Button>

        <button
          @click="fetchAllMemories"
          :disabled="loading"
          class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900"
          title="Segarkan Pengetahuan"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- ═══════════ 2. SEARCH BAR & CATEGORY TABS ═══════════ -->
    <div class="space-y-3">
      <!-- Search Input -->
      <div class="relative">
        <Icon name="lucide:search" class="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pengetahuan yang diingat AI (contoh: diskon, jam buka, stok)..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#047857] shadow-xs"
        />
      </div>

      <!-- Agent Category Tabs -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          @click="selectedAgentId = null"
          :class="['px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
            !selectedAgentId ? 'bg-[#047857] text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900']"
        >
          Semua Pengetahuan ({{ allMemories.length }})
        </button>

        <button
          v-for="ag in availableAgents"
          :key="ag.id"
          @click="selectedAgentId = selectedAgentId === ag.id ? null : ag.id"
          :class="['px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
            selectedAgentId === ag.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900']"
        >
          <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: ag.color }"></span>
          <span>{{ ag.name }}</span>
        </button>
      </div>
    </div>

    <!-- ═══════════ 3. KNOWLEDGE CARDS GRID ═══════════ -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton class="h-36 rounded-xl" />
      <Skeleton class="h-36 rounded-xl" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredMemories.length === 0" class="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
      <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#047857] mx-auto flex items-center justify-center">
        <Icon name="lucide:book-open-check" class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Belum Ada Catatan Pengetahuan</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          AI belum memiliki ingatan khsusus untuk kategori ini. Tambahkan aturan toko baru atau mulailah mengobrol.
        </p>
      </div>
      <Button
        class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9 px-5"
        @click="showAddModal = true"
      >
        + Ajari Copilot Baru
      </Button>
    </div>

    <!-- Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="m in filteredMemories"
        :key="m.id"
        class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
      >
        <div class="space-y-2">
          <!-- Header Badges -->
          <div class="flex items-center justify-between">
            <span
              class="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-white shadow-xs"
              :style="{ backgroundColor: m.agentColor || '#047857' }"
            >
              {{ m.agentName }}
            </span>

            <button
              @click="deleteMemory(m)"
              class="text-slate-400 hover:text-red-600 transition-colors p-1"
              title="Hapus Pengetahuan Ini"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>

          <!-- Memory Text Body -->
          <p class="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            "{{ m.text }}"
          </p>
        </div>

        <!-- Footer Traceability Info -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span class="flex items-center gap-1">
            <Icon name="lucide:clock" class="w-3.5 h-3.5" />
            {{ relativeTime(m.created_at) }}
          </span>

          <div class="flex items-center gap-1.5">
            <span v-if="m.importance != null" class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-semibold text-[10px]">
              ⭐ {{ m.importance }}/5
            </span>
            <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[10px]">
              Kepercayaan: {{ calculateConfidencePct(m) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ 4. TEACH AI MODAL ═══════════ -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" @click.self="showAddModal = false">
        <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Ajari Copilot Hal Baru</h3>
              <p class="text-xs text-slate-500">Tambahkan aturan bisnis, preferensi, atau info toko agar AI selalu ingat.</p>
            </div>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600">
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitNewMemory" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Pengetahuan / Aturan</label>
              <textarea
                v-model="newMemoryText"
                rows="3"
                required
                placeholder="Contoh: Toko libur setiap hari Jumat. Diskon maksimal untuk pelanggan langganan adalah 10%."
                class="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#047857]"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" @click="showAddModal = false">Batal</Button>
              <Button size="sm" class="bg-[#047857] hover:bg-[#065f46] text-white" :disabled="!newMemoryText.trim() || savingMemory">
                Simpan ke Ingatan AI
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Button from '~/components/ui/button.vue'
import Skeleton from '~/components/ui/skeleton.vue'
import { api } from '~/utils/api'

const allMemories = ref<any[]>([])
const availableAgents = ref<any[]>([])
const selectedAgentId = ref<string | null>(null)
const searchQuery = ref('')
const loading = ref(false)
const showAddModal = ref(false)
const newMemoryText = ref('')
const savingMemory = ref(false)

const agentMeta: Record<string, {name: string, color: string}> = {
  orchestrator: { name: 'Asisten Bisnis (Utama)', color: '#047857' },
  finance: { name: 'Asisten Keuangan', color: '#059669' },
  stock: { name: 'Asisten Produk & Stok', color: '#D97706' },
  marketing: { name: 'Asisten Pemasaran', color: '#8B5CF6' },
  research: { name: 'Asisten Riset Pasar', color: '#2563EB' },
}

const relativeTime = (iso: string) => {
  if (!iso) return 'Baru saja'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return mins + ' menit lalu'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + ' jam lalu'
  const days = Math.floor(hours / 24)
  if (days < 30) return days + ' hari lalu'
  return new Date(iso).toLocaleDateString('id-ID')
}

const calculateConfidencePct = (m: any) => {
  if (m.confidence_pct != null) return m.confidence_pct
  if (m.decay_factor != null) {
    return Math.round(m.decay_factor * 100)
  }
  if (m.importance != null) {
    return Math.min(100, Math.round((m.importance / 5) * 100))
  }
  return 95
}

const filteredMemories = computed(() => {
  let result = allMemories.value

  if (selectedAgentId.value) {
    result = result.filter(m => m.agentId === selectedAgentId.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(m => m.text.toLowerCase().includes(q) || m.agentName.toLowerCase().includes(q))
  }

  return result
})

const fetchAllMemories = async () => {
  loading.value = true
  try {
    const agentsResult = await api.get('/agentic/agents')
    const agents = agentsResult || []

    let combined: any[] = []
    let fetchedAgents: any[] = []

    await Promise.all(agents.map(async (agent: any) => {
      try {
        const mems = await api.get(`/agentic/agents/${agent.id}/memory`, { params: { limit: '20' } })
        if (mems && mems.memories) {
          const color = agentMeta[agent.id]?.color || '#047857'
          const name = agentMeta[agent.id]?.name || agent.name || agent.id

          fetchedAgents.push({ id: agent.id, name, color })

          mems.memories.forEach((m: any) => {
            m.agentId = agent.id
            m.agentName = name
            m.agentColor = color
            combined.push(m)
          })
        }
      } catch (e) {
        // Ignore individual agent memory errors
      }
    }))

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    allMemories.value = combined
    availableAgents.value = fetchedAgents.sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const submitNewMemory = async () => {
  if (!newMemoryText.value.trim()) return
  savingMemory.value = true
  try {
    await api.post('/agentic/agents/orchestrator/memory', { text: newMemoryText.value })
    newMemoryText.value = ''
    showAddModal.value = false
    fetchAllMemories()
  } catch (e) {
    alert('Gagal menyimpan pengetahuan ke AI.')
  } finally {
    savingMemory.value = false
  }
}

const deleteMemory = async (m: any) => {
  if (!confirm('Hapus pengetahuan ini dari ingatan AI?')) return
  try {
    await api.delete(`/agentic/agents/${m.agentId}/memory/${m.id}`)
    allMemories.value = allMemories.value.filter(mem => mem.id !== m.id)
  } catch (e) {
    alert('Gagal menghapus catatan memori.')
  }
}

onMounted(() => {
  fetchAllMemories()
})
</script>
