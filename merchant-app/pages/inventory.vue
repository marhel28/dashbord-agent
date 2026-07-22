<template>
  <div class="space-y-6 animate-fade-in">
    <!-- ═══════════ HEADER ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up border-b pb-4" style="border-color: var(--wp-navy);">
      <div>
        <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Manajemen Stok</h1>
        <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
          Total: {{ stocks.length }} produk aktif · Lacak level stok, harga & kategori.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Search with Manticore suggestions -->
        <div class="relative">
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-3 w-4 h-4 z-10" style="color: var(--wp-text-secondary);" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari produk…"
            class="w-64 pl-9 pr-4 py-2 text-xs transition border outline-none font-medium"
            style="background: #FFFFFF; border-color: var(--wp-navy); color: var(--wp-text); border-radius: 0px;"
            @input="onSearchInput"
            @keydown.escape="suggestions = []"
            @keydown.enter.prevent="onSearchEnter"
            @focus="searchQuery.length >= 2 && fetchSuggestions()"
          />
          <!-- Suggestions dropdown -->
          <div
            v-if="suggestions.length > 0"
            class="absolute top-full mt-1 left-0 right-0 bg-white border shadow-md z-50 overflow-hidden"
            style="border-color: var(--wp-navy); border-radius: 0px;"
          >
            <button
              v-for="s in suggestions" :key="s.uuid"
              @click="selectSuggestion(s)"
              class="w-full text-left px-3 py-2 transition hover:bg-slate-50 flex items-center justify-between border-b last:border-0"
              style="border-color: var(--wp-border);"
            >
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold truncate" style="color: var(--wp-text);">{{ s.product_name }}</p>
                <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">{{ s.category || 'Tanpa Kategori' }} · {{ s.stock_quantity }} tersedia</p>
              </div>
              <span class="text-[10px] font-mono font-bold ml-3 shrink-0" style="color: var(--wp-navy);">{{ formatRupiah(s.price) }}</span>
            </button>
          </div>
          <!-- Searching indicator -->
          <div v-if="searching" class="absolute right-3 top-2.5 z-10">
            <div class="w-4 h-4 border-2 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold); border-radius: 0px;"></div>
          </div>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2.5 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition hover:opacity-90"
          style="background: var(--wp-navy); border-radius: 0px;"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
          <span>Tambah Produk</span>
        </button>
      </div>
    </div>

    <!-- ═══════════ LOADING ═══════════ -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center space-y-3">
        <div class="w-10 h-10 mx-auto border-4 animate-spin" style="border-color: var(--wp-border); border-top-color: var(--wp-gold); border-radius: 0px;"></div>
        <p class="text-xs font-bold uppercase tracking-widest" style="color: var(--wp-text-secondary);">Memuat stok…</p>
      </div>
    </div>

    <!-- ═══════════ ERROR ═══════════ -->
    <div v-else-if="error" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4 max-w-sm border p-6 bg-white" style="border-color: #DC2626; border-radius: 0px;">
        <div class="w-12 h-12 mx-auto flex items-center justify-center" style="background: #FEF2F2;">
          <Icon name="heroicons:exclamation-triangle" class="w-6 h-6" style="color: #DC2626;" />
        </div>
        <h3 class="text-sm font-bold uppercase tracking-wider" style="color: var(--wp-text);">Gagal memuat stok</h3>
        <p class="text-xs font-medium" style="color: var(--wp-text-secondary);">{{ error }}</p>
        <button @click="fetchStocks" class="px-6 py-2.5 text-white text-xs font-bold uppercase tracking-wider transition"
          style="background: #DC2626; border-radius: 0px;">
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- ═══════════ EMPTY STATE ═══════════ -->
    <div v-else-if="stocks.length === 0" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4 max-w-sm border p-8 bg-white" style="border-color: var(--wp-border); border-radius: 0px;">
        <div class="w-16 h-16 mx-auto flex items-center justify-center" style="background: rgba(15,26,46,0.05);">
          <Icon name="heroicons:archive-box" class="w-8 h-8" style="color: var(--wp-navy);" />
        </div>
        <h3 class="text-sm font-bold uppercase tracking-wider" style="color: var(--wp-text);">Belum ada produk</h3>
        <p class="text-xs" style="color: var(--wp-text-secondary);">
          Mulai bangun stok dengan menambahkan produk pertama Anda ke database.
        </p>
        <button @click="openCreateModal" class="px-6 py-2.5 text-white text-xs font-bold uppercase tracking-wider transition"
          style="background: var(--wp-navy); border-radius: 0px;">
          Tambah Produk Pertama Anda
        </button>
      </div>
    </div>

    <!-- ═══════════ SUMMARY CARDS ═══════════ -->
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in summaryCards" :key="card.label"
        class="bg-white border-t-2 border p-4 shadow-sm" :style="{ borderColor: 'var(--wp-border)', borderTopColor: card.color, borderRadius: '0px' }">
        <span class="text-[9px] font-extrabold uppercase tracking-wider block" style="color: var(--wp-text-secondary);">{{ card.label }}</span>
        <p class="text-lg font-mono font-black mt-1.5" :style="{ color: 'var(--wp-navy)' }">{{ card.value }}</p>
      </div>
    </div>

    <!-- ═══════════ FILTERS + TABLE ═══════════ -->
    <div v-if="stocks.length > 0" class="bg-white border p-6 shadow-sm" style="border-color: var(--wp-border); border-radius: 0px;">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 pb-4 border-b" style="border-color: var(--wp-border);">
        <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Filter Kategori:</span>
        <button
          v-for="f in categoryFilters" :key="f.value"
          @click="activeCategoryFilter = f.value"
          class="px-3 py-1.5 text-[10px] font-bold transition-all border uppercase tracking-wider"
          :style="activeCategoryFilter === f.value
            ? 'background: var(--wp-navy); border-color: var(--wp-navy); color: white; border-radius: 0px;'
            : 'background: #FFFFFF; border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: 0px;'"
        >{{ f.label }}</button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto mt-2">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[10px] font-bold uppercase tracking-widest border-b" style="color: var(--wp-text-secondary); border-color: var(--wp-border);">
              <th class="py-4 pr-3 w-14">Foto</th>
              <th class="py-4 pr-4">Produk</th>
              <th class="py-4 pr-4">SKU</th>
              <th class="py-4 pr-4">Kategori</th>
              <th class="py-4 pr-4 text-right">Stok</th>
              <th class="py-4 pr-4 text-right">Harga</th>
              <th class="py-4 pr-4 text-right">Modal</th>
              <th class="py-4 pr-4 text-center">Status</th>
              <th class="py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y text-xs" style="border-color: var(--wp-border);">
            <tr v-for="item in filteredStocks" :key="item.uuid" class="transition-colors hover:bg-slate-50">
              <!-- Thumbnail -->
              <td class="py-3 pr-3">
                <div class="w-10 h-10 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border" style="border-color: var(--wp-border); border-radius: 0px;">
                  <img
                    v-if="item.photo_url"
                    :src="item.photo_url"
                    :alt="item.product_name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    @error="$event.target.style.display='none'"
                  />
                  <Icon v-else name="heroicons:photo" class="w-5 h-5" style="color: #CBD5E1;" />
                </div>
              </td>
              <td class="py-4 pr-4">
                <p class="font-bold" style="color: var(--wp-text);">{{ item.product_name }}</p>
                <p class="text-[10px] mt-0.5 truncate max-w-[180px]" style="color: var(--wp-text-secondary);">{{ item.description || 'Tidak ada deskripsi' }}</p>
              </td>
              <td class="py-4 pr-4 font-mono text-[11px]" style="color: var(--wp-text-secondary);">{{ item.sku || '—' }}</td>
              <td class="py-4 pr-4">
                <span class="px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider" style="background: rgba(15,26,46,0.04); color: var(--wp-navy); border-color: var(--wp-border); border-radius: 0px;">
                  {{ item.category || 'Tanpa Kategori' }}
                </span>
              </td>
              <td class="py-4 pr-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <span class="font-bold font-mono" :style="{ color: item.stock_quantity === 0 ? '#DC2626' : item.stock_quantity <= item.min_stock ? '#D97706' : 'var(--wp-text)' }">
                    {{ item.stock_quantity }}
                  </span>
                  <span class="text-[10px] uppercase font-bold" style="color: var(--wp-text-secondary);">{{ item.unit }}</span>
                </div>
              </td>
              <td class="py-4 pr-4 text-right font-bold font-mono" style="color: var(--wp-text);">
                {{ formatRupiah(item.price) }}
              </td>
              <td class="py-4 pr-4 text-right font-mono text-[11px]" style="color: var(--wp-text-secondary);">
                {{ item.cost_price ? formatRupiah(item.cost_price) : '—' }}
              </td>
              <td class="py-4 pr-4 text-center">
                <span class="px-2.5 py-0.5 text-[9px] font-bold border inline-flex items-center gap-1 uppercase tracking-wider"
                  :style="statusBadge(item)">
                  <span class="w-1.5 h-1.5" :style="{ background: statusBadge(item).color }"></span>
                  {{ statusLabel(item) }}
                </span>
              </td>
              <td class="py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="openEditModal(item)" class="p-2 border transition hover:bg-slate-50" style="border-color: var(--wp-border); border-radius: 0px;" title="Edit">
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" style="color: var(--wp-text);" />
                  </button>
                  <button @click="confirmDelete(item)" class="p-2 border transition hover:bg-red-50" style="border-color: #FECACA; border-radius: 0px;" title="Delete">
                    <Icon name="heroicons:trash" class="w-4 h-4" style="color: #DC2626;" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="pt-4 border-t mt-2 flex items-center justify-between" style="border-color: var(--wp-border);">
        <p class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">
          Menampilkan {{ filteredStocks.length }} dari {{ stocks.length }} produk
        </p>
      </div>
    </div>

    <!-- ═══════════ CREATE / EDIT MODAL ═══════════ -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[var(--wp-z-modal)] flex items-start justify-center pt-[10vh] px-4"
        style="background: rgba(15,26,46,0.5);"
        @click.self="closeModal"
      >
        <div class="bg-white shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-fade-in-up" style="border: 1px solid var(--wp-navy); border-radius: 0px;">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b z-10" style="border-color: var(--wp-border);">
            <div>
              <h2 class="text-sm font-black uppercase tracking-wider" style="color: var(--wp-navy);">
                {{ isEditing ? 'Edit Detail Produk' : 'Buat Produk Baru' }}
              </h2>
              <p class="text-[10px] font-medium mt-0.5" style="color: var(--wp-text-secondary);">
                {{ isEditing ? 'Perbarui level stok, informasi unit dan url foto.' : 'Masukkan spesifikasi produk untuk disinkronkan ke database katalog.' }}
              </p>
            </div>
            <button @click="closeModal" class="p-2 border transition hover:bg-slate-100" style="border-color: var(--wp-border); border-radius: 0px;">
              <Icon name="heroicons:x-mark" class="w-4 h-4" style="color: var(--wp-text-secondary);" />
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="saveProduct" class="p-6 space-y-5">
            <!-- Row 1: Product Name + SKU -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">
                  Nama Produk <span style="color: #DC2626;">*</span>
                </label>
                <input
                  v-model="form.product_name"
                  type="text"
                  required
                  placeholder="Cth: Indomie Goreng Spesial"
                  class="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition border"
                  :class="formErrors.product_name ? 'border-red-300 bg-red-50/30' : ''"
                  style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);"
                />
                <p v-if="formErrors.product_name" class="text-[10px] font-medium" style="color: #DC2626;">{{ formErrors.product_name }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">SKU</label>
                <input
                  v-model="form.sku"
                  type="text"
                  placeholder="e.g. IND-GOR-001"
                  class="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition border"
                  style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);"
                />
              </div>
            </div>

            <!-- Row 2: Barcode + Category -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Barcode</label>
                <input
                  v-model="form.barcode"
                  type="text"
                  placeholder="e.g. 8991234567890"
                  class="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition border"
                  style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Kategori</label>
                <div class="relative">
                  <select
                    v-model="form.category"
                    class="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition border appearance-none"
                    style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text);"
                  >
                    <option value="">Pilih Kategori</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                  <Icon name="heroicons:chevron-down" class="absolute right-3 top-3 w-4 h-4 pointer-events-none" style="color: var(--wp-text-secondary);" />
                </div>
              </div>
            </div>

            <!-- Row 3: Photo Upload -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Foto Produk</label>
              <div class="flex items-start gap-4">
                <!-- Preview -->
                <div class="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 relative"
                  style="border-color: var(--wp-border); background: var(--wp-bg); border-radius: 0px;">
                  <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                  <Icon v-else name="heroicons:photo" class="w-8 h-8" style="color: #94A3B8;" />
                  <div v-if="uploadingImage" class="absolute inset-0 bg-black/40 flex items-center justify-center" style="border-radius: 0px;">
                    <div class="w-6 h-6 border-2 animate-spin" style="border-color: rgba(255,255,255,0.3); border-top-color: white; border-radius: 0px;"></div>
                  </div>
                </div>
                <div class="flex-1 space-y-2">
                  <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border hover:border-[var(--wp-gold)]"
                    style="border-color: var(--wp-border); color: var(--wp-text-secondary); background: var(--wp-bg); border-radius: 0px;">
                    <Icon name="heroicons:cloud-arrow-up" class="w-4 h-4" />
                    <span>{{ form.photo_url ? 'Ganti Foto' : 'Upload Foto' }}</span>
                    <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                  </label>
                  <p class="text-[9px]" style="color: var(--wp-text-secondary);">JPG, PNG, WEBP · Maks 5MB · Auto WebP</p>
                  <p v-if="form.photo_url" class="text-[10px] font-mono font-medium truncate" style="color: var(--wp-success);">
                    {{ form.photo_url }}
                  </p>
                  <p v-if="uploadError" class="text-[10px] font-medium" style="color: #DC2626;">{{ uploadError }}</p>
                </div>
              </div>
            </div>

            <!-- Row 4: Description -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Deskripsi</label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Deskripsi singkat mengenai produk…"
                class="w-full px-4 py-2.5 text-sm outline-none transition border resize-none font-medium"
                style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text); border-radius: 0px;"
              ></textarea>
            </div>

            <!-- Row 4: Price + Cost Price -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">
                  Harga Jual <span style="color: #DC2626;">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-xs font-semibold" style="color: var(--wp-text-secondary);">Rp</span>
                  <input
                    v-model.number="form.price"
                    type="number"
                    required
                    min="0"
                    step="100"
                    placeholder="0"
                    class="w-full pl-10 pr-4 py-2.5 text-sm outline-none transition border font-mono font-semibold"
                    :class="formErrors.price ? 'border-red-300 bg-red-50/30' : ''"
                    style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text); border-radius: 0px;"
                  />
                </div>
                <p v-if="formErrors.price" class="text-[10px] font-medium" style="color: #DC2626;">{{ formErrors.price }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Cost Price (Harga Modal)</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-xs font-semibold" style="color: var(--wp-text-secondary);">Rp</span>
                  <input
                    v-model.number="form.cost_price"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    class="w-full pl-10 pr-4 py-2.5 text-sm outline-none transition border font-mono font-semibold"
                    style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text); border-radius: 0px;"
                  />
                </div>
              </div>
            </div>

            <!-- Row 5: Stock Quantity + Min Stock + Unit -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">
                  Kuantitas Stok <span style="color: #DC2626;">*</span>
                </label>
                <input
                  v-model.number="form.stock_quantity"
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-2.5 text-sm outline-none transition border font-mono font-semibold"
                  :class="formErrors.stock_quantity ? 'border-red-300 bg-red-50/30' : ''"
                  style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text); border-radius: 0px;"
                />
                <p v-if="formErrors.stock_quantity" class="text-[10px] font-medium" style="color: #DC2626;">{{ formErrors.stock_quantity }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Batas Stok Minimum</label>
                <input
                  v-model.number="form.min_stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-2.5 text-sm outline-none transition border font-mono font-semibold"
                  style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text); border-radius: 0px;"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Satuan</label>
                <select
                  v-model="form.unit"
                  class="w-full px-4 py-2.5 text-sm outline-none transition border appearance-none font-bold uppercase tracking-wider"
                  style="background: var(--wp-bg); border-color: var(--wp-border); color: var(--wp-text); border-radius: 0px;"
                >
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

            <!-- Modal Footer -->
            <div class="flex justify-between items-center pt-5 border-t" style="border-color: var(--wp-border);">
              <label v-if="isEditing" class="flex items-center gap-2 cursor-pointer select-none">
                <input v-model="form.is_active" type="checkbox" class="w-4 h-4 accent-[var(--wp-gold)]" style="border-radius: 0px;" />
                <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--wp-text-secondary);">Produk Aktif</span>
              </label>
              <div v-else></div>
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-6 py-2.5 border font-bold text-xs uppercase tracking-wider transition"
                  style="border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: 0px;"
                >Batal</button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-6 py-2.5 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                  style="background: var(--wp-navy); border-radius: 0px;"
                >
                  <Icon v-if="saving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                  <Icon v-else name="heroicons:check" class="w-4 h-4" />
                  <span>{{ isEditing ? 'Perbarui Produk' : 'Simpan Produk' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════ DELETE CONFIRMATION ═══════════ -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[var(--wp-z-modal)] flex items-center justify-center px-4"
        style="background: rgba(15,26,46,0.5);"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-white p-6 max-w-sm w-full animate-fade-in-up text-center border" style="border-color: var(--wp-navy); border-radius: 0px;">
          <div class="w-12 h-12 mx-auto flex items-center justify-center mb-4" style="background: #FEF2F2;">
            <Icon name="heroicons:exclamation-triangle" class="w-6 h-6" style="color: #DC2626;" />
          </div>
          <h3 class="text-sm font-black uppercase tracking-wider" style="color: var(--wp-text);">Hapus Produk?</h3>
          <p class="text-xs mt-2" style="color: var(--wp-text-secondary);">
            Apakah Anda yakin ingin menghapus <strong style="color: var(--wp-text);">"{{ deleteTarget?.product_name }}"</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div class="flex gap-3 mt-6">
            <button
              @click="showDeleteConfirm = false"
              class="flex-1 py-2 border font-bold text-xs uppercase tracking-wider transition"
              style="border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: 0px;"
            >Batal</button>
            <button
              @click="doDelete"
              :disabled="deleting"
              class="flex-1 py-2 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
              style="background: #DC2626; border-radius: 0px;"
            >
              <Icon v-if="deleting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'

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
const saving = ref(false)
const deleting = ref(false)

// Manticore suggestions
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
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const editingUuid = ref<string | null>(null)
const deleteTarget = ref<StockItem | null>(null)

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

// ── Computed ──
const categoryFilters = computed(() => {
  const cats = new Set(stocks.value.map(s => s.category || 'Tanpa Kategori'))
  return [
    { label: 'Semua', value: 'all' },
    ...[...cats].sort().map(c => ({ label: c, value: c })),
  ]
})

const filteredStocks = computed(() => {
  let result = stocks.value
  if (activeCategoryFilter.value !== 'all') {
    result = result.filter(s => (s.category || 'Tanpa Kategori') === activeCategoryFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.product_name.toLowerCase().includes(q) ||
      (s.sku && s.sku.toLowerCase().includes(q)) ||
      (s.barcode && s.barcode.toLowerCase().includes(q))
    )
  }
  return result
})

const summaryCards = computed(() => {
  const active = stocks.value.filter(s => s.is_active)
  const low = active.filter(s => s.stock_quantity > 0 && s.stock_quantity <= s.min_stock)
  const out = active.filter(s => s.stock_quantity === 0)
  const totalValue = active.reduce((sum, s) => sum + (s.price * s.stock_quantity), 0)
  return [
    { label: 'Total Produk', value: active.length, color: 'var(--wp-navy)' },
    { label: 'Stok Menipis', value: low.length, color: '#D97706' },
    { label: 'Stok Habis', value: out.length, color: '#DC2626' },
    { label: 'Nilai Stok', value: formatRupiah(totalValue), color: 'var(--wp-success)' },
  ]
})

// ── Helpers ──
const formatRupiah = (value: number): string => {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`
  return `Rp ${value.toLocaleString('id-ID')}`
}

const statusBadge = (item: StockItem) => {
  if (!item.is_active) return { background: '#F1F5F9', color: '#64748B', borderColor: '#E2E8F0' }
  if (item.stock_quantity === 0) return { background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }
  if (item.stock_quantity <= item.min_stock) return { background: '#FFFBEB', color: '#D97706', borderColor: '#FDE68A' }
  return { background: '#F0FDF4', color: '#059669', borderColor: '#DCFCE7' }
}

const statusLabel = (item: StockItem) => {
  if (!item.is_active) return 'Tidak Aktif'
  if (item.stock_quantity === 0) return 'Stok Habis'
  if (item.stock_quantity <= item.min_stock) return 'Stok Menipis'
  return 'Tersedia'
}

// ── API ──
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

// ── Image Upload ──
const handleImageUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'Ukuran gambar maksimal 5MB'
    return
  }

  // Preview lokal
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
      headers: {} as any /* let browser set multipart */
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
    // keep modal open, could show error
  } finally {
    deleting.value = false
  }
}

// ── Manticore Search ──
const fetchSuggestions = async () => {
  const q = searchQuery.value.trim()
  if (q.length < 2) {
    suggestions.value = []
    return
  }
  searching.value = true
  try {
    const result = await api.get('/stocks/suggest', { params: { q, limit: '6' } })
    suggestions.value = (result || []) as Suggestion[]
  } catch {
    suggestions.value = []
  } finally {
    searching.value = false
  }
}

const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (searchQuery.value.trim().length < 2) {
    suggestions.value = []
    return
  }
  debounceTimer = setTimeout(() => {
    fetchSuggestions()
  }, 250)
}

const selectSuggestion = (s: Suggestion) => {
  searchQuery.value = s.product_name
  suggestions.value = []
  // Scroll to the product or filter to it
  activeCategoryFilter.value = 'all'
}

const onSearchEnter = async () => {
  suggestions.value = []
  const q = searchQuery.value.trim()
  if (!q) {
    await fetchStocks()
    return
  }
  // Full-text search via Manticore
  searching.value = true
  try {
    const result = await api.get('/stocks/search', { params: { q, limit: '100' } })
    // Map search hits back to stock items for the table
    const hits = result?.hits || []
    // Merge with local stocks data for full info
    const stockMap = new Map(stocks.value.map(s => [s.uuid, s]))
    const merged: StockItem[] = []
    for (const hit of hits) {
      const existing = stockMap.get(hit.uuid)
      if (existing) {
        merged.push(existing)
      } else if (hit.product_name) {
        // Construct a minimal StockItem from search hit
        merged.push({
          uuid: hit.uuid,
          product_name: hit.product_name,
          sku: null,
          barcode: null,
          description: null,
          price: hit.price || 0,
          cost_price: hit.cost_price || null,
          stock_quantity: hit.stock_quantity || 0,
          min_stock: hit.min_stock || 0,
          unit: hit.unit || 'pcs',
          category: hit.category || null,
          photo_url: null,
          is_active: true,
          created_at: '',
          updated_at: '',
        })
      }
    }
    // Replace stocks with search results for display
    if (hits.length > 0 || q.length >= 2) {
      stocks.value = merged
    }
  } catch {
    // Fallback to client-side filter on error
  } finally {
    searching.value = false
  }
}

// ── Init ──
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
