import { ref } from 'vue'
import { api } from '~/utils/api'

export interface Wallet {
  uuid: string
  balance: number
  total_earned: number
  total_withdrawn: number
  is_active: boolean
  updated_at: string
}

export interface WalletTransaction {
  uuid: string
  type: string
  amount: number
  balance_after: number
  reference_type: string | null
  reference_uuid: string | null
  description: string | null
  created_at: string
}

export interface WalletPerformance {
  balance: number
  total_earned: number
  total_withdrawn: number
  transaction_count: number
  daily_income: { date: string; amount: number }[]
  recent_transactions: WalletTransaction[]
}

export const useWallet = () => {
  const wallet = ref<Wallet | null>(null)
  const performance = ref<WalletPerformance | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchWallet = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await api.get('/dompet/')
      wallet.value = result as Wallet
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat dompet'
    } finally {
      loading.value = false
    }
  }

  const fetchPerformance = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await api.get('/dompet/performance')
      performance.value = result as WalletPerformance
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat performa dompet'
    } finally {
      loading.value = false
    }
  }

  const fetchAll = async () => {
    await Promise.all([fetchWallet(), fetchPerformance()])
  }

  return {
    wallet,
    performance,
    loading,
    error,
    fetchWallet,
    fetchPerformance,
    fetchAll,
  }
}
