<template>
  <div class="animate-fade-in max-w-4xl mx-auto space-y-8 py-2 pb-10">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Profil Administrator
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola informasi identitas akun dan keamanan kata sandi Anda</p>
      </div>
    </div>

    <!-- Profile Info Card -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden">
      <div class="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col md:flex-row items-center gap-6">
        <!-- Profile Picture Area -->
        <div class="relative group flex flex-col items-center gap-3">
          <div class="relative">
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-white dark:bg-slate-700 flex items-center justify-center">
              <img :src="photoPreview || user?.photo_profile || logoSrc" alt="Profile" class="w-full h-full object-cover" />
            </div>
            <!-- Loading overlay -->
            <div v-if="photoUploading" class="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
              <Icon name="lucide:loader-2" class="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
          <!-- Photo upload controls -->
          <div class="flex flex-col items-center gap-2">
            <input type="file" accept="image/*" @change="handlePhotoChange" class="hidden" ref="photoInput" />
            <div class="flex gap-2">
              <Button type="button" variant="outline" size="sm" @click="photoInput?.click()" class="text-xs h-8 px-3 rounded-lg gap-1.5">
                <Icon name="lucide:image" class="w-3.5 h-3.5" />
                <span>{{ selectedFile ? 'Ganti Foto' : 'Pilih Foto' }}</span>
              </Button>
              <Button v-if="selectedFile" type="button" size="sm" @click="uploadPhoto" :disabled="photoUploading" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3 rounded-lg gap-1.5 shadow-xs">
                <Icon v-if="photoUploading" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
                <Icon v-else name="lucide:check" class="w-3.5 h-3.5" />
                <span>{{ photoUploading ? 'Mengunggah...' : 'Simpan Foto' }}</span>
              </Button>
            </div>
            <p v-if="photoUploadError" class="text-red-500 text-xs font-medium">{{ photoUploadError }}</p>
            <p v-if="photoSuccessMsg" class="text-emerald-600 dark:text-emerald-400 text-xs font-medium">{{ photoSuccessMsg }}</p>
          </div>
        </div>

        <div class="text-center md:text-left flex-1 space-y-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ user?.name }}</h2>
          <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Super Administrator</p>
          <div class="pt-1 flex flex-wrap gap-2 justify-center md:justify-start">
            <Badge variant="outline" class="gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Icon name="lucide:mail" class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ user?.email }}</span>
            </Badge>
            <Badge v-if="user?.phone_number" variant="outline" class="gap-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Icon name="lucide:phone" class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ user?.phone_number }}</span>
            </Badge>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="p-6 md:p-8">
        <form @submit.prevent="handleUpdateProfile" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
              <input v-model="form.name" type="text" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" required />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nomor Telepon</label>
              <input v-model="form.phone_number" type="text" class="w-full px-3 py-2 text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" />
            </div>
          </div>

          <!-- Error / Success Messages -->
          <div v-if="errorMsg" class="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <Icon name="lucide:alert-circle" class="w-4 h-4 shrink-0" />
            <span>{{ errorMsg }}</span>
          </div>
          <div v-if="successMsg" class="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
            <Icon name="lucide:check-circle-2" class="w-4 h-4 shrink-0" />
            <span>{{ successMsg }}</span>
          </div>

          <div class="pt-2 flex justify-end">
            <Button type="submit" :disabled="isSubmitting" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg px-5 shadow-xs flex items-center gap-2">
              <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <Icon v-else name="lucide:check" class="w-4 h-4" />
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Password Card -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl shadow-xs overflow-hidden">
      <div class="p-6 md:p-8">
        <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 mb-0.5">Keamanan & Ganti Password</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Pastikan akun Anda aman dengan menggunakan kata sandi kombinasi huruf dan angka yang kuat.</p>
        
        <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-xl">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password Lama</label>
            <input v-model="passForm.old_password" type="password" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" required />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password Baru</label>
            <input v-model="passForm.new_password" type="password" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" required minlength="8" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Konfirmasi Password Baru</label>
            <input v-model="passForm.confirm_password" type="password" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" required minlength="8" />
          </div>

          <div v-if="passErrorMsg" class="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <Icon name="lucide:alert-circle" class="w-4 h-4 shrink-0" />
            <span>{{ passErrorMsg }}</span>
          </div>
          <div v-if="passSuccessMsg" class="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
            <Icon name="lucide:check-circle-2" class="w-4 h-4 shrink-0" />
            <span>{{ passSuccessMsg }}</span>
          </div>

          <div class="pt-2">
            <Button type="submit" :disabled="isChangingPassword" class="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg px-5 shadow-xs flex items-center gap-2">
              <Icon v-if="isChangingPassword" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <Icon v-else name="lucide:key" class="w-4 h-4" />
              <span>{{ isChangingPassword ? 'Memproses...' : 'Perbarui Password' }}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { api } from '~/utils/api'

const { user, fetchMe, updateProfile } = useAuth()
const router = useRouter()
const colorMode = useColorMode()

const logoSrc = computed(() => {
  return colorMode.value === 'dark' ? '/logo_darkmode.png' : '/logo_lightmode.png'
})

const form = ref({
  name: '',
  phone_number: ''
})

const isSubmitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Photo upload state
const photoInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const photoUploading = ref(false)
const photoUploadError = ref('')
const photoSuccessMsg = ref('')

// Password variables
const passForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})
const isChangingPassword = ref(false)
const passErrorMsg = ref('')
const passSuccessMsg = ref('')

onMounted(async () => {
  if (!user.value) {
    try {
      await fetchMe()
    } catch (e) {
      // ignore
    }
  }
  
  if (!user.value) {
    router.push('/login')
    return
  }

  if (user.value) {
    form.value = {
      name: user.value.name || '',
      phone_number: user.value.phone_number || ''
    }
  }
})

const handleUpdateProfile = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  isSubmitting.value = true

  try {
    await updateProfile(form.value)
    successMsg.value = 'Profil berhasil diperbarui!'
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
  } catch (error: any) {
    errorMsg.value = error.message || 'Terjadi kesalahan sistem'
  } finally {
    isSubmitting.value = false
  }
}

const handlePhotoChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    photoUploadError.value = 'Ukuran gambar maksimal 5MB'
    selectedFile.value = null
    photoPreview.value = null
    return
  }

  selectedFile.value = file
  photoUploadError.value = ''
  photoSuccessMsg.value = ''

  const reader = new FileReader()
  reader.onload = (ev) => { photoPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

const uploadPhoto = async () => {
  if (!selectedFile.value) return

  photoUploading.value = true
  photoUploadError.value = ''
  photoSuccessMsg.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    const result = await api.post('/stocks/upload-image', formData, { headers: {} as any })
    await updateProfile({ photo_profile: result.url })
    photoSuccessMsg.value = 'Foto profil berhasil diperbarui!'
    selectedFile.value = null
    setTimeout(() => { photoSuccessMsg.value = '' }, 3000)
  } catch (err: any) {
    photoUploadError.value = err.message || 'Gagal mengupload foto'
  } finally {
    photoUploading.value = false
  }
}

const handleChangePassword = async () => {
  passErrorMsg.value = ''
  passSuccessMsg.value = ''

  if (passForm.value.new_password !== passForm.value.confirm_password) {
    passErrorMsg.value = 'Password baru dan konfirmasi tidak cocok.'
    return
  }

  isChangingPassword.value = true
  try {
    await api.post('/auth/change-password', {
      old_password: passForm.value.old_password,
      new_password: passForm.value.new_password
    })
    
    passSuccessMsg.value = 'Password berhasil diubah!'
    passForm.value.old_password = ''
    passForm.value.new_password = ''
    passForm.value.confirm_password = ''
    
    setTimeout(() => { passSuccessMsg.value = '' }, 3000)
  } catch (error: any) {
    passErrorMsg.value = error.response?.data?.detail || error.message || 'Gagal mengubah password'
  } finally {
    isChangingPassword.value = false
  }
}
</script>
