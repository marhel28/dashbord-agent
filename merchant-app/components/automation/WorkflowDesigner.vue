<template>
  <div class="workflow-designer flex h-[calc(100vh-10rem)]">
    <!-- Left: Node Palette -->
    <div class="w-52 border-r p-3 overflow-y-auto shrink-0" style="border-color: var(--wp-border); background: var(--wp-bg);">
      <h3 class="text-[10px] font-bold uppercase tracking-widest mb-3" style="color: var(--wp-text-secondary);">Node Palette</h3>

      <!-- Triggers -->
      <div class="mb-4">
        <p class="text-[9px] font-bold uppercase tracking-wider mb-1.5" style="color: #3B82F6;">⚡ Trigger</p>
        <div class="space-y-1.5">
          <div
            v-for="item in triggerItems"
            :key="item.subtype"
            :draggable="true"
            @dragstart="onDragStart($event, 'trigger', item.subtype)"
            class="palette-item"
          >
            <Icon :name="item.icon" class="w-3.5 h-3.5" style="color: #3B82F6;" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Conditions -->
      <div class="mb-4">
        <p class="text-[9px] font-bold uppercase tracking-wider mb-1.5" style="color: #D97706;">◆ Kondisi</p>
        <div class="space-y-1.5">
          <div
            v-for="item in conditionItems"
            :key="item.subtype"
            :draggable="true"
            @dragstart="onDragStart($event, 'condition', item.subtype)"
            class="palette-item"
          >
            <Icon :name="item.icon" class="w-3.5 h-3.5" style="color: #D97706;" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mb-4">
        <p class="text-[9px] font-bold uppercase tracking-wider mb-1.5" style="color: #10B981;">▶ Aksi</p>
        <div class="space-y-1.5">
          <div
            v-for="item in actionItems"
            :key="item.subtype"
            :draggable="true"
            @dragstart="onDragStart($event, 'action', item.subtype)"
            class="palette-item"
          >
            <Icon :name="item.icon" class="w-3.5 h-3.5" style="color: #10B981;" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Center: Canvas -->
    <div class="flex-1 relative">
      <!-- Toolbar -->
      <div class="absolute top-3 left-3 z-10 flex items-center gap-2">
        <button @click="newWorkflow" class="toolbar-btn" title="Workflow Baru">
          <Icon name="heroicons:plus" class="w-4 h-4" />
          <span>Baru</span>
        </button>
        <button @click="saveWorkflow" class="toolbar-btn" :disabled="!currentWorkflow" title="Simpan">
          <Icon name="heroicons:bookmark" class="w-4 h-4" />
          <span>Simpan</span>
        </button>
        <button @click="emit('run')" class="toolbar-btn run-btn" :disabled="!currentWorkflow || !hasTriggerAndAction" title="Jalankan">
          <Icon name="heroicons:play" class="w-4 h-4" />
          <span>Run</span>
        </button>
        <button @click="clearCanvas" class="toolbar-btn" title="Bersihkan">
          <Icon name="heroicons:trash" class="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>

      <!-- Status badge -->
      <div v-if="currentWorkflow" class="absolute top-3 right-3 z-10">
        <span class="text-[9px] font-bold px-2 py-1 rounded" :class="statusBadgeClass">
          {{ currentWorkflow.status || 'draft' }}
        </span>
      </div>

      <!-- VueFlow Canvas -->
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        fit-view-on-init
        class="vueflow-wrapper"
        @on-connect="onConnect"
        @on-node-click="onNodeClick"
        @on-pane-ready="onPaneReady"
        @drop="onDrop"
        @dragover.prevent
        @dragleave.prevent
      >
        <Background :gap="16" :size="1" pattern-color="#E2E8F0" />
        <Controls />
        <MiniMap pannable zoomable />
      </VueFlow>

      <!-- Empty state -->
      <div v-if="nodes.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="text-center">
          <Icon name="heroicons:squares-plus" class="w-12 h-12 mx-auto mb-3" style="color: var(--wp-border);" />
          <p class="text-sm font-bold" style="color: var(--wp-text-secondary);">Drag node dari palette ke canvas</p>
          <p class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">Hubungkan trigger → kondisi → aksi</p>
        </div>
      </div>
    </div>

    <!-- Right: Properties Panel -->
    <div v-if="selectedNode" class="w-64 border-l p-3 overflow-y-auto shrink-0" style="border-color: var(--wp-border); background: var(--wp-bg);">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--wp-text-secondary);">Properti Node</h3>
        <button @click="selectedNode = null" class="text-slate-400 hover:text-slate-600">
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Tipe</label>
          <p class="text-xs font-bold" style="color: var(--wp-navy);">{{ selectedNode.data.subtype }}</p>
        </div>

        <!-- Schedule trigger config -->
        <template v-if="selectedNode.data.type === 'trigger' && (selectedNode.data.subtype === 'schedule' || selectedNode.data.subtype === 'time_trigger')">
          <div>
            <label class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Cron Expression</label>
            <CronInput v-model="selectedNode.data.config.cron" class="mt-1" />
          </div>
        </template>

        <!-- Send report action config -->
        <template v-if="selectedNode.data.type === 'action' && selectedNode.data.subtype === 'send_report'">
          <div>
            <label class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Tipe Laporan</label>
            <select v-model="selectedNode.data.config.report_type" class="w-full mt-1 px-2 py-1.5 border rounded text-xs outline-none bg-white" style="border-color: var(--wp-border); color: var(--wp-text);">
              <option value="summary">Ringkasan</option>
              <option value="stock">Stok</option>
              <option value="finance">Keuangan</option>
              <option value="sales">Penjualan</option>
            </select>
          </div>
        </template>

        <!-- Send notification action config -->
        <template v-if="selectedNode.data.type === 'action' && selectedNode.data.subtype === 'send_notification'">
          <div>
            <label class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Pesan</label>
            <textarea v-model="selectedNode.data.config.message" rows="2" class="w-full mt-1 px-2 py-1.5 border rounded text-xs outline-none resize-none" style="border-color: var(--wp-border); color: var(--wp-text); background: white;"></textarea>
          </div>
        </template>

        <!-- Condition: stock below -->
        <template v-if="selectedNode.data.type === 'condition' && selectedNode.data.subtype === 'if_stock_below'">
          <div>
            <label class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Threshold (unit)</label>
            <input v-model.number="selectedNode.data.config.threshold" type="number" class="w-full mt-1 px-2 py-1.5 border rounded text-xs outline-none" style="border-color: var(--wp-border); color: var(--wp-text);" />
          </div>
        </template>

        <!-- Delete node button -->
        <button @click="deleteSelectedNode" class="w-full py-2 text-[10px] font-bold rounded transition" style="background: #FEF2F2; color: #DC2626;">
          Hapus Node
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/background/dist/style.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import TriggerNode from './TriggerNode.vue'
import ActionNode from './ActionNode.vue'
import ConditionNode from './ConditionNode.vue'
import CronInput from './CronInput.vue'
import type { WorkflowNode } from '~/composables/useAutomation'

const emit = defineEmits<{
  (e: 'save', workflow: any): void
  (e: 'run', workflow: any): void
  (e: 'clear'): void
}>()

const nodeTypes = {
  trigger: markRaw(TriggerNode),
  action: markRaw(ActionNode),
  condition: markRaw(ConditionNode),
}

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const selectedNode = ref<Node | null>(null)
const currentWorkflow = ref<any>(null)

const { addNodes, addEdges, removeNodes, removeEdges, screenToFlowCoordinate } = useVueFlow()

const hasTriggerAndAction = computed(() => {
  const hasTrigger = nodes.value.some(n => n.data?.type === 'trigger')
  const hasAction = nodes.value.some(n => n.data?.type === 'action')
  return hasTrigger && hasAction
})

const statusBadgeClass = computed(() => {
  const status = currentWorkflow.value?.status || 'draft'
  if (status === 'active') return 'bg-emerald-100 text-emerald-700'
  if (status === 'inactive') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-100 text-amber-700'
})

const triggerItems = [
  { subtype: 'schedule', label: 'Jadwal (Cron)', icon: 'heroicons:clock' },
  { subtype: 'low_stock_event', label: 'Stok Rendah', icon: 'heroicons:archive-box' },
  { subtype: 'new_order_event', label: 'Order Baru', icon: 'heroicons:shopping-cart' },
]

const conditionItems = [
  { subtype: 'if_stock_below', label: 'Stok Di Bawah', icon: 'heroicons:arrow-down-tray' },
  { subtype: 'if_sales_above', label: 'Penjualan Di Atas', icon: 'heroicons:arrow-trending-up' },
  { subtype: 'if_cashflow_negative', label: 'Arus Kas Negatif', icon: 'heroicons:currency-dollar' },
]

const actionItems = [
  { subtype: 'send_report', label: 'Kirim Laporan', icon: 'heroicons:document-text' },
  { subtype: 'send_notification', label: 'Kirim Notifikasi', icon: 'heroicons:bell' },
  { subtype: 'update_stock', label: 'Update Stok', icon: 'heroicons:archive-box-arrow-up' },
  { subtype: 'generate_pdf', label: 'Generate PDF', icon: 'heroicons:document-arrow-down' },
]

function onDragStart(event: DragEvent, nodeType: string, subtype: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify({ nodeType, subtype }))
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDrop(event: DragEvent) {
  if (!event.dataTransfer) return
  const data = event.dataTransfer.getData('application/vueflow')
  if (!data) return
  const { nodeType, subtype } = JSON.parse(data)

  const position = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY,
  })

  const newNode: Node = {
    id: `${subtype}-${Date.now()}`,
    type: nodeType,
    position,
    data: {
      subtype,
      config: getDefaultConfig(nodeType, subtype),
    },
  }

  addNodes([newNode])
}

function getDefaultConfig(nodeType: string, subtype: string): Record<string, any> {
  switch (subtype) {
    case 'schedule':
    case 'time_trigger':
      return { cron: '0 9 * * *' }
    case 'send_report':
      return { report_type: 'summary' }
    case 'send_notification':
      return { message: 'Notifikasi dari workflow' }
    case 'update_stock':
      return { change_type: 'set', quantity: 0 }
    case 'if_stock_below':
      return { threshold: 10 }
    case 'if_sales_above':
      return { threshold_amount: 1000000 }
    case 'if_cashflow_negative':
      return { period: 'monthly' }
    default:
      return {}
  }
}

function onConnect(connection: Connection) {
  const newEdge: Edge = {
    id: `e-${connection.source}-${connection.target}-${Date.now()}`,
    source: connection.source,
    sourceHandle: connection.sourceHandle ?? undefined,
    target: connection.target,
    targetHandle: connection.targetHandle ?? undefined,
    animated: true,
    style: { stroke: '#D4A843', strokeWidth: 2 },
  }
  addEdges([newEdge])
}

function onNodeClick(event: NodeMouseEvent) {
  selectedNode.value = event.node
}

function onPaneReady() {
  // Canvas ready
}

function deleteSelectedNode() {
  if (selectedNode.value) {
    removeNodes([selectedNode.value])
    selectedNode.value = null
  }
}

function newWorkflow() {
  currentWorkflow.value = {
    id: '',
    name: '',
    description: '',
    status: 'draft',
  }
  clearCanvas()
}

function clearCanvas() {
  nodes.value = []
  edges.value = []
  selectedNode.value = null
  emit('clear')
}

function saveWorkflow() {
  if (!currentWorkflow.value) return
  const workflow = {
    ...currentWorkflow.value,
    nodes: nodes.value.map(n => ({
      id: n.id,
      type: n.data.type,
      subtype: n.data.subtype,
      config: n.data.config,
      position: n.position,
    })),
    edges: edges.value.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  }
  emit('save', workflow)
}

// Expose methods for parent
defineExpose({
  loadWorkflow: (wf: any) => {
    currentWorkflow.value = { id: wf.id, name: wf.name, description: wf.description, status: wf.status }
    nodes.value = (wf.nodes || []).map((n: WorkflowNode) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { subtype: n.subtype, config: n.config },
    }))
    edges.value = (wf.edges || []).map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: '#D4A843', strokeWidth: 2 },
    }))
  },
  setWorkflowMeta: (meta: { name: string; description: string; status: string }) => {
    if (currentWorkflow.value) {
      currentWorkflow.value.name = meta.name
      currentWorkflow.value.description = meta.description
      currentWorkflow.value.status = meta.status
    } else {
      currentWorkflow.value = { id: '', ...meta }
    }
  },
  getCurrentWorkflow: () => currentWorkflow.value,
})
</script>

<style scoped>
.palette-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: grab;
  transition: all 0.15s;
  border: 1px solid var(--wp-border);
  background: white;
  color: var(--wp-text-secondary);
}
.palette-item:hover {
  border-color: var(--wp-gold);
  background: rgba(212,168,67,0.05);
}
.palette-item:active {
  cursor: grabbing;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 700;
  transition: all 0.15s;
  background: white;
  border: 1px solid var(--wp-border);
  color: var(--wp-text-secondary);
}
.toolbar-btn:hover:not(:disabled) {
  border-color: var(--wp-gold);
  color: var(--wp-navy);
}
.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.run-btn {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border-color: transparent;
}
.run-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.vueflow-wrapper {
  width: 100%;
  height: 100%;
  background: var(--wp-bg);
}

/* VueFlow overrides */
:deep(.vue-flow__node) {
  border-radius: 6px;
  border: 2px solid;
  min-width: 120px;
  font-family: var(--wp-font);
}
:deep(.vue-flow__node.selected) {
  border-color: var(--wp-gold) !important;
  box-shadow: 0 0 0 2px rgba(212,168,67,0.3);
}
:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  background: var(--wp-gold);
  border: 2px solid white;
}
:deep(.vue-flow__edge-path) {
  stroke: #D4A843;
  stroke-width: 2;
}
:deep(.vue-flow__controls) {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 6px;
}
:deep(.vue-flow__minimap) {
  border-radius: 6px;
}
</style>
