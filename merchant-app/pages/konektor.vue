<template>
  <div class="max-w-7xl mx-auto py-2 space-y-4">
    <!-- ═══ PAGE TITLE ═══ -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Konektor & Peta Alur Sistem</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Visualisasi arsitektur interaktif 5-Tier AI Orchestration & Infrastruktur Nahkoda.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono">
          {{ agentCount }} AI Agents
        </span>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
          {{ nodes.length }} Total Node
        </span>
      </div>
    </div>

    <!-- ═══ DESKTOP: VueFlow Canvas + Detail Panel (>= 768px) ═══ -->
    <div class="hidden md:flex flex-col lg:flex-row h-[calc(100vh-12rem)] w-full overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <!-- ── Interactive Vue Flow Canvas ── -->
      <div class="flex-1 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
        <ClientOnly>
          <VueFlow
            v-model:nodes="nodes"
            v-model:edges="edges"
            :class="colorMode.value === 'dark' ? 'dark' : ''"
            class="w-full h-full"
            :default-viewport="{ x: 50, y: 100, zoom: 0.75 }"
            :min-zoom="0.2"
            :max-zoom="4"
            @node-click="onNodeClick"
            @pane-click="selectedNode = null"
          >
            <!-- Background Grid -->
            <Background pattern-color="#CBD5E1" :gap="16" :size="1" />

            <!-- Interactive Controls -->
            <Controls position="bottom-left" />

            <!-- Mini Map for easy navigation -->
            <MiniMap position="bottom-right" />
          </VueFlow>
          <template #fallback>
            <div class="flex items-center justify-center w-full h-full">
              <div class="text-center space-y-3">
                <Icon name="lucide:loader-2" class="w-8 h-8 mx-auto text-[#047857] animate-spin" />
                <p class="text-xs font-semibold text-slate-500">Memuat Peta Alur Arsitektur...</p>
              </div>
            </div>
          </template>
        </ClientOnly>

        <!-- Toggle Help Banner -->
        <div class="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl shadow-xs max-w-xs pointer-events-auto z-10 space-y-1">
          <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Icon name="lucide:network" class="w-3.5 h-3.5 text-[#047857]" />
            Nahkoda Orchestration Map
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Klik pada node di kanvas interaktif untuk mempelajari fungsi teknis dan integrasi modul.
          </p>
        </div>
      </div>

      <!-- ── Interactive Detail Panel ── -->
      <div class="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col shrink-0 overflow-y-auto">
        <div v-if="selectedNode" class="space-y-4">
          <!-- Node Header Info -->
          <div class="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
            <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-white shadow-xs" :style="{ backgroundColor: selectedNode.data.color }">
              {{ selectedNode.data.category }}
            </span>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">
              {{ selectedNode.label }}
            </h2>
            <p class="text-[10px] text-slate-400 font-mono">Node ID: {{ selectedNode.id }}</p>
          </div>

          <!-- Node Description -->
          <div class="space-y-4">
            <div>
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi Fungsi</h4>
              <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {{ selectedNode.data.description }}
              </p>
            </div>

            <div v-if="selectedNode.data.subcomponents">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fitur & Sub-Komponen</h4>
              <div class="space-y-1.5">
                <div
                  v-for="sub in selectedNode.data.subcomponents"
                  :key="sub"
                  class="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <Icon name="lucide:check-circle-2" class="w-3.5 h-3.5 text-[#047857] shrink-0" />
                  <span class="font-medium leading-tight">{{ sub }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedNode.data.technologies">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Teknologi Terkait</h4>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tech in selectedNode.data.technologies"
                  :key="tech"
                  class="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md"
                >
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Initial State Detail Panel -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-3">
          <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#047857]">
            <Icon name="lucide:mouse-pointer-click" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Pilih Node Sistem</h4>
            <p class="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Klik pada salah satu node di kanvas peta alur untuk membuka rincian spesifikasi teknisnya.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MOBILE: Node list + detail sheet (< 768px) ═══ -->
    <div class="md:hidden space-y-4 pb-safe">
      <div class="space-y-1">
        <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Daftar Modul Sistem</h2>
        <p class="text-xs text-slate-500 font-mono">Nahkoda Orchestration Map &bull; {{ nodes.length }} Node</p>
      </div>

      <div class="space-y-2">
        <button
          v-for="node in nodes"
          :key="node.id"
          @click="selectedNode = node"
          class="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs text-left active:scale-[0.98] transition-all"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: node.data.color }"></span>
            <div class="min-w-0">
              <p class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{{ node.label }}</p>
              <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">{{ node.data.category }}</p>
            </div>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </div>
    </div>

    <!-- Mobile node detail sheet -->
    <MobileSheet v-if="selectedNode" v-model:open="mobileNodeSheetOpen" :title="selectedNode?.label" class="md:hidden">
      <div v-if="selectedNode" class="space-y-4">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-2">
          <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-white shadow-xs" :style="{ backgroundColor: selectedNode.data.color }">
            {{ selectedNode.data.category }}
          </span>
          <p class="text-[10px] text-slate-400 font-mono">Node ID: {{ selectedNode.id }}</p>
        </div>

        <div>
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi Fungsi</h4>
          <p class="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{{ selectedNode.data.description }}</p>
        </div>

        <div v-if="selectedNode.data.subcomponents">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fitur & Sub-Komponen</h4>
          <div class="space-y-1.5">
            <div v-for="sub in selectedNode.data.subcomponents" :key="sub" class="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Icon name="lucide:check-circle-2" class="w-3.5 h-3.5 text-[#047857] shrink-0" />
              <span class="font-medium leading-tight">{{ sub }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedNode.data.technologies">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Teknologi Terkait</h4>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="tech in selectedNode.data.technologies" :key="tech" class="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
              {{ tech }}
            </span>
          </div>
        </div>
      </div>
    </MobileSheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import MobileSheet from '~/components/mobile/MobileSheet.vue'

const colorMode = useColorMode()

const agentCount = computed(() => {
  return nodes.value.filter(n => n.data?.category === 'AI Agent' || n.data?.category === 'Self Correction' || n.data?.category === 'Cognitive Engine').length
})

// Mobile node detail sheet open state — synced with selectedNode.
const mobileNodeSheetOpen = computed({
  get: () => !!selectedNode.value,
  set: (val: boolean) => { if (!val) selectedNode.value = null },
})

// Custom colors for system layers
const COLORS = {
  client: '#3B82F6',     // Blue
  gateway: '#F59E0B',    // Amber
  backend: '#10B981',    // Emerald
  orchestrator: '#8B5CF6', // Purple
  router: '#EC4899',     // Pink
  agent: '#EF4444',      // Red
  executor: '#06B6D4',   // Cyan
  infrastructure: '#64748B' // Slate
}

// Nodes Definition representing Nahkoeda flow architecture
const nodes = ref([
  {
    id: 'user_client',
    label: 'User Interface / Client',
    position: { x: 50, y: 220 },
    sourcePosition: 'right',
    data: {
      category: 'Client Layer',
      color: COLORS.client,
      description: 'Pintu gerbang interaksi pengguna. UMKM dapat mengirimkan pesan, foto nota belanja, file suara, maupun melakukan manajemen stok barang.',
      subcomponents: ['Telegram Bot (@UmkmCopilotBot)', 'Vite Mini App Webview', 'Web Dashboard UI'],
      technologies: ['Telegram API', 'Vue 3', 'Nuxt 3']
    },
    style: { borderColor: COLORS.client, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'cloudflare_tunnel',
    label: 'Cloudflare Gateway',
    position: { x: 280, y: 220 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'Security & Router',
      color: COLORS.gateway,
      description: 'Menyediakan routing aman SSL dari publik ke infrastruktur server lokal FastAPI melalui tunnel enkripsi cloudflared.',
      subcomponents: ['Secure Tunneling', 'cctv-api.desa-sidomukti.com DNS', 'CORS Gatekeeping'],
      technologies: ['Cloudflare Tunnel', 'SSL Encryption']
    },
    style: { borderColor: COLORS.gateway, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'fastapi_backend',
    label: 'FastAPI Backend Core',
    position: { x: 510, y: 220 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'API Engine',
      color: COLORS.backend,
      description: 'Pusat web server utama. Mengatur autentikasi JWT, session user, penanganan file media, upload Cloudflare R2, dan meneruskan pesan user ke AI Orchestrator.',
      subcomponents: ['JWT Multi-Tenant Auth', 'FastAPI Lifespan', 'R2 Storage Handler', 'Transcription Core'],
      technologies: ['FastAPI', 'Uvicorn', 'SQLModel', 'Cloudflare R2']
    },
    style: { borderColor: COLORS.backend, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'orchestrator_core',
    label: 'Orchestrator v6 (5-Tier)',
    position: { x: 740, y: 220 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'Cognitive Engine',
      color: COLORS.orchestrator,
      description: 'Inteligensi utama dalam mengarahkan pesan. Memilah pesan melalui 5 level routing untuk mendapatkan eksekusi terbaik tanpa membuang token LLM.',
      subcomponents: ['[L0] Confirmation Gate', '[L1] FastRouter (Intent parsing)', '[L2] CES Auto-Execute', '[L3] Planner & LLM Fallback'],
      technologies: ['LangGraph', 'LiteLLM', 'DashScope (Qwen 3.7 Max)']
    },
    style: { borderColor: COLORS.orchestrator, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'fast_router',
    label: 'FastRouter Engine',
    position: { x: 970, y: 100 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'Routing',
      color: COLORS.router,
      description: 'Routing berbasis kata kunci dengan cost 0 token. Langsung mendeteksi maksud user seperti cek harga, daftar barang, atau update stok.',
      subcomponents: ['Keyword Intent Parsing', '0-Token Cost Redirection', 'Direct Database Fallback'],
      technologies: ['Python RegEx', 'SQL query mapper']
    },
    style: { borderColor: COLORS.router, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'llm_planner',
    label: 'AI Planner (LLM Cascade)',
    position: { x: 970, y: 340 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'Planning',
      color: COLORS.router,
      description: 'Digunakan saat FastRouter tidak mengenali kata kunci. Membuat rencana kerja sekuensial (task-plan) dan menentukan agen mana yang paling cocok.',
      subcomponents: ['Sequential Task Planning', 'Cross-Agent Context Sharing', 'Fallback LLM routing'],
      technologies: ['LiteLLM', 'Qwen 3.7 Max']
    },
    style: { borderColor: COLORS.router, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'finance_agent',
    label: 'Finance Agent v5',
    position: { x: 1220, y: 40 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'AI Agent',
      color: COLORS.agent,
      description: 'Agen keuangan khusus. Bertanggung jawab atas query penjualan, perhitungan profit, pembuatan bagan analisis keuangan, dan kalkulasi seasonality.',
      subcomponents: ['SQL Summary Tool', 'Matplotlib visualizer', 'Financial Trend Forecaster'],
      technologies: ['PostgreSQL Aggregate', 'Matplotlib', 'PredictionTool']
    },
    style: { borderColor: COLORS.agent, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'stock_agent',
    label: 'Stock Agent v5',
    position: { x: 1220, y: 160 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'AI Agent',
      color: COLORS.agent,
      description: 'Mengelola persediaan barang toko. Memiliki integrasi pencarian fuzzy produk, deteksi stok menipis (low-stock alert), serta memicu konfirmasi perubahan.',
      subcomponents: ['Fuzzy Stock Search', 'Stock Adjustment Initiator', 'Low-stock automated alerts'],
      technologies: ['PostgreSQL Fuzzy Match', 'ManticoreDB']
    },
    style: { borderColor: COLORS.agent, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'marketing_agent',
    label: 'Marketing Agent v5',
    position: { x: 1220, y: 280 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'AI Agent',
      color: COLORS.agent,
      description: 'Membantu penjualan toko. Mampu mendeteksi barang fast/slow-moving dan membuat poster promosi secara otomatis.',
      subcomponents: ['Image Banner Generator', 'Price Tag layouting', 'Promo logic suggester'],
      technologies: ['Pillow (PIL)', 'ReportLab PDF']
    },
    style: { borderColor: COLORS.agent, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'research_agent',
    label: 'Research Agent v5',
    position: { x: 1220, y: 400 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'AI Agent',
      color: COLORS.agent,
      description: 'Mencari informasi pasar dan tren dari luar toko. Menulis ulang query pencarian, mengakses web, serta meringkas hasil pencarian.',
      subcomponents: ['SearXNG query Rewriter', 'External web searcher', 'Reranking & Summarization'],
      technologies: ['SearXNG API', 'Reranker Engine', 'Redis Cache (6h TTL)']
    },
    style: { borderColor: COLORS.agent, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'action_executor',
    label: 'ToolManager & Executor',
    position: { x: 1470, y: 100 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'Execution Engine',
      color: COLORS.executor,
      description: 'Pusat eksekusi tools Nahkoeda. Memilih strategi eksekusi (Single, Pipeline, Parallel, atau Smart) dan meloloskan aksi CRUD database aman.',
      subcomponents: ['ActionExecutor (CRUD Gate)', 'ToolManager execution strategist', 'Database transaction handler'],
      technologies: ['SQLModel Transactions', 'Async Pipelines']
    },
    style: { borderColor: COLORS.executor, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'final_composer',
    label: 'Composer & CEO Validation',
    position: { x: 1470, y: 280 },
    sourcePosition: 'right',
    targetPosition: 'left',
    data: {
      category: 'Validation',
      color: COLORS.executor,
      description: 'Menggabungkan semua data agen menjadi jawaban terstruktur. Menerapkan CEO validation gate untuk memotong potensi halusinasi data LLM.',
      subcomponents: ['CEO Validation Gate', 'Multi-agent text composer', 'Anti-hallucination checks'],
      technologies: ['LiteLLM Validator']
    },
    style: { borderColor: COLORS.executor, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'reflection_agent',
    label: 'Reflection Agent (Lessons)',
    position: { x: 1720, y: 280 },
    targetPosition: 'left',
    data: {
      category: 'Self Correction',
      color: COLORS.executor,
      description: 'Mengevaluasi kualitas respon akhir Nahkoeda. Jika ada agen yang tidak efisien, ia menyimpan pelajarannya ke Qdrant sebagai planner hints untuk dilewati di chat berikutnya.',
      subcomponents: ['Response Quality Evaluator', 'Planner Hints storage', 'Skill logging system'],
      technologies: ['Qdrant memory', 'Redis planner hints']
    },
    style: { borderColor: COLORS.executor, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  },
  {
    id: 'infrastructure_db',
    label: 'Infrastructure Stack',
    position: { x: 1720, y: 100 },
    targetPosition: 'left',
    data: {
      category: 'Infrastructure',
      color: COLORS.infrastructure,
      description: 'Penyimpanan dan pencarian data persisten.',
      subcomponents: ['PostgreSQL (Data Toko)', 'Dragonfly/Redis (Cache & Session)', 'Qdrant (Vector Memory)', 'Cloudflare R2 (CDN Image)'],
      technologies: ['PostgreSQL 16', 'Dragonfly Redis', 'Qdrant Vector', 'Cloudflare R2']
    },
    style: { borderColor: COLORS.infrastructure, borderWidth: '2px', padding: '12px', fontSize: '11px', fontWeight: 'bold' }
  }
])

// Edges connecting nodes to represent the operational flow
const edges = ref([
  { id: 'e_client_gateway', source: 'user_client', target: 'cloudflare_tunnel', type: 'smoothstep', animated: true },
  { id: 'e_gateway_backend', source: 'cloudflare_tunnel', target: 'fastapi_backend', type: 'smoothstep', animated: true },
  { id: 'e_backend_orch', source: 'fastapi_backend', target: 'orchestrator_core', type: 'smoothstep', animated: true },
  
  // 5-Tier Routing paths
  { id: 'e_orch_fastrouter', source: 'orchestrator_core', target: 'fast_router', label: 'L1: Fast Intent', type: 'smoothstep', animated: true, style: { stroke: COLORS.router } },
  { id: 'e_orch_planner', source: 'orchestrator_core', target: 'llm_planner', label: 'L3: Planner', type: 'smoothstep', animated: true, style: { stroke: COLORS.router } },
  
  // Fast Router agent invocation
  { id: 'e_fast_finance', source: 'fast_router', target: 'finance_agent', type: 'smoothstep', animated: true, style: { stroke: COLORS.router } },
  { id: 'e_fast_stock', source: 'fast_router', target: 'stock_agent', type: 'smoothstep', animated: true, style: { stroke: COLORS.router } },
  
  // Planner agent invocation
  { id: 'e_plan_finance', source: 'llm_planner', target: 'finance_agent', type: 'smoothstep', animated: true, style: { stroke: COLORS.router } },
  { id: 'e_plan_stock', source: 'llm_planner', target: 'stock_agent', type: 'smoothstep', animated: true, style: { stroke: COLORS.router } },
  { id: 'e_plan_marketing', source: 'llm_planner', target: 'marketing_agent', type: 'smoothstep', animated: true, style: { stroke: COLORS.router } },
  { id: 'e_plan_research', source: 'llm_planner', target: 'research_agent', type: 'smoothstep', animated: true, style: { stroke: COLORS.router } },
  
  // Agents execution tools
  { id: 'e_finance_exec', source: 'finance_agent', target: 'action_executor', type: 'smoothstep', animated: true, style: { stroke: COLORS.executor } },
  { id: 'e_stock_exec', source: 'stock_agent', target: 'action_executor', type: 'smoothstep', animated: true, style: { stroke: COLORS.executor } },
  { id: 'e_marketing_exec', source: 'marketing_agent', target: 'action_executor', type: 'smoothstep', animated: true, style: { stroke: COLORS.executor } },
  { id: 'e_research_exec', source: 'research_agent', target: 'action_executor', type: 'smoothstep', animated: true, style: { stroke: COLORS.executor } },
  
  // Executor DB interaction and Composer
  { id: 'e_exec_db', source: 'action_executor', target: 'infrastructure_db', type: 'smoothstep', animated: true, style: { stroke: COLORS.infrastructure } },
  { id: 'e_exec_compose', source: 'action_executor', target: 'final_composer', type: 'smoothstep', animated: true, style: { stroke: COLORS.executor } },
  
  // Composer correction loop
  { id: 'e_compose_reflection', source: 'final_composer', target: 'reflection_agent', type: 'smoothstep', animated: true, style: { stroke: COLORS.executor } }
])

const selectedNode = ref<any>(null)

// Handle node clicks to load details dynamically
const onNodeClick = (event: any) => {
  selectedNode.value = event.node
}
</script>

<style>
/* Vue Flow Canvas Styling */
.vue-flow__node {
  background: var(--wp-surface);
  color: var(--wp-text);
  border-radius: 0px !important; /* Flat design constraints */
  box-shadow: var(--wp-shadow-sm);
  transition: all 0.2s ease;
}
.vue-flow__node:hover {
  box-shadow: var(--wp-shadow-md);
  transform: scale(1.02);
}
.vue-flow__node.selected {
  box-shadow: var(--wp-shadow-lg) !important;
  border-color: var(--wp-gold) !important;
  transform: scale(1.04);
}

.vue-flow__edge-path {
  stroke: var(--wp-border);
  stroke-width: 2px;
}
.vue-flow__edge.animated .vue-flow__edge-path {
  stroke: var(--wp-gold);
}
.vue-flow__edge-text {
  font-size: 8px;
  font-weight: bold;
  fill: var(--wp-text);
}
.vue-flow__edge-textbg {
  fill: var(--wp-surface);
}

.vue-flow__controls {
  border-radius: 0px !important;
  border: 1px solid var(--wp-border) !important;
  background: var(--wp-surface) !important;
}
.vue-flow__controls-button {
  border-bottom: 1px solid var(--wp-border) !important;
  color: var(--wp-text) !important;
  fill: currentColor !important;
}
.vue-flow__controls-button:hover {
  background: var(--wp-bg) !important;
}

.vue-flow__minimap {
  border-radius: 0px !important;
  border: 1px solid var(--wp-border) !important;
  background: var(--wp-surface) !important;
}

/* Dark mode custom theme adaptations for Canvas */
.dark .vue-flow__node {
  background: #1E293B;
  color: #F8FAFC;
}
.dark .vue-flow__edge-text {
  fill: #F8FAFC;
}
.dark .vue-flow__edge-textbg {
  fill: #1E293B;
}
</style>
