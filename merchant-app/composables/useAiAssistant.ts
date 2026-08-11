// ── AI Assistant Composable — voice + text chat with animated agent
import { ref, computed } from 'vue'
import { api } from '../utils/api'

export interface ChatMessage {
  role: 'user' | 'agent'
  content: string
  audioUrl?: string
  time: string
  agentsUsed?: string[]
}

export type AgentState = 'idle' | 'talking' | 'thinking' | 'explaining' | 'muttering' | 'realization' | 'sad'

// ── State ────────────────────────────────────────────────────────

const messages = ref<ChatMessage[]>([])
const isSending = ref(false)
const isSpeaking = ref(false)
const isRecording = ref(false)
const voiceMode = ref(true) // default: voice
const agentState = ref<AgentState>('idle')
const error = ref<string | null>(null)

// ── Computed ──────────────────────────────────────────────────────

const lastAgentMessage = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i].role === 'agent') return messages.value[i]
  }
  return null
})

// ── Helpers ───────────────────────────────────────────────────────

function formatTime(): string {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// ── Actions ───────────────────────────────────────────────────────

async function sendMessage(text: string) {
  if (!text.trim() || isSending.value) return

  error.value = null
  isSending.value = true
  agentState.value = 'thinking'

  // Add user message
  messages.value.push({
    role: 'user',
    content: text.trim(),
    time: formatTime(),
  })

  try {
    const res = await api.post('/agentic/ai-assistant/chat', {
      message: text.trim(),
      mode: voiceMode.value ? 'voice' : 'text',
    })

    if (res.status === 'success') {
      const reply = res.data.reply || 'Maaf, tidak ada respons.'
      const audioData = res.data.audio  // base64 data:audio/ogg;base64,...

      messages.value.push({
        role: 'agent',
        content: reply,
        audioUrl: audioData,  // store base64 directly
        time: formatTime(),
      })

      // Play audio if voice mode and audio available
      if (voiceMode.value && audioData) {
        await playAudio(audioData)
      } else {
        agentState.value = 'idle'
      }
    } else {
      agentState.value = 'sad'
      error.value = res.message ?? 'Gagal mendapatkan respons.'
    }
  } catch (e: any) {
    agentState.value = 'sad'
    error.value = e?.message ?? 'Terjadi kesalahan. Coba lagi.'
    messages.value.push({
      role: 'agent',
      content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
      time: formatTime(),
    })
  } finally {
    isSending.value = false
    if (agentState.value === 'thinking') {
      agentState.value = 'idle'
    }
  }
}

async function playAudio(audioData: string) {
  return new Promise<void>((resolve) => {
    isSpeaking.value = true
    agentState.value = 'talking'

    try {
      // audioData is already a base64 data URL: "data:audio/ogg;base64,..."
      const audio = new Audio(audioData)

      audio.onended = () => {
        isSpeaking.value = false
        agentState.value = 'idle'
        resolve()
      }
      audio.onerror = () => {
        console.warn('[AI Assistant] Audio playback error')
        isSpeaking.value = false
        agentState.value = 'idle'
        resolve()
      }

      // Ensure audio is loaded before playing
      audio.oncanplaythrough = () => {
        audio.play().catch((err) => {
          console.warn('[AI Assistant] Play failed:', err?.message)
          isSpeaking.value = false
          agentState.value = 'idle'
          resolve()
        })
      }

      // Fallback: try to play even if oncanplaythrough doesn't fire
      setTimeout(() => {
        if (isSpeaking.value) {
          audio.play().catch(() => {
            isSpeaking.value = false
            agentState.value = 'idle'
            resolve()
          })
        }
      }, 500)

    } catch (e) {
      console.warn('[AI Assistant] Audio setup failed:', e)
      isSpeaking.value = false
      agentState.value = 'idle'
      resolve()
    }
  })
}

// ── Voice Recording (Web API) ────────────────────────────────────

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      stream.getTracks().forEach((t) => t.stop())
      await transcribeAndSend(blob)
    }

    mediaRecorder.start()
    isRecording.value = true
    agentState.value = 'explaining'
  } catch {
    error.value = 'Tidak bisa mengakses mikrofon.'
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    isRecording.value = false
    agentState.value = 'thinking'
  }
}

async function transcribeAndSend(blob: Blob) {
  try {
    const formData = new FormData()
    formData.append('audio', blob, 'recording.webm')

    const res = await api.post('/agentic/ai-assistant/stt', formData)
    if (res.status === 'success' && res.data.text) {
      await sendMessage(res.data.text)
    } else {
      agentState.value = 'sad'
      error.value = 'Gagal mengenali suara. Coba lagi.'
    }
  } catch {
    agentState.value = 'sad'
    error.value = 'Gagal memproses audio.'
  }
}

// ── Mode Toggle ──────────────────────────────────────────────────

function toggleVoiceMode() {
  voiceMode.value = !voiceMode.value
}

function setVoiceMode(enabled: boolean) {
  voiceMode.value = enabled
}

function clearChat() {
  messages.value = []
  error.value = null
  agentState.value = 'idle'
}

// ── Composable return ────────────────────────────────────────────

export function useAiAssistant() {
  return {
    // State
    messages,
    isSending,
    isSpeaking,
    isRecording,
    voiceMode,
    agentState,
    error,
    // Computed
    lastAgentMessage,
    // Actions
    sendMessage,
    playAudio,
    startRecording,
    stopRecording,
    toggleVoiceMode,
    setVoiceMode,
    clearChat,
  }
}
