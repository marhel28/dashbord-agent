<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="border-b pb-4" style="border-color: var(--wp-navy);">
      <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Pemasaran</h1>
      <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
        Kelola promosi, konten, dan strategi penjualan toko.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !overview" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style="border-color: var(--wp-gold); border-top-color: transparent;"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white border p-8 shadow-sm text-center" style="border-color: var(--wp-border);">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <p class="text-sm font-semibold mb-3" style="color: var(--wp-text);">{{ error }}</p>
      <button @click="loadAll()" class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded text-white" style="background: var(--wp-gold);">
        Coba Lagi
      </button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- ═══ 1. AI RECOMMENDATIONS ═══ -->
      <div class="bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden" style="border-color: var(--wp-gold);">
        <div class="absolute top-0 left-0 right-0 h-1 rounded-b" style="background: linear-gradient(90deg, var(--wp-gold), var(--wp-gold-dark));"></div>
        <div class="flex items-center gap-2 mb-4">
          <Icon name="heroicons:sparkles" class="w-5 h-5" style="color: var(--wp-gold);" />
          <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Rekomendasi AI Hari Ini</h2>
        </div>
        <div v-if="overview?.recommendations?.length" class="space-y-3">
          <div v-for="(rec, i) in overview.recommendations.slice(0, 3)" :key="i"
               class="flex items-center justify-between p-4 rounded-lg border" style="border-color: var(--wp-border); background: rgba(212,168,67,0.03);">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold" style="color: var(--wp-text);">{{ rec.product || rec.name }}</span>
                <span v-if="rec.score || rec.stock" class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style="background: var(--wp-gold);">
                  Score {{ rec.score || Math.min(95, 60 + (rec.stock || 0)) }}
                </span>
              </div>
              <p class="text-xs mt-1" style="color: var(--wp-text-secondary);">{{ rec.opportunity || rec.ai_reason || 'Cocok dipromosikan minggu ini' }}</p>
            </div>
            <div class="flex gap-2">
              <button class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded text-white" style="background: var(--wp-gold);">
                Buat Promo
              </button>
              <button class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border" style="border-color: var(--wp-border); color: var(--wp-text);">
                Buat Caption
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-xs" style="color: var(--wp-text-secondary);">Belum ada rekomendasi. Tambahkan data penjualan dan stok terlebih dahulu.</p>
      </div>

      <!-- ═══ 2. KPI CARDS ═══ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="(kpi, i) in displayKpis" :key="i"
             class="bg-white border rounded-2xl p-5 shadow-sm transition hover:shadow-md relative overflow-hidden group"
             style="border-color: var(--wp-border);">
          <div class="absolute top-0 left-4 right-4 h-0.5 rounded-b" :style="{ background: kpi.color || 'var(--wp-gold)' }"></div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">{{ kpi.label }}</span>
            <Icon :name="kpi.icon || 'heroicons:chart-bar'" class="w-4 h-4" style="color: var(--wp-gold);" />
          </div>
          <p class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-text); font-variant-numeric: tabular-nums;">{{ kpi.value }}</p>
          <p v-if="kpi.change !== undefined" class="text-[11px] font-semibold mt-1.5 flex items-center gap-1"
             :style="{ color: kpi.change >= 0 ? 'var(--wp-success)' : 'var(--wp-error)' }">
            <Icon :name="kpi.change >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" class="w-3.5 h-3.5" />
            {{ kpi.change >= 0 ? '+' : '' }}{{ kpi.change }}%
          </p>
        </div>
      </div>

      <!-- ═══ 3. PRODUCT RECOMMENDATIONS ═══ -->
      <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
        <div class="flex items-center gap-2 mb-4">
          <Icon name="heroicons:fire" class="w-5 h-5" style="color: var(--wp-gold);" />
          <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Produk yang Direkomendasikan</h2>
        </div>
        <div v-if="recommendations.length" class="space-y-3">
          <div v-for="(rec, i) in recommendations" :key="i"
               class="p-4 rounded-lg border" style="border-color: var(--wp-border);">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-sm" style="color: var(--wp-text);">{{ i === 0 ? '🔥' : '⭐' }}</span>
                <span class="text-sm font-bold" style="color: var(--wp-text);">{{ rec.product }}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style="background: var(--wp-gold);">
                  {{ rec.score }}
                </span>
              </div>
              <div class="flex gap-2">
                <button class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white" style="background: var(--wp-gold);">
                  Buat Promo
                </button>
                <button class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded border" style="border-color: var(--wp-border);">
                  Buat Caption
                </button>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-2">
              <div>
                <span class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Stok</span>
                <div class="mt-1 h-1.5 rounded-full overflow-hidden" style="background: var(--wp-border);">
                  <div class="h-full rounded-full" style="width: 80%; background: var(--wp-gold);"></div>
                </div>
              </div>
              <div>
                <span class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Margin</span>
                <div class="mt-1 h-1.5 rounded-full overflow-hidden" style="background: var(--wp-border);">
                  <div class="h-full rounded-full" style="width: 65%; background: #059669;"></div>
                </div>
              </div>
              <div>
                <span class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Trend</span>
                <div class="mt-1 h-1.5 rounded-full overflow-hidden" style="background: var(--wp-border);">
                  <div class="h-full rounded-full" style="width: 45%; background: #D97706;"></div>
                </div>
              </div>
            </div>
            <p class="text-xs italic" style="color: var(--wp-text-secondary);">{{ rec.ai_reason }}</p>
          </div>
        </div>
        <p v-else class="text-xs" style="color: var(--wp-text-secondary);">Belum ada rekomendasi produk.</p>
      </div>

      <!-- ═══ 4. CONTENT STUDIO + CAMPAIGNS ═══ -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Content Studio -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="heroicons:pencil-square" class="w-5 h-5" style="color: var(--wp-gold);" />
            <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Content Studio</h2>
          </div>
          <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Buat konten marketing dengan AI.</p>
          <div class="grid grid-cols-2 gap-2">
            <button class="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-slate-50 transition" style="border-color: var(--wp-border);">
              <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" style="color: var(--wp-gold);" />
              <span class="text-xs font-semibold" style="color: var(--wp-text);">Caption</span>
            </button>
            <button class="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-slate-50 transition" style="border-color: var(--wp-border);">
              <Icon name="heroicons:video-camera" class="w-4 h-4" style="color: var(--wp-gold);" />
              <span class="text-xs font-semibold" style="color: var(--wp-text);">Script Video</span>
            </button>
            <button class="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-slate-50 transition" style="border-color: var(--wp-border);">
              <Icon name="heroicons:camera" class="w-4 h-4" style="color: var(--wp-gold);" />
              <span class="text-xs font-semibold" style="color: var(--wp-text);">Ide Konten</span>
            </button>
            <button class="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-slate-50 transition" style="border-color: var(--wp-border);">
              <Icon name="heroicons:megaphone" class="w-4 h-4" style="color: var(--wp-gold);" />
              <span class="text-xs font-semibold" style="color: var(--wp-text);">Copy Promo</span>
            </button>
          </div>
        </div>

        <!-- Campaign -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="heroicons:megaphone" class="w-5 h-5" style="color: var(--wp-gold);" />
            <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Kampanye</h2>
          </div>
          <div class="space-y-3">
            <div class="p-3 rounded-lg border flex items-center justify-between" style="border-color: var(--wp-border);">
              <div>
                <p class="text-xs font-bold" style="color: var(--wp-text);">Promo Kemerdekaan</p>
                <p class="text-[10px]" style="color: var(--wp-text-secondary);">10–17 Agustus · 15 produk</p>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style="background: #059669;">Aktif</span>
            </div>
            <div class="p-3 rounded-lg border flex items-center justify-between" style="border-color: var(--wp-border);">
              <div>
                <p class="text-xs font-bold" style="color: var(--wp-text);">Bundle Hemat</p>
                <p class="text-[10px]" style="color: var(--wp-text-secondary);">8 produk</p>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background: var(--wp-border); color: var(--wp-text-secondary);">Draft</span>
            </div>
          </div>
          <button class="mt-4 w-full py-2 text-xs font-bold uppercase tracking-wider rounded text-white" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
            + Buat Kampanye dengan AI
          </button>
        </div>
      </div>

      <!-- ═══ 5. CALENDAR + CUSTOMERS ═══ -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Content Calendar -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="heroicons:calendar-days" class="w-5 h-5" style="color: var(--wp-gold);" />
            <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Kalender Konten</h2>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center">
            <div v-for="day in ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']" :key="day"
                 class="text-[9px] font-bold uppercase tracking-wider py-2" style="color: var(--wp-text-secondary);">
              {{ day }}
            </div>
            <div v-for="(cell, i) in calendarCells" :key="i"
                 class="py-2 rounded text-center min-h-[36px] flex items-center justify-center"
                 :style="cell ? 'background: rgba(212,168,67,0.1);' : ''">
              <span v-if="cell" class="text-sm">{{ cell }}</span>
              <span v-else class="text-xs" style="color: var(--wp-border);">·</span>
            </div>
          </div>
        </div>

        <!-- Customer Targeting -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="heroicons:user-group" class="w-5 h-5" style="color: var(--wp-gold);" />
            <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Target Pelanggan</h2>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg border" style="border-color: var(--wp-border);">
              <div class="flex items-center gap-2">
                <span class="text-sm">⭐</span>
                <span class="text-xs font-bold" style="color: var(--wp-text);">VIP</span>
              </div>
              <span class="text-xs font-bold" style="color: var(--wp-gold);">18 pelanggan</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg border" style="border-color: var(--wp-border);">
              <div class="flex items-center gap-2">
                <span class="text-sm">🔥</span>
                <span class="text-xs font-bold" style="color: var(--wp-text);">Aktif</span>
              </div>
              <span class="text-xs font-bold" style="color: var(--wp-gold);">128 pelanggan</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg border" style="border-color: var(--wp-border);">
              <div class="flex items-center gap-2">
                <span class="text-sm">💤</span>
                <span class="text-xs font-bold" style="color: var(--wp-text);">Tidak Aktif</span>
              </div>
              <span class="text-xs font-bold" style="color: var(--wp-gold);">47 pelanggan</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg border" style="border-color: var(--wp-border);">
              <div class="flex items-center gap-2">
                <span class="text-sm">⚠️</span>
                <span class="text-xs font-bold" style="color: var(--wp-text);">Reactivation</span>
              </div>
              <span class="text-xs font-bold" style="color: #DC2626;">23 pelanggan</span>
            </div>
          </div>
          <button class="mt-4 w-full py-2 text-xs font-bold uppercase tracking-wider rounded text-white" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
            Buat Campaign Reactivation
          </button>
        </div>
      </div>

      <!-- ═══ 6. AI RECOMMENDATIONS FEED ═══ -->
      <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
        <div class="flex items-center gap-2 mb-4">
          <Icon name="heroicons:light-bulb" class="w-5 h-5" style="color: var(--wp-gold);" />
          <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Rekomendasi AI</h2>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-lg border-l-4" style="border-left-color: #DC2626; background: rgba(220,38,38,0.03);">
            <div>
              <p class="text-xs font-bold" style="color: var(--wp-text);">🔴 Prioritas Tinggi — Promosikan Keripik Pisang</p>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">Stok tinggi dan sales turun</p>
            </div>
            <button class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white" style="background: #DC2626;">Eksekusi</button>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg border-l-4" style="border-left-color: #D97706; background: rgba(217,119,6,0.03);">
            <div>
              <p class="text-xs font-bold" style="color: var(--wp-text);">🟡 Prioritas Sedang — Buat konten TikTok Basreng</p>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">Trend pencarian meningkat</p>
            </div>
            <button class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white" style="background: #D97706;">Generate</button>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg border-l-4" style="border-left-color: #059669; background: rgba(5,150,105,0.03);">
            <div>
              <p class="text-xs font-bold" style="color: var(--wp-text);">🟢 Peluang — Bundle Sambal + Keripik</p>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">Margin potensial +18%</p>
            </div>
            <button class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white" style="background: #059669;">Buat Promo</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMarketing } from '~/composables/useMarketing'

const {
  overview, recommendations, kpis, loading, error,
  fetchOverview, fetchRecommendations, fetchKpis, loadAll,
} = useMarketing()

// ── Calendar cells (sample) ────────────────────────────────────────
const calendarCells = ref<Array<string | null>>([
  '📝', '🎬', null, '📢', '🎬', '📝', '🔥',
])

// ── Display KPIs (fallback to overview KPIs) ───────────────────────
const displayKpis = computed(() => {
  if (kpis.value.length) {
    return kpis.value.map((k: any, i: number) => ({
      ...k,
      color: ['var(--wp-gold)', '#059669', '#3B82F6', '#D97706'][i % 4],
    }))
  }
  if (overview.value?.kpis?.length) {
    return overview.value.kpis.map((k: any, i: number) => ({
      ...k,
      color: ['var(--wp-gold)', '#059669', '#3B82F6', '#D97706'][i % 4],
    }))
  }
  return [
    { label: 'Omzet 30 Hari', value: 'Rp 0', icon: 'heroicons:banknotes', color: 'var(--wp-gold)' },
    { label: 'Transaksi', value: '0', icon: 'heroicons:shopping-cart', color: '#059669' },
    { label: 'Campaign Aktif', value: '0', icon: 'heroicons:megaphone', color: '#3B82F6' },
    { label: 'Conversion', value: '0%', icon: 'heroicons:chart-bar', color: '#D97706' },
  ]
})

// ── Load data on mount ─────────────────────────────────────────────
onMounted(() => {
  loadAll()
})
</script>
