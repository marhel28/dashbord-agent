<template>
  <div class="space-y-4 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-black tracking-tight" style="color: var(--wp-navy);">Pemasaran</h1>
        <p class="text-[10px]" style="color: var(--wp-text-secondary);">AI-powered marketing command center</p>
      </div>
      <button @click="showContentStudio = true" class="px-4 py-2 text-xs font-bold rounded-lg text-white" style="background: linear-gradient(135deg, var(--wp-gold), #B8922E);">
        + Buat Konten
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b" style="border-color: var(--wp-border);">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
              class="px-4 py-2 text-xs font-bold transition border-b-2"
              :class="activeTab === tab.id ? 'border-[var(--wp-gold)]' : 'border-transparent'"
              :style="activeTab === tab.id ? 'color: var(--wp-navy);' : 'color: var(--wp-text-secondary);'">
        {{ tab.label }}
      </button>
    </div>

    <!-- ═══ TAB: Content ═══ -->
    <div v-if="activeTab === 'content'" class="space-y-4">
      <!-- AI Recommendation -->
      <div v-if="recommendations.length" class="p-4 rounded-xl border-2" style="border-color: var(--wp-gold); background: linear-gradient(135deg, rgba(212,168,67,0.03), transparent);">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="heroicons:fire" class="w-5 h-5" style="color: var(--wp-gold);" />
          <span class="text-xs font-bold" style="color: var(--wp-navy);">Rekomendasi Hari Ini</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg" style="background: var(--wp-surface);">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold" style="color: var(--wp-text);">{{ recommendations[0].product }}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" :style="{ background: getScoreColor(recommendations[0].score) }">
                {{ recommendations[0].score }}/100
              </span>
            </div>
            <p class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">{{ recommendations[0].reason }}</p>
          </div>
          <button @click="handleGenerateCaption(recommendations[0].product)" class="px-3 py-1.5 text-[10px] font-bold rounded-lg text-white" style="background: var(--wp-gold);">
            Generate
          </button>
        </div>
      </div>

      <!-- Scheduled Content -->
      <div v-if="scheduledContent.length" class="p-4 rounded-xl border" style="border-color: var(--wp-border);">
        <span class="text-xs font-bold" style="color: var(--wp-navy);">Konten Terjadwal</span>
        <div class="mt-2 space-y-2">
          <div v-for="item in scheduledContent" :key="item.key" class="flex items-center justify-between p-2 rounded-lg" style="background: var(--wp-bg);">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium truncate" style="color: var(--wp-text);">{{ item.message }}</p>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">{{ item.cron }}</p>
            </div>
            <button @click="cancelScheduled(item)" class="text-[10px] text-red-500 hover:text-red-700">Batal</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ TAB: Campaign ═══ -->
    <div v-if="activeTab === 'campaign'" class="space-y-4">
      <!-- AI Campaign Recommendation -->
      <div v-if="campaignRecommendation" class="p-4 rounded-xl border" style="border-color: var(--wp-border);">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="heroicons:light-bulb" class="w-5 h-5" style="color: var(--wp-gold);" />
          <span class="text-xs font-bold" style="color: var(--wp-navy);">Saran Campaign AI</span>
        </div>
        <div class="p-3 rounded-lg" style="background: var(--wp-bg);">
          <p class="text-sm font-bold" style="color: var(--wp-text);">{{ campaignRecommendation.product }}</p>
          <p class="text-[10px] mt-1" style="color: var(--wp-text-secondary);">{{ campaignRecommendation.reason }}</p>
          <button @click="createCampaignFromRec" class="mt-2 px-3 py-1.5 text-[10px] font-bold rounded-lg text-white" style="background: var(--wp-gold);">
            Buat Campaign
          </button>
        </div>
      </div>

      <!-- Active Campaigns -->
      <div class="space-y-3">
        <div v-for="campaign in campaigns" :key="campaign.id" class="p-4 rounded-xl border" style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold" style="color: var(--wp-text);">{{ campaign.product_name }}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background: rgba(16,185,129,0.1); color: #059669;">
              {{ campaign.progress?.percent || 0 }}%
            </span>
          </div>
          <div class="h-1.5 rounded-full overflow-hidden mb-2" style="background: var(--wp-border);">
            <div class="h-full rounded-full" :style="{ width: (campaign.progress?.percent || 0) + '%', background: 'var(--wp-gold)' }"></div>
          </div>
          <div class="flex gap-3 text-[10px]" style="color: var(--wp-text-secondary);">
            <span>{{ campaign.progress?.total || 0 }} Steps</span>
            <span>{{ campaign.progress?.completed || 0 }} Done</span>
            <span>{{ campaign.progress?.scheduled || 0 }} Scheduled</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ TAB: Analytics ═══ -->
    <div v-if="activeTab === 'analytics'" class="space-y-4">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="kpi in kpis" :key="kpi.label" class="p-3 rounded-xl border" style="border-color: var(--wp-border);">
          <p class="text-[10px] font-medium" style="color: var(--wp-text-secondary);">{{ kpi.label }}</p>
          <p class="text-lg font-black" style="color: var(--wp-text);">{{ kpi.value }}</p>
        </div>
      </div>

      <!-- Top Products -->
      <div v-if="recommendations.length" class="p-4 rounded-xl border" style="border-color: var(--wp-border);">
        <span class="text-xs font-bold" style="color: var(--wp-navy);">Top Produk</span>
        <div class="mt-2 space-y-2">
          <div v-for="(rec, i) in recommendations.slice(0, 5)" :key="i" class="flex items-center justify-between p-2 rounded-lg" style="background: var(--wp-bg);">
            <div class="flex items-center gap-2">
              <span class="text-sm">{{ getRankIcon(i) }}</span>
              <span class="text-xs font-medium" style="color: var(--wp-text);">{{ rec.product }}</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" :style="{ background: getScoreColor(rec.score) }">
              {{ rec.score }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Content Result Modal ═══ -->
    <Teleport to="body">
      <div v-if="showContentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.6);" @click.self="showContentModal = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style="background: var(--wp-surface);">
          <div class="p-5 border-b flex items-center justify-between sticky top-0 z-10" style="border-color: var(--wp-border); background: var(--wp-surface);">
            <h3 class="text-sm font-black uppercase" style="color: var(--wp-navy);">Hasil Konten AI</h3>
            <button @click="showContentModal = false" class="p-1.5 rounded-lg hover:bg-slate-100">
              <Icon name="heroicons:x-mark" class="w-5 h-5" style="color: var(--wp-text-secondary);" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <!-- Marketing Score -->
            <div v-if="generatedContent?.marketing_score" class="flex items-center gap-3 p-3 rounded-xl" style="background: var(--wp-bg);">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white" :style="{ background: getScoreColor(generatedContent.marketing_score.score) }">
                {{ generatedContent.marketing_score.score }}
              </div>
              <div>
                <p class="text-[10px] font-bold" style="color: var(--wp-text-secondary);">Marketing Score</p>
                <p class="text-xs font-bold" style="color: var(--wp-text);">{{ generatedContent.recommendation?.strategy }}</p>
              </div>
            </div>
            <!-- Variants -->
            <div v-for="(variant, i) in generatedContent?.variants || []" :key="i" class="p-4 rounded-xl border" style="border-color: var(--wp-border);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold" style="color: var(--wp-text);">{{ variant.emoji }} {{ variant.style }}</span>
                <span v-if="variant.score" class="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" :style="{ background: getScoreColor(variant.score) }">
                  {{ variant.score }}
                </span>
              </div>
              <p class="text-xs leading-relaxed whitespace-pre-wrap mb-2" style="color: var(--wp-text);">{{ variant.caption }}</p>
              <div v-if="variant.hashtags?.length" class="flex flex-wrap gap-1">
                <span v-for="tag in variant.hashtags" :key="tag" class="text-[9px] px-1.5 py-0.5 rounded-full" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">{{ tag }}</span>
              </div>
            </div>
            <!-- Actions -->
            <div class="flex gap-2">
              <button @click="copyAllCaptions()" class="flex-1 py-2 text-xs font-bold rounded-lg text-white" style="background: var(--wp-gold);">
                {{ copied ? '✅ Tersalin!' : '📋 Copy Semua' }}
              </button>
              <button @click="openScheduleModal()" class="flex-1 py-2 text-xs font-bold rounded-lg border" style="border-color: var(--wp-border); color: var(--wp-text);">
                📅 Jadwalkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ Schedule Modal ═══ -->
    <ScheduleContentModal
      v-if="showScheduleModal"
      :content="generatedContent"
      @close="showScheduleModal = false"
      @scheduled="onContentScheduled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import ScheduleContentModal from '~/components/ScheduleContentModal.vue'
import { useMarketing } from '~/composables/useMarketing'

const {
  recommendations, kpis, campaigns, scheduledContent, campaignRecommendation,
  loading, generatedContent, contentGenerating, copied,
  loadRecommendations, loadKpis, loadCampaigns, loadScheduledContent, loadCampaignRecommendation,
  generateCaption, copyAllCaptions, cancelScheduledContent,
} = useMarketing()

const activeTab = ref<'content' | 'campaign' | 'analytics'>('content')
const showContentModal = ref(false)
const showScheduleModal = ref(false)
const showContentStudio = ref(false)

const tabs = [
  { id: 'content' as const, label: '✨ Content' },
  { id: 'campaign' as const, label: '📢 Campaign' },
  { id: 'analytics' as const, label: '📊 Analytics' },
]

// ── Helpers ──
function getRankIcon(i: number) { return ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || '•' }
function getScoreColor(score: number) {
  if (score >= 75) return '#059669'
  if (score >= 50) return '#D97706'
  return '#DC2626'
}

// ── Actions ──
async function handleGenerateCaption(product: string) {
  await generateCaption(product)
  showContentModal.value = true
}

function openScheduleModal() {
  showContentModal.value = false
  showScheduleModal.value = true
}

function onContentScheduled() {
  showScheduleModal.value = false
  loadScheduledContent()
}

async function cancelScheduled(item: any) {
  if (confirm('Batalkan pengingat ini?')) {
    await cancelScheduledContent(item.reminder_id || item.key.split(':').pop())
    loadScheduledContent()
  }
}

async function createCampaignFromRec() {
  // TODO: Implement campaign creation from recommendation
}

// ── Init (fast first paint: only recommendations + kpis) ──
onMounted(async () => {
  await Promise.all([loadRecommendations(), loadKpis()])
  // Lazy-load other data
  loadCampaigns()
  loadScheduledContent()
  loadCampaignRecommendation()
})
</script>
