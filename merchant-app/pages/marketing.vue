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
    <div v-if="loading && !overview" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style="border-color: var(--wp-gold); border-top-color: transparent;"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error && !overview" class="bg-white border p-8 shadow-sm text-center" style="border-color: var(--wp-border);">
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
        <div v-if="recommendations.length" class="space-y-3">
          <div v-for="(rec, i) in recommendations.slice(0, 3)" :key="i"
               class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-3" style="border-color: var(--wp-border); background: rgba(212,168,67,0.03);">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm" style="color: var(--wp-text);">{{ i === 0 ? '🔥' : '⭐' }}</span>
                <span class="text-sm font-bold" style="color: var(--wp-text);">{{ rec.product }}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style="background: var(--wp-gold);">
                  {{ rec.score }}
                </span>
              </div>
              <p class="text-xs mt-1" style="color: var(--wp-text-secondary);">{{ rec.ai_reason }}</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button @click="handleGenerateCaption(rec.product)"
                      :disabled="contentGenerating"
                      class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded text-white disabled:opacity-50"
                      style="background: var(--wp-gold);">
                {{ contentGenerating ? '...' : 'Buat Caption' }}
              </button>
              <button @click="handleCreateCampaign(rec.product)"
                      class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border"
                      style="border-color: var(--wp-border); color: var(--wp-text);">
                Buat Promo
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

      <!-- ═══ 3. CONTENT STUDIO + CAMPAIGN ═══ -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Content Studio -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="heroicons:pencil-square" class="w-5 h-5" style="color: var(--wp-gold);" />
            <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Content Studio</h2>
          </div>
          <p class="text-xs mb-4" style="color: var(--wp-text-secondary);">Buat konten marketing dengan AI.</p>

          <!-- Product selector -->
          <div class="mb-4">
            <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style="color: var(--wp-text-secondary);">Pilih Produk</label>
            <select v-model="selectedProduct" class="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:border-[var(--wp-gold)]" style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);">
              <option value="">-- Pilih produk --</option>
              <option v-for="rec in recommendations" :key="rec.product" :value="rec.product">{{ rec.product }}</option>
            </select>
          </div>

          <!-- Platform selector -->
          <div class="mb-4">
            <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style="color: var(--wp-text-secondary);">Platform</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="p in platforms" :key="p.value"
                      @click="selectedPlatform = p.value"
                      class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition"
                      :style="selectedPlatform === p.value ? 'background: var(--wp-gold); color: white; border-color: var(--wp-gold);' : 'border-color: var(--wp-border); color: var(--wp-text);'">
                {{ p.icon }} {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Content type buttons -->
          <div class="grid grid-cols-2 gap-2 mb-4">
            <button @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-slate-50 transition disabled:opacity-50"
                    style="border-color: var(--wp-border);">
              <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" style="color: var(--wp-gold);" />
              <span class="text-xs font-semibold" style="color: var(--wp-text);">Caption</span>
            </button>
            <button @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-slate-50 transition disabled:opacity-50"
                    style="border-color: var(--wp-border);">
              <Icon name="heroicons:video-camera" class="w-4 h-4" style="color: var(--wp-gold);" />
              <span class="text-xs font-semibold" style="color: var(--wp-text);">Script Video</span>
            </button>
            <button @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-slate-50 transition disabled:opacity-50"
                    style="border-color: var(--wp-border);">
              <Icon name="heroicons:camera" class="w-4 h-4" style="color: var(--wp-gold);" />
              <span class="text-xs font-semibold" style="color: var(--wp-text);">Ide Konten</span>
            </button>
            <button @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-slate-50 transition disabled:opacity-50"
                    style="border-color: var(--wp-border);">
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
          <button @click="showCampaignWizard = true"
                  class="mt-4 w-full py-2 text-xs font-bold uppercase tracking-wider rounded text-white"
                  style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
            + Buat Kampanye dengan AI
          </button>
        </div>
      </div>

      <!-- ═══ 4. CALENDAR + CUSTOMERS ═══ -->
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
          <button @click="handleSendChat('Buat campaign reactivation untuk pelanggan tidak aktif')"
                  class="mt-4 w-full py-2 text-xs font-bold uppercase tracking-wider rounded text-white"
                  style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
            Buat Campaign Reactivation
          </button>
        </div>
      </div>

      <!-- ═══ 5. AI RECOMMENDATIONS FEED ═══ -->
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
            <button @click="handleGenerateCaption('Keripik Pisang')" class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white shrink-0" style="background: #DC2626;">
              Eksekusi
            </button>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg border-l-4" style="border-left-color: #D97706; background: rgba(217,119,6,0.03);">
            <div>
              <p class="text-xs font-bold" style="color: var(--wp-text);">🟡 Prioritas Sedang — Buat konten TikTok Basreng</p>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">Trend pencarian meningkat</p>
            </div>
            <button @click="handleGenerateCaption('Basreng', 'tiktok')" class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white shrink-0" style="background: #D97706;">
              Generate
            </button>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg border-l-4" style="border-left-color: #059669; background: rgba(5,150,105,0.03);">
            <div>
              <p class="text-xs font-bold" style="color: var(--wp-text);">🟢 Peluang — Bundle Sambal + Keripik</p>
              <p class="text-[10px]" style="color: var(--wp-text-secondary);">Margin potensial +18%</p>
            </div>
            <button @click="handleSendChat('Buat promo bundle Sambal + Keripik')" class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white shrink-0" style="background: #059669;">
              Buat Promo
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ 6. CHAT DRAWER (Path B) ═══ -->
      <div class="bg-white border rounded-2xl shadow-sm overflow-hidden" style="border-color: var(--wp-border);">
        <div class="p-4 border-b flex items-center justify-between" style="border-color: var(--wp-border);">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:chat-bubble-oval-left-ellipsis" class="w-5 h-5" style="color: var(--wp-gold);" />
            <h2 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Asisten Marketing AI</h2>
          </div>
          <button v-if="chatMessages.length" @click="clearChat()" class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">
            Clear
          </button>
        </div>

        <!-- Messages -->
        <div class="p-4 max-h-80 overflow-y-auto space-y-3" style="background: var(--wp-bg);">
          <div v-if="!chatMessages.length" class="text-center py-6">
            <Icon name="heroicons:sparkles" class="w-8 h-8 mx-auto mb-2" style="color: var(--wp-gold);" />
            <p class="text-xs font-semibold" style="color: var(--wp-text-secondary);">Tanyakan apa saja tentang pemasaran toko Anda</p>
          </div>
          <div v-for="(msg, i) in chatMessages" :key="i"
               :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div :class="['max-w-[80%']">
              <div v-if="msg.role === 'ai' && msg.agents?.length" class="flex gap-1 mb-1">
                <span v-for="agent in msg.agents" :key="agent"
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
                  {{ agent }}
                </span>
              </div>
              <div class="px-4 py-2.5 rounded-2xl text-xs leading-relaxed"
                   :style="msg.role === 'user'
                     ? 'background: var(--wp-gold); color: white; border-bottom-right-radius: 4px;'
                     : 'background: white; color: var(--wp-text); border: 1px solid var(--wp-border); border-bottom-left-radius: 4px;'">
                <div class="whitespace-pre-wrap" v-html="formatMessage(msg.text)"></div>
              </div>
            </div>
          </div>
          <!-- Typing indicator -->
          <div v-if="chatSending" class="flex justify-start">
            <div class="px-4 py-2.5 rounded-2xl" style="background: white; border: 1px solid var(--wp-border); border-bottom-left-radius: 4px;">
              <div class="flex gap-1">
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 0ms;"></span>
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 150ms;"></span>
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 300ms;"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Example prompts -->
        <div v-if="!chatMessages.length" class="px-4 pb-3 flex gap-2 flex-wrap">
          <button v-for="prompt in examplePrompts" :key="prompt"
                  @click="handleSendChat(prompt)"
                  class="px-3 py-1.5 text-[10px] font-bold rounded-full border hover:bg-slate-50 transition"
                  style="border-color: var(--wp-border); color: var(--wp-text);">
            {{ prompt }}
          </button>
        </div>

        <!-- Input -->
        <div class="p-4 border-t flex gap-2" style="border-color: var(--wp-border);">
          <textarea
            v-model="chatInput"
            @keydown.enter.prevent="handleSendChat(chatInput); chatInput = ''"
            placeholder="Tanyakan tentang pemasaran... (contoh: buat caption untuk produk terlaris)"
            rows="1"
            class="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[var(--wp-gold)] resize-none"
            style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);"
          ></textarea>
          <button @click="handleSendChat(chatInput); chatInput = ''"
                  :disabled="!chatInput.trim() || chatSending"
                  class="px-4 py-2 rounded-lg text-white text-xs font-bold disabled:opacity-50"
                  style="background: var(--wp-gold);">
            <Icon name="heroicons:paper-airplane" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>

    <!-- ═══ CONTENT RESULT MODAL ═══ -->
    <Teleport to="body">
      <div v-if="showContentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5);" @click.self="closeContentModal">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" style="background: var(--wp-surface);">
          <div class="p-6 border-b flex items-center justify-between sticky top-0 z-10" style="border-color: var(--wp-border); background: var(--wp-surface);">
            <div class="flex items-center gap-2">
              <Icon name="heroicons:sparkles" class="w-5 h-5" style="color: var(--wp-gold);" />
              <h3 class="text-base font-black uppercase tracking-wider" style="color: var(--wp-navy);">Hasil Konten</h3>
            </div>
            <button @click="closeContentModal" class="p-1 rounded hover:bg-slate-100">
              <Icon name="heroicons:x-mark" class="w-5 h-5" style="color: var(--wp-text-secondary);" />
            </button>
          </div>
          <div class="p-6">
            <!-- Caption -->
            <div v-if="generatedContent?.caption" class="mb-4">
              <label class="block text-[10px] font-bold uppercase tracking-wider mb-2" style="color: var(--wp-text-secondary);">Caption</label>
              <div class="p-4 rounded-lg border text-xs leading-relaxed whitespace-pre-wrap" style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);">
                {{ generatedContent.caption }}
              </div>
            </div>

            <!-- Hashtags -->
            <div v-if="generatedContent?.hashtags?.length" class="mb-4">
              <label class="block text-[10px] font-bold uppercase tracking-wider mb-2" style="color: var(--wp-text-secondary);">Hashtags</label>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in generatedContent.hashtags" :key="tag"
                      class="text-xs font-semibold px-2.5 py-1 rounded-full" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Meta -->
            <div v-if="generatedContent?.platform" class="flex gap-3 mb-4 text-xs" style="color: var(--wp-text-secondary);">
              <span>Platform: <strong style="color: var(--wp-text);">{{ generatedContent.platform }}</strong></span>
              <span v-if="generatedContent?.product">Produk: <strong style="color: var(--wp-text);">{{ generatedContent.product }}</strong></span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button @click="copyContent()"
                      class="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded text-white"
                      style="background: var(--wp-gold);">
                {{ copied ? 'Tersalin!' : 'Copy' }}
              </button>
              <button @click="closeContentModal"
                      class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border"
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
  overview, recommendations, kpis, loading, error,
  chatMessages, chatSending,
  generatedContent, showContentModal, contentGenerating,
  fetchOverview, fetchRecommendations, fetchKpis, loadAll,
  sendChat, clearChat,
  generateCaption, closeContentModal, handleGenerateCaption: _generate,
} = useMarketing()

// ── Chat state ──────────────────────────────────────────────────────
const chatInput = ref('')
const copied = ref(false)

const examplePrompts = [
  'Buat caption untuk produk terlaris',
  'Strategi promo mingguan',
  'Produk apa yang harus saya promosikan?',
  'Buat campaign reactivation',
]

// ── Content studio state ────────────────────────────────────────────
const selectedProduct = ref('')
const selectedPlatform = ref('instagram')
const showCampaignWizard = ref(false)

const platforms = [
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
]

// ── Calendar cells (sample) ────────────────────────────────────────
const calendarCells = ref<Array<string | null>>([
  '📝', '🎬', null, '📢', '🎬', '📝', '🔥',
])

// ── Display KPIs ───────────────────────────────────────────────────
const displayKpis = computed(() => {
  if (kpis.value.length) {
    return kpis.value.map((k: any, i: number) => ({
      ...k,
      color: ['var(--wp-gold)', '#059669', '#3B82F6', '#D97706'][i % 4],
    }))
  }
  return [
    { label: 'Omzet 30 Hari', value: 'Rp 0', icon: 'heroicons:banknotes', color: 'var(--wp-gold)' },
    { label: 'Transaksi', value: '0', icon: 'heroicons:shopping-cart', color: '#059669' },
    { label: 'Rata-rata Order', value: 'Rp 0', icon: 'heroicons:calculator', color: '#3B82F6' },
    { label: 'Conversion', value: '0%', icon: 'heroicons:chart-bar', color: '#D97706' },
  ]
})

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
  await sendChat(`Buat campaign promo untuk ${productName}`)
}

const handleSendChat = async (message: string) => {
  if (!message.trim()) return
  await sendChat(message)
  chatInput.value = ''
}

const copyContent = async () => {
  if (!generatedContent.value) return
  const text = [
    generatedContent.value.caption,
    '',
    ...(generatedContent.value.hashtags || []),
  ].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
  }
}

// ── Format message (basic markdown) ────────────────────────────────
const formatMessage = (text: string) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(#{1,3})\s+(.+)$/gm, '<strong>$2</strong>')
    .replace(/^[•-]\s+(.+)$/gm, '<span class="ml-2">• $1</span>')
}

// ── Load data on mount ─────────────────────────────────────────────
onMounted(() => {
  loadAll()
})
</script>
