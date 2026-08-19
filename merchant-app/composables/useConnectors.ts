/**
 * useConnectors — singleton state management for the Connector Hub.
 *
 * Single source of truth for all connector state: connectors from API,
 * canvas nodes/edges, selected node, link dialog, toasts.
 *
 * Pattern: module-level refs forming a singleton (same as useAutomation).
 * All child components read/mutate via useConnectors() — no prop drilling.
 */

import { ref, computed, type Ref } from 'vue'
import { api } from '~/utils/api'
import type { Node, Edge } from '@vue-flow/core'

// ── Types ──────────────────────────────────────────────────────────

export type ConnectorType =
  | 'whatsapp' | 'google_sheet' | 'google_drive' | 'telegram'
  | 'email' | 'notion' | 'shopee' | 'tokopedia' | 'meta'
  | 'instagram' | 'tiktok' | 'gmail' | 'slack' | 'n8n' | 'pos'

export type ConnectorStatus = 'pending' | 'active' | 'inactive' | 'error' | 'expired'

export interface Connector {
  uuid: string
  connector_type: ConnectorType
  status: ConnectorStatus
  metadata_: Record<string, any>
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface ConnectorMeta {
  type: ConnectorType
  label: string
  icon: string
  color: string
  description: string
  implemented: boolean
  isDefault?: boolean
}

export interface CanvasNodeData {
  type: ConnectorType
  label: string
  icon: string
  color: string
  status: ConnectorStatus
  phone?: string
  isDefault?: boolean
  uuid?: string | null
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// ── Master Catalog (frontend-owned) ─────────────────────────────────

export const CONNECTOR_CATALOG: ConnectorMeta[] = [
  { type: 'telegram', label: 'Telegram', icon: 'lucide:send', color: '#26A5E4', description: 'Bot telegram utama — selalu aktif sebagai konektor default.', implemented: true, isDefault: true },
  { type: 'whatsapp', label: 'WhatsApp', icon: 'lucide:message-circle', color: '#25D366', description: 'Hubungkan via link WhatsApp untuk chat dengan bot.', implemented: true },
  { type: 'google_sheet', label: 'Google Sheet', icon: 'lucide:table', color: '#0F9D58', description: 'Ekspor data ke spreadsheet.', implemented: false },
  { type: 'google_drive', label: 'Google Drive', icon: 'lucide:hard-drive', color: '#4285F4', description: 'Simpan file & cadangkan data.', implemented: false },
  { type: 'email', label: 'Email', icon: 'lucide:mail', color: '#EA4335', description: 'Notifikasi & laporan via email.', implemented: false },
  { type: 'gmail', label: 'Gmail', icon: 'lucide:mail-open', color: '#EA4335', description: 'Integrasi khusus Gmail.', implemented: false },
  { type: 'notion', label: 'Notion', icon: 'lucide:book-open', color: '#000000', description: 'Sinkronkan catatan ke Notion.', implemented: false },
  { type: 'slack', label: 'Slack', icon: 'lucide:hash', color: '#4A154B', description: 'Notifikasi tim lewat Slack.', implemented: false },
  { type: 'meta', label: 'Meta', icon: 'lucide:globe', color: '#0081FB', description: 'Instagram & Facebook via Meta.', implemented: false },
  { type: 'instagram', label: 'Instagram', icon: 'lucide:camera', color: '#E4405F', description: 'Kelola DM & komentar IG.', implemented: false },
  { type: 'tiktok', label: 'TikTok', icon: 'lucide:music', color: '#000000', description: 'Integrasi TikTok Shop.', implemented: false },
  { type: 'shopee', label: 'Shopee', icon: 'lucide:shopping-bag', color: '#EE4D2D', description: 'Sinkronkan pesanan Shopee.', implemented: false },
  { type: 'tokopedia', label: 'Tokopedia', icon: 'lucide:store', color: '#42B549', description: 'Sinkronkan pesanan Tokopedia.', implemented: false },
  { type: 'n8n', label: 'n8n', icon: 'lucide:workflow', color: '#EA4B71', description: 'Otomatisasi workflow lanjut.', implemented: false },
  { type: 'pos', label: 'POS', icon: 'lucide:monitor', color: '#64748B', description: 'Koneksi perangkat POS lokal.', implemented: false },
]

// ── Singleton State ─────────────────────────────────────────────────

const connectors = ref<Connector[]>([])
const loading = ref(false)
const canvasNodes = ref<Node[]>([])
const canvasEdges = ref<Edge[]>([])
const selectedNodeId = ref<string | null>(null)

const linkDialog = ref({
  open: false,
  type: null as ConnectorType | null,
  wa_link: '',
  link_token: '',
  bot_number: '',
  expires_at: '',
  polling: false,
  opened_at: 0,
})

const toasts = ref<Toast[]>([])

let pollTimer: ReturnType<typeof setInterval> | null = null
let pollAbort: AbortController | null = null

// Track node positions so returning nodes keep their spot
const nodePositions = ref<Map<ConnectorType, { x: number; y: number }>>(new Map())

// ── Computed ────────────────────────────────────────────────────────

const connectedTypes = computed(() => new Set(connectors.value.map(c => c.connector_type)))

const catalogView = computed(() =>
  CONNECTOR_CATALOG.map(c => ({
    ...c,
    connected: connectedTypes.value.has(c.type),
    effectiveStatus: c.isDefault
      ? 'active' as ConnectorStatus
      : (connectors.value.find(x => x.connector_type === c.type)?.status ?? 'inactive' as ConnectorStatus),
  }))
)

const activeConnectors = computed(() => catalogView.value.filter(c => c.connected || c.isDefault))
const availableConnectors = computed(() => catalogView.value.filter(c => !(c.connected || c.isDefault)))

const selectedNode = computed(() =>
  canvasNodes.value.find(n => n.id === selectedNodeId.value) ?? null
)

const selectedConnector = computed(() =>
  connectors.value.find(c => c.connector_type === selectedNodeId.value) ?? null
)

// ── Toast helpers ───────────────────────────────────────────────────

let toastIdCounter = 0

const toast = (message: string, type: Toast['type'] = 'info') => {
  const id = `toast_${++toastIdCounter}`
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

const toastError = (message: string) => toast(message || 'Terjadi kesalahan.', 'error')
const toastSuccess = (message: string) => toast(message, 'success')

// ── Canvas helpers ──────────────────────────────────────────────────

const nextPosition = (type: ConnectorType): { x: number; y: number } => {
  // Return saved position if node existed before
  const saved = nodePositions.value.get(type)
  if (saved) return saved

  // Auto-place on a loose grid based on current node count
  const count = canvasNodes.value.length
  const col = count % 3
  const row = Math.floor(count / 3)
  const pos = { x: 80 + col * 220, y: 60 + row * 160 }
  nodePositions.value.set(type, pos)
  return pos
}

const buildNode = (
  meta: ConnectorMeta,
  status: ConnectorStatus,
  phone?: string,
  connector?: Connector,
  isDefault?: boolean,
): Node => ({
  id: meta.type,
  type: 'connector',
  position: nextPosition(meta.type),
  data: {
    type: meta.type,
    label: meta.label,
    icon: meta.icon,
    color: meta.color,
    status,
    phone,
    isDefault: isDefault ?? meta.isDefault ?? false,
    uuid: connector?.uuid ?? null,
  } as CanvasNodeData,
})

const buildHubEdges = () => {
  // Draw animated edges from Telegram (hub) to every other connected node
  const edges: Edge[] = []
  const hubId = 'telegram'
  for (const node of canvasNodes.value) {
    if (node.id === hubId) continue
    edges.push({
      id: `hub-${hubId}-${node.id}`,
      source: hubId,
      target: node.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#26A5E4', strokeWidth: 2 },
    })
  }
  canvasEdges.value = edges
}

// ── Core Functions ──────────────────────────────────────────────────

const fetchConnectors = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/connectors')
    connectors.value = res.data ?? []
    syncCanvas()
  } catch (err: any) {
    console.error('[useConnectors] fetchConnectors failed:', err)
    toastError(err.message)
    throw err
  } finally {
    loading.value = false
  }
}

const syncCanvas = () => {
  const nodes: Node[] = []
  const seen = new Set<ConnectorType>()

  // 1) Real connectors from the API
  for (const c of connectors.value) {
    const meta = CONNECTOR_CATALOG.find(m => m.type === c.connector_type)
    if (!meta) continue
    seen.add(c.connector_type)
    nodes.push(buildNode(meta, c.status, c.metadata_?.phone, c))
  }

  // 2) Guarantee Telegram default node (always present)
  if (!seen.has('telegram')) {
    const tg = CONNECTOR_CATALOG.find(m => m.type === 'telegram')!
    nodes.push(buildNode(tg, 'active', undefined, undefined, true))
  }

  canvasNodes.value = nodes
  buildHubEdges()
}

const addCanvasNode = (meta: ConnectorMeta, status: ConnectorStatus) => {
  // Don't add duplicate
  if (canvasNodes.value.find(n => n.id === meta.type)) return
  const node = buildNode(meta, status)
  canvasNodes.value = [...canvasNodes.value, node]
  buildHubEdges()
}

const removeCanvasNode = (type: ConnectorType) => {
  canvasNodes.value = canvasNodes.value.filter(n => n.id !== type)
  nodePositions.value.delete(type)
  buildHubEdges()
}

// ── Drag-Drop: just add the node (no connection yet) ────────────────

const handleDrop = (type: ConnectorType) => {
  // Guard: already on canvas?
  if (canvasNodes.value.find(n => n.id === type)) {
    toast('Connector sudah di kanvas.')
    return
  }

  const meta = CONNECTOR_CATALOG.find(m => m.type === type)
  if (!meta?.implemented) {
    toast(`${meta?.label ?? type} belum tersedia.`, 'info')
    return
  }

  // Add node in disconnected state — user must click to connect
  addCanvasNode(meta, 'inactive')
}

// ── Connect: triggered by clicking a disconnected node ──────────────

const handleConnect = async (type: ConnectorType) => {
  // Guard: already connected?
  if (connectedTypes.value.has(type) || type === 'telegram') {
    openCopilotChat()
    return
  }

  const meta = CONNECTOR_CATALOG.find(m => m.type === type)
  if (!meta?.implemented) {
    toast(`${meta?.label ?? type} belum tersedia.`, 'info')
    return
  }

  if (type === 'whatsapp') {
    // Update node to "connecting…" state
    updateNodeStatus(type, 'pending')
    await startWhatsAppLink()
  }
  // future: other implemented connectors branch here
}

// ── Node click handler — routes based on state ──────────────────────

const onNodeClick = (type: ConnectorType) => {
  const connector = connectors.value.find(c => c.connector_type === type)
  const status = connector?.status ?? 'inactive'

  if (status === 'active' || type === 'telegram') {
    // Connected → open chat
    if (type === 'whatsapp') openCopilotChat()
  } else if (status === 'inactive') {
    // Disconnected → start connection flow
    handleConnect(type)
  }
  // status === 'pending' → do nothing (already connecting)
}

// ── Update node status on canvas ────────────────────────────────────

const updateNodeStatus = (type: ConnectorType, status: ConnectorStatus) => {
  const node = canvasNodes.value.find(n => n.id === type)
  if (node) {
    node.data.status = status
  }
}

// ── WhatsApp Link Flow ──────────────────────────────────────────────

const startWhatsAppLink = async () => {
  try {
    const res: any = await api.post('/connectors/whatsapp/link')
    linkDialog.value = {
      open: true,
      type: 'whatsapp',
      wa_link: res.wa_link,
      link_token: res.link_token,
      bot_number: res.bot_number,
      expires_at: res.expires_at,
      polling: true,
      opened_at: Date.now(),
    }
    startPolling()
  } catch (err: any) {
    toastError(err.message)
    removeCanvasNode('whatsapp')
    throw err
  }
}

const startPolling = () => {
  stopPolling()
  pollAbort = new AbortController()
  pollTimer = setInterval(async () => {
    if (pollAbort?.signal.aborted) return
    try {
      const st: any = await api.get('/connectors/whatsapp/status')
      if (st.linked) {
        stopPolling()
        linkDialog.value.polling = false
        linkDialog.value.open = false
        toastSuccess('WhatsApp berhasil terhubung!')
        await fetchConnectors()
      }
    } catch (err: any) {
      console.error('[useConnectors] poll status error:', err)
      toastError('Gagal memeriksa status. Mencoba lagi…')
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (pollAbort) {
    pollAbort.abort()
    pollAbort = null
  }
}

// ── Disconnect ──────────────────────────────────────────────────────

const disconnectConnector = async (type: ConnectorType) => {
  if (type === 'telegram') return
  try {
    await api.delete(`/connectors/${type}`)
    toastSuccess('Konektor diputuskan.')
    await fetchConnectors()
  } catch (err: any) {
    toastError(err.message)
    throw err
  }
}

// ── Selection ───────────────────────────────────────────────────────

const selectNode = (id: string | null) => {
  selectedNodeId.value = id
}

// ── Open Copilot Chat ───────────────────────────────────────────────

const openCopilotChat = () => {
  window.open('https://wa.me/6285187515161?text=Halo', '_blank', 'noopener')
}

// ── Cleanup ─────────────────────────────────────────────────────────

const dispose = () => {
  stopPolling()
}

// ── Public API ──────────────────────────────────────────────────────

export const useConnectors = () => ({
  // State
  connectors,
  loading,
  canvasNodes,
  canvasEdges,
  selectedNodeId,
  selectedNode,
  selectedConnector,
  linkDialog,
  toasts,
  // Computed
  catalogView,
  activeConnectors,
  availableConnectors,
  connectedTypes,
  // Actions
  fetchConnectors,
  handleDrop,
  handleConnect,
  onNodeClick,
  startWhatsAppLink,
  stopPolling,
  disconnectConnector,
  selectNode,
  dispose,
  // Helpers
  addCanvasNode,
  removeCanvasNode,
  openCopilotChat,
  toast,
  toastError,
  toastSuccess,
})
