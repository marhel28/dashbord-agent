<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

definePageMeta({ layout: 'auth' })

if (process.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const logoSrc = computed(() => '/logo_lightmode.png')

// ── Interactive Copilot Simulator state ──
const activeTab = ref<'inventory' | 'finance' | 'sales' | 'marketing'>('inventory')
const simulatorQuery = ref('')
const isSimulating = ref(false)
const simOutput = ref<any>(null)

const simulatorPresets: Record<string, string[]> = {
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

const simulationResults: Record<string, any> = {
  inventory: {
    title: "Analisis Inventaris & Restock",
    badge: "Prioritas Tinggi",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    metrics: [
      { label: "Sisa Stok", val: "4 Pouch", note: "Batas aman: 10" },
      { label: "Saran Restock", val: "12 Pouch", note: "Estimasi habis 2 hari" },
      { label: "Supplier Rekomendasi", val: "PT Indofood", note: "Tiba besok 10:00" }
    ],
    actionText: "Draf PO siap dikonfirmasi dan dikirim ke WhatsApp Distributor.",
    btnText: "📦 Kirim Order Supplier"
  },
  finance: {
    title: "Laporan Arus Kas & Profitabilitas",
    badge: "Kesehatan Finansial Baik",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    metrics: [
      { label: "Omset Minggu Ini", val: "Rp 14.850.000", note: "+18% vs minggu lalu" },
      { label: "Margin Bersih", val: "21.4%", note: "Rp 3.177.900 profit" },
      { label: "Kas Siap Pakai", val: "Rp 6.420.000", note: "Aman bayar supplier" }
    ],
    actionText: "Arus kas sehat. Rekomendasi alokasikan 10% untuk restock promo akhir pekan.",
    btnText: "📊 Buka Rekap Keuangan"
  },
  sales: {
    title: "Insight Cross-Selling & Produk",
    badge: "Peluang Omset Baru",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    metrics: [
      { label: "Pasangan Favorit", val: "Kopi + Gula 1kg", note: "84% transaksi bareng" },
      { label: "Kenaikan Nilai", val: "+Rp 16.500", note: "Per keranjang belanja" },
      { label: "Saran Display", val: "Rak Bersebelahan", note: "Tingkatkan pembelian impulsif" }
    ],
    actionText: "Letakkan rak Gula Pasir tepat di samping display Kopi untuk menaikkan basket size.",
    btnText: "📈 Buat Aturan Display"
  },
  marketing: {
    title: "Kampanye Promo Generatif AI",
    badge: "Siap Tayang",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    metrics: [
      { label: "Target Produk", val: "Paket Hemat Berkah", note: "Minyak 2L + Beras 5kg" },
      { label: "Diskon Efektif", val: "Rp 4.500", note: "Margin tetap aman 16%" },
      { label: "Kanal Distribusi", val: "WhatsApp Blast", note: "Ke 142 pelanggan loyal" }
    ],
    actionText: "Draft teks promo WhatsApp siap disebarkan dengan 1-klik.",
    btnText: "🚀 Sebar Promo WhatsApp"
  }
}

const typedQuery = ref('')
let typewriterTimer: any = null

const typeWriterEffect = (text: string, onComplete: () => void) => {
  if (typewriterTimer) clearInterval(typewriterTimer)
  typedQuery.value = ''
  let i = 0
  typewriterTimer = setInterval(() => {
    if (i < text.length) {
      typedQuery.value += text.charAt(i)
      i++
    } else {
      clearInterval(typewriterTimer)
      onComplete()
    }
  }, 22)
}

const runSimulation = (queryText: string) => {
  simulatorQuery.value = queryText
  simOutput.value = null
  isSimulating.value = true

  // 1. Run Typewriter animation in input simulation box
  typeWriterEffect(queryText, () => {
    // 2. Simulate AI agent reasoning and return visual card
    setTimeout(() => {
      isSimulating.value = false
      simOutput.value = simulationResults[activeTab.value]
    }, 600)
  })
}

const bentoFeatures = [
  {
    colSpan: "md:col-span-2",
    tag: "Autonomous Copilot",
    title: "Asisten Bisnis Otonom 24/7",
    desc: "Bukan sekadar chatbot tanya-jawab biasa. Nahkoda AI secara proaktif mengaudit tren penjualan harian, mendeteksi potensi kebocoran kas kasir, serta merumuskan rekomendasi taktis.",
    icon: "lucide:sparkles",
    bgAccent: "bg-gradient-to-br from-emerald-950 via-[#003B32] to-[#047857] text-white",
    previewType: "copilot"
  },
  {
    colSpan: "md:col-span-1",
    tag: "Stock Engine",
    title: "Prediksi Stok & Restock",
    desc: "Peringatan dini otomatis sebelum stok barang di warung habis, lengkap dengan estimasi kebutuhan order ke supplier tanpa tebak-tebakan.",
    icon: "lucide:package",
    bgAccent: "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100",
    previewType: "stock"
  },
  {
    colSpan: "md:col-span-1",
    tag: "Cashflow Intelligence",
    title: "Arus Kas & Margin Real-Time",
    desc: "Hitung laba bersih otomatis, pisahkan modal belanja vs profit kotor, dan pantau kesehatan dompet kasir secara instan.",
    icon: "lucide:circle-dollar-sign",
    bgAccent: "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100",
    previewType: "finance"
  },
  {
    colSpan: "md:col-span-2",
    tag: "Multi-Channel Integration",
    title: "Terhubung Langsung dengan Telegram Bot & Mobile POS",
    desc: "Kelola pesanan pelanggan, input transaksi via voice note, hingga terima laporan harian langsung dari smartphone tanpa perlu membuka laptop.",
    icon: "lucide:send",
    bgAccent: "bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 text-slate-900 dark:text-slate-100",
    previewType: "telegram"
  },
  {
    colSpan: "md:col-span-2",
    tag: "Generative Marketing",
    title: "Mesin Promosi Otomatis & Analisis Cross-Selling",
    desc: "AI menganalisis pola produk yang sering dibeli bersamaan dan secara otomatis merancang pesan promosi WhatsApp serta poster diskon.",
    icon: "lucide:megaphone",
    bgAccent: "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100",
    previewType: "marketing"
  },
  {
    colSpan: "md:col-span-1",
    tag: "Enterprise Shield",
    title: "Keamanan Multi-Tenant & Cloud Sync",
    desc: "Enkripsi data transaksi tingkat perbankan dengan pencadangan cloud otomatis agar pembukuan toko Anda selalu aman.",
    icon: "lucide:shield-check",
    bgAccent: "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100",
    previewType: "security"
  }
]

const faqs = ref([
  {
    q: "Apa itu Nahkoda AI Business Copilot?",
    a: "Nahkoda AI adalah sistem kecerdasan buatan terpadu (Agentic AI) yang dirancang khusus untuk pemilik toko, warung, dan UMKM dalam mengelola stok, keuangan, penjualan, serta keputusan bisnis secara cerdas dan otomatis.",
    open: true
  },
  {
    q: "Apakah saya bisa menghubungkan Nahkoda AI dengan Telegram?",
    a: "Ya! Nahkoda AI dilengkapi dengan Telegram Bot bawaan yang memungkinkan Anda melakukan cek stok, input penjualan lewat suara/teks, hingga meminta rekomendasi bisnis langsung dari HP Anda.",
    open: false
  },
  {
    q: "Apakah platform ini cocok untuk warung kecil atau toko kelontong?",
    a: "Sangat cocok. Nahkoda AI mendukung mode 'Basic' yang sangat sederhana untuk kasir harian, hingga mode 'Expert' untuk distributor dan toko ritel dengan ribuan jenis barang.",
    open: false
  },
  {
    q: "Bagaimana keamanan data transaksi toko saya?",
    a: "Seluruh data transaksi dan informasi bisnis Anda dienkripsi berstandar industri dengan isolasi multi-tenant yang ketat, menjamin privasi toko Anda selalu terlindungi.",
    open: false
  }
])

onMounted(() => {
  if (!process.client) return
  // Parallax floating animations for 5 connector cards
  gsap.to(".hero-float-card-1", { y: -12, duration: 2.6, repeat: -1, yoyo: true, ease: "power1.inOut" })
  gsap.to(".hero-float-card-2", { y: 10, duration: 2.9, repeat: -1, yoyo: true, ease: "power1.inOut", delay: 0.4 })
  gsap.to(".hero-float-card-3", { y: 12, duration: 2.7, repeat: -1, yoyo: true, ease: "power1.inOut", delay: 0.2 })
  gsap.to(".hero-float-card-4", { y: -10, duration: 3.1, repeat: -1, yoyo: true, ease: "power1.inOut", delay: 0.6 })
  gsap.to(".hero-float-card-5", { y: 14, duration: 2.5, repeat: -1, yoyo: true, ease: "power1.inOut", delay: 0.3 })
  gsap.to(".hero-phone-mockup", { y: -8, duration: 3.2, repeat: -1, yoyo: true, ease: "power1.inOut" })

  // Smooth Staggered Scroll-Reveal for Bento Grid
  nextTick(() => {
    // Reveal Bento section header
    gsap.fromTo(
      ".bento-header",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#features",
          start: "top 90%",
        }
      }
    )

    // Staggered reveal for each individual Bento Card
    gsap.fromTo(
      ".bento-card",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".bento-grid-container",
          start: "top 90%",
        }
      }
    )
  })

  runSimulation(simulatorPresets.inventory[0])
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-x-hidden">
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#003B32] flex items-center justify-center p-1.5 shadow-xs">
            <img :src="logoSrc" class="w-full h-full object-contain" alt="Nahkoda Logo" />
          </div>
          <div>
            <span class="font-black text-base tracking-tight text-slate-900 dark:text-slate-100 leading-none block">Nahkoda</span>
            <span class="text-[10px] font-bold text-[#047857] uppercase tracking-wider block mt-0.5">Business Copilot</span>
          </div>
        </div>
        <nav class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <a href="#simulator" class="hover:text-[#047857] transition-colors">Demo Copilot</a>
          <a href="#features" class="hover:text-[#047857] transition-colors">Fitur Unggulan</a>
          <a href="#faq" class="hover:text-[#047857] transition-colors">FAQ</a>
        </nav>
        <div class="flex items-center gap-3">
          <NuxtLink to="/login" class="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 px-3 py-2">Masuk</NuxtLink>
          <NuxtLink to="/register" class="text-xs font-bold bg-[#047857] hover:bg-[#065f46] text-white px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]">Daftar Merchant</NuxtLink>
        </div>
      </div>
    </header>

    <section class="relative pt-20 pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200/60">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15]">
          Kelola Toko Lebih Cerdas Bersama <br class="hidden sm:block" />
          <span class="bg-gradient-to-r from-[#003B32] via-[#047857] to-[#D97706] bg-clip-text text-transparent">Nahkoda AI Business Copilot</span>
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
          Platform otonom cerdas untuk pemilik usaha UMKM. Pantau stok barang, analisis arus kas, otomatisasi pemesanan distributor, dan ambil keputusan bisnis tepat dalam satu genggaman.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <NuxtLink to="/register" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
            <span>Mulai Gratis Sekarang</span>
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </NuxtLink>
          <a href="#simulator" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Icon name="lucide:play-circle" class="w-4 h-4 text-[#047857]" />
            <span>Lihat Demo Interaktif</span>
          </a>
        </div>
        <div class="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
          <div class="flex items-center gap-1.5"><Icon name="lucide:check-circle-2" class="w-4 h-4 text-[#047857]" /> <span>Terhubung Telegram Bot</span></div>
          <div class="flex items-center gap-1.5"><Icon name="lucide:check-circle-2" class="w-4 h-4 text-[#047857]" /> <span>Analisis Finansial Real-time</span></div>
          <div class="flex items-center gap-1.5"><Icon name="lucide:check-circle-2" class="w-4 h-4 text-[#047857]" /> <span>Multi-Tenant SSL Enkripsi</span></div>
        </div>
        <!-- ── GSAP Floating Parallax Mockup Showcase with 5 Animated Connector Lines ── -->
        <div class="relative pt-12 max-w-4xl mx-auto min-h-[580px]">
          <!-- Animated SVG Connector Lines Layer -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none z-15 hidden sm:block overflow-visible" xmlns="http://www.w3.org/2000/svg">
            <!-- 1. Left Card: Promo Otomatis AI -->
            <path
              d="M 190 130 C 250 130, 270 160, 310 180"
              fill="none"
              stroke="#10B981"
              stroke-width="1.5"
              stroke-dasharray="4 4"
              class="opacity-75 animate-pulse"
            />
            <circle cx="310" cy="180" r="4" fill="#047857" stroke="#34D399" stroke-width="2" />
            <circle cx="190" cy="130" r="3" fill="#10B981" />

            <!-- 2. Left Card: Pengingat (Reminder) -->
            <path
              d="M 180 340 C 240 340, 270 310, 310 290"
              fill="none"
              stroke="#8B5CF6"
              stroke-width="1.5"
              stroke-dasharray="4 4"
              class="opacity-75 animate-pulse"
            />
            <circle cx="310" cy="290" r="4" fill="#6D28D9" stroke="#A78BFA" stroke-width="2" />
            <circle cx="180" cy="340" r="3" fill="#8B5CF6" />

            <!-- 3. Right Card: Peringatan Stok -->
            <path
              d="M 690 140 C 630 140, 600 170, 560 190"
              fill="none"
              stroke="#F59E0B"
              stroke-width="1.5"
              stroke-dasharray="4 4"
              class="opacity-75 animate-pulse"
            />
            <circle cx="560" cy="190" r="4" fill="#D97706" stroke="#FBBF24" stroke-width="2" />
            <circle cx="690" cy="140" r="3" fill="#F59E0B" />

            <!-- 4. Right Card: Response Voice (Middle Right) -->
            <path
              d="M 690 230 C 630 230, 600 240, 565 240"
              fill="none"
              stroke="#06B6D4"
              stroke-width="1.5"
              stroke-dasharray="4 4"
              class="opacity-75 animate-pulse"
            />
            <circle cx="565" cy="240" r="4" fill="#0891B2" stroke="#67E8F9" stroke-width="2" />
            <circle cx="690" cy="230" r="3" fill="#06B6D4" />

            <!-- 5. Right Card: Generate Chart (Red - Bottom Right) -->
            <path
              d="M 680 360 C 620 360, 590 340, 555 330"
              fill="none"
              stroke="#EF4444"
              stroke-width="1.5"
              stroke-dasharray="4 4"
              class="opacity-75 animate-pulse"
            />
            <circle cx="555" cy="330" r="4" fill="#DC2626" stroke="#F87171" stroke-width="2" />
            <circle cx="680" cy="360" r="3" fill="#EF4444" />
          </svg>

          <!-- ── Floating Cards ── -->
          <!-- Card 1: Promo Otomatis AI (Top Left) -->
          <div class="hero-float-card-1 absolute -left-2 sm:-left-16 top-10 z-20 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-left hidden sm:flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Icon name="lucide:trending-up" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Promo Otomatis AI</p>
              <p class="text-xs font-extrabold text-slate-900 dark:text-slate-100">+Rp 2.850.000 Omset</p>
            </div>
          </div>

          <!-- Card 2: Pengingat (Bottom Left) -->
          <div class="hero-float-card-2 absolute -left-2 sm:-left-20 top-72 z-20 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-left hidden sm:flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Icon name="lucide:bell-ring" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pengingat Tagihan</p>
              <p class="text-xs font-extrabold text-slate-900 dark:text-slate-100">Bayar Supplier Besok 10:00</p>
            </div>
          </div>

          <!-- Card 3: Peringatan Stok (Top Right - Yellow) -->
          <div class="hero-float-card-3 absolute -right-2 sm:-right-16 top-6 z-20 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-left hidden sm:flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Icon name="lucide:alert-triangle" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peringatan Stok</p>
              <p class="text-xs font-extrabold text-slate-900 dark:text-slate-100">Bimoli 2L Segera Habis</p>
            </div>
          </div>

          <!-- Card 4: Response Voice (Middle Right - Cyan) -->
          <div class="hero-float-card-4 absolute -right-2 sm:-right-20 top-48 z-20 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-left hidden sm:flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
              <Icon name="lucide:mic" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Response Voice</p>
              <p class="text-xs font-extrabold text-slate-900 dark:text-slate-100">Audio Voice Balasan Aktif</p>
            </div>
          </div>

          <!-- Card 5: Generate Chart (Bottom Right - Red) -->
          <div class="hero-float-card-5 absolute -right-2 sm:-right-16 top-[340px] z-20 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-left hidden sm:flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Icon name="lucide:bar-chart-3" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Generate Chart</p>
              <p class="text-xs font-extrabold text-slate-900 dark:text-slate-100">Grafik Penjualan Visual</p>
            </div>
          </div>

          <!-- Center Mobile App Showcase Frame -->
          <div class="hero-phone-mockup relative z-10 mx-auto max-w-[280px] sm:max-w-[310px] drop-shadow-2xl">
            <img src="/cardids.webp" alt="Nahkoda AI Interface Mockup" class="w-full h-auto object-contain rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    </section>

    <section id="simulator" class="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/60">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        <div class="text-center space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-widest text-[#047857]">Interactive Live Terminal</span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Uji Kecerdasan <span class="text-[#047857]">Nahkoda AI Copilot</span></h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">Pilih modul bisnis di bawah dan saksikan bagaimana Nahkoda AI menganalisis serta menghasilkan tindakan nyata.</p>
        </div>
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shadow-xl overflow-hidden">
          <div class="p-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-1.5">
              <button v-for="t in [{id:'inventory', label:'Stok & Restock', icon:'lucide:package'}, {id:'finance', label:'Keuangan & Arus Kas', icon:'lucide:circle-dollar-sign'}, {id:'sales', label:'Penjualan & Produk', icon:'lucide:receipt-text'}, {id:'marketing', label:'Pemasaran & Promo', icon:'lucide:megaphone'}]" :key="t.id" @click="activeTab = t.id; runSimulation(simulatorPresets[t.id][0])" :class="['px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5', activeTab === t.id ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400']">
                <Icon :name="t.icon" class="w-3.5 h-3.5" /> <span>{{ t.label }}</span>
              </button>
            </div>
            <div class="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> <span>FastAPI 5-Tier Agentic Engine</span></div>
          </div>
          <div class="p-6 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Simulasi Pertanyaan:</span>
              <div class="flex flex-wrap gap-2">
                <button v-for="(p, idx) in simulatorPresets[activeTab]" :key="idx" @click="runSimulation(p)" :class="['text-xs font-medium px-3.5 py-2 rounded-xl border text-left transition-all', simulatorQuery === p ? 'bg-emerald-50 text-[#047857] border-emerald-300 font-bold shadow-2xs' : 'bg-white dark:bg-slate-900 border-slate-200/80 hover:border-emerald-300 text-slate-700 dark:text-slate-300']">"{{ p }}"</button>
              </div>
            </div>
            <!-- Terminal Output Window -->
            <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
                <span class="font-mono text-slate-400 flex items-center gap-1.5">
                  <Icon name="lucide:terminal" class="w-3.5 h-3.5 text-[#047857]" />
                  <span>terminal@nahkoda-ai:~ $ <strong class="text-slate-800 dark:text-slate-200 font-sans font-medium">{{ typedQuery || simulatorQuery }}</strong><span v-if="isSimulating && typedQuery.length < simulatorQuery.length" class="animate-pulse">|</span></span>
                </span>
                <span v-if="simOutput" :class="['px-2 py-0.5 rounded text-[10px] font-bold border', simOutput.badgeColor]">
                  {{ simOutput.badge }}
                </span>
              </div>

              <!-- Loading Skeleton / AI Reasoning -->
              <div v-if="isSimulating" class="py-8 flex flex-col items-center justify-center space-y-3">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#047857] animate-bounce" style="animation-delay: 0ms;"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-[#047857] animate-bounce" style="animation-delay: 150ms;"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-[#047857] animate-bounce" style="animation-delay: 300ms;"></span>
                </div>
                <p class="text-xs font-semibold text-slate-500">Menganalisis data transaksi & merumuskan tindakan...</p>
              </div>
              <div v-else-if="simOutput" class="space-y-4 animate-fade-in">
                <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ simOutput.title }}</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div v-for="(m, mIdx) in simOutput.metrics" :key="mIdx" class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">{{ m.label }}</p>
                    <p class="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">{{ m.val }}</p>
                    <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{{ m.note }}</p>
                  </div>
                </div>
                <div class="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span class="text-emerald-900 dark:text-emerald-200 font-medium">{{ simOutput.actionText }}</span>
                  <NuxtLink to="/login" class="px-3.5 py-1.5 rounded-md bg-[#047857] text-white font-bold text-[11px] shrink-0 hover:bg-[#065f46] text-center shadow-xs">{{ simOutput.btnText }}</NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="py-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/60">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div class="bento-header text-center space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-widest text-[#047857]">Ekosistem Terintegrasi</span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Semua yang Dibutuhkan Merchant Modern</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">Dirancang secara khusus agar pedagang warung & toko kelontong dapat menjalankan bisnis layaknya retail besar.</p>
        </div>

        <div class="bento-grid-container grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(card, i) in bentoFeatures"
            :key="i"
            :class="['bento-card p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl space-y-5 flex flex-col justify-between shadow-xs', card.colSpan, card.bgAccent]"
          >
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/10 dark:bg-white/10">
                  {{ card.tag }}
                </span>
                <Icon :name="card.icon" class="w-5 h-5 opacity-80" />
              </div>
              <h3 class="text-base sm:text-lg font-bold tracking-tight">{{ card.title }}</h3>
              <p class="text-xs leading-relaxed opacity-85 font-medium">{{ card.desc }}</p>
            </div>

            <!-- Rich Visual UI Snippets per Card Type -->
            <div class="pt-2">
              <!-- Copilot UI Snippet -->
              <div v-if="card.previewType === 'copilot'" class="p-3.5 rounded-xl bg-white/10 dark:bg-black/40 border border-white/15 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-emerald-200">✨ Rekomendasi Hari Ini</span>
                  <span class="text-[10px] opacity-75">Baru saja</span>
                </div>
                <p class="text-[11px] leading-relaxed text-emerald-50">"Stok Minyak Goreng menipis. Alokasikan Rp 420.000 untuk reorder 12 pouch agar tidak kehilangan omset akhir pekan."</p>
              </div>

              <!-- Stock UI Snippet -->
              <div v-else-if="card.previewType === 'stock'" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                <div class="flex justify-between items-center text-[11px]">
                  <span class="font-bold">Bimoli 2L</span>
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700">Sisa 4</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-full w-1/4 rounded-full"></div>
                </div>
              </div>

              <!-- Finance UI Snippet -->
              <div v-else-if="card.previewType === 'finance'" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1 text-xs text-slate-800 dark:text-slate-200">
                <div class="flex justify-between text-[11px]">
                  <span class="text-slate-500">Omset Harian</span>
                  <span class="font-bold text-emerald-600">+18.4%</span>
                </div>
                <p class="text-sm font-extrabold">Rp 2.024.575</p>
              </div>

              <!-- Telegram UI Snippet -->
              <div v-else-if="card.previewType === 'telegram'" class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:message-square" class="w-4 h-4 text-[#0088cc]" />
                  <span class="font-medium text-[11px]">Telegram: "Catat beras 5kg 2 karung cash"</span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Tersimpan</span>
              </div>

              <!-- Marketing UI Snippet -->
              <div v-else-if="card.previewType === 'marketing'" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
                <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">📦 Paket Sembako Berkah Jumat</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#047857] text-white">Broadcast WA</span>
              </div>

              <!-- Security UI Snippet -->
              <div v-else class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                <Icon name="lucide:check-circle-2" class="w-4 h-4 text-emerald-600 shrink-0" />
                <span class="text-[11px] font-medium">Auto Cloud Backup & TLS 1.3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="faq" class="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/60">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div class="text-center space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-widest text-[#047857]">Bantuan & Panduan</span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Pertanyaan yang Sering Diajukan</h2>
        </div>
        <div class="divide-y divide-slate-200/80 dark:divide-slate-800 border-y border-slate-200/80 dark:border-slate-800">
          <div v-for="(faq, idx) in faqs" :key="idx" class="py-4 cursor-pointer" @click="faq.open = !faq.open">
            <div class="flex items-center justify-between gap-4">
              <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ faq.q }}</h4>
              <Icon :name="faq.open ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="w-4 h-4 text-slate-400 shrink-0 transition-transform" />
            </div>
            <p v-if="faq.open" class="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 6. FULL-WIDTH IMMERSIVE FOREST GREEN CTA SECTION ═══════════ -->
    <section class="relative py-24 sm:py-32 bg-gradient-to-b from-[#002B24] via-[#003B32] to-[#012620] text-white overflow-hidden border-t border-emerald-800/40">
      <!-- Background Ambient Glow & Neural Grid -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,120,87,0.35),transparent_75%)] pointer-events-none"></div>
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#04785710_1px,transparent_1px),linear-gradient(to_bottom,#04785710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40"></div>

      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <!-- 3D Mascot Avatar Highlight -->
        <div class="flex justify-center">
          <div class="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-2xl hover:scale-105 transition-transform">
            <img src="/agent-avatar/nahkoda-head.png" alt="Nahkoda Copilot" class="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]" />
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Siap Mentransformasi Toko Anda <br class="hidden sm:block" />
            Bersama <span class="bg-gradient-to-r from-emerald-300 via-amber-300 to-amber-400 bg-clip-text text-transparent">Nahkoda AI</span>?
          </h2>
          <p class="text-sm sm:text-base text-emerald-100/85 font-medium leading-relaxed max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pemilik warung & merchant pintar yang telah mengotomatisasi pencatatan stok, analisis keuntungan, dan melipatgandakan efisiensi usaha.
          </p>
        </div>

        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            to="/register"
            class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-950/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Daftar Merchant Gratis Sekarang</span>
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </NuxtLink>

          <NuxtLink
            to="/login"
            class="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 backdrop-blur-md flex items-center justify-center gap-2"
          >
            <Icon name="lucide:log-in" class="w-4 h-4 text-emerald-300" />
            <span>Masuk ke Akun Saya</span>
          </NuxtLink>
        </div>

        <!-- Security Trust Footnote -->
        <p class="text-xs text-emerald-300/60 font-medium flex items-center justify-center gap-1.5 pt-4">
          <Icon name="lucide:shield-check" class="w-4 h-4 text-emerald-400" />
          <span>Tanpa Biaya Tersembunyi &bull; Setup Kurang dari 2 Menit &bull; Data Terenkripsi Penuh</span>
        </p>
      </div>
    </section>

    <footer class="py-12 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-[#003B32] flex items-center justify-center p-1"><img :src="logoSrc" class="w-full h-full object-contain" alt="Nahkoda Logo" /></div>
            <span class="font-bold text-slate-900 dark:text-slate-100 text-sm">Nahkoda AI Copilot</span>
          </div>
          <div class="flex items-center gap-6 font-semibold">
            <a href="#simulator" class="hover:text-slate-900">Demo</a>
            <a href="#features" class="hover:text-slate-900">Fitur</a>
            <a href="#faq" class="hover:text-slate-900">FAQ</a>
            <NuxtLink to="/login" class="hover:text-slate-900">Masuk</NuxtLink>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>© 2026 Nahkoda AI Business Copilot. Hak Cipta Dilindungi Undang-Undang.</p>
          <p class="font-mono text-slate-400">Enterprise Edition v2.4.0</p>
        </div>
      </div>
    </footer>
  </div>
</template>
