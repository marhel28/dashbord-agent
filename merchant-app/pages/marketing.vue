<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. HEADER ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Pemasaran (Marketing Workspace)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tingkatkan penjualan dengan rekomendasi produk, pembuatan konten siap pakai, dan kampanye terstruktur.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="loadAll()"
          :disabled="loading"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
        >
          <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Refresh Rekomendasi</span>
        </button>
      </div>
    </div>

    <!-- ═══════════ 2. SKELETON LOADING STATE ═══════════ -->
    <div v-if="loading && !recommendations.length" class="space-y-4">
      <Skeleton class="h-40 rounded-xl" />
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton class="h-72 rounded-xl" />
        <Skeleton class="h-72 rounded-xl" />
      </div>
    </div>

    <!-- ═══════════ 3. ERROR STATE ═══════════ -->
    <div v-else-if="error && !recommendations.length" class="flex items-center justify-center py-16">
      <div class="text-center space-y-4 max-w-sm border border-red-200 dark:border-red-500/20 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-950/40">
        <div class="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
          <Icon name="lucide:alert-triangle" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Gagal Memuat Rekomendasi Pemasaran</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ error }}</p>
        </div>
        <Button variant="default" size="sm" @click="loadAll()" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-semibold shadow-xs text-xs">Coba Lagi</Button>
      </div>
    </div>

    <!-- ═══════════ 4. MAIN MARKETING WORKSPACE ═══════════ -->
    <template v-else>
      <!-- STEP 1: MARKETING OPPORTUNITIES & RECOMMENDATIONS -->
      <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] uppercase font-bold">Langkah 1: Decide</span>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Peluang Pemasaran (Marketing Opportunities)</h2>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Produk yang paling direkomendasikan untuk dipromosikan berdasarkan analisis stok, tren, dan margin toko.</p>
          </div>
          <Badge variant="outline" class="text-[10px] font-semibold">{{ recommendations.length }} Produk Terdeteksi</Badge>
        </div>

        <!-- Product Recommendation Cards -->
        <div v-if="recommendations.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(rec, i) in recommendations.slice(0, 3)"
            :key="i"
            class="p-4 rounded-xl border transition-all flex flex-col justify-between space-y-4"
            :class="selectedProduct === rec.product ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Prioritas {{ i === 0 ? 'Tinggi' : i === 1 ? 'Sedang' : 'Normal' }}
                </span>
                <span class="text-xs font-mono font-bold text-slate-400">Stok: {{ rec.data?.stock_qty || 0 }}</span>
              </div>

              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{ rec.product }}</h3>

              <!-- Recommendation Reason -->
              <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kenapa Direkomendasikan?</span>
                <p class="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">{{ rec.reason || 'Stok memadai dan memiliki potensi peningkatan omzet yang baik.' }}</p>
              </div>
            </div>

            <!-- Action button -> auto select product into Content Studio -->
            <Button
              @click="selectProductForStudio(rec.product)"
              size="sm"
              class="w-full text-xs font-semibold rounded-lg"
              :class="selectedProduct === rec.product ? 'bg-[#047857] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'"
            >
              <Icon name="lucide:sparkles" class="w-3.5 h-3.5 text-emerald-600" />
              <span>{{ selectedProduct === rec.product ? 'Produk Terpilih' : 'Buat Promosi Produk Ini' }}</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- STEP 2 & 3: CONTENT STUDIO (SPLIT WORKSPACE: FORM LEFT, GENERATED RESULT RIGHT) -->
      <div id="content-studio" class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- LEFT PANEL: CONFIGURATION FORM (5 COLS) -->
        <div class="xl:col-span-5 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] uppercase font-bold">Langkah 2: Create</span>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Content Studio Generator</h2>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Konfigurasikan sasaran promosi dan platform tujuan.</p>
          </div>

          <!-- Product Picker -->
          <div class="space-y-1.5 text-xs">
            <Label class="font-semibold text-slate-700 dark:text-slate-300">1. Produk Promosi <span class="text-red-500">*</span></Label>
            <select
              v-model="selectedProduct"
              class="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="">-- Pilih Produk --</option>
              <option v-for="rec in recommendations" :key="rec.uuid" :value="rec.product">
                {{ rec.product }} (Stok: {{ rec.data?.stock_qty || 0 }})
              </option>
            </select>
          </div>

          <!-- Platform Selector -->
          <div class="space-y-1.5 text-xs">
            <Label class="font-semibold text-slate-700 dark:text-slate-300">2. Platform Tujuan</Label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="p in platforms" :key="p.value"
                @click="selectedPlatform = p.value"
                :class="['p-2 rounded-lg border text-left flex items-center gap-2 transition-all',
                  selectedPlatform === p.value ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400']"
              >
                <Icon :name="p.icon" class="w-4 h-4 text-emerald-600" />
                <span>{{ p.label }}</span>
              </button>
            </div>
          </div>

          <!-- Campaign Goal -->
          <div class="space-y-1.5 text-xs">
            <Label class="font-semibold text-slate-700 dark:text-slate-300">3. Tujuan Promosi (Goal)</Label>
            <select
              v-model="selectedGoal"
              class="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="sales">Meningkatkan Penjualan (Hard Selling)</option>
              <option value="clearance">Habiskan Stok (Stok Clearance)</option>
              <option value="new_customer">Mendapatkan Pelanggan Baru</option>
              <option value="repeat">Repeat Purchase (Pelanggan Setia)</option>
            </select>
          </div>

          <!-- Tone Selector -->
          <div class="space-y-1.5 text-xs">
            <Label class="font-semibold text-slate-700 dark:text-slate-300">4. Tone & Gaya Bahasa</Label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in tones" :key="t.value"
                @click="selectedTone = t.value"
                :class="['px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all',
                  selectedTone === t.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 dark:border-slate-800 text-slate-600']"
              >{{ t.label }}</button>
            </div>
          </div>

          <!-- Submit Button -->
          <Button
            @click="handleGenerateContent()"
            :disabled="!selectedProduct || contentGenerating"
            class="w-full bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-10"
          >
            <Icon v-if="contentGenerating" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:sparkles" class="w-4 h-4" />
            <span>{{ contentGenerating ? 'Membuat Konten AI...' : 'Generate Konten siap Pakai' }}</span>
          </Button>
        </div>

        <!-- RIGHT PANEL: GENERATED RESULT WORKSPACE (7 COLS) -->
        <div class="xl:col-span-7 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span class="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] uppercase font-bold">Langkah 3: Review & Copy</span>
                <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">Hasil Konten Promosi</h3>
              </div>
              <Badge variant="outline" class="text-[10px] uppercase font-mono">{{ selectedPlatform }}</Badge>
            </div>

            <!-- Empty Result Placeholder -->
            <div v-if="!generatedContent && !contentGenerating" class="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <Icon name="lucide:file-text" class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Konten Belum Di-generate</p>
              <p class="text-xs text-slate-400 max-w-xs mx-auto">Pilih produk di sebelah kiri dan klik tombol "Generate Konten Siap Pakai".</p>
            </div>

            <!-- Generated Content Variants -->
            <div v-else-if="generatedContent" class="space-y-4">
              <div
                v-for="(variant, i) in (generatedContent.variants || [generatedContent])"
                :key="i"
                class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Icon name="lucide:sparkles" class="w-3.5 h-3.5 text-emerald-600" />
                    <span>Opsi {{ i + 1 }}: {{ variant.style || 'Teks Promosi' }}</span>
                  </span>
                  <Button size="sm" variant="outline" @click="copyText(variant.caption || generatedContent.caption || '')" class="h-7 text-[11px] rounded-lg">
                    <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="w-3 h-3 text-slate-500" />
                    <span>{{ copied ? 'Tersalin' : 'Salin Teks' }}</span>
                  </Button>
                </div>

                <!-- Text Content -->
                <p class="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {{ variant.caption || generatedContent.caption }}
                </p>

                <!-- Hashtags & CTA -->
                <div v-if="variant.hashtags?.length" class="flex flex-wrap gap-1 pt-1">
                  <span v-for="tag in variant.hashtags" :key="tag" class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Execute Action -->
          <div v-if="generatedContent" class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-400">Siap dipublikasikan ke media sosial Anda.</span>
            <Button size="sm" @click="copyContent()" class="bg-[#047857] text-white text-xs font-semibold rounded-lg">
              Salin Seluruh Konten
            </Button>
          </div>
        </div>
      </div>

      <!-- STEP 4: ACTIVE MARKETING CAMPAIGNS & CHAT COPILOT -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Active Campaigns List -->
        <div class="xl:col-span-1 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px] uppercase font-bold">Langkah 4: Execute</span>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">Kampanye Aktif</h2>
            </div>
            <Badge variant="success" class="text-[10px]">Aktif</Badge>
          </div>

          <div class="space-y-3 text-xs">
            <div class="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span class="font-bold text-slate-900 dark:text-slate-100 block">Promo Stok Akhir Pekan</span>
              <span class="text-[10px] text-slate-400 block font-mono">WhatsApp + Instagram &bull; Active</span>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Stok clearance promo untuk produk terlaris toko.</p>
            </div>
          </div>
        </div>

        <!-- Chat Copilot Marketing -->
        <div class="xl:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Marketing Copilot Assistant</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tanyakan ide promosi, strategi campaign, atau copywriting tambahan.</p>

            <div class="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto space-y-2 text-xs">
              <div v-if="!chatMessages.length" class="text-slate-400 text-center py-4">
                Tanyakan strategi pemasaran atau klik contoh pertanyaan di bawah.
              </div>
              <div v-for="(msg, i) in chatMessages" :key="i" class="space-y-0.5">
                <span class="text-[10px] font-bold text-slate-400 uppercase">{{ msg.role === 'user' ? 'Anda' : 'Copilot' }}</span>
                <p class="text-slate-800 dark:text-slate-200 leading-relaxed">{{ msg.text }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <Input v-model="chatInput" type="text" placeholder="Tanyakan strategi promo toko…" class="h-9 text-xs rounded-lg" @keydown.enter.prevent="handleSendChat(chatInput)" />
            <Button size="sm" @click="handleSendChat(chatInput)" :disabled="chatSending" class="bg-[#047857] text-white text-xs h-9 font-semibold rounded-lg">
              Kirim
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMarketing } from '~/composables/useMarketing'
import Button from '~/components/ui/button.vue'
import Input from '~/components/ui/input.vue'
import Label from '~/components/ui/label.vue'
import Badge from '~/components/ui/badge.vue'
import Skeleton from '~/components/ui/skeleton.vue'

const {
  recommendations, kpis, loading, error,
  chatMessages, chatSending,
  generatedContent, contentGenerating,
  fetchRecommendations, fetchKpis, loadAll,
  sendChat, clearChat,
  generateCaption
} = useMarketing()

// ── Local state ──────────────────────────────────────────────────────
const chatInput = ref('')
const copied = ref(false)
const selectedProduct = ref('')
const selectedPlatform = ref('instagram')
const selectedGoal = ref('sales')
const selectedTone = ref('friendly')

const platforms = [
  { value: 'whatsapp',  label: 'WhatsApp',  icon: 'lucide:message-square' },
  { value: 'instagram', label: 'Instagram', icon: 'lucide:instagram' },
  { value: 'tiktok',    label: 'TikTok',    icon: 'lucide:video' },
  { value: 'facebook',  label: 'Facebook',  icon: 'lucide:facebook' },
]

const tones = [
  { value: 'friendly', label: 'Ramah & Santai' },
  { value: 'persuasive', label: 'Persuasif (Membujuk)' },
  { value: 'urgent', label: 'Darurat (Diskon Terbatas)' },
  { value: 'professional', label: 'Profesional & Resmi' },
]

const selectProductForStudio = (productName: string) => {
  selectedProduct.value = productName
  const el = document.getElementById('content-studio')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const handleGenerateContent = async () => {
  if (!selectedProduct.value) return
  await generateCaption(selectedProduct.value, selectedPlatform.value)
}

const handleSendChat = async (message: string) => {
  if (!message.trim()) return
  await sendChat(message)
  chatInput.value = ''
}

const copyContent = async () => {
  if (!generatedContent.value) return
  const variants = generatedContent.value.variants || []
  if (variants.length) {
    const text = variants.map((v: any, i: number) =>
      `${i + 1}. ${v.style || 'Teks Promosi'}\n${v.caption || ''}\n${(v.hashtags || []).join(' ')}`
    ).join('\n\n---\n\n')
    await copyText(text)
  } else {
    await copyText(generatedContent.value.caption || '')
  }
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
  }
}

onMounted(() => {
  loadAll()
})
</script>
<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
