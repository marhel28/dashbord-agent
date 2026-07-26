<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-navy);">Otomatisasi</h1>
        <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">
          Kelola workflow otomatis, pengingat terjadwal, dan cron job — ala Hermes.
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b" style="border-color: var(--wp-border);">
      <nav class="flex gap-0 -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-5 py-3 text-xs font-bold transition border-b-2"
          :class="activeTab === tab.id
            ? 'border-[var(--wp-gold)]'
            : 'border-transparent hover:border-[var(--wp-border)]'"
          :style="activeTab === tab.id ? 'color: var(--wp-navy);' : 'color: var(--wp-text-secondary);'"
        >
          <Icon :name="tab.icon" class="w-4 h-4 inline mr-1.5 align-text-bottom" />
          {{ tab.label }}
          <span v-if="tab.badge" class="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style="background: rgba(212,168,67,0.15); color: var(--wp-gold-dark);">
            {{ tab.badge }}
          </span>
        </button>
      </nav>
    </div>

    <!-- ═══════════ TAB 1: Workflow Designer ═══════════ -->
    <div v-show="activeTab === 'designer'" class="animate-fade-in">
      <!-- Workflow Meta Bar -->
      <div class="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white border rounded-xl p-4 shadow-sm" style="border-color: var(--wp-border);">
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <div>
            <label class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Nama Workflow</label>
            <input v-model="workflowMeta.name" type="text" placeholder="Cek Stok Harian" class="w-full mt-1 px-3 py-1.5 border rounded text-xs outline-none focus:border-[var(--wp-gold)]" style="border-color: var(--wp-border); color: var(--wp-text);" />
          </div>
          <div>
            <label class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Deskripsi</label>
            <input v-model="workflowMeta.description" type="text" placeholder="Kirim laporan stok tiap pagi" class="w-full mt-1 px-3 py-1.5 border rounded text-xs outline-none focus:border-[var(--wp-gold)]" style="border-color: var(--wp-border); color: var(--wp-text);" />
          </div>
          <div>
            <label class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Status</label>
            <select v-model="workflowMeta.status" class="w-full mt-1 px-3 py-1.5 border rounded text-xs outline-none bg-white focus:border-[var(--wp-gold)]" style="border-color: var(--wp-border); color: var(--wp-text);">
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Designer -->
      <WorkflowDesigner
        ref="designerRef"
        @save="onSaveWorkflow"
        @run="onRunWorkflow"
        @clear="onClearDesigner"
      />
    </div>

    <!-- ═══════════ TAB 2: My Reminders ═══════════ -->
    <div v-show="activeTab === 'reminders'" class="animate-fade-in">
      <div class="flex items-center justify-between mb-4">
        <p class="text-xs font-medium" style="color: var(--wp-text-secondary);">
          {{ reminders.length }} pengingat aktif
        </p>
        <button @click="showReminderModal = true" class="px-4 py-2 text-xs font-bold rounded-lg text-white transition flex items-center gap-2" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          <Icon name="heroicons:plus" class="w-4 h-4" />
          Buat Pengingat
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-8 h-8 rounded-full border-4 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
      </div>

      <!-- Reminder List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="reminders.length === 0" class="col-span-full flex flex-col items-center justify-center py-16">
          <Icon name="heroicons:bell-slash" class="w-12 h-12 mb-3" style="color: var(--wp-border);" />
          <p class="text-sm font-bold" style="color: var(--wp-text-secondary);">Belum ada pengingat</p>
          <p class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">Buat pengingat pertama Anda untuk memulai otomatisasi.</p>
          <button @click="showReminderModal = true" class="mt-4 px-4 py-2 text-xs font-bold rounded-lg text-white" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
            Buat Pengingat
          </button>
        </div>

        <div
          v-for="r in reminders"
          :key="r.reminder_id || r.key"
          class="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition relative group"
          style="border-color: var(--wp-border);"
        >
          <div class="absolute top-0 left-4 right-4 h-0.5 rounded-b" style="background: linear-gradient(90deg, var(--wp-gold), var(--wp-gold-dark));"></div>
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold truncate" style="color: var(--wp-text);">{{ r.message }}</p>
              <p class="text-[10px] font-medium mt-1" style="color: var(--wp-text-secondary);">
                {{ r.cron_description || r.cron }}
              </p>
            </div>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2" :class="r.once ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
              {{ r.once ? 'Sekali' : 'Berulang' }}
            </span>
          </div>
          <div class="flex items-center gap-2 mb-3">
            <code class="text-[10px] font-mono px-2 py-0.5 rounded" style="background: var(--wp-bg); color: var(--wp-text-secondary);">
              {{ r.cron }}
            </code>
            <span v-if="r.source === 'workflow'" class="text-[9px] font-bold px-2 py-0.5 rounded" style="background: rgba(59,130,246,0.1); color: #3B82F6;">
              Workflow
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="onTriggerReminder(r.reminder_id || '')"
              :disabled="isReminderTriggering(r.reminder_id || '') || !r.reminder_id"
              class="flex-1 py-2 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-50"
              style="background: rgba(16,185,129,0.1); color: #059669;"
            >
              <Icon v-if="isReminderTriggering(r.reminder_id || '')" name="heroicons:arrow-path" class="w-3 h-3 animate-spin" />
              <Icon v-else name="heroicons:play" class="w-3 h-3" />
              {{ isReminderTriggering(r.reminder_id || '') ? 'Jalankan...' : 'Run Now' }}
            </button>
            <button
              @click="onDeleteReminder(r.reminder_id || '')"
              :disabled="!r.reminder_id"
              class="py-2 px-3 text-[10px] font-bold rounded-lg transition disabled:opacity-50"
              style="background: #FEF2F2; color: #DC2626;"
            >
              <Icon name="heroicons:trash" class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ TAB 3: System Jobs ═══════════ -->
    <div v-show="activeTab === 'system'" class="animate-fade-in">
      <p class="text-xs font-medium mb-4" style="color: var(--wp-text-secondary);">
        Cron job sistem yang berjalan otomatis di background.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="job in systemJobs"
          :key="job.task"
          class="bg-white border rounded-xl p-5 shadow-sm"
          style="border-color: var(--wp-border);"
        >
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: rgba(212,168,67,0.1);">
              <Icon name="heroicons:cog-6-tooth" class="w-4 h-4" style="color: var(--wp-gold-dark);" />
            </div>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Aktif</span>
          </div>
          <h3 class="text-sm font-bold mb-1" style="color: var(--wp-text);">{{ job.task }}</h3>
          <p class="text-[10px] font-medium mb-2" style="color: var(--wp-text-secondary);">{{ job.description }}</p>
          <p class="text-[10px] font-bold" style="color: var(--wp-gold-dark);">
            ⏰ Tiap {{ job.schedule_human }}
          </p>
        </div>
      </div>
    </div>

    <!-- ═══════════ Create Reminder Modal ═══════════ -->
    <div v-if="showReminderModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in-up">
        <div class="px-5 py-4 border-b flex justify-between items-center" style="border-color: var(--wp-border);">
          <h3 class="font-bold text-sm" style="color: var(--wp-navy);">Buat Pengingat Baru</h3>
          <button @click="showReminderModal = false" class="text-slate-400 hover:text-slate-600">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="onCreateReminder" class="p-5 space-y-4">
          <div>
            <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Pesan Pengingat</label>
            <textarea v-model="reminderForm.message" rows="2" required placeholder="Cek stok barang toko saya" class="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:border-[var(--wp-gold)] resize-none" style="border-color: var(--wp-border); color: var(--wp-text);"></textarea>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Jadwal (Cron)</label>
            <CronInput v-model="reminderForm.cron" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="reminderForm.once" type="checkbox" id="once-toggle" class="rounded" />
            <label for="once-toggle" class="text-[10px] font-medium" style="color: var(--wp-text-secondary);">Sekali jalan (auto-hapus setelah trigger)</label>
          </div>
          <div class="pt-2 flex gap-2">
            <button type="submit" :disabled="!reminderForm.message || !reminderForm.cron || creatingReminder" class="flex-1 py-2.5 rounded-lg text-xs font-bold text-white transition disabled:opacity-50" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
              {{ creatingReminder ? 'Menyimpan...' : 'Simpan Pengingat' }}
            </button>
            <button type="button" @click="showReminderModal = false" class="px-4 py-2.5 rounded-lg text-xs font-bold transition" style="color: var(--wp-text-secondary); border: 1px solid var(--wp-border);">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════ Run Result Modal ═══════════ -->
    <div v-if="runResult" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in-up">
        <div class="px-5 py-4 border-b flex justify-between items-center" style="border-color: var(--wp-border);">
          <h3 class="font-bold text-sm" style="color: var(--wp-navy);">Hasil Eksekusi</h3>
          <button @click="runResult = null" class="text-slate-400 hover:text-slate-600">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <div class="p-5 space-y-3 max-h-80 overflow-y-auto">
          <div v-for="(res, i) in runResult.results" :key="i" class="p-3 rounded-lg border" style="border-color: var(--wp-border); background: var(--wp-bg);">
            <p class="text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">{{ res.subtype }}</p>
            <p class="text-xs whitespace-pre-wrap" style="color: var(--wp-text);">{{ res.result }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ Toast ═══════════ -->
    <div class="fixed top-4 right-4 z-[1000] flex flex-col gap-2">
      <div v-for="toast in toasts" :key="toast.id" class="bg-white border-l-4 shadow-lg rounded p-4 pr-10 relative min-w-[300px] animate-fade-in-up" :style="`border-left-color: ${toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : 'var(--wp-gold)'};`">
        <button @click="dismissToast(toast.id)" class="absolute top-2 right-2 text-slate-400 hover:text-slate-600">
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
        <h4 class="text-sm font-bold" style="color: var(--wp-text);">{{ toast.title }}</h4>
        <p class="text-xs mt-1" style="color: var(--wp-text-secondary);">{{ toast.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import WorkflowDesigner from '~/components/automation/WorkflowDesigner.vue'
import CronInput from '~/components/automation/CronInput.vue'
import { useAutomation } from '~/composables/useAutomation'

const {
  workflows, reminders, systemJobs, loading,
  fetchWorkflows, fetchWorkflowDetail, createWorkflow, updateWorkflow, deleteWorkflow, runWorkflow, isWorkflowRunning,
  fetchReminders, createReminder, deleteReminder, triggerReminder, isReminderTriggering,
  fetchSystemJobs,
} = useAutomation()

const designerRef = ref<InstanceType<typeof WorkflowDesigner> | null>(null)
const activeTab = ref<'designer' | 'reminders' | 'system'>('designer')
const showReminderModal = ref(false)
const creatingReminder = ref(false)
const runResult = ref<any>(null)

const workflowMeta = reactive({
  name: '',
  description: '',
  status: 'draft',
})

const reminderForm = reactive({
  message: '',
  cron: '0 9 * * *',
  once: false,
})

const toasts = ref<Array<{ id: string; title: string; message: string; type: string }>>([])

const tabs = computed(() => [
  { id: 'designer' as const, label: 'Workflow Designer', icon: 'heroicons:squares-plus' },
  { id: 'reminders' as const, label: 'Pengingat Saya', icon: 'heroicons:bell', badge: reminders.value.length || undefined },
  { id: 'system' as const, label: 'Cron Job Sistem', icon: 'heroicons:cog-6-tooth', badge: systemJobs.value.length || undefined },
])

// ── Toast ──
function showToast(title: string, message: string, type: string = 'success') {
  const id = Math.random().toString(36).substring(7)
  toasts.value.push({ id, title, message, type })
  setTimeout(() => dismissToast(id), 5000)
}
function dismissToast(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// ── Workflow Handlers ──
async function onSaveWorkflow(wf: any) {
  try {
    // Sync meta from form
    wf.name = workflowMeta.name || wf.name
    wf.description = workflowMeta.description || wf.description
    wf.status = workflowMeta.status

    if (wf.id) {
      await updateWorkflow(wf.id, wf)
      showToast('Workflow Diperbarui', `Workflow "${wf.name}" berhasil disimpan`)
    } else {
      const result = await createWorkflow(wf)
      workflowMeta.name = ''
      workflowMeta.description = ''
      showToast('Workflow Dibuat', `Workflow "${wf.name}" berhasil dibuat`)
    }
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal menyimpan workflow', 'error')
  }
}

async function onRunWorkflow(wf: any) {
  try {
    if (!wf.id) {
      showToast('Simpan Dulu', 'Simpan workflow sebelum menjalankan', 'warning')
      return
    }
    const result = await runWorkflow(wf.id)
    runResult.value = result
    showToast('Workflow Dijalankan', result.message)
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal menjalankan workflow', 'error')
  }
}

function onClearDesigner() {
  workflowMeta.name = ''
  workflowMeta.description = ''
  workflowMeta.status = 'draft'
}

// ── Reminder Handlers ──
async function onCreateReminder() {
  creatingReminder.value = true
  try {
    await createReminder({
      message: reminderForm.message,
      cron: reminderForm.cron,
      once: reminderForm.once,
    })
    showToast('Pengingat Dibuat', `"${reminderForm.message}" berhasil dijadwalkan`)
    showReminderModal.value = false
    reminderForm.message = ''
    reminderForm.cron = '0 9 * * *'
    reminderForm.once = false
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal membuat pengingat', 'error')
  } finally {
    creatingReminder.value = false
  }
}

async function onTriggerReminder(reminderId: string) {
  try {
    const result = await triggerReminder(reminderId)
    showToast('Pengingat Dipanggil', 'Laporan terbaru telah dikirim ke Telegram Anda')
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal memanggil pengingat', 'error')
  }
}

async function onDeleteReminder(reminderId: string) {
  if (!confirm('Hapus pengingat ini?')) return
  try {
    await deleteReminder(reminderId)
    showToast('Dihapus', 'Pengingat berhasil dihapus')
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal menghapus pengingat', 'error')
  }
}

// ── Init ──
onMounted(async () => {
  try {
    await Promise.all([fetchReminders(), fetchSystemJobs()])
  } catch (err) {
    console.error('Failed to load automation data:', err)
  }
})
</script>
