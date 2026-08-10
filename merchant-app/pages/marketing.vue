<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ═══ HEADER ═══ -->
    <div class="flex items-center justify-between border-b pb-5" style="border-color: var(--wp-border);">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
          <Icon name="heroicons:megaphone" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Pemasaran</h1>
          <p class="text-xs font-medium mt-0.5" style="color: var(--wp-text-secondary);">
            Kelola promosi, konten, dan strategi penjualan toko
          </p>
        </div>
      </div>
      <button @click="loadAll()"
              :disabled="loading"
              class="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition hover:shadow-sm disabled:opacity-50"
              style="border-color: var(--wp-border); color: var(--wp-text-secondary); background: var(--wp-surface);">
        <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <!-- ═══ LOADING ═══ -->
    <div v-if="loading && !recommendations.length" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div class="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
             style="background: rgba(212,168,67,0.08);">
          <Icon name="heroicons:arrow-path" class="w-7 h-7 animate-spin" style="color: var(--wp-gold);" />
        </div>
        <p class="text-sm font-semibold" style="color: var(--wp-text);">Menganalisis data toko...</p>
        <p class="text-xs mt-1" style="color: var(--wp-text-secondary);">Mohon tunggu sebentar</p>
      </div>
    </div>

    <!-- ═══ ERROR ═══ -->
    <div v-else-if="error && !recommendations.length"
         class="bg-white border rounded-xl p-10 shadow-sm text-center"
         style="border-color: var(--wp-border);">
      <div class="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
           style="background: rgba(220,38,38,0.08);">
        <Icon name="heroicons:exclamation-triangle" class="w-7 h-7" style="color: #DC2626;" />
      </div>
      <p class="text-sm font-bold mb-1" style="color: var(--wp-text);">Gagal memuat data</p>
      <p class="text-xs mb-5" style="color: var(--wp-text-secondary);">{{ error }}</p>
      <button @click="loadAll()"
              class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg text-white transition hover:shadow-md"
              style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
        <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
        Coba Lagi
      </button>
    </div>

    <!-- ═══ MAIN CONTENT ═══ -->
    <template v-else>

      <!-- ═══ 1. KPI STRIP ═══ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div v-for="(kpi, i) in displayKpis" :key="i"
             class="bg-white border rounded-xl p-4 shadow-sm transition hover:shadow-md"
             style="border-color: var(--wp-border);">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">{{ kpi.label }}</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" :style="{ background: kpi.color + '18' }">
              <Icon :name="kpi.icon || 'heroicons:chart-bar'" class="w-3.5 h-3.5" :style="{ color: kpi.color }" />
            </div>
          </div>
          <p class="text-xl font-black tracking-tight leading-none" style="color: var(--wp-text); font-variant-numeric: tabular-nums;">
            {{ kpi.value }}
          </p>
        </div>
      </div>

      <!-- ═══ 2. PRODUK REKOMENDASI AI ═══ -->
      <div class="bg-white border-2 rounded-xl shadow-sm"
           style="border-color: var(--wp-gold);">

        <!-- header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
              <Icon name="heroicons:fire" class="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 class="text-sm font-black uppercase tracking-wider" style="color: var(--wp-navy);">Rekomendasi Produk AI</h2>
              <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">Berdasarkan penjualan, stok, margin & tren pasar</p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
            <Icon name="heroicons:cube" class="w-3 h-3" />
            {{ recommendations.length }} produk
          </span>
        </div>

        <!-- product list -->
        <div v-if="recommendations.length" class="px-6 pb-6 space-y-3">
          <div v-for="(rec, i) in recommendations.slice(0, 5)" :key="i"
               class="p-4 rounded-xl border transition hover:shadow-md cursor-default"
               :style="i === 0
                 ? 'border-color: var(--wp-gold); background: linear-gradient(135deg, rgba(212,168,67,0.06), rgba(212,168,67,0.01));'
                 : 'border-color: var(--wp-border); background: var(--wp-bg);'">
            <div class="flex flex-col lg:flex-row lg:items-start gap-4">
              <!-- rank + info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2.5 flex-wrap">
                  <!-- rank badge -->
                  <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-black"
                       :style="{ background: i === 0 ? '#D4A843' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : 'var(--wp-border)' }">
                    {{ i + 1 }}
                  </div>
                  <span class="text-sm font-bold truncate" style="color: var(--wp-text);">{{ rec.product }}</span>
                  <!-- score chip -->
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded text-white shrink-0"
                        :style="{ background: getScoreColor(rec.score) }">
                    <Icon name="heroicons:star" class="w-2.5 h-2.5" />
                    {{ rec.score }}
                  </span>
                  <!-- stock chip -->
                  <span v-if="rec.data?.stock_qty"
                        class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded"
                        style="background: var(--wp-bg); color: var(--wp-text-secondary);">
                    <Icon name="heroicons:archive-box" class="w-2.5 h-2.5" />
                    {{ rec.data.stock_qty }}
                  </span>
                </div>

                <!-- component progress bars -->
                <div class="grid grid-cols-3 gap-x-4 gap-y-2 mb-2.5">
                  <div v-for="(value, key) in rec.components || {}" :key="key">
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">
                        {{ getComponentLabel(key) }}
                      </span>
                      <span class="text-[9px] font-bold" :style="{ color: getScoreColor(value) }">{{ value }}</span>
                    </div>
                    <div class="h-1 rounded-full overflow-hidden" style="background: var(--wp-border);">
                      <div class="h-full rounded-full transition-all duration-700"
                           :style="{ width: value + '%', background: getScoreColor(value) }"></div>
                    </div>
                  </div>
                </div>

                <p class="text-xs leading-relaxed" style="color: var(--wp-text-secondary);">{{ rec.reason }}</p>
              </div>

              <!-- action buttons -->
              <div class="flex gap-2 shrink-0">
                <button @click="handleGenerateCaption(rec.product)"
                        :disabled="contentGenerating"
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-white disabled:opacity-50 transition hover:shadow-md"
                        style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
                  <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" />
                  Caption
                </button>
                <button @click="handleCreateCampaign(rec.product)"
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition hover:shadow-md"
                        style="border-color: var(--wp-border); color: var(--wp-text); background: var(--wp-surface);">
                  <Icon name="heroicons:megaphone" class="w-3.5 h-3.5" />
                  Promo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="px-6 pb-10 text-center">
          <div class="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
               style="background: rgba(212,168,67,0.08);">
            <Icon name="heroicons:cube-transparent" class="w-6 h-6" style="color: var(--wp-gold);" />
          </div>
          <p class="text-sm font-semibold" style="color: var(--wp-text);">Belum ada data produk</p>
          <p class="text-xs mt-1" style="color: var(--wp-text-secondary);">Pastikan Anda memiliki stok dan transaksi penjualan.</p>
        </div>
      </div>

      <!-- ═══ 3. CONTENT STUDIO ═══ -->
      <div class="bg-white border rounded-xl shadow-sm" style="border-color: var(--wp-border);">
        <!-- section header -->
        <div class="flex items-center gap-3 px-6 pt-5 pb-4 border-b" style="border-color: var(--wp-border);">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
            <Icon name="heroicons:sparkles" class="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 class="text-sm font-black uppercase tracking-wider" style="color: var(--wp-navy);">Content Studio</h2>
            <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">Buat konten marketing dengan bantuan AI</p>
          </div>
        </div>

        <div class="p-6">
          <!-- controls: product + platform -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <!-- product select -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                     style="color: var(--wp-text-secondary);">
                <Icon name="heroicons:cube" class="w-3 h-3 inline mr-0.5" />
                Pilih Produk
              </label>
              <select v-model="selectedProduct"
                      class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none transition"
                      style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);">
                <option value="">-- Pilih produk --</option>
                <option v-for="rec in recommendations" :key="rec.uuid" :value="rec.product">
                  {{ rec.product }} (Stok: {{ rec.data?.stock_qty || 0 }})
                </option>
              </select>
            </div>

            <!-- platform tabs -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                     style="color: var(--wp-text-secondary);">
                <Icon name="heroicons:device-phone-mobile" class="w-3 h-3 inline mr-0.5" />
                Platform
              </label>
              <div class="flex gap-2 flex-wrap">
                <button v-for="p in platforms" :key="p.value"
                        @click="selectedPlatform = p.value"
                        class="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition"
                        :style="selectedPlatform === p.value
                          ? 'background: var(--wp-gold); color: white; border-color: var(--wp-gold);'
                          : 'border-color: var(--wp-border); color: var(--wp-text-secondary); background: var(--wp-bg);'">
                  <Icon :name="p.icon" class="w-3.5 h-3.5" />
                  {{ p.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- content type grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button v-for="ct in contentTypes" :key="ct.key"
                    @click="handleGenerateCaption(selectedProduct, selectedPlatform)"
                    :disabled="!selectedProduct || contentGenerating"
                    class="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    :style="`border-color: var(--wp-border); background: linear-gradient(135deg, ${ct.bg}, transparent);`">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   :style="{ background: ct.iconBg }">
                <Icon :name="ct.icon" class="w-5 h-5 text-white" />
              </div>
              <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text);">{{ ct.label }}</span>
              <span class="text-[9px]" style="color: var(--wp-text-secondary);">{{ ct.desc }}</span>
            </button>
          </div>

          <!-- generating indicator -->
          <div v-if="contentGenerating" class="mt-4 flex items-center gap-2 text-xs"
               style="color: var(--wp-gold);">
            <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5 animate-spin" />
            <span class="font-semibold">Membuat konten...</span>
          </div>
        </div>
      </div>

      <!-- ═══ 4. CHAT ASSISTANT ═══ -->
      <div class="bg-white border rounded-xl shadow-sm overflow-hidden" style="border-color: var(--wp-border);">
        <!-- chat header -->
        <div class="flex items-center justify-between px-6 py-4 border-b"
             style="border-color: var(--wp-border); background: linear-gradient(135deg, rgba(5,150,105,0.04), transparent);">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style="background: linear-gradient(135deg, #059669, #047857);">
              <Icon name="heroicons:chat-bubble-left-right" class="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 class="text-sm font-black uppercase tracking-wider" style="color: var(--wp-navy);">Asisten Marketing AI</h2>
              <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">Tanyakan strategi, promo, atau konten</p>
            </div>
          </div>
          <button v-if="chatMessages.length"
                  @click="clearChat()"
                  class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition hover:bg-slate-50"
                  style="border-color: var(--wp-border); color: var(--wp-text-secondary);">
            <Icon name="heroicons:trash" class="w-3 h-3" />
            Hapus
          </button>
        </div>

        <!-- message area -->
        <div class="p-4 max-h-96 overflow-y-auto space-y-3" style="background: var(--wp-bg);">
          <!-- empty state -->
          <div v-if="!chatMessages.length" class="text-center py-10">
            <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                 style="background: linear-gradient(135deg, rgba(212,168,67,0.12), rgba(139,92,246,0.08));">
              <Icon name="heroicons:light-bulb" class="w-8 h-8" style="color: var(--wp-gold);" />
            </div>
            <p class="text-sm font-semibold mb-1" style="color: var(--wp-text);">Apa yang ingin Anda promosikan hari ini?</p>
            <p class="text-xs mb-5" style="color: var(--wp-text-secondary);">Tanyakan strategi, promo, atau konten untuk toko Anda</p>
            <!-- prompt chips -->
            <div class="flex gap-2 flex-wrap justify-center">
              <button v-for="prompt in examplePrompts" :key="prompt"
                      @click="handleSendChat(prompt)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-full border hover:shadow-md transition"
                      style="border-color: var(--wp-border); color: var(--wp-text); background: var(--wp-surface);">
                <Icon name="heroicons:chat-bubble-oval-left" class="w-3 h-3" style="color: var(--wp-gold);" />
                {{ prompt }}
              </button>
            </div>
          </div>

          <!-- messages -->
          <div v-for="(msg, i) in chatMessages" :key="i"
               :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div class="max-w-[85%]">
              <!-- agent tags -->
              <div v-if="msg.role === 'ai' && msg.agents?.length" class="flex gap-1 mb-1 flex-wrap">
                <span v-for="agent in msg.agents" :key="agent"
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
                  {{ agent }}
                </span>
              </div>
              <!-- bubble -->
              <div class="px-4 py-3 rounded-2xl text-xs leading-relaxed"
                   :style="msg.role === 'user'
                     ? 'background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); color: white; border-bottom-right-radius: 4px;'
                     : 'background: var(--wp-surface); color: var(--wp-text); border: 1px solid var(--wp-border); border-bottom-left-radius: 4px;'">
                <div class="whitespace-pre-wrap" v-html="formatMessage(msg.text)"></div>
              </div>
            </div>
          </div>

          <!-- typing indicator -->
          <div v-if="chatSending" class="flex justify-start">
            <div class="px-4 py-3 rounded-2xl" style="background: var(--wp-surface); border: 1px solid var(--wp-border); border-bottom-left-radius: 4px;">
              <div class="flex gap-1.5 items-center">
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 0ms;"></span>
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 150ms;"></span>
                <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--wp-gold); animation-delay: 300ms;"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- input bar -->
        <div class="flex gap-2 p-4 border-t" style="border-color: var(--wp-border); background: var(--wp-surface);">
          <textarea
            v-model="chatInput"
            @keydown.enter.exact.prevent="handleSendChat(chatInput)"
            placeholder="Tanyakan tentang pemasaran… (Enter untuk kirim)"
            rows="1"
            class="flex-1 px-4 py-2.5 text-sm border rounded-xl focus:outline-none resize-none transition"
            style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);"
          ></textarea>
          <button @click="handleSendChat(chatInput)"
                  :disabled="!chatInput.trim() || chatSending"
                  class="px-4 py-2.5 rounded-xl text-white flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 transition hover:shadow-md"
                  style="background: linear-gradient(135deg, #059669, #047857);">
            <Icon name="heroicons:paper-airplane" class="w-4 h-4" />
          </button>
        </div>
      </div>

    </template>

    <!-- ═══ CONTENT MODAL ═══ -->
    <Teleport to="body">
      <div v-if="showContentModal"
           class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background: rgba(0,0,0,0.55);"
           @click.self="closeContentModal">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
             style="background: var(--wp-surface);">

          <!-- modal header -->
          <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
               style="border-color: var(--wp-border); background: var(--wp-surface);">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
                <Icon name="heroicons:sparkles" class="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 class="text-sm font-black uppercase tracking-wider" style="color: var(--wp-navy);">Hasil Konten AI</h3>
                <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">
                  {{ generatedContent?.product }} — {{ generatedContent?.variants?.length || 1 }} varian
                </p>
              </div>
            </div>
            <button @click="closeContentModal"
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-slate-100"
                    style="color: var(--wp-text-secondary);">
              <Icon name="heroicons:x-mark" class="w-4.5 h-4.5" />
            </button>
          </div>

          <div class="px-6 py-5 space-y-5">

            <!-- marketing score card -->
            <div v-if="generatedContent?.marketing_score?.score > 0"
                 class="p-4 rounded-xl border"
                 style="border-color: var(--wp-border); background: linear-gradient(135deg, rgba(212,168,67,0.05), transparent);">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center text-base font-black text-white shrink-0"
                       :style="`background: ${generatedContent.marketing_score.score >= 70 ? '#22c55e' : generatedContent.marketing_score.score >= 50 ? '#f59e0b' : '#ef4444'};`">
                    {{ generatedContent.marketing_score.score }}
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider mb-0.5" style="color: var(--wp-text-secondary);">Marketing Score</p>
                    <p class="text-xs font-bold" style="color: var(--wp-text);">{{ generatedContent.recommendation?.strategy || 'Recommended' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-[10px]" style="color: var(--wp-text-secondary);">Confidence</p>
                  <p class="text-sm font-black" style="color: var(--wp-gold);">{{ generatedContent.recommendation?.confidence || 0 }}%</p>
                </div>
              </div>
              <div v-if="generatedContent.recommendation?.reasons?.length" class="space-y-1">
                <div v-for="(reason, ri) in generatedContent.recommendation.reasons" :key="ri"
                     class="flex items-start gap-2 text-[10px]" style="color: var(--wp-text-secondary);">
                  <Icon name="heroicons:check-circle" class="w-3 h-3 mt-0.5 shrink-0" style="color: var(--wp-gold);" />
                  <span>{{ reason }}</span>
                </div>
              </div>
              <!-- score components -->
              <div v-if="generatedContent.marketing_score?.components" class="mt-3 pt-3 border-t flex gap-2 flex-wrap" style="border-color: var(--wp-border);">
                <span v-for="(val, key) in generatedContent.marketing_score.components" :key="key"
                      class="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                      style="background: var(--wp-bg); color: var(--wp-text-secondary);">
                  {{ key }}: {{ val }}
                </span>
              </div>
            </div>

            <!-- caption variants -->
            <div v-if="generatedContent?.variants?.length" class="space-y-4">
              <div v-for="(variant, i) in generatedContent.variants" :key="i"
                   class="p-4 rounded-xl border"
                   :style="i === 0
                     ? 'border-color: var(--wp-gold); background: linear-gradient(135deg, rgba(212,168,67,0.05), transparent);'
                     : 'border-color: var(--wp-border);'">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold" style="color: var(--wp-text);">{{ variant.emoji }} {{ variant.style || 'Caption' }}</span>
                    <span v-if="variant.score"
                          class="text-[9px] font-bold px-2 py-0.5 rounded text-white"
                          :style="`background: ${variant.score >= 80 ? '#22c55e' : variant.score >= 60 ? '#f59e0b' : '#94a3b8'};`">
                      {{ variant.score }}
                    </span>
                  </div>
                  <button @click="copyText(variant.caption || '')"
                          class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition hover:bg-slate-100"
                          style="color: var(--wp-text-secondary);">
                    <Icon name="heroicons:clipboard-document" class="w-3 h-3" />
                    Salin
                  </button>
                </div>
                <p class="text-xs leading-relaxed whitespace-pre-wrap mb-3" style="color: var(--wp-text);">
                  {{ variant.caption || 'Tidak ada caption' }}
                </p>
                <!-- hashtags -->
                <div v-if="variant.hashtags?.length" class="flex flex-wrap gap-1.5 mb-2">
                  <span v-for="tag in variant.hashtags" :key="tag"
                        class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
                    {{ tag }}
                  </span>
                </div>
                <!-- cta + headline -->
                <div v-if="variant.cta || variant.headline" class="flex gap-2 flex-wrap text-[10px]">
                  <span v-if="variant.cta" class="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                        style="background: var(--wp-bg); color: var(--wp-text-secondary);">
                    <Icon name="heroicons:cursor-arrow-rays" class="w-2.5 h-2.5" />
                    CTA: <strong style="color: var(--wp-text);">{{ variant.cta }}</strong>
                  </span>
                  <span v-if="variant.headline" class="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                        style="background: var(--wp-bg); color: var(--wp-text-secondary);">
                    <Icon name="heroicons:bolt" class="w-2.5 h-2.5" />
                    Headline: <strong style="color: var(--wp-text);">{{ variant.headline }}</strong>
                  </span>
                </div>
                <!-- image idea -->
                <p v-if="variant.image_idea" class="flex items-start gap-1.5 text-[10px] italic mt-2"
                   style="color: var(--wp-text-secondary);">
                  <Icon name="heroicons:photo" class="w-3 h-3 mt-0.5 shrink-0" style="color: var(--wp-gold);" />
                  {{ variant.image_idea }}
                </p>
              </div>
            </div>

            <!-- fallback single caption -->
            <div v-else-if="generatedContent?.caption">
              <div class="p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap"
                   style="border-color: var(--wp-border); background: var(--wp-bg); color: var(--wp-text);">
                {{ generatedContent.caption }}
              </div>
            </div>

            <!-- meta info -->
            <div v-if="generatedContent?.platform" class="flex gap-2 flex-wrap text-xs" style="color: var(--wp-text-secondary);">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded" style="background: var(--wp-bg);">
                <Icon name="heroicons:device-phone-mobile" class="w-3 h-3" />
                <strong style="color: var(--wp-text);">{{ generatedContent.platform }}</strong>
              </span>
              <span v-if="generatedContent?.product" class="inline-flex items-center gap-1 px-2 py-1 rounded" style="background: var(--wp-bg);">
                <Icon name="heroicons:cube" class="w-3 h-3" />
                <strong style="color: var(--wp-text);">{{ generatedContent.product }}</strong>
              </span>
            </div>

            <!-- modal actions -->
            <div class="flex gap-3 pt-1">
              <button @click="copyContent()"
                      class="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition hover:shadow-md"
                      style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
                <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-4 h-4" />
                {{ copied ? 'Tersalin!' : 'Salin Semua Caption' }}
              </button>
              <button @click="closeContentModal"
                      class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition hover:bg-slate-50"
                      style="border-color: var(--wp-border); color: var(--wp-text);">
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
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

// ── Local state ──────────────────────────────────────────────────────
const chatInput = ref('')
const copied = ref(false)
const selectedProduct = ref('')
const selectedPlatform = ref('instagram')

// ── Static data ──────────────────────────────────────────────────────

const examplePrompts = [
  'Buat caption untuk produk terlaris',
  'Strategi promo mingguan',
  'Produk apa yang harus saya promosikan?',
  'Ide konten TikTok untuk snack',
]

const platforms = [
  { value: 'whatsapp',  label: 'WhatsApp',  icon: 'heroicons:chat-bubble-bottom-center-text' },
  { value: 'instagram', label: 'Instagram', icon: 'heroicons:camera' },
  { value: 'tiktok',    label: 'TikTok',    icon: 'heroicons:musical-note' },
  { value: 'facebook',  label: 'Facebook',  icon: 'heroicons:user-group' },
]

const contentTypes = [
  {
    key: 'caption',
    label: 'Caption',
    desc: 'Teks promosi menarik',
    icon: 'heroicons:pencil-square',
    iconBg: 'linear-gradient(135deg, #D4A843, #B8922E)',
    bg: 'rgba(212,168,67,0.06)',
  },
  {
    key: 'video',
    label: 'Script Video',
    desc: 'Naskah konten video',
    icon: 'heroicons:video-camera',
    iconBg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    bg: 'rgba(139,92,246,0.06)',
  },
  {
    key: 'idea',
    label: 'Ide Konten',
    desc: 'Inspirasi kreatif',
    icon: 'heroicons:light-bulb',
    iconBg: 'linear-gradient(135deg, #059669, #047857)',
    bg: 'rgba(5,150,105,0.06)',
  },
  {
    key: 'promo',
    label: 'Copy Promo',
    desc: 'Teks iklan & penawaran',
    icon: 'heroicons:megaphone',
    iconBg: 'linear-gradient(135deg, #D97706, #B45309)',
    bg: 'rgba(217,119,6,0.06)',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────

const getScoreColor = (score: number) => {
  if (score >= 80) return '#D4A843'  // gold
  if (score >= 60) return '#059669'  // green
  if (score >= 40) return '#D97706'  // amber
  return '#64748B'                   // gray
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

// ── Handlers ──────────────────────────────────────────────────────────

const handleGenerateCaption = async (productName?: string, platform?: string) => {
  const product = productName || selectedProduct.value
  if (!product) return
  await generateCaption(product, platform || selectedPlatform.value)
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
    // fallback: silently fail
  }
}

// ── Computed KPIs ─────────────────────────────────────────────────────

const displayKpis = computed(() => {
  const colors = ['#D4A843', '#059669', '#3B82F6', '#8B5CF6']
  if (kpis.value.length) {
    return kpis.value.map((k: any, i: number) => ({
      ...k,
      color: colors[i % 4],
    }))
  }
  return [
    { label: 'Omzet 30 Hari',   value: 'Rp 0',  icon: 'heroicons:banknotes',     color: '#D4A843' },
    { label: 'Transaksi',        value: '0',      icon: 'heroicons:shopping-cart', color: '#059669' },
    { label: 'Rata-rata Order',  value: 'Rp 0',  icon: 'heroicons:calculator',    color: '#3B82F6' },
    { label: 'Conversion',       value: '0%',     icon: 'heroicons:chart-bar',     color: '#8B5CF6' },
  ]
})

// ── Lifecycle ─────────────────────────────────────────────────────────

onMounted(() => {
  loadAll()
})
</script>
