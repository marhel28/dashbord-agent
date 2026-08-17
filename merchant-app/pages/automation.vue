<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. HEADER ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Otomatisasi & Pengingat</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Biar Business Copilot yang mengingat dan mengurus rutinitas harian toko Anda.
        </p>
      </div>

      <!-- Action Button -->
      <Button
        class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9 px-4 shadow-xs"
        @click="openCreateModal()"
      >
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span>+ Buat Rutinitas Manual</span>
      </Button>
    </div>

    <!-- ═══════════ 2. NATURAL LANGUAGE AI PROMPT BAR ═══════════ -->
    <div class="p-5 rounded-xl bg-slate-900 text-white shadow-md space-y-3">
      <div class="flex items-center gap-2">
        <Icon name="lucide:sparkles" class="w-4 h-4 text-emerald-400" />
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-300">Asisten Pintar AI</span>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="aiPromptInput"
          type="text"
          placeholder="Contoh: 'Tolong ingatkan saya cek rekap kasir setiap jam 9 malam'"
          class="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
          @keyup.enter="handleAiPromptSubmit"
        />
        <Button
          class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-10 px-5 shrink-0"
          :disabled="!aiPromptInput.trim() || creatingReminder"
          @click="handleAiPromptSubmit"
        >
          <Icon name="lucide:arrow-right" class="w-4 h-4" />
          <span>Buat via AI</span>
        </Button>
      </div>
    </div>

    <!-- ═══════════ 3. QUICK ACTION TEMPLATES ═══════════ -->
    <div class="space-y-3">
      <h2 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Template Rutinitas Cepat</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="tpl in quickTemplates"
          :key="tpl.label"
          @click="onQuickAdd(tpl)"
          class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2 group"
        >
          <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#047857]">
            <Icon :name="tpl.icon" class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#047857] transition-colors">{{ tpl.label }}</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ tpl.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ 4. TABS & WORKFLOW LIST ═══════════ -->
    <div class="space-y-4">
      <!-- Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['px-4 py-2 text-xs font-semibold rounded-lg transition-all',
            activeTab === tab.id ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          {{ tab.label }} ({{ tab.badge || 0 }})
        </button>
      </div>

      <!-- TAB 1: PENGINGAT SAYA -->
      <div v-if="activeTab === 'reminders'" class="space-y-4">
        <!-- Loading State -->
        <div v-if="loading" class="py-12 text-center">
          <Icon name="lucide:loader-2" class="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
          <p class="text-xs text-slate-500 mt-2">Memuat daftar rutinitas toko...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="reminders.length === 0" class="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#047857] mx-auto flex items-center justify-center">
            <Icon name="lucide:bell-off" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Belum Ada Rutinitas</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Otomatiskan tugas harian Anda seperti pengingat stok atau laporan kasir sekarang.</p>
          </div>
          <Button
            class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9 px-5"
            @click="openCreateModal()"
          >
            + Buat Pengingat Manual
          </Button>
        </div>

        <!-- Active Reminders Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="r in reminders"
            :key="r.reminder_id"
            class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div class="space-y-3">
              <!-- Top Row: Toggle + Schedule Badge -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <!-- Toggle Switch -->
                  <button
                    @click="toggleReminderActive(r)"
                    :class="['w-9 h-5 rounded-full transition-colors relative p-0.5', r.disabled ? 'bg-slate-200 dark:bg-slate-800' : 'bg-[#047857]']"
                  >
                    <span :class="['w-4 h-4 rounded-full bg-white transition-transform block', r.disabled ? 'translate-x-0' : 'translate-x-4']"></span>
                  </button>
                  <span class="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {{ r.disabled ? 'Nonaktif' : 'Aktif' }}
                  </span>
                </div>

                <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                  {{ r.cron_description || r.cron }}
                </span>
              </div>

              <!-- Message Body -->
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {{ r.message || '(Tanpa Pesan)' }}
                </p>
                <span class="text-[11px] text-slate-400 mt-1 block">
                  Status Terakhir: Berhasil dijalankan
                </span>
              </div>
            </div>

            <!-- Bottom Actions -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                @click="onTriggerReminder(r.reminder_id)"
                :disabled="isReminderTriggering(r.reminder_id)"
                class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
              >
                <Icon name="lucide:play" class="w-3.5 h-3.5" />
                <span>Jalankan Sekarang</span>
              </button>

              <div class="flex items-center gap-2">
                <button @click="openEditModal(r)" class="p-1.5 text-slate-400 hover:text-slate-600">
                  <Icon name="lucide:edit-2" class="w-4 h-4" />
                </button>
                <button @click="onDeleteReminder(r.reminder_id)" class="p-1.5 text-red-400 hover:text-red-600">
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: TUGAS SISTEM BACKGROUND -->
      <div v-else-if="activeTab === 'system'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="job in systemJobs"
          :key="job.task"
          class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Tugas Sistem</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ job.task }}</h3>
            <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{{ job.description }}</p>
          </div>
          <span class="text-[10px] font-mono text-slate-400 block pt-2 border-t border-slate-100 dark:border-slate-800">
            Jadwal: Setiap {{ job.schedule_human }}
          </span>
        </div>
      </div>
    </div>

    <!-- ═══════════ MODAL CREATE/EDIT ═══════════ -->
    <Teleport to="body">
      <div v-if="showReminderModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" @click.self="closeReminderModal">
        <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
              {{ editingReminder ? 'Edit Rutinitas' : 'Buat Rutinitas Baru' }}
            </h3>
            <button @click="closeReminderModal()" class="text-slate-400 hover:text-slate-600">
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="onSubmitReminder" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan Rutinitas / Tugas</label>
              <textarea
                v-model="reminderForm.message"
                rows="3"
                required
                placeholder="Contoh: Ingatkan saya rekap kasir dan tutup buku toko"
                class="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#047857]"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Frekuensi Jadwal</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="t in scheduleTemplates"
                  :key="t.cron"
                  type="button"
                  @click="reminderForm.cron = t.cron"
                  :class="['p-2 rounded-lg text-xs font-medium border text-left transition-all',
                    reminderForm.cron === t.cron ? 'border-[#047857] bg-emerald-50 text-[#047857] font-bold' : 'border-slate-200 text-slate-600']"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" @click="closeReminderModal()">Batal</Button>
              <Button size="sm" class="bg-[#047857] hover:bg-[#065f46] text-white">Simpan Rutinitas</Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Button from '~/components/ui/button.vue'
import { useAutomation } from '~/composables/useAutomation'

const {
  reminders, systemJobs, loading,
  fetchReminders, createReminder, updateReminder, deleteReminder,
  triggerReminder, isReminderTriggering,
  fetchSystemJobs,
} = useAutomation()

const activeTab = ref<'reminders' | 'system'>('reminders')
const showReminderModal = ref(false)
const creatingReminder = ref(false)
const editingReminder = ref<any>(null)
const aiPromptInput = ref('')

const reminderForm = reactive({
  message: '',
  cron: '0 8 * * *',
  once: false,
})

const tabs = computed(() => [
  { id: 'reminders' as const, label: 'Rutinitas Saya', badge: reminders.value.length },
  { id: 'system' as const, label: 'Tugas Sistem', badge: systemJobs.value.length },
])

const quickTemplates = [
  { icon: 'lucide:sun', label: 'Laporan Pagi (08:00)', description: 'Kirim ringkasan transaksi & pendapatan toko kemarin.', message: 'ingatkan saya rekap laporan pagi jam 8' },
  { icon: 'lucide:moon', label: 'Tutup Kasir Malam', description: 'Pengingat hitung fisik uang kasir sebelum toko tutup.', message: 'ingatkan saya rekap kasir malam jam 8' },
  { icon: 'lucide:package-warning', label: 'Cek Stok Menipis', description: 'Peringatan otomatis barang yang sisa kurang dari 5 pcs.', message: 'ingatkan saya cek barang stok menipis setiap hari' },
  { icon: 'lucide:calendar-days', label: 'Laporan Mingguan', description: 'Ringkasan performa penjualan produk 7 hari terakhir.', message: 'ingatkan saya laporan penjualan mingguan' },
]

const scheduleTemplates = [
  { label: 'Tiap Pagi Jam 8', cron: '0 8 * * *' },
  { label: 'Tiap Malam Jam 8', cron: '0 20 * * *' },
  { label: 'Tiap Senin Jam 8', cron: '0 8 * * 1' },
  { label: 'Setiap Jam', cron: '0 * * * *' },
]

const handleAiPromptSubmit = async () => {
  if (!aiPromptInput.value.trim()) return
  creatingReminder.value = true
  try {
    await createReminder({ message: aiPromptInput.value })
    aiPromptInput.value = ''
    fetchReminders()
  } catch (err) {
    console.error(err)
  } finally {
    creatingReminder.value = false
  }
}

const onQuickAdd = async (tpl: any) => {
  try {
    await createReminder({ message: tpl.message })
    fetchReminders()
  } catch (err) {
    console.error(err)
  }
}

const toggleReminderActive = (r: any) => {
  r.disabled = !r.disabled
}

const openCreateModal = () => {
  editingReminder.value = null
  reminderForm.message = ''
  reminderForm.cron = '0 8 * * *'
  showReminderModal.value = true
}

const openEditModal = (r: any) => {
  editingReminder.value = r
  reminderForm.message = r.message
  reminderForm.cron = r.cron
  showReminderModal.value = true
}

const closeReminderModal = () => {
  showReminderModal.value = false
}

const onSubmitReminder = async () => {
  try {
    if (editingReminder.value) {
      await updateReminder(editingReminder.value.reminder_id, reminderForm)
    } else {
      await createReminder(reminderForm)
    }
    closeReminderModal()
    fetchReminders()
  } catch (err) {
    console.error(err)
  }
}

const onTriggerReminder = async (id: string) => {
  await triggerReminder(id)
}

const onDeleteReminder = async (id: string) => {
  if (confirm('Hapus rutinitas ini?')) {
    await deleteReminder(id)
    fetchReminders()
  }
}

onMounted(() => {
  fetchReminders()
  fetchSystemJobs()
})
</script>
