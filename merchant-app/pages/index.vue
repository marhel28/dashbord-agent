<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ layout: 'auth' })

const colorMode = useColorMode()

const logoSrc = computed(() => {
  return '/logo_lightmode.png'
})

// Interactive Copilot Simulator state
const activeTab = ref<'inventory' | 'finance' | 'sales' | 'marketing'>('inventory')
const simulatorQuery = ref('')
const isSimulating = ref(false)
const simOutput = ref<string | null>(null)

const simulatorPresets = {
  inventory: [
    "Cek stok Minyak Goreng Bimoli 2L, apakah perlu restock hari ini?",
    "Prediksi stok mana yang akan habis dalam 3 hari ke depan?",
    "Buatkan draf order otomatis ke distributor Indofood."
  ],
  finance: [
    "Berapa total omzet bersih dan profit margin minggu ini?",
    "Analisis pengeluaran terbanyak toko bulan ini.",
    "Bantu hitung arus kas untuk rencana bayar supplier besok."
  ],
  sales: [
    "Produk apa yang paling laris dipasangkan dengan Kopi Kapal Api?",
    "Tampilkan ringkasan penjualan harian per kategori.",
    "Berapa rata-rata nilai keranjang pembeli di warung saya?"
  ],
  marketing: [
    "Buatkan pesan promo WhatsApp untuk produk sembako diskon akhir pekan.",
    "Rekomendasikan strategi bundel paket sembako hemat.",
    "Buatkan kupon promo otomatis untuk pelanggan setia."
  ]
}

const runSimulation = (queryText: string) => {
  simulatorQuery.value = queryText
  isSimulating.value = true
  simOutput.value = null

  setTimeout(() => {
    isSimulating.value = false
    if (activeTab.value === 'inventory') {
      simOutput.value = `📦 **Analisis Stok Real-time Nahkoda AI:**\n- Stok Bimoli 2L tersisa **4 pouch** (Batas aman: 10 pouch).\n- **Rekomendasi:** Lakukan pemesanan **12 pouch** hari ini.\n- Pemasok terbaik: *PT Indofood Sukses (Estimasi tiba besok 10.00 WIB)*.\n\n👉 *Draf nota pesanan telah disiapkan di menu Stok Barang.*`
    } else if (activeTab.value === 'finance') {
      simOutput.value = `💰 **Laporan Arus Kas & Margin:**\n- Total Omzet Minggu Ini: **Rp 14.850.000** (+18% vs minggu lalu).\n- Profit Margin Bersih: **21.4%**.\n- Cashflow aman untuk membayar tagihan supplier sebesar **Rp 4.200.000** besok.`
    } else if (activeTab.value === 'sales') {
      simOutput.value = `📊 **Analisis Penjualan & Cross-Selling:**\n- Kopi Kapal Api paling sering dibeli bersama **Gula Pasir Gulaku 1kg** (84% transaksi berbarengan).\n- **Saran Copilot:** Letakkan rak Gula Pasir tepat di samping rak Kopi untuk meningkatkan keterbelian.`
    } else {
      simOutput.value = `Draft Promo WhatsApp siap dikirim:\n"🎉 *PROMO JUMAT BERKAH WARUNG MAKMUR!* 🎉\nDapatkan gratis Gula Pasir 500g setiap pembelian Minyak Goreng 2L + beras 5kg. Khusus 20 pembeli pertama!"`
    }
  }, 900)
}

const features = [
  {
    icon: 'heroicons:sparkles',
    title: 'Asisten Bisnis Otomatis (Agentic Copilot)',
    desc: 'Bukan sekadar chat biasa! Nahkoda AI secara aktif menganalisis data toko Anda dan memberikan saran keputusan bisnis presisi.'
  },
  {
    icon: 'heroicons:archive-box',
    title: 'Manajemen Stok & Prediksi Kehabisan',
    desc: 'Pantau persediaan barang, dapatkan alert sebelum stok habis, serta rekap otomatis kebutuhan restock mingguan.'
  },
  {
    icon: 'heroicons:banknotes',
    title: 'Laporan Keuangan & Omzet Real-time',
    desc: 'Catat transaksi bulanan, hitung keuntungan bersih, dan pantau arus kas tanpa perlu pencatatan manual yang rumit.'
  },
  {
    icon: 'heroicons:paper-airplane',
    title: 'Integrasi Langsung via Telegram Bot',
    desc: 'Kelola seluruh operasional warung langsung dari HP Anda via Telegram Bot tanpa harus selalu membuka laptop.'
  },
  {
    icon: 'heroicons:user-group',
    title: 'Analisis Pelanggan & Rekomendasi Promo',
    desc: 'Pahami kebiasaan belanja pelanggan warung Anda dan buat kampanye promosi yang efektif meningkatkan omzet.'
  },
  {
    icon: 'heroicons:shield-check',
    title: 'Keamanan Data Berstandar Tinggi',
    desc: 'Seluruh data transaksi dan informasi warung Anda terenkripsi aman dengan sistem privasi berlapis.'
  }
]

const faqs = ref([
  {
    q: "Apa itu Nahkoda AI Business Copilot?",
    a: "Nahkoda AI adalah asisten kecerdasan buatan terpadu (Agentic AI) yang dirancang khusus untuk pemilik toko, warung, dan UMKM dalam mengelola stok, keuangan, penjualan, serta keputusan bisnis secara cerdas.",
    open: true
  },
  {
    q: "Apakah saya bisa menghubungkan Nahkoda AI dengan Telegram?",
    a: "Ya! Nahkoda AI dilengkapi dengan Telegram Bot bawaan yang memungkinkan Anda melakukan cek stok, input penjualan, hingga minta rekomendasi bisnis secara instan melalui chat Telegram.",
    open: false
  },
  {
    q: "Apakah platform ini cocok untuk warung kecil atau toko kelontong?",
    a: "Sangat cocok. Nahkoda AI mendukung mode 'Warung Kecil' sederhana hingga mode 'Expert' untuk distributor dan toko ritel dengan ribuan SKU barang.",
    open: false
  },
  {
    q: "Bagaimana cara mulai menggunakannya?",
    a: "Cukup mendaftar akun merchant secara gratis, masukkan informasi nama toko Anda, dan Nahkoda AI siap menjadi asisten bisnis digital Anda!",
    open: false
  }
])
</script>

<template>
  <div class="landing-root">
    <!-- Ambient Clean Light Background -->
    <div class="ambient-layer" aria-hidden="true">
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      <div class="ambient-grid"></div>
    </div>

    <!-- Navigation Header -->
    <header class="landing-nav animate-fade-in">
      <div class="nav-container">
        <div class="brand-block">
          <img :src="logoSrc" class="w-9 h-9 object-contain shrink-0" alt="Nahkoda Logo" />
          <div class="brand-text">
            <span class="brand-name">Nahkoda</span>
            <span class="brand-tag">Business Copilot</span>
          </div>
        </div>

        <nav class="nav-links">
          <a href="#features" class="nav-item">Fitur Utama</a>
          <a href="#simulator" class="nav-item">Demo Copilot</a>
          <a href="#faq" class="nav-item">FAQ</a>
        </nav>

        <div class="nav-actions">
          <NuxtLink to="/login" class="btn-ghost">Masuk</NuxtLink>
          <NuxtLink to="/register" class="btn-primary-sm">Daftar Merchant</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <h1 class="hero-title animate-fade-in-up">
          Kelola Warung & Toko Lebih Cerdas Bersama <span class="gold-gradient-text">Nahkoda AI Business Copilot</span>
        </h1>

        <p class="hero-subtitle animate-fade-in-up">
          Platform otonom untuk pemilik usaha UMKM. Pantau stok barang, analisis arus kas, otomatisasi pembelian supplier, dan rasakan kemudahan mengelola toko dalam satu genggaman.
        </p>

        <div class="hero-ctas animate-fade-in-up">
          <NuxtLink to="/register" class="btn-hero-primary">
            <span>Mulai Gratis Sekarang</span>
            <Icon name="heroicons:arrow-right" class="w-5 h-5" />
          </NuxtLink>
          <NuxtLink to="/login" class="btn-hero-secondary">
            <Icon name="heroicons:arrow-left-on-rectangle" class="w-5 h-5" />
            <span>Masuk ke Merchant App</span>
          </NuxtLink>
        </div>

        <!-- Trust Badges -->
        <div class="trust-strip animate-fade-in-up">
          <div class="trust-item">
            <Icon name="heroicons:check-badge-solid" class="w-4 h-4 text-[#B8922E]" />
            <span>Terhubung Telegram Bot</span>
          </div>
          <div class="trust-divider"></div>
          <div class="trust-item">
            <Icon name="heroicons:bolt-solid" class="w-4 h-4 text-[#B8922E]" />
            <span>Analisis Real-time</span>
          </div>
          <div class="trust-divider"></div>
          <div class="trust-item">
            <Icon name="heroicons:shield-check-solid" class="w-4 h-4 text-[#B8922E]" />
            <span>Data Terenkripsi SSL</span>
          </div>
        </div>

        <!-- Phone Image Showcase (Clean) -->
        <div class="hero-app-mockup animate-fade-in-up mt-10">
          <div class="mockup-frame">
            <img src="/cardids.webp" alt="Nahkoda AI Merchant App Interface" class="mockup-image" />
          </div>
        </div>
      </div>
    </section>

    <!-- Live Interactive Copilot Simulator Section -->
    <section id="simulator" class="simulator-section">
      <div class="section-container">
        <div class="section-header text-center">
          <span class="section-kicker">Interactive Live Demo</span>
          <h2 class="section-title">Uji Kecerdasan <span class="gold-gradient-text">Nahkoda AI Copilot</span></h2>
          <p class="section-desc">Pilih modul bisnis di bawah dan lihat bagaimana Nahkoda AI memproses keputusan toko Anda secara instan.</p>
        </div>

        <div class="simulator-box">
          <!-- Module Tabs -->
          <div class="sim-tabs">
            <button 
              @click="activeTab = 'inventory'"
              :class="['sim-tab-btn', activeTab === 'inventory' ? 'active' : '']"
            >
              <Icon name="heroicons:archive-box" class="w-4 h-4" />
              <span>Stok & Restock</span>
            </button>
            <button 
              @click="activeTab = 'finance'"
              :class="['sim-tab-btn', activeTab === 'finance' ? 'active' : '']"
            >
              <Icon name="heroicons:banknotes" class="w-4 h-4" />
              <span>Keuangan & Omzet</span>
            </button>
            <button 
              @click="activeTab = 'sales'"
              :class="['sim-tab-btn', activeTab === 'sales' ? 'active' : '']"
            >
              <Icon name="heroicons:chart-bar" class="w-4 h-4" />
              <span>Penjualan & Produk</span>
            </button>
            <button 
              @click="activeTab = 'marketing'"
              :class="['sim-tab-btn', activeTab === 'marketing' ? 'active' : '']"
            >
              <Icon name="heroicons:megaphone" class="w-4 h-4" />
              <span>Pemasaran & Promo</span>
            </button>
          </div>

          <!-- Simulator Body -->
          <div class="sim-content">
            <div class="sim-preset-label">Contoh pertanyaan cepat ke Copilot:</div>
            <div class="sim-presets">
              <button 
                v-for="(p, idx) in simulatorPresets[activeTab]" 
                :key="idx" 
                @click="runSimulation(p)"
                class="preset-chip"
              >
                "{{ p }}"
              </button>
            </div>

            <!-- Copilot Screen Output -->
            <div class="sim-screen">
              <div class="sim-screen-header">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-red-400"></div>
                  <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div class="text-[11px] font-mono text-slate-500">Nahkoda AI Assistant Console</div>
              </div>

              <div class="sim-screen-body">
                <div v-if="simulatorQuery" class="sim-user-msg">
                  <Icon name="heroicons:user-circle" class="w-5 h-5 text-slate-400 shrink-0" />
                  <span>{{ simulatorQuery }}</span>
                </div>

                <div v-if="isSimulating" class="sim-loading">
                  <div class="w-5 h-5 border-2 border-[#B8922E] border-t-transparent rounded-full animate-spin"></div>
                  <span>Nahkoda AI sedang menganalisis data merchant...</span>
                </div>

                <div v-else-if="simOutput" class="sim-ai-msg">
                  <img :src="logoSrc" class="w-6 h-6 object-contain shrink-0" alt="Logo" />
                  <div class="sim-ai-text" v-html="simOutput.replace(/\n/g, '<br/>')"></div>
                </div>

                <div v-else class="sim-placeholder">
                  <Icon name="heroicons:sparkles" class="w-8 h-8 text-[#B8922E]/40 mb-2" />
                  <p class="text-sm text-slate-500">Klik salah satu tombol preset pertanyaan di atas untuk melihat respon cerdas Nahkoda AI.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid Section -->
    <section id="features" class="features-section">
      <div class="section-container">
        <div class="section-header text-center">
          <span class="section-kicker">Fitur Unggulan</span>
          <h2 class="section-title">Semua yang Dibutuhkan Warung & Toko Modern</h2>
          <p class="section-desc">Dirancang khusus untuk mempermudah operasional harian merchant tanpa kerumitan teknis.</p>
        </div>

        <div class="features-grid">
          <div v-for="(f, i) in features" :key="i" class="feature-card">
            <div class="feature-icon-box">
              <Icon :name="f.icon" class="w-6 h-6 text-[#B8922E]" />
            </div>
            <h3 class="feature-card-title">{{ f.title }}</h3>
            <p class="feature-card-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="faq-section">
      <div class="section-container">
        <div class="section-header text-center">
          <span class="section-kicker">Pertanyaan Umum</span>
          <h2 class="section-title">Masih Punya Pertanyaan?</h2>
        </div>

        <div class="faq-list">
          <div 
            v-for="(item, idx) in faqs" 
            :key="idx" 
            class="faq-item"
            @click="item.open = !item.open"
          >
            <div class="faq-question">
              <span>{{ item.q }}</span>
              <Icon :name="item.open ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-5 h-5 text-[#B8922E]" />
            </div>
            <div v-if="item.open" class="faq-answer">
              {{ item.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Banner -->
    <section class="cta-banner-section">
      <div class="cta-box">
        <h2 class="cta-title">Siap Mentransformasi Toko Anda Bersama Nahkoda AI?</h2>
        <p class="cta-desc">Bergabunglah dengan ribuan merchant dan pemilik warung pintar yang telah melipatgandakan efisiensi bisnis mereka.</p>
        <div class="cta-actions">
          <NuxtLink to="/register" class="btn-hero-primary">
            <span>Daftar Merchant Sekarang</span>
            <Icon name="heroicons:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Professional Landing Footer -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-top-grid">
          <!-- Column 1: Brand & Tagline -->
          <div class="footer-col brand-col">
            <div class="flex items-center gap-2 mb-3">
              <img :src="logoSrc" class="w-8 h-8 object-contain shrink-0" alt="Nahkoda AI Logo" />
              <span class="font-extrabold text-xl text-[#0F1A2E] tracking-tight">Nahkoda <span class="gold-gradient-text">AI</span></span>
            </div>
            <p class="footer-desc">
              Platform Business Copilot otonom pertama di Indonesia untuk otomatisasi persediaan stok, analisis arus kas, serta keputusan bisnis merchant & warung pintar.
            </p>
            <div class="footer-badges">
              <div class="tech-badge">
                <Icon name="heroicons:shield-check" class="w-4 h-4 text-[#B8922E]" />
                <span>Enterprise Grade Security</span>
              </div>
            </div>
          </div>

          <!-- Column 2: Navigasi Produk -->
          <div class="footer-col">
            <h4 class="footer-col-title">Produk & Solusi</h4>
            <ul class="footer-links">
              <li><a href="#simulator" class="footer-link">Copilot Simulator</a></li>
              <li><a href="#features" class="footer-link">Manajemen Stok & Restock</a></li>
              <li><a href="#features" class="footer-link">Laporan Arus Kas & Margin</a></li>
              <li><a href="#features" class="footer-link">Integrasi Telegram Bot</a></li>
              <li><NuxtLink to="/skill-marketplace" class="footer-link">Skill Marketplace</NuxtLink></li>
            </ul>
          </div>

          <!-- Column 3: Ekosistem & Akun -->
          <div class="footer-col">
            <h4 class="footer-col-title">Akses Merchant</h4>
            <ul class="footer-links">
              <li><NuxtLink to="/login" class="footer-link">Masuk Merchant App</NuxtLink></li>
              <li><NuxtLink to="/register" class="footer-link">Daftar Akun Merchant</NuxtLink></li>
              <li><NuxtLink to="/sales-report" class="footer-link">Ringkasan Penjualan</NuxtLink></li>
              <li><NuxtLink to="/konektor" class="footer-link">Integrasi Saluran POS</NuxtLink></li>
            </ul>
          </div>

          <!-- Column 4: Dukungan & Bantuan -->
          <div class="footer-col">
            <h4 class="footer-col-title">Pusat Bantuan</h4>
            <ul class="footer-links">
              <li><a href="#faq" class="footer-link">Pertanyaan Umum (FAQ)</a></li>
              <li><NuxtLink to="/help" class="footer-link">Dokumentasi & Panduan</NuxtLink></li>
              <li><a href="https://t.me/" target="_blank" rel="noopener" class="footer-link flex items-center gap-1.5">
                <Icon name="heroicons:paper-airplane" class="w-4 h-4 text-[#0088cc]" />
                <span>Bantuan via Telegram</span>
              </a></li>
              <li><span class="footer-text-muted">Jam Operasional: 24/7 AI System</span></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <p class="footer-copy">© 2026 Nahkoda AI Business Copilot · Hak Cipta Dilindungi Undang-Undang.</p>
          <div class="footer-legal-links">
            <span class="legal-item">Privasi & Keamanan</span>
            <span class="legal-dot">•</span>
            <span class="legal-item">Syarat & Ketentuan</span>
            <span class="legal-dot">•</span>
            <span class="legal-item">Standar UMKM Digital</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ── Root & Ambient Layer (Clean Light Theme) ── */
.landing-root {
  min-height: 100dvh;
  background: #F8FAFC;
  color: #0F1A2E;
  font-family: 'Fira Sans', system-ui, -apple-system, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.ambient-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.45;
}
.orb-1 {
  width: 600px; height: 600px;
  top: -200px; left: -100px;
  background: radial-gradient(circle, rgba(212, 168, 67, 0.25) 0%, transparent 70%);
}
.orb-2 {
  width: 500px; height: 500px;
  bottom: -150px; right: -100px;
  background: radial-gradient(circle, rgba(226, 232, 240, 0.8) 0%, transparent 70%);
}
.ambient-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 26, 46, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 26, 46, 0.03) 1px, transparent 1px);
  background-size: 56px 56px;
}

/* ── Typography & Gradients ── */
.gold-gradient-text {
  background: linear-gradient(135deg, #B8922E 0%, #D4A843 50%, #B8922E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ── Header Nav ── */
.landing-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-b: 1px solid rgba(226, 232, 240, 0.8);
  padding: 1rem 0;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.brand-name {
  font-weight: 800;
  font-size: 1.125rem;
  color: #0F1A2E;
  display: block;
  line-height: 1;
}
.brand-tag {
  font-size: 0.7rem;
  color: #B8922E;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.nav-links {
  display: flex;
  gap: 2rem;
}
.nav-item {
  color: #475569;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s;
}
.nav-item:hover {
  color: #B8922E;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.btn-ghost {
  color: #0F1A2E;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  padding: 0.5rem 1rem;
  transition: opacity 0.15s;
}
.btn-ghost:hover {
  opacity: 0.8;
}
.btn-primary-sm {
  background: linear-gradient(135deg, #D4A843 0%, #B8922E 100%);
  color: #FFFFFF;
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(184,146,46,0.25);
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-primary-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184,146,46,0.35);
}

/* ── Hero Section ── */
.hero-section {
  position: relative;
  z-index: 1;
  padding: 5rem 1.5rem 4rem;
  text-align: center;
}
.hero-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  background: rgba(212, 168, 67, 0.12);
  border: 1px solid rgba(184, 146, 46, 0.25);
  color: #B8922E;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.hero-title {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #0F1A2E;
  margin-bottom: 1.25rem;
}
.hero-subtitle {
  font-size: 1.125rem;
  color: #475569;
  max-width: 720px;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}
.hero-ctas {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-bottom: 3rem;
  width: 100%;
}
.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: linear-gradient(135deg, #D4A843 0%, #B8922E 100%);
  color: #FFFFFF;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(184,146,46,0.3);
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(184,146,46,0.45);
}
.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  color: #0F1A2E;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: background 0.15s, border-color 0.15s;
}
.btn-hero-secondary:hover {
  background: #F8FAFC;
  border-color: #B8922E;
}

.trust-strip {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(15, 26, 46, 0.04);
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #334155;
  font-weight: 600;
}
.trust-divider {
  width: 1px;
  height: 14px;
  background: #E2E8F0;
}

/* ── Hero App Mockup Frame (Clean Phone Display) ── */
.hero-app-mockup {
  width: 100%;
  max-width: 380px;
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
}
.mockup-frame {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}
.mockup-image {
  width: 100%;
  height: auto;
  max-height: 720px;
  object-fit: contain;
  display: block;
}

/* ── Section Shared ── */
.section-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}
.section-header {
  margin-bottom: 3rem;
}
.section-kicker {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #B8922E;
  display: block;
  margin-bottom: 0.5rem;
}
.section-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0F1A2E;
  margin-bottom: 0.75rem;
}
.section-desc {
  font-size: 1rem;
  color: #64748B;
  max-width: 600px;
  margin: 0 auto;
}

/* ── Simulator Section ── */
.simulator-section {
  position: relative;
  z-index: 1;
}
.simulator-box {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 26, 46, 0.08);
}
.sim-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #F1F5F9;
  border-b: 1px solid #E2E8F0;
}
.sim-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #64748B;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 2px solid transparent;
}
.sim-tab-btn:hover {
  color: #0F1A2E;
  background: rgba(255,255,255,0.5);
}
.sim-tab-btn.active {
  color: #B8922E;
  border-bottom-color: #B8922E;
  background: #FFFFFF;
}

.sim-content {
  padding: 2rem;
}
.sim-preset-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748B;
  margin-bottom: 0.75rem;
}
.sim-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.preset-chip {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  color: #334155;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.preset-chip:hover {
  border-color: #B8922E;
  color: #B8922E;
  background: rgba(212, 168, 67, 0.08);
}

.sim-screen {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}
.sim-screen-header {
  background: #E2E8F0;
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sim-screen-body {
  padding: 1.5rem;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.sim-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.sim-user-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #E2E8F0;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1E293B;
  margin-bottom: 1rem;
}
.sim-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #B8922E;
  font-weight: 600;
}
.sim-ai-msg {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  background: #FFFFFF;
  border: 1px solid rgba(212, 168, 67, 0.3);
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(15, 26, 46, 0.04);
}
.sim-ai-text {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #1E293B;
}

/* ── Features Grid ── */
.features-section {
  position: relative;
  z-index: 1;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.feature-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(15, 26, 46, 0.03);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.feature-card:hover {
  transform: translateY(-4px);
  border-color: #B8922E;
  box-shadow: 0 8px 20px rgba(15, 26, 46, 0.08);
}
.feature-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(212, 168, 67, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}
.feature-card-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0F1A2E;
}
.feature-card-desc {
  font-size: 0.875rem;
  color: #64748B;
  line-height: 1.5;
}

/* ── FAQ ── */
.faq-section {
  position: relative;
  z-index: 1;
}
.faq-list {
  max-width: 750px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.faq-item {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  transition: border-color 0.15s;
}
.faq-item:hover {
  border-color: #B8922E;
}
.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1rem;
  color: #0F1A2E;
}
.faq-answer {
  margin-top: 0.875rem;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  border-t: 1px solid #F1F5F9;
  padding-top: 0.875rem;
}

/* ── CTA Banner ── */
.cta-banner-section {
  position: relative;
  z-index: 1;
  padding: 2rem 1.5rem 5rem;
}
.cta-box {
  max-width: 1100px;
  margin: 0 auto;
  background: linear-gradient(135deg, #0F1A2E 0%, #1E293B 100%);
  border-radius: 20px;
  padding: 3.5rem 2rem;
  text-align: center;
  color: #FFFFFF;
  box-shadow: 0 15px 35px rgba(15, 26, 46, 0.15);
}
.cta-title {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #FFFFFF;
}
.cta-desc {
  font-size: 1.0625rem;
  color: #94A3B8;
  max-width: 600px;
  margin: 0 auto 2rem;
}
.cta-actions {
  display: flex;
  justify-content: center;
}

/* ── Footer ── */
.landing-footer {
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  padding: 4rem 1.5rem 2rem;
  position: relative;
  z-index: 1;
}
.footer-container {
  max-width: 1100px;
  margin: 0 auto;
}
.footer-top-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid #F1F5F9;
}
.brand-col {
  max-width: 320px;
}
.footer-desc {
  font-size: 0.875rem;
  color: #64748B;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}
.footer-badges {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #334155;
}
.footer-col-title {
  font-size: 0.875rem;
  font-weight: 800;
  color: #0F1A2E;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.25rem;
}
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.footer-link {
  font-size: 0.875rem;
  color: #64748B;
  text-decoration: none;
  transition: color 0.15s, transform 0.15s;
  display: inline-block;
}
.footer-link:hover {
  color: #B8922E;
  transform: translateX(2px);
}
.footer-text-muted {
  font-size: 0.8rem;
  color: #94A3B8;
  font-style: italic;
}
.footer-bottom-bar {
  padding-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}
.footer-copy {
  font-size: 0.8125rem;
  color: #64748B;
}
.footer-legal-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: #94A3B8;
}
.legal-item {
  cursor: pointer;
  transition: color 0.15s;
}
.legal-item:hover {
  color: #475569;
}
.legal-dot {
  color: #CBD5E1;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .sim-tabs {
    grid-template-columns: repeat(2, 1fr);
  }
  .footer-top-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
}
@media (max-width: 640px) {
  .hero-title {
    font-size: 2rem;
  }
  .nav-links {
    display: none;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .sim-tabs {
    grid-template-columns: 1fr;
  }
  .hero-ctas {
    flex-direction: column;
  }
  .trust-strip {
    flex-direction: column;
    gap: 0.5rem;
  }
  .trust-divider {
    display: none;
  }
  .footer-top-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .footer-bottom-bar {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>
