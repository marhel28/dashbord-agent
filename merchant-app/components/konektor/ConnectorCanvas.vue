<!--
  ConnectorCanvas — VueFlow drop zone for the Connector Hub.

  Handles drag-and-drop from the palette: parses the application/vueflow payload
  and calls handleDropConnect from the composable. Shows empty state and
  drag-over highlight overlay.

  DnD pattern copied from components/automation/WorkflowDesigner.vue.
-->
<template>
  <div class="relative h-full w-full min-h-[400px]">
    <VueFlow
      v-model:nodes="canvasNodes"
      v-model:edges="canvasEdges"
      :node-types="nodeTypes"
      class="bg-background"
      :default-viewport="{ x: 0, y: 0, zoom: 0.85 }"
      :min-zoom="0.2"
      :max-zoom="4"
      @node-click="onNodeClicked"
      @pane-click="selectNode(null)"
      @drop="onDrop"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
    >
      <Background pattern-color="#CBD5E1" :gap="20" :size="1" />
      <Controls position="bottom-left" />
      <MiniMap position="bottom-right" pannable zoomable />
    </VueFlow>

    <!-- Empty state overlay -->
    <div
      v-if="canvasNodes.length === 0"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div class="text-center space-y-2">
        <Icon name="lucide-move" class="w-12 h-12 mx-auto text-muted-foreground/40" />
        <p class="text-sm font-medium text-muted-foreground">
          Tarik connector ke sini untuk menghubungkan
        </p>
      </div>
    </div>

    <!-- Drag-over highlight -->
    <div
      v-if="dragOver"
      class="absolute inset-0 border-2 border-dashed border-primary/50 bg-primary/5 pointer-events-none rounded-lg m-2 transition-all duration-150"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue'
import { VueFlow, useVueFlow, type NodeMouseEvent } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import ConnectorNode from './ConnectorNode.vue'
import { useConnectors } from '~/composables/useConnectors'

// Register custom node type
const nodeTypes = { connector: markRaw(ConnectorNode) }

const { handleDrop, onNodeClick, selectNode, canvasNodes, canvasEdges } = useConnectors()

const dragOver = ref(false)

const onNodeClicked = ({ node }: NodeMouseEvent) => {
  selectNode(node.id)
  onNodeClick(node.data.type)
}

const onDrop = (e: DragEvent) => {
  dragOver.value = false
  if (!e.dataTransfer) return
  const raw = e.dataTransfer.getData('application/vueflow')
  if (!raw) return
  try {
    const payload = JSON.parse(raw)
    if (payload.kind !== 'connector') return
    handleDrop(payload.type)
  } catch {
    // ignore malformed payload
  }
}
</script>
