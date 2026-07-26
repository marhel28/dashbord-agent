<template>
  <div class="cron-input-wrapper">
    <!-- Cron Expression Input -->
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <input
          v-model="cronValue"
          @input="onCronInput"
          type="text"
          placeholder="0 9 * * *"
          class="w-full px-3 py-2 border rounded-lg text-xs font-mono outline-none focus:border-[var(--wp-gold)] transition"
          :class="{ 'border-red-400': error }"
          style="border-color: var(--wp-border); color: var(--wp-text);"
        />
        <button
          type="button"
          @click="toggleAIParse"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold px-2 py-0.5 rounded transition"
          style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);"
          title="AI Parse dari bahasa alami"
        >
          ✨ AI
        </button>
      </div>
    </div>

    <!-- Human-readable preview -->
    <div v-if="cronDescription && !error" class="mt-1.5 flex items-center gap-1.5">
      <Icon name="heroicons:eye" class="w-3 h-3" style="color: var(--wp-text-secondary);" />
      <span class="text-[10px] font-medium" style="color: var(--wp-text-secondary);">
        {{ cronDescription }}
      </span>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-1 text-[10px] font-medium text-red-500">
      {{ error }}
    </div>

    <!-- Format guide -->
    <div class="mt-2 p-2 rounded border" style="background: var(--wp-bg); border-color: var(--wp-border);">
      <p class="text-[9px] font-bold uppercase tracking-wider mb-1" style="color: var(--wp-text-secondary);">
        Format: menit jam tgl bulan hari (WIB)
      </p>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="preset in presets"
          :key="preset.cron"
          @click="applyPreset(preset.cron)"
          class="text-[9px] font-bold px-2 py-0.5 rounded transition hover:opacity-80"
          style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);"
          :title="preset.cron"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <!-- AI Parse Panel -->
    <div v-if="showAIParse" class="mt-3 p-3 rounded-lg border space-y-2" style="border-color: var(--wp-border); background: var(--wp-bg);">
      <div class="flex items-center gap-2">
        <Icon name="heroicons:sparkles" class="w-4 h-4" style="color: var(--wp-gold);" />
        <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">
          AI Natural Language
        </span>
      </div>
      <textarea
        v-model="aiInput"
        rows="2"
        placeholder="Contoh: setiap jam 9 pagi, setiap senin jam 8, tiap 2 jam sekali..."
        class="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:border-[var(--wp-gold)] resize-none"
        style="border-color: var(--wp-border); color: var(--wp-text); background: white;"
      ></textarea>
      <div class="flex items-center gap-2">
        <button
          @click="runAIParse"
          :disabled="!aiInput.trim() || aiParsing"
          class="px-3 py-1.5 text-[10px] font-bold rounded transition disabled:opacity-50"
          style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;"
        >
          <Icon v-if="aiParsing" name="heroicons:arrow-path" class="w-3 h-3 animate-spin inline" />
          {{ aiParsing ? 'Memparsing...' : 'Parse' }}
        </button>
        <button
          @click="showAIParse = false"
          class="px-3 py-1.5 text-[10px] font-bold rounded transition"
          style="color: var(--wp-text-secondary);"
        >
          Batal
        </button>
      </div>
      <!-- AI Result -->
      <div v-if="aiResult" class="p-2 rounded border space-y-1" style="border-color: var(--wp-gold); background: rgba(212,168,67,0.05);">
        <p class="text-[10px] font-bold" style="color: var(--wp-navy);">📌 {{ aiResult.message }}</p>
        <p class="text-[10px] font-mono" style="color: var(--wp-text-secondary);">Cron: {{ aiResult.cron }}</p>
        <p class="text-[10px]" style="color: var(--wp-text-secondary);">{{ aiResult.cron_description }}</p>
        <button
          @click="applyAIResult"
          class="text-[10px] font-bold px-2 py-0.5 rounded"
          style="background: var(--wp-gold); color: white;"
        >
          Gunakan Ini
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAutomation } from '~/composables/useAutomation'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { parseNaturalLanguage } = useAutomation()

const cronValue = ref(props.modelValue || '')
const cronDescription = ref('')
const error = ref('')
const showAIParse = ref(false)
const aiInput = ref('')
const aiParsing = ref(false)
const aiResult = ref<{ cron: string; message: string; once: boolean; cron_description: string } | null>(null)

const presets = [
  { label: 'Setiap Jam', cron: '0 * * * *' },
  { label: 'Jam 9 Pagi', cron: '0 9 * * *' },
  { label: 'Jam 12 Siang', cron: '0 12 * * *' },
  { label: 'Jam 6 Sore', cron: '0 18 * * *' },
  { label: 'Hari Senin', cron: '0 8 * * 1' },
  { label: 'Tanggal 1', cron: '0 8 1 * *' },
  { label: 'Tiap 2 Jam', cron: '0 */2 * * *' },
  { label: 'Setiap Menit', cron: '* * * * *' },
]

// Simple cron description (client-side fallback)
function describeCronLocal(cron: string): string {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return ''
  const [menit, jam, hari, bulan, dow] = parts

  if (menit === '*' && jam === '*') return 'Setiap menit'
  if (menit === '0' && jam === '*') return 'Setiap jam'
  if (menit !== '*' && jam === '*') return `Menit ke-${menit} tiap jam`

  let time = 'Setiap menit'
  if (menit === '0' && jam !== '*') {
    time = `Setiap jam ${jam}:00 WIB`
  } else if (menit !== '0' && jam !== '*') {
    time = `Setiap hari jam ${jam}:${menit.padStart(2, '0')} WIB`
  }

  const dayNames: Record<string, string> = { '0': 'Minggu', '1': 'Senin', '2': 'Selasa', '3': 'Rabu', '4': 'Kamis', '5': 'Jumat', '6': 'Sabtu', '7': 'Minggu' }
  const monthNames: Record<string, string> = { '1': 'Januari', '2': 'Februari', '3': 'Maret', '4': 'April', '5': 'Mei', '6': 'Juni', '7': 'Juli', '8': 'Agustus', '9': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember' }

  let suffix = ''
  if (dow !== '*') suffix += ` pada hari ${dayNames[dow] || dow}`
  if (hari !== '*') suffix += ` pada tanggal ${hari}`
  if (bulan !== '*') suffix += ` di bulan ${monthNames[bulan] || bulan}`

  return (time + suffix).trim()
}

function validateCron(cron: string): boolean {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) {
    error.value = 'Cron harus 5 field (menit jam tgl bulan hari)'
    return false
  }
  error.value = ''
  return true
}

function onCronInput() {
  if (validateCron(cronValue.value)) {
    cronDescription.value = describeCronLocal(cronValue.value)
    emit('update:modelValue', cronValue.value)
  }
}

function applyPreset(cron: string) {
  cronValue.value = cron
  cronDescription.value = describeCronLocal(cron)
  error.value = ''
  emit('update:modelValue', cron)
}

function toggleAIParse() {
  showAIParse.value = !showAIParse.value
  aiResult.value = null
}

async function runAIParse() {
  if (!aiInput.value.trim()) return
  aiParsing.value = true
  aiResult.value = null
  try {
    const result = await parseNaturalLanguage(aiInput.value)
    if (result) {
      aiResult.value = result
    } else {
      error.value = 'AI tidak dapat memparsing sebagai pengingat'
    }
  } catch (err: any) {
    error.value = 'Gagal parsing: ' + (err.message || 'Unknown error')
  } finally {
    aiParsing.value = false
  }
}

function applyAIResult() {
  if (aiResult.value) {
    cronValue.value = aiResult.value.cron
    cronDescription.value = aiResult.value.cron_description
    error.value = ''
    emit('update:modelValue', cronValue.value)
    showAIParse.value = false
  }
}

// Sync with v-model
watch(() => props.modelValue, (val) => {
  if (val && val !== cronValue.value) {
    cronValue.value = val
    cronDescription.value = describeCronLocal(val)
  }
})
</script>
