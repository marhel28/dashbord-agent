<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/ai" class="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors bg-white dark:bg-slate-900 shadow-2xs">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Katalog Keahlian AI (Skills & Tools)
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar perkakas fungsional yang dapat dipanggil secara otonom oleh agen AI.
          </p>
        </div>
      </div>
    </div>

    <!-- Skills Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="skill in skills" :key="skill.name" class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-200/60 dark:border-emerald-900/40">
              {{ skill.toolId }}
            </h3>
            <Badge variant="outline" class="text-[10px]">Aktif</Badge>
          </div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">{{ skill.name }}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ skill.description }}</p>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-mono">
          Schema: {{ skill.params }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const skills = [
  { toolId: 'create_transaction', name: 'Catat Transaksi Kasir', description: 'Membuat rekaman penjualan baru, mengurangi stok produk, dan mengupdate saldo dompet merchant.', params: '{ items: Array, payment_method: String }' },
  { toolId: 'search_catalog', name: 'Pencarian Semantik Produk', description: 'Mencari barang di database menggunakan embedding vector dan kata kunci fleksibel.', params: '{ query: String, threshold: Float }' },
  { toolId: 'adjust_stock', name: 'Penyesuaian Stok Cepat', description: 'Menambah atau mengurangi stok barang saat kulakan atau inventarisasi fisik.', params: '{ product_id: String, delta: Number }' },
  { toolId: 'generate_sales_report', name: 'Kalkulasi Laporan Penjualan', description: 'Menghitung total pemasukan, profit kotor, dan item terlaris pada rentang tanggal tertentu.', params: '{ start_date: String, end_date: String }' },
  { toolId: 'extract_receipt_items', name: 'Ekstraksi Foto Nota Struk', description: 'Mengubah citra foto struk belanja supplier menjadi daftar baris inventaris siap input.', params: '{ image_url: String }' },
  { toolId: 'check_geo_density', name: 'Pemeriksaan Kepadatan Area', description: 'Menganalisis sebaran pesaing dan merchant sejenis pada radius geospasial tertentu.', params: '{ latitude: Float, longitude: Float, radius_km: Number }' }
]
</script>
