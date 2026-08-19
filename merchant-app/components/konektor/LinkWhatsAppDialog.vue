<!--
  LinkWhatsAppDialog — modal dialog for the WhatsApp link flow.

  Shows:
  - Countdown timer (from expires_at)
  - Progress bar
  - Link box with copy button
  - "Buka WhatsApp" button (opens wa_link)
  - Polling indicator while waiting for confirmation
-->
<template>
  <UiDialog v-model="open">
    <UiDialogContent class="max-w-md">
      <UiDialogHeader>
        <UiDialogTitle class="flex items-center gap-2">
          <Icon name="lucide:message-circle" class="w-5 h-5" :style="{ color: '#25D366' }" />
          Hubungkan WhatsApp
        </UiDialogTitle>
        <UiDialogDescription>
          Kirim pesan tautan ke bot Nahkoda di WhatsApp Anda.
        </UiDialogDescription>
      </UiDialogHeader>

      <div class="space-y-3 py-2">
        <!-- Countdown + progress -->
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Tautan kedaluwarsa dalam</span>
          <span
            class="font-mono font-bold"
            :class="timeLeft <= 60000 ? 'text-destructive' : 'text-card-foreground'"
          >
            {{ formattedTimeLeft }}
          </span>
        </div>
        <UiProgress :value="timeLeftPercent" />

        <!-- Link box -->
        <div class="rounded-lg border border-border bg-muted p-3 flex items-center gap-2">
          <code class="text-[11px] font-mono text-foreground break-all flex-1 leading-tight">
            {{ linkDialog.wa_link }}
          </code>
          <Button size="sm" variant="ghost" class="shrink-0" title="Salin link" @click="copyLink">
            <Icon name="lucide:copy" class="w-4 h-4" />
          </Button>
        </div>

        <p v-if="linkDialog.bot_number" class="text-[10px] text-muted-foreground">
          Nomor bot: <span class="font-mono">{{ linkDialog.bot_number }}</span>
        </p>

        <!-- Polling indicator -->
        <div
          v-if="linkDialog.polling"
          class="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5"
        >
          <Icon name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
          Menunggu konfirmasi dari WhatsApp…
        </div>
      </div>

      <UiDialogFooter class="gap-2">
        <Button variant="outline" :disabled="linkDialog.polling" @click="close">
          Tutup
        </Button>
        <Button class="bg-[#25D366] hover:bg-[#1DA851] text-white" @click="openWhatsApp">
          <Icon name="lucide:external-link" class="w-3.5 h-3.5" />
          Buka WhatsApp
        </Button>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Button from '~/components/ui/button.vue'
import UiDialog from '~/components/ui/dialog.vue'
import UiDialogContent from '~/components/ui/dialog-content.vue'
import UiDialogHeader from '~/components/ui/dialog-header.vue'
import UiDialogTitle from '~/components/ui/dialog-title.vue'
import UiDialogDescription from '~/components/ui/dialog-description.vue'
import UiDialogFooter from '~/components/ui/dialog-footer.vue'
import UiProgress from '~/components/ui/progress.vue'
import { useConnectors } from '~/composables/useConnectors'

const { linkDialog, stopPolling, toastSuccess } = useConnectors()

const open = computed({
  get: () => linkDialog.value.open,
  set: (v: boolean) => { if (!v) close() },
})

// Countdown clock
const now = ref(Date.now())
let clock: ReturnType<typeof setInterval> | null = null

const timeLeft = computed(() => {
  const expiresMs = new Date(linkDialog.value.expires_at).getTime()
  return Math.max(0, expiresMs - now.value)
})

const totalWindow = computed(() => {
  // Total TTL = expires_at - opened_at
  const expiresMs = new Date(linkDialog.value.expires_at).getTime()
  return Math.max(1, expiresMs - linkDialog.value.opened_at)
})

const timeLeftPercent = computed(() => (timeLeft.value / totalWindow.value) * 100)

const formattedTimeLeft = computed(() => {
  const totalSeconds = Math.floor(timeLeft.value / 1000)
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})

const openWhatsApp = () => {
  window.open(linkDialog.value.wa_link, '_blank', 'noopener')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(linkDialog.value.wa_link)
    toastSuccess('Link disalin!')
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = linkDialog.value.wa_link
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    toastSuccess('Link disalin!')
  }
}

const close = () => {
  stopPolling()
  linkDialog.value.open = false
}

onMounted(() => {
  clock = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
  if (clock) clearInterval(clock)
})
</script>
