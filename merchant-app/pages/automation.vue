<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ═══ HEADER ═══ -->
    <div class="flex items-center justify-between border-b pb-5" style="border-color: var(--wp-border);">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          <Icon name="heroicons:bolt" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Otomatisasi</h1>
          <p class="text-xs font-medium mt-0.5" style="color: var(--wp-text-secondary);">
            Atur pengingat otomatis &mdash; pakai AI atau atur manual
          </p>
        </div>
      </div>
    </div>

    <!-- ═══ TABS ═══ -->
    <div class="border-b" style="border-color: var(--wp-border);">
      <nav class="flex gap-0 -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold transition border-b-2"
          :class="activeTab === tab.id ? 'border-[var(--wp-gold)]' : 'border-transparent hover:border-[var(--wp-border)]'"
          :style="activeTab === tab.id ? 'color: var(--wp-navy);' : 'color: var(--wp-text-secondary);'"
        >
          <Icon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <span v-if="tab.badge"
                class="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style="background: rgba(212,168,67,0.15); color: var(--wp-gold-dark);">
            {{ tab.badge }}
          </span>
        </button>
      </nav>
    </div>

    <!-- ═══════════ TAB 1: Pengingat ═══════════ -->
    <div v-show="activeTab === 'reminders'" class="animate-fade-in space-y-5">

      <!-- Quick Add Strip -->
      <div class="bg-white border rounded-xl p-5 shadow-sm" style="border-color: var(--wp-border);">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="heroicons:rocket-launch" class="w-4 h-4" style="color: var(--wp-gold);" />
          <p class="text-xs font-black uppercase tracking-wider" style="color: var(--wp-navy);">Buat Cepat</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tpl in quickTemplates"
            :key="tpl.label"
            @click="onQuickAdd(tpl)"
            :disabled="creatingReminder"
            class="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-bold rounded-lg border transition hover:shadow-sm disabled:opacity-50 active:scale-95"
            style="border-color: var(--wp-border); color: var(--wp-text); background: var(--wp-bg);"
          >
            <Icon :name="tpl.icon" class="w-4 h-4" style="color: var(--wp-gold);" />
            {{ tpl.label }}
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium" style="color: var(--wp-text-secondary);">
          <span class="font-bold" style="color: var(--wp-text);">{{ reminders.length }}</span> pengingat aktif
        </p>
        <button @click="openCreateModal()"
                class="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-bold rounded-lg text-white transition hover:shadow-md"
                style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          <Icon name="heroicons:plus" class="w-4 h-4" />
          Buat Pengingat
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
               style="background: rgba(212,168,67,0.08);">
            <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin" style="color: var(--wp-gold);" />
          </div>
          <p class="text-xs font-semibold" style="color: var(--wp-text-secondary);">Memuat pengingat...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="reminders.length === 0"
           class="bg-white border rounded-xl p-12 shadow-sm text-center"
           style="border-color: var(--wp-border);">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
             style="background: rgba(212,168,67,0.08);">
          <Icon name="heroicons:bell-slash" class="w-8 h-8" style="color: var(--wp-gold);" />
        </div>
        <p class="text-sm font-bold mb-1" style="color: var(--wp-text);">Belum ada pengingat</p>
        <p class="text-xs mb-5" style="color: var(--wp-text-secondary);">Buat pengingat pertama — pakai AI atau pilih template di atas.</p>
        <button @click="openCreateModal()"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg text-white transition hover:shadow-md"
                style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          <Icon name="heroicons:plus" class="w-4 h-4" />
          Buat Pengingat
        </button>
      </div>

      <!-- Reminder Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        <div
          v-for="r in reminders"
          :key="r.reminder_id"
          class="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
          style="border-color: var(--wp-border);"
        >
          <!-- icon + schedule badges -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style="background: rgba(5,150,105,0.1); color: #047857;">
                <Icon name="heroicons:clock" class="w-3 h-3" />
                {{ r.cron_description || r.cron }}
              </span>
              <span v-if="r.once"
                    class="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style="background: rgba(217,119,6,0.1); color: #B45309;">
                <Icon name="heroicons:arrow-right-circle" class="w-2.5 h-2.5" />
                Sekali
              </span>
            </div>
            <!-- action group -->
            <div class="flex items-center gap-1 shrink-0">
              <button @click="openEditModal(r)"
                      class="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center transition hover:bg-slate-100 active:bg-slate-200"
                      style="color: var(--wp-text-secondary);"
                      title="Edit">
                <Icon name="heroicons:pencil" class="w-4 h-4" />
              </button>
              <button @click="onDeleteReminder(r.reminder_id)"
                      :disabled="!r.reminder_id"
                      class="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center transition hover:bg-red-50 active:bg-red-100 disabled:opacity-40"
                      style="color: #DC2626;"
                      title="Hapus">
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- message -->
          <p class="text-sm font-semibold mb-4 leading-snug" style="color: var(--wp-text);">
            {{ r.message || '(tanpa pesan)' }}
          </p>

          <!-- run now -->
          <button
            @click="onTriggerReminder(r.reminder_id)"
            :disabled="isReminderTriggering(r.reminder_id) || !r.reminder_id"
            class="w-full py-2.5 min-h-[44px] text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            style="background: rgba(5,150,105,0.1); color: #059669;"
          >
            <Icon v-if="isReminderTriggering(r.reminder_id)" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <Icon v-else name="heroicons:play" class="w-4 h-4" />
            {{ isReminderTriggering(r.reminder_id) ? 'Menjalankan...' : 'Jalankan Sekarang' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════ TAB 2: Cron Job Sistem ═══════════ -->
    <div v-show="activeTab === 'system'" class="animate-fade-in space-y-4">
      <p class="text-xs font-medium" style="color: var(--wp-text-secondary);">
        Job sistem yang berjalan otomatis di background.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <div
          v-for="job in systemJobs"
          :key="job.task"
          class="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
          style="border-color: var(--wp-border);"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style="background: rgba(212,168,67,0.1);">
              <Icon name="heroicons:cog-6-tooth" class="w-4.5 h-4.5" style="color: var(--wp-gold-dark);" />
            </div>
            <span class="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style="background: rgba(5,150,105,0.1); color: #047857;">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Aktif
            </span>
          </div>
          <h3 class="text-sm font-bold mb-1" style="color: var(--wp-text);">{{ job.task }}</h3>
          <p class="text-[10px] mb-3 leading-relaxed" style="color: var(--wp-text-secondary);">{{ job.description }}</p>
          <div class="flex items-center gap-1.5 text-[10px] font-bold" style="color: var(--wp-gold-dark);">
            <Icon name="heroicons:clock" class="w-3 h-3" />
            Tiap {{ job.schedule_human }}
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL CREATE / EDIT ═══ -->
    <Teleport to="body">
      <div v-if="showReminderModal"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
           style="background: rgba(0,0,0,0.5);"
           @click.self="closeReminderModal">
        <div class="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up"
             style="background: var(--wp-surface);">

          <!-- modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color: var(--wp-border);">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                   style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
                <Icon name="heroicons:bell" class="w-4 h-4 text-white" />
              </div>
              <h3 class="text-sm font-black uppercase tracking-wider" style="color: var(--wp-navy);">
                {{ editingReminder ? 'Edit Pengingat' : 'Buat Pengingat Baru' }}
              </h3>
            </div>
            <button @click="closeReminderModal()"
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-slate-100"
                    style="color: var(--wp-text-secondary);">
              <Icon name="heroicons:x-mark" class="w-4.5 h-4.5" />
            </button>
          </div>

          <form @submit.prevent="onSubmitReminder" class="p-6 space-y-5">

            <!-- Mode toggle -->
            <div class="flex gap-2 p-1 rounded-xl" style="background: var(--wp-bg);">
              <button type="button" @click="formMode = 'llm'"
                      class="flex-1 inline-flex items-center justify-center gap-2 py-2 text-[10px] font-bold rounded-lg transition"
                      :style="formMode === 'llm'
                        ? 'background: var(--wp-surface); color: var(--wp-navy); box-shadow: 0 1px 4px rgba(0,0,0,0.08);'
                        : 'color: var(--wp-text-secondary);'">
                <Icon name="heroicons:sparkles" class="w-3.5 h-3.5" :style="formMode === 'llm' ? 'color: var(--wp-gold);' : ''" />
                Pakai AI
              </button>
              <button type="button" @click="formMode = 'manual'"
                      class="flex-1 inline-flex items-center justify-center gap-2 py-2 text-[10px] font-bold rounded-lg transition"
                      :style="formMode === 'manual'
                        ? 'background: var(--wp-surface); color: var(--wp-navy); box-shadow: 0 1px 4px rgba(0,0,0,0.08);'
                        : 'color: var(--wp-text-secondary);'">
                <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" :style="formMode === 'manual' ? 'color: var(--wp-gold);' : ''" />
                Atur Manual
              </button>
            </div>

            <!-- LLM Mode -->
            <div v-if="formMode === 'llm'" class="space-y-3">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                       style="color: var(--wp-text-secondary);">
                  Ceritakan pengingat yang Anda inginkan
                </label>
                <textarea v-model="reminderForm.message" rows="3" required
                          placeholder="contoh: ingatkan saya cek stok tiap jam 8 malam"
                          class="w-full px-3 py-2.5 border rounded-xl text-xs outline-none resize-none transition focus:border-[var(--wp-gold)]"
                          style="border-color: var(--wp-border); color: var(--wp-text); background: var(--wp-bg);">
                </textarea>
              </div>
              <button type="button" @click="onParsePreview()"
                      :disabled="!reminderForm.message || parsing"
                      class="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold rounded-lg border transition disabled:opacity-50 hover:border-[var(--wp-gold)]"
                      style="border-color: var(--wp-border); color: var(--wp-text-secondary); background: var(--wp-bg);">
                <Icon :name="parsing ? 'heroicons:arrow-path' : 'heroicons:eye'" class="w-3.5 h-3.5" :class="{ 'animate-spin': parsing }" />
                {{ parsing ? 'Memproses...' : 'Preview Jadwal' }}
              </button>
              <!-- Preview result -->
              <div v-if="parsedPreview" class="p-4 rounded-xl border" style="border-color: var(--wp-border); background: var(--wp-bg);">
                <p class="text-[9px] font-bold uppercase tracking-wider mb-2" style="color: var(--wp-text-secondary);">Hasil Parse</p>
                <p class="text-xs font-bold mb-1" style="color: var(--wp-text);">{{ parsedPreview.message }}</p>
                <div class="flex items-center gap-1.5 text-[10px]" style="color: var(--wp-gold-dark);">
                  <Icon name="heroicons:clock" class="w-3 h-3" />
                  {{ parsedPreview.cron_description }}
                </div>
              </div>
            </div>

            <!-- Manual Mode -->
            <div v-if="formMode === 'manual'" class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                       style="color: var(--wp-text-secondary);">Pesan Pengingat</label>
                <textarea v-model="reminderForm.message" rows="2" required
                          placeholder="Cek stok barang toko saya"
                          class="w-full px-3 py-2.5 border rounded-xl text-xs outline-none resize-none transition focus:border-[var(--wp-gold)]"
                          style="border-color: var(--wp-border); color: var(--wp-text); background: var(--wp-bg);">
                </textarea>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-2"
                       style="color: var(--wp-text-secondary);">Template Jadwal</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="t in scheduleTemplates"
                    :key="t.cron"
                    type="button"
                    @click="reminderForm.cron = t.cron"
                    class="px-3 py-1.5 text-[9px] font-bold rounded-full border transition"
                    :style="reminderForm.cron === t.cron
                      ? 'border-color: var(--wp-gold); background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);'
                      : 'border-color: var(--wp-border); color: var(--wp-text-secondary);'"
                  >
                    {{ t.label }}
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                       style="color: var(--wp-text-secondary);">Atau Masukkan Cron Manual</label>
                <input v-model="reminderForm.cron" type="text" placeholder="0 20 * * *"
                       class="w-full px-3 py-2 border rounded-xl text-xs outline-none transition focus:border-[var(--wp-gold)] font-mono"
                       style="border-color: var(--wp-border); color: var(--wp-text); background: var(--wp-bg);" />
              </div>
              <label class="flex items-center gap-2.5 cursor-pointer select-none">
                <input v-model="reminderForm.once" type="checkbox" id="once-toggle"
                       class="w-4 h-4 rounded accent-[var(--wp-gold)]" />
                <span class="text-[10px] font-medium" style="color: var(--wp-text-secondary);">
                  Sekali jalan (auto-hapus setelah trigger)
                </span>
              </label>
            </div>

            <!-- Submit -->
            <div class="flex gap-2 pt-1">
              <button type="submit"
                      :disabled="!reminderForm.message || creatingReminder"
                      class="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition hover:shadow-md disabled:opacity-50"
                      style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
                <Icon :name="creatingReminder ? 'heroicons:arrow-path' : 'heroicons:check'" class="w-4 h-4" :class="{ 'animate-spin': creatingReminder }" />
                {{ creatingReminder ? 'Menyimpan...' : (editingReminder ? 'Simpan Perubahan' : 'Simpan Pengingat') }}
              </button>
              <button type="button" @click="closeReminderModal()"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition hover:bg-slate-50"
                      style="border-color: var(--wp-border); color: var(--wp-text-secondary);">
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ═══ TOAST ═══ -->
    <Teleport to="body">
      <div class="fixed top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div v-for="toast in toasts" :key="toast.id"
             class="bg-white border rounded-xl shadow-lg p-4 pr-10 relative min-w-[300px] animate-fade-in-up pointer-events-auto"
             style="border-color: var(--wp-border);">
          <!-- colored left stripe via icon -->
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                 :style="toast.type === 'success' ? 'background: rgba(5,150,105,0.1);' : toast.type === 'error' ? 'background: rgba(220,38,38,0.1);' : 'background: rgba(212,168,67,0.1);'">
              <Icon :name="toast.type === 'success' ? 'heroicons:check-circle' : toast.type === 'error' ? 'heroicons:exclamation-circle' : 'heroicons:information-circle'"
                    class="w-4 h-4"
                    :style="toast.type === 'success' ? 'color: #059669;' : toast.type === 'error' ? 'color: #DC2626;' : 'color: var(--wp-gold);'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold leading-tight" style="color: var(--wp-text);">{{ toast.title }}</p>
              <p class="text-[10px] mt-0.5 leading-snug" style="color: var(--wp-text-secondary);">{{ toast.message }}</p>
            </div>
          </div>
          <button @click="dismissToast(toast.id)"
                  class="absolute top-2.5 right-2.5 w-6 h-6 rounded flex items-center justify-center transition hover:bg-slate-100"
                  style="color: var(--wp-text-secondary);">
            <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAutomation } from '~/composables/useAutomation'

const {
  reminders, systemJobs, loading,
  fetchReminders, createReminder, updateReminder, deleteReminder,
  triggerReminder, isReminderTriggering, parseNaturalLanguage,
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
  { id: 'system'    as const, label: 'Cron Job Sistem', icon: 'heroicons:cog-6-tooth', badge: systemJobs.value.length || undefined },
])

// ── Quick add templates (heroicons) ──────────────────────────────────
const quickTemplates = [
  { icon: 'heroicons:sun',             label: 'Pagi jam 8',       message: 'ingatkan saya cek stok setiap pagi jam 8' },
  { icon: 'heroicons:moon',            label: 'Malam jam 8',      message: 'ingatkan saya cek stok setiap malam jam 8' },
  { icon: 'heroicons:chart-bar',       label: 'Laporan mingguan', message: 'ingatkan saya laporan penjualan setiap minggu' },
  { icon: 'heroicons:exclamation-triangle', label: 'Alert stok rendah', message: 'ingatkan saya cek stok yang menipis setiap hari' },
]

// ── Schedule templates ────────────────────────────────────────────────
const scheduleTemplates = [
  { label: 'Tiap pagi jam 8',         cron: '0 8 * * *' },
  { label: 'Tiap malam jam 8',        cron: '0 20 * * *' },
  { label: 'Tiap Senin jam 8',        cron: '0 8 * * 1' },
  { label: 'Tiap hari tengah malam',  cron: '0 0 * * *' },
  { label: 'Tiap jam',                cron: '0 * * * *' },
]

// ── Toast ─────────────────────────────────────────────────────────────
function showToast(title: string, message: string, type = 'success') {
  const id = Math.random().toString(36).substring(7)
  toasts.value.push({ id, title, message, type })
  setTimeout(() => dismissToast(id), 5000)
}
function dismissToast(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// ── Modal ─────────────────────────────────────────────────────────────
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

// ── Quick Add ─────────────────────────────────────────────────────────
async function onQuickAdd(tpl: { message: string }) {
  creatingReminder.value = true
  try {
    await createReminder({ message: tpl.message })
    showToast('Pengingat Dibuat', 'Pengingat berhasil dijadwalkan via AI')
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal membuat pengingat', 'error')
  } finally {
    creatingReminder.value = false
  }
}

// ── Parse Preview ─────────────────────────────────────────────────────
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
  } catch {
    showToast('Gagal', 'Tidak bisa memparse pesan. Coba mode manual.', 'error')
  } finally {
    parsing.value = false
  }
}

// ── Create / Update ───────────────────────────────────────────────────
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

// ── Trigger / Delete ──────────────────────────────────────────────────
async function onTriggerReminder(reminderId: string) {
  try {
    await triggerReminder(reminderId)
    showToast('Pengingat Dijalankan', 'Laporan terbaru telah dikirim ke Telegram Anda')
  } catch (err: any) {
    showToast('Gagal', err.message || 'Gagal menjalankan pengingat', 'error')
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

// ── Init ──────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await Promise.all([fetchReminders(), fetchSystemJobs()])
  } catch (err) {
    console.error('Failed to load automation data:', err)
  }
})
</script>
