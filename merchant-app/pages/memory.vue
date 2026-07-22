<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
      <div class="border-b pb-4" style="border-color: var(--wp-navy);">
        <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Memory Center</h1>
        <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
          Pusat kendali ingatan seluruh Agen AI Copilot Anda.
        </p>
      </div>
      <button @click="fetchAllMemories" class="px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-sm transition" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
        Segarkan Memori
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[300px] border rounded-2xl bg-white" style="border-color: var(--wp-border);">
      <div class="w-8 h-8 rounded-full border-4 animate-spin mb-4" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
      <p class="text-xs font-bold" style="color: var(--wp-text-secondary);">Mengekstrak ingatan para AI...</p>
    </div>

    <template v-else>
      <!-- Agent Badges Filter -->
      <div v-if="availableAgents.length > 0" class="flex flex-wrap gap-2 animate-fade-in-up" style="animation-delay: 0.1s;">
        <button 
          @click="selectedAgentId = null" 
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
          :class="!selectedAgentId ? 'bg-slate-800 text-white' : 'bg-white border text-slate-500 hover:bg-slate-50'"
        >
          Semua Agent
        </button>
        <button 
          v-for="ag in availableAgents" :key="ag.id"
          @click="selectedAgentId = selectedAgentId === ag.id ? null : ag.id"
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border flex items-center gap-1.5"
          :class="selectedAgentId === ag.id ? 'opacity-100 ring-2 ring-offset-1' : 'bg-white hover:bg-slate-50'"
          :style="selectedAgentId === ag.id ? `background: ${ag.color}; color: white; border-color: ${ag.color}; ring-color: ${ag.color};` : `color: ${ag.color}; border-color: ${ag.color}40;`"
        >
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: selectedAgentId === ag.id ? 'white' : ag.color }"></div>
          {{ ag.name }}
        </button>
      </div>

      <!-- Combined Memory List -->
      <div v-if="filteredMemories.length > 0" class="space-y-3">
        <div v-for="m in filteredMemories" :key="m.id" class="p-4 bg-white border rounded-xl shadow-sm transition hover:shadow-md" style="border-color: var(--wp-border);">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white shadow-sm" :style="{ background: m.agentColor || 'var(--wp-navy)' }">
              {{ m.agentName }}
            </span>
            <span class="text-[9px] font-bold" style="color: var(--wp-text-secondary);">{{ relativeTime(m.created_at) }}</span>
          </div>
          <button @click="deleteMemory(m)" class="p-1.5 rounded-lg hover:bg-red-50 transition" title="Hapus memori">
            <Icon name="heroicons:trash" class="w-4 h-4 text-red-500" />
          </button>
        </div>
        <p class="text-xs leading-relaxed" style="color: var(--wp-text);">{{ m.text }}</p>
        
        <div class="flex items-center gap-2 mt-3 flex-wrap">
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
            ⭐ Penting: {{ m.importance }}/5
          </span>
          <span v-if="m.access_count > 0" class="text-[9px]" style="color: var(--wp-text-secondary);">
            Dibaca {{ m.access_count }}x
          </span>
        </div>
      </div>
    </div>
    
      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center min-h-[300px] border rounded-2xl bg-white" style="border-color: var(--wp-border);">
        <Icon name="heroicons:cpu-chip" class="w-12 h-12 mb-3 text-slate-300" />
        <p class="text-sm font-bold" style="color: var(--wp-text-secondary);">Belum ada memori</p>
        <p class="text-xs mt-1 text-slate-500 max-w-sm text-center">
          <span v-if="selectedAgentId">Agent ini belum menyimpan informasi jangka panjang.</span>
          <span v-else>Para AI Anda belum menyimpan informasi jangka panjang apa pun. Mulailah mengobrol dengan AI Copilot.</span>
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '~/utils/api'

const allMemories = ref<any[]>([])
const availableAgents = ref<any[]>([])
const selectedAgentId = ref<string | null>(null)
const loading = ref(false)

const agentMeta: Record<string, {name: string, color: string}> = {
  orchestrator: { name: 'Orchestrator', color: '#D4A843' },
  finance: { name: 'Finance Agent', color: '#059669' },
  stock: { name: 'Stock Agent', color: '#B8922E' },
  marketing: { name: 'Marketing Agent', color: '#8B5CF6' },
  research: { name: 'Research Agent', color: '#3B82F6' },
}

const relativeTime = (iso: string) => {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return mins + 'm lalu'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + 'j lalu'
  const days = Math.floor(hours / 24)
  if (days < 30) return days + 'h lalu'
  return new Date(iso).toLocaleDateString('id-ID')
}

const filteredMemories = computed(() => {
  if (!selectedAgentId.value) return allMemories.value
  return allMemories.value.filter(m => m.agentId === selectedAgentId.value)
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
          const color = agentMeta[agent.id]?.color || '#0F1A2E'
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
        // Skip on error
      }
    }))
    
    // Sort by created_at desc
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    allMemories.value = combined
    availableAgents.value = fetchedAgents.sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const deleteMemory = async (m: any) => {
  if (!confirm('Hapus memori ini dari ingatan AI?')) return
  try {
    await api.delete(`/agentic/agents/${m.agentId}/memory/${m.id}`)
    allMemories.value = allMemories.value.filter(mem => mem.id !== m.id)
  } catch (e) {
    alert('Gagal menghapus memori.')
  }
}

onMounted(() => {
  fetchAllMemories()
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
