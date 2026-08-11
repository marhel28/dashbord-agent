<template>
  <div class="agent-avatar-root" :class="[`state-${state}`, { speaking: isSpeaking }]">
    <!-- Glow ring when speaking -->
    <div v-if="isSpeaking" class="avatar-glow"></div>

    <!-- Avatar image (single img, no stacking = no blink) -->
    <div class="avatar-box">
      <img
        :src="currentFrame"
        alt="AI Agent"
        class="avatar-img"
        draggable="false"
      />
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

// ── All 20 animation frames (paths relative to /public/) ─────────

const FRAMES: Record<string, string[]> = {
  idle: ['/agent-avatar/Senyum.png'],
  talking: [
    '/agent-avatar/TT 1.png',
    '/agent-avatar/TT 2.png',
    '/agent-avatar/TT 3.png',
    '/agent-avatar/TT 4.png',
    '/agent-avatar/TT 5.png',
  ],
  explaining: [
    '/agent-avatar/Menjelaskan  1.png',
    '/agent-avatar/menjelaskan 2.png',
    '/agent-avatar/menjelaskan 3.png',
  ],
  thinking: [
    '/agent-avatar/Bingung.png',
    '/agent-avatar/Bingung 2.png',
  ],
  muttering: [
    '/agent-avatar/Mutung  1.png',
    '/agent-avatar/Mutung 2.png',
    '/agent-avatar/Mutung 3.png',
    '/agent-avatar/Mutung 4.png',
    '/agent-avatar/Mutung 5.png',
  ],
  realization: [
    '/agent-avatar/AHA.png',
    '/agent-avatar/AHA 2.png',
    '/agent-avatar/AHA 3.png',
  ],
  sad: ['/agent-avatar/sedikit sedih.png'],
}

const SPEED: Record<string, number> = {
  idle: 0,
  talking: 90,
  explaining: 110,
  thinking: 180,
  muttering: 130,
  realization: 140,
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
  if (SPEED[props.state] > 0) startLoop(); else stopLoop()
}, { immediate: true })

onMounted(() => { if (SPEED[props.state] > 0) startLoop() })
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
  border-radius: 20px;
  border: 2px solid #D4A843;
  animation: glow-pulse 1.4s ease-out infinite;
  pointer-events: none;
  z-index: 2;
}

/* ── Image container (rounded rect, NOT circle) ────────────────── */
.avatar-box {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  overflow: hidden;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  animation: avatar-breathe 3s ease-in-out infinite;
  flex-shrink: 0;
  position: relative;
}

/* Speaking = faster breathe + gold border + glow */
.speaking .avatar-box {
  animation: avatar-breathe 1.2s ease-in-out infinite;
  border-color: #D4A843;
  box-shadow: 0 4px 24px rgba(212,168,67,0.35);
}

/* ── Image (fills container, no transparency issues) ───────────── */
.avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 15%; /* focus on face area */
  /* NO transition = NO blink */
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
