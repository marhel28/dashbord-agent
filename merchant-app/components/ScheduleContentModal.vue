<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.6);" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" style="background: var(--wp-surface);">
        <div class="p-5 border-b flex items-center justify-between" style="border-color: var(--wp-border);">
          <h3 class="text-sm font-black uppercase" style="color: var(--wp-navy);">📅 Jadwalkan Konten</h3>
          <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-slate-100">
            <Icon name="heroicons:x-mark" class="w-5 h-5" style="color: var(--wp-text-secondary);" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
          <!-- Product -->
          <div>
            <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Produk</label>
            <input v-model="form.product_name" type="text" required class="w-full px-3 py-2 border rounded-lg text-xs outline-none" style="border-color: var(--wp-border); color: var(--wp-text);" />
          </div>
          <!-- Platform -->
          <div>
            <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Platform</label>
            <select v-model="form.platform" class="w-full px-3 py-2 border rounded-lg text-xs outline-none bg-white" style="border-color: var(--wp-border); color: var(--wp-text);">
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="shopee">Shopee</option>
            </select>
          </div>
          <!-- Date & Time -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Tanggal</label>
              <input v-model="form.date" type="date" required class="w-full px-3 py-2 border rounded-lg text-xs outline-none" style="border-color: var(--wp-border); color: var(--wp-text);" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Jam</label>
              <input v-model="form.time" type="time" required class="w-full px-3 py-2 border rounded-lg text-xs outline-none" style="border-color: var(--wp-border); color: var(--wp-text);" />
            </div>
          </div>
          <!-- Repeat -->
          <div>
            <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">🔄 Ulangi</label>
            <select v-model="form.repeat" class="w-full px-3 py-2 border rounded-lg text-xs outline-none bg-white" style="border-color: var(--wp-border); color: var(--wp-text);">
              <option value="none">Tidak ada</option>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
          <!-- Caption Preview -->
          <div>
            <label class="block text-[10px] font-bold uppercase mb-1" style="color: var(--wp-text-secondary);">Caption</label>
            <textarea v-model="form.content" rows="3" readonly class="w-full px-3 py-2 border rounded-lg text-xs outline-none resize-none" style="border-color: var(--wp-border); color: var(--wp-text); background: var(--wp-bg);"></textarea>
          </div>
          <!-- Actions -->
          <div class="flex gap-2 pt-2">
            <button type="button" @click="$emit('close')" class="flex-1 py-2.5 rounded-lg text-xs font-bold border" style="border-color: var(--wp-border); color: var(--wp-text-secondary);">
              Batal
            </button>
            <button type="submit" :disabled="scheduling" class="flex-1 py-2.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style="background: linear-gradient(135deg, var(--wp-gold), #B8922E);">
              {{ scheduling ? 'Menyimpan...' : '📅 Jadwalkan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { api } from '~/utils/api'

const props = defineProps<{ content: any }>()
defineEmits(['close', 'scheduled'])

const scheduling = ref(false)

const form = reactive({
  product_name: '',
  platform: 'instagram',
  date: '',
  time: '09:00',
  repeat: 'none',
  content: '',
})

onMounted(() => {
  // Pre-fill from generated content
  const variant = props.content?.variants?.[0]
  form.content = variant?.caption || ''
  form.product_name = props.content?.product_data?.name || props.content?.product || ''
  form.platform = props.content?.platform || 'instagram'
  // Default: tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  form.date = tomorrow.toISOString().split('T')[0]
})

async function handleSubmit() {
  scheduling.value = true
  try {
    // Build cron expression
    const [h, m] = form.time.split(':')
    let cron = `${m} ${h} * * *`
    if (form.repeat === 'weekly') cron = `${m} ${h} * * 1`  // Monday
    if (form.repeat === 'monthly') cron = `${m} ${h} 1 * *`  // 1st of month

    await api.post('/agentic/automation/scheduled-content', {
      content: form.content,
      product_name: form.product_name,
      platform: form.platform,
      cron,
      timezone: 'Asia/Jakarta',
      once: form.repeat === 'none',
    })

    emit('scheduled')
  } catch (err: any) {
    alert(err.message || 'Gagal menjadwalkan konten')
  } finally {
    scheduling.value = false
  }
}
</script>
