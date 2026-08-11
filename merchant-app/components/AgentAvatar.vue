<template>
  <div class="agent-avatar-container" :class="[`state-${state}`, { speaking: isSpeaking }]">
    <!-- Glow ring when speaking -->
    <div v-if="isSpeaking" class="speaking-ring"></div>

    <!-- Avatar frame -->
    <div class="avatar-frame-wrapper">
      <img
        v-for="(frame, idx) in frames"
        :key="idx"
        :src="frame"
        alt="AI Agent"
        class="avatar-frame"
        :class="{ active: idx === frameIndex }"
        draggable="false"
        @error="onImageError"
      />
    </div>

    <!-- Sound wave indicator -->
    <div v-if="isSpeaking" class="sound-waves">
      <span v-for="i in 5" :key="i" class="wave-bar" :style="{ animationDelay: `${i * 0.1}s` }" />
    </div>

    <!-- State label -->
    <div v-if="showLabel" class="state-label" :style="{ color: stateColor }">
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

// ── Frame mapping (all 20 animation frames) ──────────────────────
// Paths are relative to /public/ folder (served at root)

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
  talking: 100,
  explaining: 120,
  thinking: 200,
  muttering: 150,
  realization: 150,
  sad: 0,
}

// ── Animation state ──────────────────────────────────────────────

const frameIndex = ref(0)
let interval: ReturnType<typeof setInterval> | null = null

const frames = computed(() => FRAMES[props.state] || FRAMES.idle)

const currentFrame = computed(() => {
  const f = frames.value
  return f[frameIndex.value % f.length]
})

const stateColor = computed(() => {
  const colors: Record<string, string> = {
    idle: 'var(--wp-text-secondary)',
    talking: 'var(--wp-gold)',
    explaining: '#3B82F6',
    thinking: 'var(--wp-warning)',
    muttering: '#8B5CF6',
    realization: 'var(--wp-success)',
    sad: 'var(--wp-error)',
  }
  return colors[props.state] || 'var(--wp-text-secondary)'
})

const stateLabel = computed(() => {
  const labels: Record<string, string> = {
    idle: 'Siap membantu',
    talking: 'Berbicara...',
    explaining: 'Menjelaskan...',
    thinking: 'Berpikir...',
    muttering: 'Memproses...',
    realization: 'Ada insight!',
    sad: 'Terjadi masalah',
  }
  return labels[props.state] || ''
})

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

// ── Animation loop ───────────────────────────────────────────────

function startAnimation() {
  stopAnimation()
  const speed = SPEED[props.state] || 0
  if (speed <= 0) {
    frameIndex.value = 0
    return
  }
  interval = setInterval(() => {
    const f = frames.value
    frameIndex.value = (frameIndex.value + 1) % f.length
  }, speed)
}

function stopAnimation() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

watch(() => props.state, () => {
  frameIndex.value = 0
  const speed = SPEED[props.state] || 0
  if (speed > 0) {
    startAnimation()
  } else {
    stopAnimation()
  }
}, { immediate: true })

onMounted(() => {
  const speed = SPEED[props.state] || 0
  if (speed > 0) startAnimation()
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.agent-avatar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.avatar-frame-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--wp-gold-light), var(--wp-gold-dark));
  box-shadow: 0 4px 20px rgba(212, 168, 67, 0.3);
  animation: avatar-breathe 3s ease-in-out infinite;
  flex-shrink: 0;
}

.avatar-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  opacity: 0;
  transition: opacity 0.06s ease;
}

.avatar-frame.active {
  opacity: 1;
}

/* Speaking ring */
.speaking-ring {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  border: 2px solid var(--wp-gold);
  animation: pulse-ring 1.5s ease-out infinite;
  pointer-events: none;
  z-index: 2;
}

/* Sound waves */
.sound-waves {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 16px;
}

.wave-bar {
  width: 3px;
  height: 100%;
  background: var(--wp-gold);
  border-radius: 2px;
  animation: sound-wave 0.8s ease-in-out infinite;
  transform-origin: bottom;
}

/* State label */
.state-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: fadeIn 0.3s ease;
  white-space: nowrap;
}

/* ── Animations ────────────────────────────────────────────────── */

@keyframes avatar-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.12); opacity: 0; }
}

@keyframes sound-wave {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Speaking state boosts breathing */
.speaking .avatar-frame-wrapper {
  animation: avatar-breathe 1.5s ease-in-out infinite;
  box-shadow: 0 4px 30px rgba(212, 168, 67, 0.5);
}
</style>
