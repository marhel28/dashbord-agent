<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. PAGE HEADER ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Produk & Stok</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {{ stocks.length }} produk aktif · Lacak level stok, harga & kategori.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" class="h-9 text-xs gap-1.5 rounded-lg" @click="showImportModal = true">
          <Icon name="lucide:file-up" class="w-4 h-4" />
          <span>Import CSV/Excel</span>
        </Button>
        <Button size="sm" class="h-9 bg-[#047857] hover:bg-[#065f46] text-white text-xs gap-1.5 rounded-lg font-semibold" @click="openCreateModal">
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span>Tambah Produk</span>
        </Button>
      </div>
    </div>

    <!-- ═══════════ 2. SKELETON LOADING STATE ═══════════ -->
    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
      </div>
      <Skeleton class="h-12 w-full rounded-xl" />
      <div class="space-y-2">
        <Skeleton v-for="i in 6" :key="i" class="h-14 w-full rounded-lg" />
      </div>
    </div>

    <!-- ═══════════ 3. ERROR STATE ═══════════ -->
    <div v-else-if="error" class="flex items-center justify-center py-16">
      <div class="text-center space-y-4 max-w-sm border border-red-200 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-xs">
        <div class="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-red-50 text-red-600">
          <Icon name="lucide:alert-triangle" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Gagal Memuat Stok</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ error }}</p>
        </div>
        <Button variant="default" size="sm" @click="fetchStocks" class="rounded-lg">
          Coba Lagi
        </Button>
      </div>
    </div>

    <!-- ═══════════ 4. EMPTY STATE ═══════════ -->
    <div v-else-if="stocks.length === 0" class="flex items-center justify-center py-16">
      <div class="text-center space-y-4 max-w-md border border-slate-200 dark:border-slate-800 p-8 bg-white dark:bg-slate-900 rounded-xl shadow-xs">
        <div class="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <Icon name="lucide:package-open" class="w-8 h-8" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Belum Ada Produk</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Tambahkan produk pertama untuk mulai mengelola stok dan penjualan toko Anda.
          </p>
        </div>
        <div class="flex justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" @click="showImportModal = true" class="rounded-lg text-xs">
            Import CSV / Excel
          </Button>
          <Button size="sm" class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold" @click="openCreateModal">
            + Tambah Produk Pertama
          </Button>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- ═══════════ 5. KPI SUMMARY CARDS (CLICKABLE NAVIGATION SHORTCUTS) ═══════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Produk -->
        <button
          @click="activeStatusFilter = 'all'; activeCategoryFilter = 'all'"
          class="p-4 rounded-xl text-left transition-all border shadow-xs bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          :class="activeStatusFilter === 'all' && activeCategoryFilter === 'all' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800'"
        >
          <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Produk</span>
          <p class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1">{{ totalActiveProducts }}</p>
          <p class="text-[10px] text-slate-400 mt-1">Klik untuk lihat semua</p>
        </button>

        <!-- Stok Menipis (Navigation Shortcut) -->
        <button
          @click="activeStatusFilter = 'low'"
          class="p-4 rounded-xl text-left transition-all border shadow-xs bg-white dark:bg-slate-900 hover:border-amber-400"
          :class="activeStatusFilter === 'low' ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/20' : 'border-slate-200 dark:border-slate-800'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-amber-700 dark:text-amber-400">Stok Menipis</span>
            <span v-if="lowStockCount > 0" class="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-amber-600 mt-1">{{ lowStockCount }}</p>
          <p class="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-1">di bawah minimum stok</p>
        </button>

        <!-- Stok Habis (Navigation Shortcut) -->
        <button
          @click="activeStatusFilter = 'out'"
          class="p-4 rounded-xl text-left transition-all border shadow-xs bg-white dark:bg-slate-900 hover:border-red-400"
          :class="activeStatusFilter === 'out' ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-red-600 dark:text-red-400">Stok Habis</span>
            <span v-if="outOfStockCount > 0" class="w-2 h-2 rounded-full bg-red-500"></span>
          </div>
          <p class="text-2xl font-bold font-mono tracking-tight text-red-600 mt-1">{{ outOfStockCount }}</p>
          <p class="text-[10px] text-red-600/80 dark:text-red-400/80 mt-1">perlu restock segera</p>
        </button>

        <!-- Nilai Stok -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
          <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Nilai Stok (Total)</span>
          <p class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1">{{ formatRupiah(totalStockValue) }}</p>
          <p class="text-[10px] text-slate-400 mt-1">Berdasarkan harga jual</p>
        </div>
      </div>

      <!-- ═══════════ 6. SEARCH & MULTI-FILTER BAR ═══════════ -->
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <!-- Multi-column Search -->
          <div class="relative flex-1">
            <Icon name="lucide:search" class="absolute left-3 top-2.5 w-4 h-4 text-slate-400 z-10" />
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Cari produk, SKU, barcode, atau kategori…"
              class="w-full h-9 pl-9 pr-8 text-xs rounded-lg"
              @input="onSearchInput"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 z-10">
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>

          <!-- Dropdown Filters (Category + Stock Status) -->
          <div class="flex items-center gap-2">
            <!-- Category Filter -->
            <select
              v-model="activeCategoryFilter"
              class="h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">Semua Kategori</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <!-- Status Filter -->
            <select
              v-model="activeStatusFilter"
              class="h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="in">In Stock (Tersedia)</option>
              <option value="low">Low Stock (Menipis)</option>
              <option value="out">Out of Stock (Habis)</option>
            </select>

            <!-- Reset Button -->
            <Button
              v-if="searchQuery || activeCategoryFilter !== 'all' || activeStatusFilter !== 'all'"
              variant="ghost" size="sm" class="h-9 text-xs text-slate-500 hover:text-slate-900"
              @click="resetFilters"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      <!-- ═══════════ 7. PRODUCTION PRODUCT TABLE (CLEAN 7-COLUMN) ═══════════ -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <!-- Desktop Table View (>= 768px) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4 w-10">
                  <input type="checkbox" :checked="selectAll" @change="selectAll = ($event.target as HTMLInputElement).checked" class="rounded border-slate-300 text-emerald-600" />
                </th>
                <th class="py-3 px-3 w-12 text-center">Foto</th>
                <th class="py-3 px-4 cursor-pointer hover:text-slate-900" @click="toggleSort('product_name')">
                  Product <span v-if="sortBy === 'product_name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="py-3 px-4">SKU</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4 text-right cursor-pointer hover:text-slate-900" @click="toggleSort('stock_quantity')">
                  Stock <span v-if="sortBy === 'stock_quantity'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="py-3 px-4 text-right cursor-pointer hover:text-slate-900" @click="toggleSort('price')">
                  Selling Price <span v-if="sortBy === 'price'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr
                v-for="item in paginatedStocks" :key="item.uuid"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                @click="openQuickView(item)"
              >
                <!-- Checkbox -->
                <td class="py-3 px-4" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedUuids.includes(item.uuid)"
                    @change="toggleSelect(item.uuid)"
                    class="rounded border-slate-300 text-emerald-600"
                  />
                </td>

                <!-- Image Thumbnail -->
                <td class="py-2 px-3 text-center">
                  <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center mx-auto">
                    <img v-if="item.photo_url" :src="item.photo_url" :alt="item.product_name" class="w-full h-full object-cover" />
                    <Icon v-else name="lucide:image" class="w-4 h-4 text-slate-400" />
                  </div>
                </td>

                <!-- Product Name + SKU Subtitle -->
                <td class="py-3 px-4">
                  <p class="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors">{{ item.product_name }}</p>
                  <p class="text-[11px] text-slate-400 font-mono mt-0.5">{{ item.sku || 'No SKU' }}</p>
                </td>

                <!-- SKU Code -->
                <td class="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">{{ item.sku || '—' }}</td>

                <!-- Category Badge (Subtle Soft Slate) -->
                <td class="py-3 px-4">
                  <span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {{ item.category || 'Uncategorized' }}
                  </span>
                </td>

                <!-- Stock + Visual Signal -->
                <td class="py-3 px-4 text-right font-mono">
                  <span class="font-semibold text-slate-900 dark:text-slate-100">{{ item.stock_quantity }}</span>
                  <span class="text-[10px] text-slate-400 uppercase ml-1">{{ item.unit }}</span>
                  <span v-if="item.stock_quantity <= item.min_stock && item.stock_quantity > 0" class="block text-[10px] text-amber-600 font-medium">Low stock</span>
                  <span v-else-if="item.stock_quantity === 0" class="block text-[10px] text-red-600 font-medium">Out of stock</span>
                </td>

                <!-- Price -->
                <td class="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {{ formatRupiah(item.price) }}
                </td>

                <!-- Status Dot Badge -->
                <td class="py-3 px-4 text-center">
                  <Badge
                    :variant="item.stock_quantity === 0 ? 'destructive' : item.stock_quantity <= item.min_stock ? 'warning' : 'success'"
                    class="text-[10px] rounded-md font-medium gap-1"
                  >
                    {{ item.stock_quantity === 0 ? 'Out of Stock' : item.stock_quantity <= item.min_stock ? 'Low Stock' : 'In Stock' }}
                  </Badge>
                </td>

                <!-- Actions (Safe Edit & Safe Delete) -->
                <td class="py-3 px-4 text-right" @click.stop>
                  <div class="flex items-center justify-end gap-1">
                    <button class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded" @click="openQuickView(item)" title="Quick View">
                      <Icon name="lucide:eye" class="w-4 h-4" />
                    </button>
                    <button class="p-1.5 text-slate-400 hover:text-emerald-600 rounded" @click="openEditModal(item)" title="Edit">
                      <Icon name="lucide:pencil" class="w-4 h-4" />
                    </button>
                    <button class="p-1.5 text-slate-400 hover:text-red-600 rounded" @click="confirmDelete(item)" title="Delete">
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List View (< 768px) -->
        <div class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="item in paginatedStocks" :key="item.uuid" class="p-4 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100" @click="openQuickView(item)">{{ item.product_name }}</h4>
                <p class="text-[11px] font-mono text-slate-400">SKU: {{ item.sku || '—' }}</p>
              </div>
              <span class="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{{ formatRupiah(item.price) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1">
              <span class="text-slate-500 font-mono">{{ item.stock_quantity }} {{ item.unit }}</span>
              <Badge
                :variant="item.stock_quantity === 0 ? 'destructive' : item.stock_quantity <= item.min_stock ? 'warning' : 'success'"
                class="text-[10px]"
              >
                {{ item.stock_quantity === 0 ? 'Out of Stock' : item.stock_quantity <= item.min_stock ? 'Low Stock' : 'In Stock' }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- ═══════════ SERVER-SIDE PAGINATION FOOTER ═══════════ -->
        <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredStocks.length) }} of {{ filteredStocks.length }} products</p>
          <div class="flex items-center gap-2">
            <select v-model="pageSize" class="h-8 px-2 rounded border border-slate-200 dark:border-slate-800 text-xs">
              <option :value="15">15 per page</option>
              <option :value="30">30 per page</option>
              <option :value="50">50 per page</option>
            </select>
            <div class="flex items-center gap-1">
              <Button variant="outline" size="sm" class="h-8 px-2" :disabled="currentPage === 1" @click="currentPage--">Prev</Button>
              <span class="px-2 font-mono font-medium text-slate-700 dark:text-slate-300">{{ currentPage }} / {{ totalPages }}</span>
              <Button variant="outline" size="sm" class="h-8 px-2" :disabled="currentPage >= totalPages" @click="currentPage++">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ 8. QUICK VIEW SIDE DRAWER ═══════════ -->
    <Teleport to="body">
      <div v-if="selectedQuickView" class="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-xs" @click.self="selectedQuickView = null">
        <div class="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 space-y-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Product Details</h3>
              <button @click="selectedQuickView = null" class="text-slate-400 hover:text-slate-600">
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <!-- Product Image Preview in Drawer -->
            <div class="w-full h-48 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center relative group">
              <img
                v-if="selectedQuickView.photo_url"
                :src="selectedQuickView.photo_url"
                :alt="selectedQuickView.product_name"
                class="w-full h-full object-cover"
              />
              <div v-else class="text-center space-y-2 text-slate-400">
                <Icon name="lucide:image" class="w-10 h-10 mx-auto opacity-50" />
                <span class="text-xs block">Tidak ada foto produk</span>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ selectedQuickView.product_name }}</h2>
                <p class="text-xs font-mono text-slate-400 mt-0.5">SKU: {{ selectedQuickView.sku || '—' }}</p>
                <p v-if="selectedQuickView.description" class="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {{ selectedQuickView.description }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span class="text-[11px] font-medium text-slate-400">Stock Available</span>
                  <p class="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">{{ selectedQuickView.stock_quantity }} {{ selectedQuickView.unit }}</p>
                </div>
                <div>
                  <span class="text-[11px] font-medium text-slate-400">Selling Price</span>
                  <p class="text-xl font-bold font-mono text-emerald-600 mt-0.5">{{ formatRupiah(selectedQuickView.price) }}</p>
                </div>
              </div>

              <div class="space-y-2 text-xs">
                <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-400">Cost Price (Modal)</span>
                  <span class="font-mono font-medium text-slate-700 dark:text-slate-300">{{ selectedQuickView.cost_price ? formatRupiah(selectedQuickView.cost_price) : '—' }}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-400">Category</span>
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ selectedQuickView.category || 'Uncategorized' }}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-400">Minimum Stock</span>
                  <span class="font-mono font-medium text-slate-700 dark:text-slate-300">{{ selectedQuickView.min_stock }} {{ selectedQuickView.unit }}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-400">Barcode</span>
                  <span class="font-mono font-medium text-slate-700 dark:text-slate-300">{{ selectedQuickView.barcode || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <Button variant="outline" class="flex-1 rounded-lg text-xs" @click="selectedQuickView = null">Close</Button>
            <Button class="flex-1 bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold" @click="openEditModal(selectedQuickView); selectedQuickView = null">
              Edit Product
            </Button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════ 9. CREATE / EDIT PRODUCT MODAL (HIGH Z-INDEX) ═══════════ -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs" @click.self="closeModal">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
          <!-- Modal Header -->
          <div class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">
                {{ isEditing ? 'Edit Detail Produk' : 'Buat Produk Baru' }}
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ isEditing ? 'Perbarui level stok, harga, foto, dan informasi katalog.' : 'Masukkan spesifikasi produk baru ke inventaris toko.' }}
              </p>
            </div>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body Form -->
          <form @submit.prevent="saveProduct" class="p-6 space-y-4 overflow-y-auto min-h-0 flex-1 text-xs">
            <!-- Row 1: Product Name & SKU -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label for="form-name" class="font-semibold text-slate-700 dark:text-slate-300">
                  Nama Produk <span class="text-red-500">*</span>
                </Label>
                <Input
                  id="form-name"
                  v-model="form.product_name"
                  type="text"
                  required
                  placeholder="Cth: Indomie Goreng Spesial"
                  class="h-9 text-xs rounded-lg"
                />
                <p v-if="formErrors.product_name" class="text-[10px] text-red-500 font-medium">{{ formErrors.product_name }}</p>
              </div>
              <div class="space-y-1.5">
                <Label for="form-sku" class="font-semibold text-slate-700 dark:text-slate-300">SKU Code</Label>
                <Input
                  id="form-sku"
                  v-model="form.sku"
                  type="text"
                  placeholder="Cth: IND-GOR-001"
                  class="h-9 text-xs rounded-lg font-mono"
                />
              </div>
            </div>

            <!-- Row 2: Barcode & Category -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label for="form-barcode" class="font-semibold text-slate-700 dark:text-slate-300">Barcode / EAN</Label>
                <Input
                  id="form-barcode"
                  v-model="form.barcode"
                  type="text"
                  placeholder="Cth: 8991234567890"
                  class="h-9 text-xs rounded-lg font-mono"
                />
              </div>
              <div class="space-y-1.5">
                <Label for="form-category" class="font-semibold text-slate-700 dark:text-slate-300">Kategori Produk</Label>
                <select id="form-category" v-model="form.category" class="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <option value="">Pilih Kategori</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>

            <!-- Row 3: Product Image CRUD (Upload / URL) -->
            <div class="space-y-2">
              <Label class="font-semibold text-slate-700 dark:text-slate-300">Foto Produk</Label>
              <div class="flex items-start gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div class="w-20 h-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center relative">
                  <img v-if="imagePreview || form.photo_url" :src="imagePreview || form.photo_url" class="w-full h-full object-cover" />
                  <Icon v-else name="lucide:image" class="w-6 h-6 text-slate-400" />
                  <div v-if="uploadingImage" class="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                  </div>
                </div>

                <div class="flex-1 space-y-2">
                  <div class="flex items-center gap-2">
                    <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 font-medium text-xs">
                      <Icon name="lucide:upload" class="w-3.5 h-3.5 text-emerald-600" />
                      <span>{{ form.photo_url ? 'Ganti Foto' : 'Upload File' }}</span>
                      <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                    </label>
                    <button v-if="form.photo_url || imagePreview" type="button" class="text-red-500 hover:text-red-700 p-1.5" @click="form.photo_url = ''; imagePreview = ''" title="Hapus foto">
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    v-model="form.photo_url"
                    type="text"
                    placeholder="Atau masukkan URL Foto (http://...)"
                    class="h-8 text-xs font-mono rounded-md"
                  />
                  <p class="text-[10px] text-slate-400">JPG, PNG, WEBP Maksimal 5MB.</p>
                  <p v-if="uploadError" class="text-[10px] text-red-500 font-medium">{{ uploadError }}</p>
                </div>
              </div>
            </div>

            <!-- Row 4: Description -->
            <div class="space-y-1.5">
              <Label for="form-desc" class="font-semibold text-slate-700 dark:text-slate-300">Deskripsi</Label>
              <Textarea
                id="form-desc"
                v-model="form.description"
                rows="2"
                placeholder="Deskripsi singkat produk…"
                class="text-xs rounded-lg"
              />
            </div>

            <!-- Row 5: Price & Cost Price -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label for="form-price" class="font-semibold text-slate-700 dark:text-slate-300">
                  Harga Jual <span class="text-red-500">*</span>
                </Label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-xs font-semibold text-slate-400">Rp</span>
                  <Input
                    id="form-price"
                    v-model.number="form.price"
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    class="pl-9 h-9 text-xs font-mono rounded-lg"
                  />
                </div>
              </div>
              <div class="space-y-1.5">
                <Label for="form-cost" class="font-semibold text-slate-700 dark:text-slate-300">Cost Price (Harga Modal)</Label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-xs font-semibold text-slate-400">Rp</span>
                  <Input
                    id="form-cost"
                    v-model.number="form.cost_price"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="pl-9 h-9 text-xs font-mono rounded-lg"
                  />
                </div>
              </div>
            </div>

            <!-- Row 6: Stock, Min Stock & Unit -->
            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1.5">
                <Label for="form-stock" class="font-semibold text-slate-700 dark:text-slate-300">
                  Stok Available <span class="text-red-500">*</span>
                </Label>
                <Input
                  id="form-stock"
                  v-model.number="form.stock_quantity"
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  class="h-9 text-xs font-mono rounded-lg"
                />
              </div>
              <div class="space-y-1.5">
                <Label for="form-min" class="font-semibold text-slate-700 dark:text-slate-300">Min Stok</Label>
                <Input
                  id="form-min"
                  v-model.number="form.min_stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="h-9 text-xs font-mono rounded-lg"
                />
              </div>
              <div class="space-y-1.5">
                <Label for="form-unit" class="font-semibold text-slate-700 dark:text-slate-300">Satuan</Label>
                <select id="form-unit" v-model="form.unit" class="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                  <option value="box">box</option>
                  <option value="pack">pack</option>
                  <option value="carton">carton</option>
                  <option value="gram">gram</option>
                  <option value="ml">ml</option>
                </select>
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <label v-if="isEditing" class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.is_active" type="checkbox" class="rounded border-slate-300 text-emerald-600" />
                <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Produk Aktif</span>
              </label>
              <div v-else></div>
              <div class="flex gap-2">
                <Button type="button" variant="outline" size="sm" @click="closeModal" class="rounded-lg">Batal</Button>
                <Button type="submit" size="sm" :disabled="saving" class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg font-semibold">
                  <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                  <Icon v-else name="lucide:check" class="w-4 h-4" />
                  <span>{{ isEditing ? 'Simpan Perubahan' : 'Simpan Produk' }}</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════ 10. CSV / EXCEL IMPORT MODAL ═══════════ -->
    <Dialog :open="showImportModal" @update:open="showImportModal = $event">
      <DialogContent class="sm:max-w-md" @close="showImportModal = false">
        <DialogHeader>
          <DialogTitle>Import Produk (CSV / Excel)</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2 text-xs text-slate-600">
          <p>Upload file CSV atau Excel berisi daftar produk Anda dengan kolom wajib: <code>name, sku, category, stock, price</code>.</p>
          <div class="border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-xl text-center space-y-2">
            <Icon name="lucide:file-spreadsheet" class="w-8 h-8 mx-auto text-emerald-600" />
            <p class="font-medium">Pilih file CSV atau XLS untuk di-upload</p>
            <input type="file" accept=".csv, .xlsx, .xls" class="hidden" id="import-file" @change="handleImportFile" />
            <label for="import-file" class="inline-block px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold cursor-pointer">Browse File</label>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- ═══════════ 11. SAFE DELETE CONFIRMATION DIALOG ═══════════ -->
    <Dialog :open="showDeleteConfirm" @update:open="showDeleteConfirm = $event">
      <DialogContent class="sm:max-w-sm" @close="showDeleteConfirm = false">
        <div class="w-12 h-12 mx-auto flex items-center justify-center mb-4 rounded-full bg-red-50 text-red-600">
          <Icon name="lucide:alert-triangle" class="w-6 h-6" />
        </div>
        <DialogHeader>
          <DialogTitle class="text-center">Hapus Produk?</DialogTitle>
        </DialogHeader>
        <p class="text-xs mt-2 text-center text-slate-500">
          Apakah Anda yakin ingin menghapus <strong class="text-slate-900 dark:text-slate-100">"{{ deleteTarget?.product_name }}"</strong>?
          <span v-if="deleteTarget && deleteTarget.stock_quantity > 0" class="block font-semibold text-amber-600 mt-1">Produk ini memiliki {{ deleteTarget.stock_quantity }} {{ deleteTarget.unit }} di inventaris.</span>
        </p>
        <div class="flex gap-3 mt-6">
          <Button variant="outline" @click="showDeleteConfirm = false" class="flex-1 rounded-lg text-xs">Batal</Button>
          <Button variant="destructive" @click="doDelete" :disabled="deleting" class="flex-1 rounded-lg text-xs">
            <span>Hapus Produk</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- ═══════════ 12. BULK SELECTION ACTION BAR ═══════════ -->
    <Teleport to="body">
      <div v-if="selectedUuids.length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 shadow-xl bg-slate-900 text-white rounded-xl flex items-center gap-4 text-xs">
        <span class="font-bold font-mono">{{ selectedUuids.length }} selected</span>
        <div class="h-4 w-px bg-slate-700"></div>
        <button class="hover:text-red-400 font-medium" @click="confirmBatchDelete">Delete Selected</button>
        <button class="text-slate-400 hover:text-white" @click="selectedUuids = []">Cancel</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '~/utils/api'
import Card from '~/components/ui/card.vue'
import CardContent from '~/components/ui/card-content.vue'
import Badge from '~/components/ui/badge.vue'
import Button from '~/components/ui/button.vue'
import Input from '~/components/ui/input.vue'
import Label from '~/components/ui/label.vue'
import Textarea from '~/components/ui/textarea.vue'
import Select from '~/components/ui/select.vue'
import Dialog from '~/components/ui/dialog.vue'
import DialogContent from '~/components/ui/dialog-content.vue'
import DialogHeader from '~/components/ui/dialog-header.vue'
import DialogTitle from '~/components/ui/dialog-title.vue'
import Skeleton from '~/components/ui/skeleton.vue'

// ── Types ──
interface StockItem {
  uuid: string
  product_name: string
  sku: string | null
  barcode: string | null
  description: string | null
  price: number
  cost_price: number | null
  stock_quantity: number
  min_stock: number
  unit: string
  category: string | null
  photo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface StockForm {
  product_name: string
  sku: string
  barcode: string
  description: string
  price: number | ''
  cost_price: number | null
  stock_quantity: number | ''
  min_stock: number
  unit: string
  category: string
  is_active: boolean
}

// ── State ──
const stocks = ref<StockItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const activeCategoryFilter = ref('all')
const activeStatusFilter = ref<'all' | 'in' | 'low' | 'out'>('all')

// Sorting State
const sortBy = ref<'product_name' | 'stock_quantity' | 'price'>('product_name')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Pagination State
const currentPage = ref(1)
const pageSize = ref(15)

// Modals & Drawers
const selectedQuickView = ref<StockItem | null>(null)
const showImportModal = ref(false)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const editingUuid = ref<string | null>(null)
const deleteTarget = ref<StockItem | null>(null)
const saving = ref(false)
const deleting = ref(false)

// Multi-select & Batch Actions State
const selectedUuids = ref<string[]>([])
const showBatchDeleteConfirm = ref(false)

// Suggestions & Searching
interface Suggestion {
  uuid: string
  product_name: string
  category: string
  price: number
  stock_quantity: number
}
const suggestions = ref<Suggestion[]>([])
const searching = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const categories = ['Staples', 'Beverages', 'Snacks', 'Dairy', 'Frozen', 'Household', 'Personal Care', 'Other']

const emptyForm = (): StockForm & { photo_url: string } => ({
  product_name: '',
  sku: '',
  barcode: '',
  description: '',
  price: '',
  stock_quantity: '',
  min_stock: 0,
  unit: 'pcs',
  category: '',
  cost_price: null,
  is_active: true,
  photo_url: '',
})

const form = ref<StockForm & { photo_url: string }>(emptyForm())
const formErrors = ref<Record<string, string>>({})
const imagePreview = ref<string>('')
const uploadingImage = ref(false)
const uploadError = ref<string>('')

// ── Multi-select ──
const selectAll = computed({
  get: () => filteredStocks.value.length > 0 && selectedUuids.value.length === filteredStocks.value.length,
  set: (val: boolean) => {
    if (val) {
      selectedUuids.value = filteredStocks.value.map(s => s.uuid)
    } else {
      selectedUuids.value = []
    }
  }
})

const toggleSelect = (uuid: string) => {
  const idx = selectedUuids.value.indexOf(uuid)
  if (idx > -1) {
    selectedUuids.value.splice(idx, 1)
  } else {
    selectedUuids.value.push(uuid)
  }
}

const confirmBatchDelete = () => {
  if (selectedUuids.value.length > 0) {
    showBatchDeleteConfirm.value = true
  }
}

const doBatchDelete = async () => {
  if (selectedUuids.value.length === 0) return
  deleting.value = true
  try {
    await Promise.all(selectedUuids.value.map(uuid => api.delete(`/stocks/${uuid}`)))
    selectedUuids.value = []
    showBatchDeleteConfirm.value = false
    await fetchStocks()
  } catch (err: any) {
    // error silent
  } finally {
    deleting.value = false
  }
}

// ── Computed Helpers ──
const availableCategories = computed(() => {
  const set = new Set(stocks.value.map(s => s.category).filter(Boolean) as string[])
  return [...set].sort()
})

const totalActiveProducts = computed(() => stocks.value.filter(s => s.is_active).length)
const lowStockCount = computed(() => stocks.value.filter(s => s.is_active && s.stock_quantity > 0 && s.stock_quantity <= s.min_stock).length)
const outOfStockCount = computed(() => stocks.value.filter(s => s.is_active && s.stock_quantity === 0).length)
const totalStockValue = computed(() => stocks.value.filter(s => s.is_active).reduce((acc, item) => acc + (item.price * item.stock_quantity), 0))

// ── Filter & Search Logic ──
const filteredStocks = computed(() => {
  let result = [...stocks.value]

  // Category filter
  if (activeCategoryFilter.value !== 'all') {
    result = result.filter(s => (s.category || 'Uncategorized') === activeCategoryFilter.value)
  }

  // Status filter (in, low, out)
  if (activeStatusFilter.value === 'in') {
    result = result.filter(s => s.stock_quantity > s.min_stock)
  } else if (activeStatusFilter.value === 'low') {
    result = result.filter(s => s.stock_quantity > 0 && s.stock_quantity <= s.min_stock)
  } else if (activeStatusFilter.value === 'out') {
    result = result.filter(s => s.stock_quantity === 0)
  }

  // Multi-column Search (Name, SKU, Barcode, Category)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.product_name.toLowerCase().includes(q) ||
      (s.sku && s.sku.toLowerCase().includes(q)) ||
      (s.barcode && s.barcode.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q))
    )
  }

  // Sorting Logic
  result.sort((a, b) => {
    let valA = a[sortBy.value]
    let valB = b[sortBy.value]
    if (typeof valA === 'string') valA = (valA as string).toLowerCase()
    if (typeof valB === 'string') valB = (valB as string).toLowerCase()
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

// Pagination Computed
const totalPages = computed(() => Math.ceil(filteredStocks.value.length / pageSize.value) || 1)

const paginatedStocks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStocks.value.slice(start, start + pageSize.value)
})

watch([searchQuery, activeCategoryFilter, activeStatusFilter, pageSize], () => {
  currentPage.value = 1
})

const toggleSort = (col: 'product_name' | 'stock_quantity' | 'price') => {
  if (sortBy.value === col) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortOrder.value = 'asc'
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  activeCategoryFilter.value = 'all'
  activeStatusFilter.value = 'all'
}

const openQuickView = (item: StockItem) => {
  selectedQuickView.value = item
}

const handleImportFile = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    showImportModal.value = false
    alert(`File ${input.files[0].name} siap di-import.`)
  }
}

// ── Formatters ──
const formatRupiah = (value: number): string => {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`
  return `Rp ${value.toLocaleString('id-ID')}`
}

// ── API CRUD ──
const fetchStocks = async () => {
  loading.value = true
  error.value = null
  try {
    const result = await api.get('/stocks/')
    stocks.value = (result || []) as StockItem[]
  } catch (err: any) {
    error.value = err.message || 'Gagal memuat stok'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingUuid.value = null
  form.value = emptyForm()
  formErrors.value = {}
  showModal.value = true
}

const openEditModal = (item: StockItem) => {
  isEditing.value = true
  editingUuid.value = item.uuid
  form.value = {
    product_name: item.product_name,
    sku: item.sku || '',
    barcode: item.barcode || '',
    description: item.description || '',
    price: item.price,
    cost_price: item.cost_price,
    stock_quantity: item.stock_quantity,
    min_stock: item.min_stock,
    unit: item.unit,
    category: item.category || '',
    is_active: item.is_active,
    photo_url: item.photo_url || '',
  }
  imagePreview.value = item.photo_url || ''
  uploadError.value = ''
  formErrors.value = {}
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formErrors.value = {}
  imagePreview.value = ''
  uploadError.value = ''
}

const handleImageUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'Ukuran gambar maksimal 5MB'
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => { imagePreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)

  uploadingImage.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)
    if (editingUuid.value) {
      formData.append('stock_uuid', editingUuid.value)
    }
    const result = await api.post('/stocks/upload-image', formData, {
      headers: {} as any
    })
    form.value.photo_url = result.url
    uploadError.value = ''
  } catch (err: any) {
    uploadError.value = err.message || 'Gagal upload gambar'
    imagePreview.value = ''
  } finally {
    uploadingImage.value = false
    input.value = ''
  }
}

const validateForm = (): boolean => {
  const errs: Record<string, string> = {}
  if (!form.value.product_name.trim()) errs.product_name = 'Nama produk wajib diisi'
  if (form.value.price === '' || Number(form.value.price) < 0) errs.price = 'Harga valid wajib diisi'
  if (form.value.stock_quantity === '' || Number(form.value.stock_quantity) < 0) errs.stock_quantity = 'Kuantitas stok valid wajib diisi'
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

const saveProduct = async () => {
  if (!validateForm()) return
  saving.value = true

  const payload = {
    product_name: form.value.product_name.trim(),
    sku: form.value.sku.trim() || null,
    barcode: form.value.barcode.trim() || null,
    description: form.value.description.trim() || null,
    price: Number(form.value.price),
    cost_price: form.value.cost_price !== null && form.value.cost_price !== '' ? Number(form.value.cost_price) : null,
    stock_quantity: Number(form.value.stock_quantity),
    min_stock: Number(form.value.min_stock) || 0,
    unit: form.value.unit,
    category: form.value.category || null,
    photo_url: form.value.photo_url || null,
  }

  try {
    if (isEditing.value && editingUuid.value) {
      await api.put(`/stocks/${editingUuid.value}`, { ...payload, is_active: form.value.is_active })
    } else {
      await api.post('/stocks/', payload)
    }
    closeModal()
    await fetchStocks()
  } catch (err: any) {
    formErrors.value = { _form: err.message || 'Gagal menyimpan produk' }
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item: StockItem) => {
  deleteTarget.value = item
  showDeleteConfirm.value = true
}

const doDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.delete(`/stocks/${deleteTarget.value.uuid}`)
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await fetchStocks()
  } catch (err: any) {
    // error
  } finally {
    deleting.value = false
  }
}

const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {}, 250)
}

onMounted(() => {
  fetchStocks()
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
