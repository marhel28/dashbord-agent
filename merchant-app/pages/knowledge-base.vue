<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="border-b pb-4" style="border-color: var(--wp-navy);">
      <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Knowledge Base</h1>
      <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
        Dokumen, panduan, dan FAQ bisnis Anda.
      </p>
    </div>

    <!-- Search -->
    <div class="bg-white border p-4 shadow-sm" style="border-color: var(--wp-border);">
      <div class="flex items-center gap-3">
        <div class="flex-1 relative">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style="color: var(--wp-text-secondary);" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari dokumen, panduan, atau FAQ..."
            class="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            style="border-color: var(--wp-border); color: var(--wp-text);"
          />
        </div>
        <select
          v-model="selectedCategory"
          class="text-xs font-semibold border rounded-lg px-3 py-2.5 focus:outline-none"
          style="border-color: var(--wp-border); color: var(--wp-text);"
        >
          <option value="all">Semua Kategori</option>
          <option value="panduan">Panduan</option>
          <option value="faq">FAQ</option>
          <option value="template">Template</option>
          <option value="kebijakan">Kebijakan</option>
        </select>
      </div>
    </div>

    <!-- Document Grid -->
    <div v-if="filteredDocs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="doc in filteredDocs"
        :key="doc.id"
        class="bg-white border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        style="border-color: var(--wp-border);"
      >
        <div class="flex items-start gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            :style="{ backgroundColor: doc.iconBg }"
          >
            <Icon :name="doc.icon" class="w-5 h-5" :style="{ color: doc.iconColor }" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold truncate" style="color: var(--wp-navy);">{{ doc.title }}</h3>
            <p class="text-[10px] font-semibold mt-0.5" style="color: var(--wp-text-secondary);">{{ doc.category }}</p>
          </div>
        </div>
        <p class="text-xs leading-relaxed mb-3" style="color: var(--wp-text-secondary);">{{ doc.description }}</p>
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-semibold" style="color: var(--wp-text-secondary);">{{ doc.updated }}</span>
          <span
            class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style="background-color: #EFF6FF; color: #2563EB;"
          >
            {{ doc.type }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white border p-12 shadow-sm text-center" style="border-color: var(--wp-border);">
      <Icon name="heroicons:document-magnifying-glass" class="w-12 h-12 mx-auto mb-4" style="color: var(--wp-text-secondary);" />
      <h2 class="text-sm font-bold uppercase tracking-wider mb-2" style="color: var(--wp-navy);">Tidak Ada Dokumen</h2>
      <p class="text-xs" style="color: var(--wp-text-secondary);">Tidak ada dokumen yang cocok dengan pencarian Anda.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('all')

interface DocItem {
  id: string
  title: string
  description: string
  category: string
  type: string
  icon: string
  iconBg: string
  iconColor: string
  updated: string
}

const documents = ref<DocItem[]>([
  {
    id: '1',
    title: 'Panduan Memulai Bisnis UMKM',
    description: 'Langkah-langkah memulai usaha mikro kecil menengah dari nol hingga berjalan.',
    category: 'Panduan',
    type: 'PDF',
    icon: 'heroicons:book-open',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    updated: '10 Agt 2026',
  },
  {
    id: '2',
    title: 'Cara Mencatat Penjualan',
    description: 'Panduan lengkap mencatat transaksi penjualan harian di sistem.',
    category: 'Panduan',
    type: 'Artikel',
    icon: 'heroicons:clipboard-document-list',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    updated: '9 Agt 2026',
  },
  {
    id: '3',
    title: 'FAQ Manajemen Stok',
    description: 'Pertanyaan yang sering diajukan tentang pengelolaan stok barang.',
    category: 'FAQ',
    type: 'FAQ',
    icon: 'heroicons:question-mark-circle',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    updated: '8 Agt 2026',
  },
  {
    id: '4',
    title: 'Template Laporan Keuangan',
    description: 'Template siap pakai untuk laporan keuangan bulanan dan tahunan.',
    category: 'Template',
    type: 'Excel',
    icon: 'heroicons:table-cells',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    updated: '7 Agt 2026',
  },
  {
    id: '5',
    title: 'Kebijakan Retur & Garansi',
    description: 'Contoh kebijakan retur barang dan garansi untuk pelanggan.',
    category: 'Kebijakan',
    type: 'Dokumen',
    icon: 'heroicons:shield-check',
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    updated: '6 Agt 2026',
  },
  {
    id: '6',
    title: 'Tips Menaikkan Omzet',
    description: 'Strategi dan tips praktis untuk meningkatkan penjualan bulanan.',
    category: 'Panduan',
    type: 'Artikel',
    icon: 'heroicons:arrow-trending-up',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    updated: '5 Agt 2026',
  },
])

const filteredDocs = computed(() => {
  let docs = documents.value

  if (selectedCategory.value !== 'all') {
    docs = docs.filter((d) => d.category.toLowerCase() === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q),
    )
  }

  return docs
})
</script>
