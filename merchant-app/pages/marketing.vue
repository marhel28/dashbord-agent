<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="border-b pb-4" style="border-color: var(--wp-navy);">
      <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Pemasaran</h1>
      <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
        Kelola promosi, konten, dan strategi penjualan toko.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading && !recommendations.length" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 mx-auto mb-4" style="border-color: rgba(212,168,67,0.2); border-top-color: var(--wp-gold);"></div>
        <p class="text-xs font-semibold" style="color: var(--wp-text-secondary);">Menganalisis data toko Anda...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error && !recommendations.length" class="bg-white border p-8 shadow-sm text-center rounded-2xl" style="border-color: var(--wp-border);">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 mx-auto mb-4" style="color: #D97706;" />
      <p class="text-sm font-semibold mb-3" style="color: var(--wp-text);">{{ error }}</p>
      <button @click="loadAll()" class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded text-white" style="background: var(--wp-gold);">
        Coba Lagi
      </button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- ═══ 1. PRODUK REKOMENDASI AI (Hero) ═══ -->
      <div class="bg-white border-2 rounded-2xl p-6 shadow-sm relative overflow-hidden" style="border-color: var(--wp-gold);">
        <div class="absolute top-0 left-0 right-0 h-1.5 rounded-b" style="background: linear-gradient(90deg, var(--wp-gold), #B8922E);"></div>
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, var(--wp-gold), #B8922E);">
              <Icon name="heroicons:fire" class="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Produk Rekomendasi AI</h2>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">Berdasarkan penjualan, stok, margin & tren</p>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2.5 py-1 rounded-full" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
            {{ recommendations.length }} produk
          </span>
        </div>

        <div v-if="recommendations.length" class="space-y-3">
          <div v-for="(rec, i) in recommendations.slice(0, 5)" :key="i"
               class="p-4 rounded-xl border transition hover:shadow-md"
               :style="i === 0 ? 'border-color: var(--wp-gold); background: linear-gradient(135deg, rgba(212,168,67,0.05), rgba(212,168,67,0.02));' : 'border-color: var(--wp-border); background: var(--wp-surface);'">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg">{{ getRankIcon(i) }}</span>
                  <span class="text-sm font-bold truncate" style="color: var(--wp-text);">{{ rec.product }}</span>
                  <span class="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shrink-0" :style="{ background: getScoreColor(rec.score) }">
                    Score {{ rec.score }}
                  </span>
                  <span v-if="rec.data?.stock_qty" class="text-[10px] font-bold px-2 py-0.5 rounded" style="background: var(--wp-bg); color: var(--wp-text-secondary);">
                    Stok: {{ rec.data.stock_qty }}
                  </span>
                </div>
                <!-- Component bars -->
                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div v-for="(value, key) in rec.components || {}" :key="key">
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">{{ getComponentLabel(key) }}</span>
                      <span class="text-[9px] font-bold" :style="{ color: getScoreColor(value) }">{{ value }}</span>
                    </div>
                    <div class="h-1.5 rounded-full overflow-hidden" style="background: var(--wp-border);">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: value + '%', background: getScoreColor(value) }"></div>
                    </div>
                  </div>
                </div>
                <p class="text-xs leading-relaxed" style="color: var(--wp-text-secondary);">{{ rec.reason }}</p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button @click="handleGenerateCaption(rec.product)"
                        :disabled="contentGenerating"
                        class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-white disabled:opacity-50 transition hover:shadow-md"
                        style="background: linear-gradient(135deg, var(--wp-gold), #B8922E);">
                  {{ contentGenerating ? '⏳' : '✍️' }} Caption
                </button>
                <button @click="handleCreateCampaign(rec.product)"
                        class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition hover:shadow-md"
                        style="border-color: var(--wp-border); color: var(--wp-text);">
                  🎯 Promo
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-center py-8" style="color: var(--wp-text-secondary);">
          Belum ada data produk. Pastikan Anda memiliki stok dan transaksi penjualan.
        </p>
      </div>

      <!-- ═══ 2. KPI + CONTENT STUDIO ═══ -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- KPI Cards -->
        <div class="xl:col-span-1 space-y-4">
          <h3 class="text-sm font-black uppercase tracking-wider" style="color: var(--wp-navy);">📊 KPI Marketing</h3>
          <div v-for="(kpi, i) in displayKpis" :key="i"
               class="bg-white border rounded-xl p-4 shadow-sm transition hover:shadow-md relative overflow-hidden"
               style="border-color: var(--wp-border);">
            <div class="absolute top-0 left-3 right-3 h-0.5 rounded-b" :style="{ background: kpi.color || 'var(--wp-gold)' }"></div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">{{ kpi.label }}</span>
              <Icon :name="kpi.icon || 'heroicons:chart-bar'" class="w-4 h-4" style="color: var(--wp-gold);" />
            </div>
            <p class="text-xl font-extrabold tracking-tight" style="color: var(--wp-text); font-variant-numeric: tabular-nums;">{{ kpi.value }}</p>
          </div>
        </div>

        <!-- Content Studio -->
        <div class="xl:col-span-2 bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
              <Icon name="heroicons:pencil-square" class="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Content Studio</h2>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">Buat konten marketing dengan AI</p>
            </div>
          </div>

          <!-- Product selector with stock -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style="color: var(--wp-text-secondary);">Produk</label>
              <select v-model="selectedProduct" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:border-[var(--wp-gold)]" style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);">
                <option value="">-- Pilih produk --</option>
                <option v-for="rec in recommendations" :key="rec.uuid" :value="rec.product">
                  {{ rec.product }} (Stok: {{ rec.data?.stock_qty || 0 }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style="color: var(--wp-text-secondary);">Platform</label>
              <div class="flex gap-2 flex-wrap">
                <button v-for="p in platforms" :key="p.value"
                        @click="selectedPlatform = p.value"
                        class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition"
                        :style="selectedPlatform === p.value ? 'background: var(--wp-gold); color: white; border-color: var(--wp-gold);' : 'border-color: var(--wp-border); color: var(--wp-text);'">
                  {{ p.icon }} {{ p.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Content type buttons -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center hover:shadow-md transition disabled:opacity-40"
                    style="border-color: var(--wp-border); background: linear-gradient(135deg, rgba(212,168,67,0.05), transparent);">
              <span class="text-xl">✍️</span>
              <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text);">Caption</span>
            </button>
            <button @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center hover:shadow-md transition disabled:opacity-40"
                    style="border-color: var(--wp-border); background: linear-gradient(135deg, rgba(139,92,246,0.05), transparent);">
              <span class="text-xl">🎬</span>
              <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text);">Script Video</span>
            </button>
            <button @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center hover:shadow-md transition disabled:opacity-40"
                    style="border-color: var(--wp-border); background: linear-gradient(135deg, rgba(5,150,105,0.05), transparent);">
              <span class="text-xl">📸</span>
              <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text);">Ide Konten</span>
            </button>
            <button @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center hover:shadow-md transition disabled:opacity-40"
                    style="border-color: var(--wp-border); background: linear-gradient(135deg, rgba(217,119,6,0.05), transparent);">
              <span class="text-xl">📢</span>
              <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text);">Copy Promo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ 3. CHAT ASSISTANT ═══ -->
      <div class="bg-white border rounded-2xl shadow-sm overflow-hidden" style="border-color: var(--wp-border);">
        <div class="p-4 border-b flex items-center justify-between" style="border-color: var(--wp-border); background: linear-gradient(135deg, rgba(212,168,67,0.03), transparent);">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #059669, #047857);">
              <Icon name="heroicons:chat-bubble-oval-left-ellipsis" class="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Asisten Marketing AI</h2>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">Tanyakan strategi, promo, atau konten</p>
            </div>
          </div>
          <button v-if="chatMessages.length" @click="clearChat()" class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-slate-100" style="color: var(--wp-text-secondary);">
            Clear
          </button>
        </div>

        <!-- Messages -->
        <div class="p-4 max-h-96 overflow-y-auto space-y-3" style="background: var(--wp-bg);">
          <div v-if="!chatMessages.length" class="text-center py-8">
            <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style="background: linear-gradient(135deg, rgba(212,168,67,0.1), rgba(139,92,246,0.1));">
              <Icon name="heroicons:light-bulb" class="w-8 h-8" style="color: var(--wp-gold);" />
            </div>
            <p class="text-sm font-semibold mb-2" style="color: var(--wp-text);">Apa yang ingin Anda promosikan hari ini?</p>
            <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Tanyakan tentang strategi, promo, atau konten untuk toko Anda</p>
            <div class="flex gap-2 flex-wrap justify-center">
              <button v-for="prompt in examplePrompts" :key="prompt"
                      @click="handleSendChat(prompt)"
                      class="px-3 py-1.5 text-[10px] font-bold rounded-full border hover:shadow-md transition"
                      style="border-color: var(--wp-border); color: var(--wp-text); background: var(--wp-surface);">
                {{ prompt }}
              </button>
            </div>
          </div>
          <div v-for="(msg, i) in chatMessages" :key="i"
               :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div class="max-w-[85%]">
              <div v-if="msg.role === 'ai' && msg.agents?.length" class="flex gap-1 mb-1">
                <span v-for="agent in msg.agents" :key="agent"
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
                  {{ agent }}
                </span>
              </div>
              <div class="px-4 py-3 rounded-2xl text-xs leading-relaxed"
                   :style="msg.role === 'user'
                     ? 'background: linear-gradient(135deg, var(--wp-gold), #B8922E); color: white; border-bottom-right-radius: 6px;'
                     : 'background: white; color: var(--wp-text); border: 1px solid var(--wp-border); border-bottom-left-radius: 6px;'">
                <div class="whitespace-pre-wrap" v-html="formatMessage(msg.text)"></div>
              </div>
            </div>
          </div>
          <!-- Typing -->
          <div v-if="chatSending" class="flex justify-start">
            <div class="px-4 py-3 rounded-2xl" style="background: white; border: 1px solid var(--wp-border); border-bottom-left-radius: 6px;">
              <div class="flex gap-1.5">
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 0ms;"></span>
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 150ms;"></span>
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 300ms;"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t flex gap-2" style="border-color: var(--wp-border); background: var(--wp-surface);">
          <textarea
            v-model="chatInput"
            @keydown.enter.prevent="handleSendChat(chatInput); chatInput = ''"
            placeholder="Tanyakan tentang pemasaran... (contoh: buat caption untuk produk terlaris)"
            rows="1"
            class="flex-1 px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[var(--wp-gold)] resize-none"
            style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);"
          ></textarea>
          <button @click="handleSendChat(chatInput); chatInput = ''"
                  :disabled="!chatInput.trim() || chatSending"
                  class="px-4 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-50 transition hover:shadow-md"
                  style="background: linear-gradient(135deg, var(--wp-gold), #B8922E);">
            <Icon name="heroicons:paper-airplane" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>

    <!-- ═══ CONTENT RESULT MODAL (3 Variants) ═══ -->
    <Teleport to="body">
      <div v-if="showContentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.6);" @click.self="closeContentModal">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style="background: var(--wp-surface);">
          <div class="p-6 border-b flex items-center justify-between sticky top-0 z-10" style="border-color: var(--wp-border); background: var(--wp-surface);">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, var(--wp-gold), #B8922E);">
                <Icon name="heroicons:sparkles" class="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Hasil Konten AI</h3>
                <p class="text-[10px]" style="color: var(--wp-text-secondary);">{{ generatedContent?.product }} — 3 varian caption dinamis</p>
              </div>
            </div>
            <button @click="closeContentModal" class="p-1.5 rounded-lg hover:bg-slate-100 transition">
              <Icon name="heroicons:x-mark" class="w-5 h-5" style="color: var(--wp-text-secondary);" />
            </button>
          </div>
          <div class="p-6">
            <!-- Variant Tabs -->
            <div v-if="generatedContent?.variants?.length" class="space-y-4">
              <div v-for="(variant, i) in generatedContent.variants" :key="i"
                   class="p-4 rounded-xl border"
                   :style="i === 0 ? 'border-color: var(--wp-gold); background: linear-gradient(135deg, rgba(212,168,67,0.05), transparent);' : 'border-color: var(--wp-border);'">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-bold" style="color: var(--wp-text);">{{ variant.style || 'Caption' }}</span>
                  <button @click="copyText(variant.caption || '')" class="text-[10px] font-bold px-2 py-1 rounded" style="background: var(--wp-bg); color: var(--wp-text-secondary);">
                    📋 Copy
                  </button>
                </div>
                <p class="text-xs leading-relaxed whitespace-pre-wrap mb-3" style="color: var(--wp-text);">{{ variant.caption || 'Tidak ada caption' }}</p>
                <!-- Hashtags -->
                <div v-if="variant.hashtags?.length" class="flex flex-wrap gap-1.5 mb-2">
                  <span v-for="tag in variant.hashtags" :key="tag" class="text-[10px] font-semibold px-2 py-0.5 rounded-full" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
                    {{ tag }}
                  </span>
                </div>
                <!-- CTA + Headline -->
                <div v-if="variant.cta || variant.headline" class="flex gap-2 flex-wrap text-[10px]" style="color: var(--wp-text-secondary);">
                  <span v-if="variant.cta" class="px-2 py-0.5 rounded" style="background: var(--wp-bg);">CTA: <strong style="color: var(--wp-text);">{{ variant.cta }}</strong></span>
                  <span v-if="variant.headline" class="px-2 py-0.5 rounded" style="background: var(--wp-bg);">Headline: <strong style="color: var(--wp-text);">{{ variant.headline }}</strong></span>
                </div>
                <!-- Image Idea -->
                <p v-if="variant.image_idea" class="text-[10px] italic mt-2" style="color: var(--wp-text-secondary);">💡 {{ variant.image_idea }}</p>
              </div>
            </div>

            <!-- Fallback: single caption -->
            <div v-else-if="generatedContent?.caption" class="mb-4">
              <div class="p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap" style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);">
                {{ generatedContent.caption }}
              </div>
            </div>

            <!-- Meta -->
            <div v-if="generatedContent?.platform" class="flex gap-3 mb-4 text-xs flex-wrap mt-4" style="color: var(--wp-text-secondary);">
              <span class="px-2 py-1 rounded" style="background: var(--wp-bg);">Platform: <strong style="color: var(--wp-text);">{{ generatedContent.platform }}</strong></span>
              <span v-if="generatedContent?.product" class="px-2 py-1 rounded" style="background: var(--wp-bg);">Produk: <strong style="color: var(--wp-text);">{{ generatedContent.product }}</strong></span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button @click="copyContent()"
                      class="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition hover:shadow-md"
                      style="background: linear-gradient(135deg, var(--wp-gold), #B8922E);">
                {{ copied ? '✅ Tersalin!' : '📋 Copy Semua Caption' }}
              </button>
              <button @click="closeContentModal"
                      class="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition"
                      style="border-color: var(--wp-border); color: var(--wp-text);">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMarketing } from '~/composables/useMarketing'

const {
  recommendations, kpis, loading, error,
  chatMessages, chatSending,
  generatedContent, showContentModal, contentGenerating,
  fetchRecommendations, fetchKpis, loadAll,
  sendChat, clearChat,
  generateCaption, closeContentModal,
} = useMarketing()

// ── Chat state ──────────────────────────────────────────────────────
const chatInput = ref('')
const copied = ref(false)

const examplePrompts = [
  'Buat caption untuk produk terlaris',
  'Strategi promo mingguan',
  'Produk apa yang harus saya promosikan?',
  'Ide konten TikTok untuk snack',
]

// ── Content studio state ────────────────────────────────────────────
const selectedProduct = ref('')
const selectedPlatform = ref('instagram')

const platforms = [
  { value: 'whatsapp', label: 'WA', icon: '💬' },
  { value: 'instagram', label: 'IG', icon: '📸' },
  { value: 'tiktok', label: 'TT', icon: '🎵' },
  { value: 'facebook', label: 'FB', icon: '👥' },
]

// ── Helpers ────────────────────────────────────────────────────────

const getRankIcon = (i: number) => ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || '⭐'

const getScoreColor = (score: number) => {
  if (score >= 80) return '#D4A843'  // gold
  if (score >= 60) return '#059669'  // green
  if (score >= 40) return '#D97706'  // amber
  return '#64748B'  // gray
}

const getComponentLabel = (key: string) => ({
  stock: 'Stok',
  trend: 'Tren',
  margin: 'Margin',
  potential: 'Potensi',
  promo: 'Promo',
  seasonal: 'Musim',
}[key] || key)

const formatMessage = (text: string) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

// ── Handlers ───────────────────────────────────────────────────────

const handleGenerateCaption = async (productName?: string, platform?: string) => {
  const product = productName || selectedProduct.value
  if (!product) return
  try {
    await generateCaption(product, platform || selectedPlatform.value)
  } catch (err) {
    // error handled in composable
  }
}

const handleCreateCampaign = async (productName: string) => {
  await sendChat(`Buat strategi promo untuk ${productName}`)
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
      `${i + 1}. ${v.style || 'Caption'}\n${v.caption || ''}\n${(v.hashtags || []).join(' ')}\nCTA: ${v.cta || '-'}`
    ).join('\n\n---\n\n')
    await copyText(text)
  } else {
    const text = [
      generatedContent.value.caption || '',
      '',
      ...(generatedContent.value.hashtags || []),
    ].join('\n')
    await copyText(text)
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

// ── Display KPIs ──────────────────────────────────────────────────

const displayKpis = computed(() => {
  if (kpis.value.length) {
    return kpis.value.map((k: any, i: number) => ({
      ...k,
      color: ['#D4A843', '#059669', '#3B82F6', '#8B5CF6'][i % 4],
    }))
  }
  return [
    { label: 'Omzet 30 Hari', value: 'Rp 0', icon: 'heroicons:banknotes', color: '#D4A843' },
    { label: 'Transaksi', value: '0', icon: 'heroicons:shopping-cart', color: '#059669' },
    { label: 'Rata-rata Order', value: 'Rp 0', icon: 'heroicons:calculator', color: '#3B82F6' },
    { label: 'Conversion', value: '0%', icon: 'heroicons:chart-bar', color: '#8B5CF6' },
  ]
})

// ── Load data ──────────────────────────────────────────────────────

onMounted(() => {
  loadAll()
})
</script>
