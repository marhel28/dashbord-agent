<template>
  <div class="max-w-6xl mx-auto space-y-8 animate-fade-in">
    <!-- ═══ HEADER ═══ -->
    <div class="animate-fade-in-up">
      <span class="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider inline-flex items-center gap-1.5"
        style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
        <Icon name="heroicons:sparkles" class="w-3.5 h-3.5" />
        AI AGENT CONFIGURATION
      </span>
      <h1 class="text-3xl font-extrabold tracking-tight mt-2" style="color: var(--wp-navy);">Kelola Skill Agent</h1>
      <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">
        Buat dan kelola workflow otomatis untuk agent AI Anda. Skill adalah rangkaian langkah yang dijalankan agent secara otomatis.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-children">

      <!-- ═══ LEFT: Skill List ═══ -->
      <div class="lg:col-span-1 order-2 lg:order-1 space-y-4">
        <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold flex items-center gap-2" style="color: var(--wp-text);">
              <Icon name="heroicons:queue-list" class="w-4 h-4" style="color: var(--wp-gold);" />
              Skill Anda
            </h2>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background: var(--wp-bg); color: var(--wp-text-secondary);">
              {{ skills.length }}
            </span>
          </div>

          <!-- Loading -->
          <div v-if="loadingSkills" class="flex items-center gap-2 py-8 justify-center">
            <div class="w-4 h-4 rounded-full border-2 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold);"></div>
            <span class="text-xs" style="color: var(--wp-text-secondary);">Memuat skill...</span>
          </div>

          <!-- Empty -->
          <div v-else-if="skills.length === 0" class="text-center py-8">
            <Icon name="heroicons:light-bulb" class="w-8 h-8 mx-auto mb-2" style="color: #94A3B8;" />
            <p class="text-xs font-medium" style="color: var(--wp-text-secondary);">Belum ada skill</p>
            <p class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">Buat skill pertama Anda dari template di samping.</p>
          </div>

          <!-- Skill cards -->
          <div v-else class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            <div v-for="skill in skills" :key="skill.uuid"
              class="p-3 rounded-xl border transition hover:border-[var(--wp-gold-light)] group/skill cursor-pointer"
              style="border-color: var(--wp-border); background: var(--wp-bg);"
              @click="selectSkill(skill)">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-xs font-bold truncate" style="color: var(--wp-text);">{{ skill.workflow_name }}</p>
                  <p class="text-[10px] mt-0.5 line-clamp-2" style="color: var(--wp-text-secondary);">{{ skill.description }}</p>
                </div>
                <button
                  @click.stop="deleteSkill(skill)"
                  class="opacity-0 group-hover/skill:opacity-100 transition p-1.5 rounded-lg hover:bg-red-50 shrink-0"
                  title="Hapus skill">
                  <Icon name="heroicons:trash" class="w-3.5 h-3.5" style="color: #DC2626;" />
                </button>
              </div>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <span class="text-[8px] font-bold px-1.5 py-0.5 rounded" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
                  {{ skill.agent }}
                </span>
                <span class="text-[8px] px-1.5 py-0.5 rounded" style="background: var(--wp-bg); color: var(--wp-text-secondary); border: 1px solid var(--wp-border);">
                  {{ skill.steps?.length || 0 }} langkah
                </span>
                <span class="text-[8px]" style="color: var(--wp-text-secondary);">
                  {{ skill.usage || 0 }}x dipakai
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Template / Default Skills -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <h3 class="font-bold flex items-center gap-2 mb-3" style="color: var(--wp-text);">
            <Icon name="heroicons:bookmark" class="w-4 h-4" style="color: var(--wp-gold);" />
            Template Bawaan
          </h3>
          <div class="space-y-2">
            <div v-for="tpl in defaultTemplates" :key="tpl.name"
              class="p-3 rounded-xl border cursor-pointer transition hover:border-[var(--wp-gold-light)] hover:shadow-sm"
              style="border-color: var(--wp-border); background: var(--wp-bg);"
              @click="useTemplate(tpl)">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ tpl.icon }}</span>
                <div>
                  <p class="text-xs font-bold" style="color: var(--wp-text);">{{ tpl.name }}</p>
                  <p class="text-[9px]" style="color: var(--wp-text-secondary);">{{ tpl.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT: Form ═══ -->
      <div class="lg:col-span-2 order-1 lg:order-2">
        <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-5" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:adjustments-horizontal" class="w-5 h-5" style="color: var(--wp-gold);" />
            <h2 class="font-bold" style="color: var(--wp-text);">{{ isEditing ? 'Edit Skill' : 'Buat Skill Baru' }}</h2>
          </div>

          <!-- Success message -->
          <div v-if="successMsg" class="px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
            style="background: #F0FDF4; color: #059669; border: 1px solid #DCFCE7;">
            <Icon name="heroicons:check-circle" class="w-4 h-4" />
            {{ successMsg }}
          </div>

          <!-- Error message -->
          <div v-if="errorMsg" class="px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
            style="background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            {{ errorMsg }}
          </div>

          <!-- Nama Skill -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--wp-text-secondary);">Nama Skill</label>
            <input v-model="form.workflow_name" type="text" placeholder="e.g., Laporan Harian Otomatis"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition border"
              style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);" />
          </div>

          <!-- Agent -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--wp-text-secondary);">Agent Target</label>
            <select v-model="form.agent"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition border"
              style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);">
              <option value="all">Semua Agent</option>
              <option value="finance">Finance Agent</option>
              <option value="stock">Stock Agent</option>
              <option value="marketing">Marketing Agent</option>
              <option value="research">Research Agent</option>
            </select>
          </div>

          <!-- Deskripsi -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--wp-text-secondary);">Deskripsi Skill</label>
            <textarea v-model="form.description" rows="4"
              placeholder="Jelaskan apa yang dilakukan skill ini dan kapan sebaiknya digunakan..."
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition border resize-none"
              style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);"></textarea>
          </div>

          <!-- Langkah-langkah -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--wp-text-secondary);">Langkah-langkah (Steps)</label>
              <button @click="addStep" class="text-[10px] font-bold flex items-center gap-1 transition hover:underline" style="color: var(--wp-gold);">
                <Icon name="heroicons:plus-circle" class="w-3.5 h-3.5" />
                Tambah Langkah
              </button>
            </div>
            <div class="space-y-2">
              <div v-for="(step, i) in form.steps" :key="i"
                class="flex items-start gap-2 p-3 rounded-xl border" style="border-color: var(--wp-border); background: var(--wp-bg);">
                <span class="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1"
                  style="background: var(--wp-navy); color: var(--wp-gold);">{{ i + 1 }}</span>
                <div class="flex-1 space-y-2">
                  <input v-model="step.tool" placeholder="Tool (e.g., stock.get_stocks)" class="w-full px-3 py-2 rounded-lg text-xs outline-none border"
                    style="background: white; border-color: var(--wp-border); color: var(--wp-text);" />
                  <textarea v-model="step.description" rows="2" placeholder="Deskripsi langkah ini..."
                    class="w-full px-3 py-2 rounded-lg text-xs outline-none border resize-none"
                    style="background: white; border-color: var(--wp-border); color: var(--wp-text);"></textarea>
                </div>
                <button @click="removeStep(i)" class="p-1.5 rounded-lg hover:bg-red-50 transition shrink-0 mt-1">
                  <Icon name="heroicons:x-mark" class="w-4 h-4" style="color: #DC2626;" />
                </button>
              </div>
            </div>
            <p v-if="form.steps.length === 0" class="text-[10px] italic" style="color: var(--wp-text-secondary);">
              Belum ada langkah. Klik "Tambah Langkah" untuk menambahkan tool yang akan dijalankan.
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-2">
            <button @click="saveSkill" :disabled="saving"
              class="flex-1 py-3 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
              style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white;">
              <Icon v-if="!saving" name="heroicons:bookmark" class="w-4 h-4" />
              <div v-else class="w-4 h-4 rounded-full border-2 animate-spin" style="border-color: rgba(255,255,255,0.3); border-top-color: white;"></div>
              {{ saving ? 'MENYIMPAN...' : (isEditing ? 'UPDATE SKILL' : 'SIMPAN SKILL') }}
            </button>
            <button @click="resetForm"
              class="px-6 py-3 border rounded-xl text-xs font-bold transition"
              style="border-color: var(--wp-border); color: var(--wp-text-secondary);">
              RESET
            </button>
          </div>
        </div>

        <!-- ═══ Upload Knowledge ═══ -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-4 mt-6" style="border-color: var(--wp-border);">
          <h3 class="font-bold flex items-center gap-2" style="color: var(--wp-text);">
            <Icon name="heroicons:document-arrow-up" class="w-4 h-4" style="color: var(--wp-gold);" />
            Unggah Basis Pengetahuan
          </h3>
          <p class="text-[11px] leading-relaxed" style="color: var(--wp-text-secondary);">
            Tambahkan dokumen (PDF, CSV, TXT) untuk memperkaya pengetahuan agent.
          </p>
          <div class="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition cursor-pointer hover:border-[var(--wp-gold-light)]"
            style="border-color: var(--wp-border); background: var(--wp-bg);">
            <Icon name="heroicons:cloud-arrow-up" class="w-10 h-10 mb-3" style="color: #94A3B8;" />
            <span class="text-xs font-bold" style="color: var(--wp-text);">Drag & Drop File</span>
            <span class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">atau klik untuk pilih file</span>
            <div class="flex gap-2 mt-4">
              <span v-for="ext in ['.PDF', '.CSV', '.TXT', '.DOCX']" :key="ext"
                class="px-2 py-0.5 border rounded text-[9px] font-bold"
                style="background: white; border-color: var(--wp-border); color: var(--wp-text-secondary);">{{ ext }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'

interface Skill {
  uuid: string
  agent: string
  workflow_name: string
  description: string
  steps: { tool: string; description: string; args?: Record<string, any>; output_var?: string }[]
  confidence: number
  usage: number
  success_rate: number
  created_at: string | null
}

interface StepForm {
  tool: string
  description: string
  args?: Record<string, any>
  output_var?: string
}

const skills = ref<Skill[]>([])
const loadingSkills = ref(false)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const isEditing = ref(false)

const form = ref<{
  workflow_name: string
  agent: string
  description: string
  steps: StepForm[]
}>({
  workflow_name: '',
  agent: 'all',
  description: '',
  steps: [],
})

const defaultTemplates = [
  { name: 'Laporan Harian', icon: '📊', description: 'Stok → Keuangan → Grafik → PDF',
    agent: 'all',
    steps: [
      { tool: 'stock.get_stocks', description: 'Ambil data stok semua produk', output_var: 'stock_data' },
      { tool: 'finance.get_financial_summary', description: 'Ambil ringkasan keuangan', output_var: 'finance_data' },
      { tool: 'pdf.generate_report_async', description: 'Generate laporan PDF dan kirim ke Telegram' },
    ]},
  { name: 'Analisis Produk', icon: '📦', description: 'Stok → Margin Chart → Strategi',
    agent: 'stock',
    steps: [
      { tool: 'stock.get_stocks', description: 'Ambil semua data stok', output_var: 'stock_data' },
      { tool: 'chart.render_margin_chart', description: 'Buat grafik margin per produk' },
      { tool: 'marketing.get_promo_suggestions', description: 'Dapatkan saran promosi' },
    ]},
  { name: 'Restock Cepat', icon: '📥', description: 'Cek Stok → Validasi → Tambah Stok',
    agent: 'stock',
    steps: [
      { tool: 'stock.get_stocks', description: 'Cek stok saat ini', output_var: 'stock_data' },
      { tool: 'validation.validate_stock_operation', description: 'Validasi operasi stok' },
      { tool: 'executor.execute_stock_adjustment', description: 'Eksekusi penambahan stok' },
    ]},
  { name: 'Suara Laporan', icon: '🎙️', description: 'Finance → Voice → Kirim ke Telegram',
    agent: 'finance',
    steps: [
      { tool: 'finance.get_financial_summary', description: 'Ambil data keuangan', output_var: 'finance_data' },
      { tool: 'voice.speak_and_send', description: 'Bacakan laporan dengan suara' },
    ]},
  { name: 'Cek Kompetitor', icon: '🔍', description: 'Search → Marketing → Strategi',
    agent: 'research',
    steps: [
      { tool: 'search.search_products', description: 'Cari produk di katalog', output_var: 'my_products' },
      { tool: 'marketing.get_promo_suggestions', description: 'Analisis strategi kompetitor' },
    ]},
]

// ── Fetch skills ──
async function fetchSkills() {
  loadingSkills.value = true
  try {
    const result = await api.get('/agentic/skills')
    skills.value = (result || []) as Skill[]
  } catch (e: any) {
    console.error('Failed to load skills:', e)
    skills.value = []
  } finally {
    loadingSkills.value = false
  }
}

// ── Template ──
function useTemplate(tpl: typeof defaultTemplates[0]) {
  form.value = {
    workflow_name: tpl.name,
    agent: tpl.agent,
    description: tpl.description,
    steps: tpl.steps.map(s => ({ ...s })),
  }
  isEditing.value = false
  successMsg.value = ''
  errorMsg.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Select existing skill ──
function selectSkill(skill: Skill) {
  form.value = {
    workflow_name: skill.workflow_name,
    agent: skill.agent,
    description: skill.description,
    steps: (skill.steps || []).map(s => ({ tool: s.tool || '', description: s.description || '', args: s.args, output_var: s.output_var })),
  }
  isEditing.value = true
  successMsg.value = ''
  errorMsg.value = ''
}

// ── Steps management ──
function addStep() {
  form.value.steps.push({ tool: '', description: '', output_var: '' })
}

function removeStep(i: number) {
  form.value.steps.splice(i, 1)
}

// ── Save ──
async function saveSkill() {
  if (!form.value.workflow_name.trim()) {
    errorMsg.value = 'Nama skill wajib diisi.'
    return
  }
  if (!form.value.description.trim()) {
    errorMsg.value = 'Deskripsi skill wajib diisi.'
    return
  }

  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const payload = {
      workflow_name: form.value.workflow_name.trim(),
      agent: form.value.agent,
      description: form.value.description.trim(),
      steps: form.value.steps.filter(s => s.tool.trim()).map(s => ({
        tool: s.tool.trim(),
        description: s.description.trim(),
        output_var: s.output_var || undefined,
      })),
    }
    await api.post('/agentic/skills', payload)
    successMsg.value = `Skill "${payload.workflow_name}" berhasil disimpan!`
    await fetchSkills()
    resetForm()
  } catch (e: any) {
    errorMsg.value = e.message || 'Gagal menyimpan skill.'
  } finally {
    saving.value = false
  }
}

// ── Delete ──
async function deleteSkill(skill: Skill) {
  if (!confirm(`Hapus skill "${skill.workflow_name}"?`)) return
  try {
    await api.delete(`/agentic/skills/${skill.uuid}`)
    skills.value = skills.value.filter(s => s.uuid !== skill.uuid)
  } catch (e: any) {
    errorMsg.value = e.message || 'Gagal menghapus skill.'
  }
}

// ── Reset ──
function resetForm() {
  form.value = { workflow_name: '', agent: 'all', description: '', steps: [] }
  isEditing.value = false
  successMsg.value = ''
  errorMsg.value = ''
}

onMounted(() => { fetchSkills() })
</script>
