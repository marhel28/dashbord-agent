<template>
  <div class="animate-fade-in max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Profil Pengguna</h1>
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Kelola informasi akun dan profil Anda</p>
      </div>
    </div>

    <!-- Profile Info Card -->
    <div class="bg-white dark:bg-slate-800 border border-[var(--wp-border)] rounded shadow-sm overflow-hidden">
      <div class="p-6 md:p-8 border-b border-[var(--wp-border)] bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row items-center gap-6">
        <!-- Profile Picture Area -->
        <div class="relative group">
          <div v-if="user?.photo_profile" class="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
            <img :src="user.photo_profile" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center text-3xl font-black text-white" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
        </div>

        <div class="text-center md:text-left flex-1">
          <h2 class="text-2xl font-black text-[var(--wp-navy)] dark:text-white">{{ user?.name }}</h2>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{{ user?.role }}</p>
          <div class="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
              <Icon name="heroicons:envelope" class="w-3.5 h-3.5" />
              {{ user?.email }}
            </span>
            <span v-if="user?.phone_number" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <Icon name="heroicons:phone" class="w-3.5 h-3.5" />
              {{ user?.phone_number }}
            </span>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="p-6 md:p-8">
        <form @submit.prevent="handleUpdateProfile" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Lengkap</label>
              <input v-model="form.name" type="text" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors" required />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Nomor Telepon</label>
              <input v-model="form.phone_number" type="text" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Toko / Bisnis</label>
              <input v-model="form.store_name" type="text" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors" required />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Alamat</label>
              <input v-model="form.address" type="text" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors" required />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Deskripsi Toko</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors resize-none"></textarea>
          </div>

          <!-- Error / Success Messages -->
          <div v-if="errorMsg" class="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded border border-rose-100 flex items-center gap-2">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            <span>{{ errorMsg }}</span>
          </div>
          <div v-if="successMsg" class="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded border border-emerald-100 flex items-center gap-2">
            <Icon name="heroicons:check-circle" class="w-4 h-4" />
            <span>{{ successMsg }}</span>
          </div>

          <div class="pt-4 flex justify-end">
            <button type="submit" :disabled="isSubmitting" class="px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); border-radius: 4px;">
              <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <Icon v-else name="heroicons:check" class="w-4 h-4" />
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth'
})

const { user, fetchUser, getAuthHeaders } = useAuth()
const config = useRuntimeConfig()

const form = ref({
  name: '',
  phone_number: '',
  store_name: '',
  address: '',
  description: ''
})

const isSubmitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(async () => {
  if (!user.value) {
    await fetchUser()
  }
  
  if (user.value) {
    form.value = {
      name: user.value.name || '',
      phone_number: user.value.phone_number || '',
      store_name: user.value.store_name || '',
      address: user.value.address || '',
      description: user.value.description || ''
    }
  }
})

const handleUpdateProfile = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  isSubmitting.value = true

  try {
    const headers = getAuthHeaders()
    if (!headers) throw new Error('Not authenticated')

    const response = await fetch(`${config.public.apiBase}/auth/update-profile`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.detail || 'Gagal memperbarui profil')
    }

    // Refresh user data in state
    await fetchUser()
    successMsg.value = 'Profil berhasil diperbarui!'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)

  } catch (error: any) {
    errorMsg.value = error.message || 'Terjadi kesalahan sistem'
  } finally {
    isSubmitting.value = false
  }
}
</script>
