<template>
  <div class="space-y-6 animate-fade-in pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 animate-fade-in-up" style="border-color: var(--wp-border);">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight" style="color: var(--wp-navy);">Pusat Bantuan & Panduan</h1>
        <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">
          Pelajari cara menggunakan berbagai fitur unggulan di Nahkoeda Agentic AI Bot untuk memaksimalkan bisnis Anda.
        </p>
      </div>
    </div>

    <!-- Search / Filter (Visual Only) -->
    <div class="relative max-w-xl animate-fade-in-up" style="animation-delay: 0.1s;">
      <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-3.5 w-5 h-5" style="color: var(--wp-text-secondary);" />
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Cari fitur atau panduan (contoh: 'keuangan', 'stok mati', 'telegram')..." 
        class="w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all shadow-sm focus:ring-2" 
        style="background-color: white; border-color: var(--wp-border); color: var(--wp-text); --tw-ring-color: var(--wp-gold);"
      />
    </div>

    <!-- Features Grid -->
    <div v-if="filteredCategories.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
      <div 
        v-for="(category, idx) in filteredCategories" 
        :key="idx" 
        class="bg-white border rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300 animate-fade-in-up"
        :style="`border-color: var(--wp-border); animation-delay: ${0.15 + (idx * 0.05)}s;`"
      >
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-inner" :style="`background: ${category.color};`">
            <Icon :name="category.icon" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-base font-bold" style="color: var(--wp-navy);">{{ category.title }}</h2>
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{{ category.section }}</p>
          </div>
        </div>
        
        <p class="text-xs leading-relaxed mb-4 flex-1" style="color: var(--wp-text-secondary);">
          {{ category.description }}
        </p>

        <div class="space-y-2 border-t pt-4 mt-auto" style="border-color: var(--wp-border);">
          <div v-for="(feature, fIdx) in category.features" :key="fIdx" class="flex items-start gap-2">
            <Icon name="heroicons:check-circle" class="w-4 h-4 shrink-0 mt-0.5" style="color: var(--wp-gold);" />
            <span class="text-xs font-medium text-slate-700 leading-snug">{{ feature }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="py-20 flex flex-col items-center justify-center text-center animate-fade-in">
      <div class="w-16 h-16 rounded-full bg-slate-50 border flex items-center justify-center mb-4 text-slate-300">
        <Icon name="heroicons:magnifying-glass-minus" class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-slate-700">Tidak Ada Hasil</h3>
      <p class="text-sm text-slate-500 max-w-md mt-2">
        Kami tidak dapat menemukan panduan untuk pencarian "{{ searchQuery }}". Coba gunakan kata kunci lain.
      </p>
      <button @click="searchQuery = ''" class="mt-6 px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm" style="background: var(--wp-gold);">
        Lihat Semua Panduan
      </button>
    </div>

    <!-- Pertanyaan yang Sering Diajukan (FAQ) -->
    <div class="mt-8 border-t pt-8 animate-fade-in-up" style="border-color: var(--wp-border); animation-delay: 0.3s;">
      <h2 class="text-xl font-extrabold mb-6" style="color: var(--wp-navy);">Tanya Jawab (FAQ)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(faq, idx) in faqs" :key="idx" class="bg-white border rounded-xl p-5 shadow-sm" style="border-color: var(--wp-border);">
          <h3 class="text-sm font-bold mb-2 flex items-start gap-2" style="color: var(--wp-navy);">
            <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            {{ faq.question }}
          </h3>
          <p class="text-xs leading-relaxed text-slate-600 pl-7">
            {{ faq.answer }}
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Help Banner -->
    <div class="mt-8 bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-lg">
      <div class="absolute -right-10 -top-10 opacity-10">
        <Icon name="heroicons:lifebuoy" class="w-48 h-48 text-white" />
      </div>
      <div class="relative z-10">
        <h3 class="text-lg md:text-xl font-bold text-white mb-2">Masih Bingung Cara Pakainya?</h3>
        <p class="text-sm text-slate-300 max-w-xl">
          Anda tidak perlu menghafal semua ini! Nahkoeda dilengkapi dengan <strong>Asisten AI Pintar</strong>. Cukup masuk ke menu <span class="text-amber-400 font-bold">Asisten AI</span> dan tanyakan apa saja dengan bahasa sehari-hari. Biarkan AI yang bekerja untuk Anda.
        </p>
      </div>
      <NuxtLink to="/chat" class="relative z-10 shrink-0 px-6 py-3 bg-white text-slate-900 text-sm font-bold rounded-xl shadow-md hover:bg-slate-50 transition-colors flex items-center gap-2">
        <Icon name="heroicons:sparkles" class="w-5 h-5 text-amber-500" />
        Tanya AI Sekarang
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'Pusat Bantuan - Nahkoeda',
})

const searchQuery = ref('')

// Pertanyaan yang Sering Diajukan (FAQ) - Plain, Direct, Non-AI Slop
const faqs = [
  {
    question: 'Bagaimana cara melihat barang yang paling susah laku?',
    answer: 'Buka menu "Analitik" di sebelah kiri, lalu lihat bagian "Stok Mati". Di situ ada daftar barang yang tidak terjual sama sekali beserta info berapa rupiah uang modal Anda yang tertahan.'
  },
  {
    question: 'Kenapa angka di menu Keuangan berbeda dengan Laporan Penjualan?',
    answer: 'Laporan Penjualan hanya menghitung omset kotor dari barang laku. Sedangkan menu Keuangan menghitung semuanya, termasuk pengeluaran harian (bayar listrik, gaji karyawan) dan uang kulakan (restock) sehingga menghasilkan Laba Bersih riil.'
  },
  {
    question: 'Apa maksudnya modal "mangkrak" atau "tertahan"?',
    answer: 'Modal mangkrak adalah uang belanja Anda yang nyangkut karena barangnya tidak laku-laku. Daripada menumpuk di gudang, sebaiknya barang ini segera didiskon agar uangnya bisa berputar lagi.'
  },
  {
    question: 'Bagaimana cara terima laporan otomatis di Telegram?',
    answer: 'Masuk ke menu "Konektor", lalu klik "Hubungkan Telegram" dan ikuti petunjuknya. Kalau sudah tersambung, bot akan otomatis mengirim laporan penjualan ke HP Anda.'
  },
  {
    question: 'Bolehkah saya pakai bahasa daerah saat ngobrol dengan Asisten AI?',
    answer: 'Boleh. Anda tidak perlu bahasa baku. Cukup ketik santai seperti "Tolong cek penjualan hari ini" atau "Barang apa yang lagi kosong?", AI akan mengerti dan langsung mencarikan datanya.'
  },
  {
    question: 'Ada kesalahan ketik saat input pengeluaran, bagaimana perbaikinya?',
    answer: 'Fitur edit pengeluaran sedang dalam pengembangan. Untuk sementara, Anda bisa membatalkan efeknya dengan mencatat pemasukan (Lain-lain) sebesar angka yang salah agar saldonya kembali seimbang.'
  }
]

// Content for help center based on existing features
const helpCategories = [
  {
    title: 'Asisten AI & Copilot',
    section: 'AI Copilot',
    icon: 'heroicons:cpu-chip',
    color: 'linear-gradient(135deg, #0F1A2E, #1e293b)', // wp-navy
    description: 'Pusat kendali kecerdasan buatan. Sistem AI agentic yang bisa mengeksekusi tugas kompleks secara mandiri.',
    features: [
      'Chat Asisten: Mengobrol dengan AI untuk analisa data & saran bisnis.',
      'Memory: Melihat daftar agen AI yang sedang berjalan di background.',
      'Skill Marketplace: Tambah kemampuan (skill) khusus untuk AI.',
      'Knowledge Base: Menambahkan dokumen (PDF/Teks) agar AI lebih pintar memahami konteks bisnis Anda.'
    ]
  },
  {
    title: 'Laporan Penjualan (Sales)',
    section: 'Bisnis & Operasional',
    icon: 'heroicons:banknotes',
    color: 'linear-gradient(135deg, #10B981, #059669)', // emerald
    description: 'Pantau omset harian, mingguan, atau bulanan secara mendetail dengan grafik interaktif.',
    features: [
      'Visualisasi metrik utama: Pendapatan, Laba Kotor, dan Rata-rata transaksi.',
      'Filter Tanggal Kustom: Tarik data laporan dengan rentang waktu bebas.',
      'Daftar Transaksi Terbaru: Riwayat kasir atau invoice terbaru.',
      'Chart Kategori & Metode Pembayaran.'
    ]
  },
  {
    title: 'Kecerdasan Bisnis (Analitik)',
    section: 'Manajemen',
    icon: 'heroicons:chart-pie',
    color: 'linear-gradient(135deg, #D4A843, #B88E35)', // wp-gold
    description: 'Analisis mendalam dari AI untuk membongkar performa toko dan menemukan peluang bisnis.',
    features: [
      'Jam Tersibuk: Mengetahui kapan toko Anda paling ramai pembeli.',
      'Paling Laris Terjual: Mengetahui barang primadona yang cepat habis.',
      'Stok Mati (Dead Stock): Menemukan barang yang mandek dan menjebol modal agar bisa segera didiskon/dikeluarkan.'
    ]
  },
  {
    title: 'Manajemen Keuangan',
    section: 'Bisnis & Operasional',
    icon: 'heroicons:wallet',
    color: 'linear-gradient(135deg, #3B82F6, #2563EB)', // blue
    description: 'Sistem pembukuan modern untuk mencatat semua aliran uang masuk dan uang keluar (Cashflow).',
    features: [
      'Catat Pengeluaran Operasional (Opex), Gaji, dll.',
      'Otomatis menghitung modal kulakan (Restock) sebagai pengeluaran.',
      'Pencatatan Kasbon (Piutang) dan Hutang.',
      'Unduh Laporan PDF: Hasilkan file laporan keuangan dalam format PDF (dikirim & diproses otomatis di background).'
    ]
  },
  {
    title: 'Stok Barang (Inventory)',
    section: 'Bisnis & Operasional',
    icon: 'heroicons:archive-box',
    color: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', // violet
    description: 'Sistem manajemen inventaris lengkap untuk mengontrol perpindahan barang masuk dan keluar.',
    features: [
      'Peringatan Stok Menipis otomatis.',
      'Pencatatan Kulakan (Restock) dan Riwayat Pergerakan Barang.',
      'Manajemen Kategori dan Harga Pokok/Jual barang.'
    ]
  },
  {
    title: 'Konektor & Notifikasi Telegram',
    section: 'Sistem',
    icon: 'heroicons:paper-airplane',
    color: 'linear-gradient(135deg, #0284C7, #0369A1)', // sky
    description: 'Hubungkan sistem toko dengan aplikasi pihak ketiga seperti Telegram untuk menerima notifikasi real-time.',
    features: [
      'Bind Akun: Hubungkan Telegram pribadi Anda ke aplikasi.',
      'Notifikasi Transaksi: Dapatkan pesan setiap ada barang terjual.',
      'Laporan Otomatis: Terima ringkasan PDF atau teks langsung ke chat Telegram Anda setiap jam tertentu.'
    ]
  }
]

const filteredCategories = computed(() => {
  if (!searchQuery.value) return helpCategories
  
  const q = searchQuery.value.toLowerCase()
  return helpCategories.filter(cat => {
    const matchTitle = cat.title.toLowerCase().includes(q)
    const matchDesc = cat.description.toLowerCase().includes(q)
    const matchFeatures = cat.features.some(f => f.toLowerCase().includes(q))
    const matchSection = cat.section.toLowerCase().includes(q)
    return matchTitle || matchDesc || matchFeatures || matchSection
  })
})
</script>
