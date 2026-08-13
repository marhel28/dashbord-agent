<template>
  <div class="agent-avatar-root" :class="[`state-${state}`, { speaking: isSpeaking }]">
    <!-- Glow ring when speaking -->
    <div v-if="isSpeaking" class="avatar-glow"></div>

    <!-- Avatar image (WhatsApp circular style) -->
    <div class="avatar-box">
      <img
        :src="currentFrame"
        alt="AI Agent"
        class="avatar-img"
        draggable="false"
      />
      <!-- WhatsApp style online status dot -->
      <span class="online-dot" title="Online"></span>
    </div>

    <!-- Sound wave bars -->
    <div v-if="isSpeaking" class="voice-bars">
      <span v-for="i in 5" :key="i" class="vbar" :style="{ animationDelay: `${i * 0.08}s` }" />
    </div>

    <!-- State label -->
    <div v-if="showLabel" class="avatar-label" :style="{ color: stateColor }">
      {{ stateLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  state?: 'idle' | 'talking' | 'thinking' | 'explaining' | 'muttering' | 'realization' | 'sad'
  isSpeaking?: boolean
  showLabel?: boolean
}>(), {
  state: 'idle',
  isSpeaking: false,
  showLabel: false,
})

// ── Primary Avatar Image (AHA.png) ─────────
const AHA_IMAGE = ['/agent-avatar/AHA.png']

const FRAMES: Record<string, string[]> = {
  idle: AHA_IMAGE,
  talking: AHA_IMAGE,
  explaining: AHA_IMAGE,
  thinking: AHA_IMAGE,
  muttering: AHA_IMAGE,
  realization: AHA_IMAGE,
  sad: AHA_IMAGE,
}

const SPEED: Record<string, number> = {
  idle: 0,
  talking: 0,
  explaining: 0,
  thinking: 0,
  muttering: 0,
  realization: 0,
  sad: 0,
}

// ── Animation state ──────────────────────────────────────────────

const frameIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const frames = computed(() => FRAMES[props.state] || FRAMES.idle)

const currentFrame = computed(() => {
  const f = frames.value
  return f[frameIndex.value % f.length]
})

const stateColor = computed(() => {
  const c: Record<string, string> = {
    idle: '#64748B',
    talking: '#D4A843',
    explaining: '#3B82F6',
    thinking: '#D97706',
    muttering: '#8B5CF6',
    realization: '#059669',
    sad: '#DC2626',
  }
  return c[props.state] || '#64748B'
})

const stateLabel = computed(() => {
  const l: Record<string, string> = {
    idle: 'Siap membantu',
    talking: 'Berbicara...',
    explaining: 'Menjelaskan...',
    thinking: 'Berpikir...',
    muttering: 'Memproses...',
    realization: 'Ada insight!',
    sad: 'Terjadi masalah',
  }
  return l[props.state] || ''
})

// ── Animation loop (hard switch, no fade = no blink) ─────────────

function startLoop() {
  stopLoop()
  if (!process.client) return
  const ms = SPEED[props.state] || 0
  if (ms <= 0) { frameIndex.value = 0; return }
  timer = setInterval(() => {
    frameIndex.value = (frameIndex.value + 1) % frames.value.length
  }, ms)
}

function stopLoop() {
  if (timer) { clearInterval(timer); timer = null }
}

watch(() => props.state, () => {
  frameIndex.value = 0
  if (process.client && SPEED[props.state] > 0) startLoop(); else stopLoop()
})

onMounted(() => { if (process.client && SPEED[props.state] > 0) startLoop() })
onUnmounted(() => stopLoop())
</script>

<style scoped>
.agent-avatar-root {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

/* ── Glow ring (speaking) ──────────────────────────────────────── */
.avatar-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #25D366;
  animation: glow-pulse 1.4s ease-out infinite;
  pointer-events: none;
  z-index: 2;
}

/* ── Image container (WhatsApp style circle) ────────────────── */
.avatar-box {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  animation: avatar-breathe 3s ease-in-out infinite;
  flex-shrink: 0;
  position: relative;
}

/* Speaking = faster breathe + WA green border + glow */
.speaking .avatar-box {
  animation: avatar-breathe 1.2s ease-in-out infinite;
  border-color: #25D366;
  box-shadow: 0 4px 24px rgba(37,211,102,0.35);
}

/* ── Image (fills circular container, focus on face area) ───── */
.avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 12%; /* perfect face alignment */
}

/* ── WhatsApp style online status dot ────────────────────────── */
.online-dot {
  position: absolute;
  bottom: 2px;
  right: 6px;
  width: 14px;
  height: 14px;
  background: #25D366;
  border: 2.5px solid #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* ── Voice bars ────────────────────────────────────────────────── */
.voice-bars {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 18px;
}

.vbar {
  width: 3px;
  height: 100%;
  background: #D4A843;
  border-radius: 2px;
  animation: vbar-wave 0.7s ease-in-out infinite;
  transform-origin: bottom;
}

/* ── Label ─────────────────────────────────────────────────────── */
.avatar-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* ── Keyframes ─────────────────────────────────────────────────── */
@keyframes avatar-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.03); }
}

@keyframes glow-pulse {
  0%   { transform: scale(1);    opacity: 0.8; }
  100% { transform: scale(1.10); opacity: 0;   }
}

@keyframes vbar-wave {
  0%, 100% { transform: scaleY(0.25); }
  50%      { transform: scaleY(1);    }
}
</style>
