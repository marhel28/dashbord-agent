<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-navy);">Otomatisasi</h1>
      <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">
        Atur pengingat otomatis &mdash; pakai AI atau atur manual, sesuka Anda.
      </p>
    </div>

    <!-- Tabs: 2 saja -->
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

    <!-- ═══════════ TAB 1: Pengingat ═══════════ -->
    <div v-show="activeTab === 'reminders'" class="animate-fade-in">
      <!-- Quick Add Chips -->
      <div class="mb-4">
        <p class="text-[10px] font-bold uppercase tracking-wider mb-2" style="color: var(--wp-text-secondary);">Buat Cepat</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tpl in quickTemplates"
            :key="tpl.label"
            @click="onQuickAdd(tpl)"
            class="px-3 py-1.5 text-[10px] font-bold rounded-full border transition hover:border-[var(--wp-gold)]"
            style="border-color: var(--wp-border); color: var(--wp-text);"
          >
            {{ tpl.icon }} {{ tpl.label }}
          </button>
        </div>
      </div>

      <!-- Add Button -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-xs font-medium" style="color: var(--wp-text-secondary);">
          {{ reminders.length }} pengingat aktif
        </p>
        <button @click="openCreateModal()" class="px-4 py-2 text-xs font-bold rounded-lg text-white transition flex items-center gap-2" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          <Icon name="heroicons:plus" class="w-4 h-4" />
          Buat Pengingat
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-8 h-8 rounded-full border-4 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="reminders.length === 0" class="flex flex-col items-center justify-center py-16">
        <Icon name="heroicons:bell-slash" class="w-12 h-12 mb-3" style="color: var(--wp-border);" />
        <p class="text-sm font-bold" style="color: var(--wp-text-secondary);">Belum ada pengingat</p>
        <p class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">Buat pengingat pertama &mdash; pakai AI atau pilih template.</p>
        <button @click="openCreateModal()" class="mt-4 px-4 py-2 text-xs font-bold rounded-lg text-white" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          Buat Pengingat
        </button>
      </div>

      <!-- Reminder Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="r in reminders"
          :key="r.reminder_id"
          class="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition relative group"
          style="border-color: var(--wp-border);"
        >
          <div class="absolute top-0 left-4 right-4 h-0.5 rounded-b" style="background: linear-gradient(90deg, var(--wp-gold), var(--wp-gold-dark));"></div>
          <!-- Message -->
          <p class="text-sm font-bold mb-2 pr-6" style="color: var(--wp-text);">{{ r.message || '(tanpa pesan)' }}</p>
          <!-- Schedule -->
          <div class="flex items-center gap-2 mb-3">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              {{ r.cron_description || r.cron }}
            </span>
            <span v-if="r.once" class="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">Sekali</span>
          </div>
          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="onTriggerReminder(r.reminder_id)"
              :disabled="isReminderTriggering(r.reminder_id) || !r.reminder_id"
              class="flex-1 py-2 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-50"
              style="background: rgba(16,185,129,0.1); color: #059669;"
            >
              <Icon v-if="isReminderTriggering(r.reminder_id)" name="heroicons:arrow-path" class="w-3 h-3 animate-spin" />
              <Icon v-else name="heroicons:play" class="w-3 h-3" />
              {{ isReminderTriggering(r.reminder_id) ? 'Jalankan...' : 'Run Now' }}
            </button>
            <button
              @click="openEditModal(r)"
              class="py-2 px-3 text-[10px] font-bold rounded-lg transition"
              style="background: var(--wp-bg); color: var(--wp-text-secondary);"
            >
              <Icon name="heroicons:pencil" class="w-3 h-3" />
            </button>
            <button
              @click="onDeleteReminder(r.reminder_id)"
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

    <!-- ═══════════ TAB 2: Cron Job Sistem ═══════════ -->
    <div v-show="activeTab === 'system'" class="animate-fade-in">
      <p class="text-xs font-medium mb-4" style="color: var(--wp-text-secondary);">
        Job sistem yang berjalan otomatis di background.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p class="text-[10px] font-medium mb-3" style="color: var(--wp-text-secondary);">{{ job.description }}</p>
          <p class="text-[10px] font-bold" style="color: var(--wp-gold-dark);">
            ⏰ Tiap {{ job.schedule_human }}
          </p>
        </div>
      </div>
    </div>

    <!-- ═══════════ Create/Edit Reminder Modal ═══════════ -->
    <div v-if="showReminderModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in-up">
        <div class="px-5 py-4 border-b flex justify-between items-center" style="border-color: var(--wp-border);">
          <h3 class="font-bold text-sm" style="color: var(--wp-navy);">{{ editingReminder ? 'Edit Pengingat' : 'Buat Pengingat Baru' }}</h3>
          <button @click="closeReminderModal()" class="text-slate-400 hover:text-slate-600">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="onSubmitReminder" class="p-5 space-y-4">
          <!-- Mode Toggle -->
          <div class="flex gap-2 mb-2">
            <button type="button" @click="formMode = 'llm'" class="flex-1 py-2 text-[10px] font-bold rounded-lg transition" :style="formMode === 'llm' ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;' : 'background: var(--wp-bg); color: var(--wp-text-secondary);'">
              🤖 Pakai AI
            </button>
            <button type="button" @click="formMode = 'manual'" class="flex-1 py-2 text-[10px] font-bold rounded-lg transition" :style="formMode === 'manual' ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;' : 'background: var(--wp-bg); color: var(--wp-text-secondary);'">
              ✏️ Atur Manual
            </button>
          </div>

          <!-- LLM Mode -->
          <div v-if="formMode === 'llm'">
            <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Katakan apa yang Anda inginkan</label>
            <textarea v-model="reminderForm.message" rows="3" required placeholder="contoh: ingatkan saya cek stok tiap jam 8 malam" class="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:border-[var(--wp-gold)] resize-none" style="border-color: var(--wp-border); color: var(--wp-text);"></textarea>
            <!-- Preview -->
            <div v-if="parsedPreview" class="mt-3 p-3 rounded-lg border" style="border-color: var(--wp-border); background: var(--wp-bg);">
              <p class="text-[9px] font-bold uppercase mb-1" style="color: var(--wp-text-preview);">Preview</p>
              <p class="text-xs font-bold" style="color: var(--wp-text);">{{ parsedPreview.message }}</p>
              <p class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">{{ parsedPreview.cron_description }}</p>
            </div>
            <button type="button" @click="onParsePreview()" :disabled="!reminderForm.message || parsing" class="mt-2 px-3 py-1.5 text-[10px] font-bold rounded-lg transition disabled:opacity-50" style="background: var(--wp-bg); color: var(--wp-text-secondary);">
              {{ parsing ? 'Memparse...' : '🔍 Preview' }}
            </button>
          </div>

          <!-- Manual Mode -->
          <div v-if="formMode === 'manual'">
            <div>
              <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Pesan Pengingat</label>
              <textarea v-model="reminderForm.message" rows="2" required placeholder="Cek stok barang toko saya" class="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:border-[var(--wp-gold)] resize-none" style="border-color: var(--wp-border); color: var(--wp-text);"></textarea>
            </div>
            <div class="mt-3">
              <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Template Jadwal</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="t in scheduleTemplates"
                  :key="t.cron"
                  type="button"
                  @click="reminderForm.cron = t.cron"
                  class="px-2.5 py-1 text-[9px] font-bold rounded-full border transition"
                  :style="reminderForm.cron === t.cron ? 'border-color: var(--wp-gold); background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);' : 'border-color: var(--wp-border); color: var(--wp-text-secondary);'"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>
            <div class="mt-3">
              <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Atau Cron Manual</label>
              <input v-model="reminderForm.cron" type="text" placeholder="0 20 * * *" class="w-full px-3 py-1.5 border rounded text-xs outline-none focus:border-[var(--wp-gold)] font-mono" style="border-color: var(--wp-border); color: var(--wp-text);" />
            </div>
            <div class="flex items-center gap-2 mt-3">
              <input v-model="reminderForm.once" type="checkbox" id="once-toggle" class="rounded" />
              <label for="once-toggle" class="text-[10px] font-medium" style="color: var(--wp-text-secondary);">Sekali jalan (auto-hapus setelah trigger)</label>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-2 flex gap-2">
            <button type="submit" :disabled="!reminderForm.message || creatingReminder" class="flex-1 py-2.5 rounded-lg text-xs font-bold text-white transition disabled:opacity-50" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
              {{ creatingReminder ? 'Menyimpan...' : (editingReminder ? 'Simpan Perubahan' : 'Simpan Pengingat') }}
            </button>
            <button type="button" @click="closeReminderModal()" class="px-4 py-2.5 rounded-lg text-xs font-bold transition" style="color: var(--wp-text-secondary); border: 1px solid var(--wp-border);">
              Batal
            </button>
          </div>
        </form>
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
import { useAutomation } from '~/composables/useAutomation'

const {
  reminders, systemJobs, loading,
  fetchReminders, createReminder, updateReminder, deleteReminder, triggerReminder, isReminderTriggering, parseNaturalLanguage,
  fetchSystemJobs,
} = useAutomation()

const activeTab = ref<'reminders' | 'system'>('reminders')
const showReminderModal = ref(false)
const creatingReminder = ref(false)
const editingReminder = ref<any>(null)
const formMode = ref<'llm' | 'manual'>('llm')
const parsing = ref(false)
const parsedPreview = ref<any>(null)

const reminderForm = reactive({
  message: '',
  cron: '',
  once: false,
})

const toasts = ref<Array<{ id: string; title: string; message: string; type: string }>>([])

const tabs = computed(() => [
  { id: 'reminders' as const, label: 'Pengingat Saya', icon: 'heroicons:bell', badge: reminders.value.length || undefined },
  { id: 'system' as const, label: 'Cron Job Sistem', icon: 'heroicons:cog-6-tooth', badge: systemJobs.value.length || undefined },
])

// Quick add templates
const quickTemplates = [
  { icon: '🌅', label: 'Pagi jam 8', message: 'ingatkan saya cek stok setiap pagi jam 8' },
  { icon: '🌙', label: 'Malam jam 8', message: 'ingatkan saya cek stok setiap malam jam 8' },
  { icon: '📊', label: 'Laporan mingguan', message: 'ingatkan saya laporan penjualan setiap minggu' },
  { icon: '⚠️', label: 'Alert stok rendah', message: 'ingatkan saya cek stok yang menipis setiap hari' },
]

// Schedule templates for manual mode
const scheduleTemplates = [
  { label: 'Tiap pagi jam 8', cron: '0 8 * * *' },
  { label: 'Tiap malam jam 8', cron: '0 20 * * *' },
  { label: 'Tiap Senin jam 8', cron: '0 8 * * 1' },
  { label: 'Tiap hari tengah malam', cron: '0 0 * * *' },
  { label: 'Tiap jam', cron: '0 * * * *' },
]

// ── Toast ──
function showToast(title: string, message: string, type: string = 'success') {
  const id = Math.random().toString(36).substring(7)
  toasts.value.push({ id, title, message, type })
  setTimeout(() => dismissToast(id), 5000)
}
function dismissToast(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// ── Modal ──
function openCreateModal() {
  editingReminder.value = null
  reminderForm.message = ''
  reminderForm.cron = ''
  reminderForm.once = false
  formMode.value = 'llm'
  parsedPreview.value = null
  showReminderModal.value = true
}

function openEditModal(r: any) {
  editingReminder.value = r
  reminderForm.message = r.message || ''
  reminderForm.cron = r.cron || ''
  reminderForm.once = r.once || false
  formMode.value = 'manual'
  parsedPreview.value = null
  showReminderModal.value = true
}

function closeReminderModal() {
  showReminderModal.value = false
  editingReminder.value = null
  parsedPreview.value = null
}

// ── Quick Add ──
async function onQuickAdd(tpl: { message: string }) {
  creatingReminder.value = true
  try {
    await createReminder({ message: tpl.message })
    showToast('Pengingat Dibuat', 'Pengingat berhasil dibuat via AI')
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal membuat pengingat', 'error')
  } finally {
    creatingReminder.value = false
  }
}

// ── Parse Preview ──
async function onParsePreview() {
  if (!reminderForm.message) return
  parsing.value = true
  try {
    const result = await parseNaturalLanguage(reminderForm.message)
    parsedPreview.value = result
    if (result) {
      reminderForm.cron = result.cron
      reminderForm.once = result.once
    }
  } catch (err: any) {
    showToast('Gagal', 'Tidak bisa memparse pesan. Coba manual.', 'error')
  } finally {
    parsing.value = false
  }
}

// ── Create / Update Reminder ──
async function onSubmitReminder() {
  creatingReminder.value = true
  try {
    if (editingReminder.value) {
      await updateReminder(editingReminder.value.reminder_id, {
        message: reminderForm.message,
        cron: reminderForm.cron,
        once: reminderForm.once,
      })
      showToast('Tersimpan', 'Pengingat berhasil diperbarui')
    } else {
      await createReminder({
        message: reminderForm.message,
        cron: reminderForm.cron,
        once: reminderForm.once,
      })
      showToast('Pengingat Dibuat', `"${reminderForm.message}" berhasil dijadwalkan`)
    }
    closeReminderModal()
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal menyimpan pengingat', 'error')
  } finally {
    creatingReminder.value = false
  }
}

// ── Trigger / Delete ──
async function onTriggerReminder(reminderId: string) {
  try {
    await triggerReminder(reminderId)
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
