import { ref, computed } from 'vue'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: string
  date: string
  read: boolean
}

// Global state
const notifications = ref<AppNotification[]>([])
const initialized = ref(false)

export const useNotificationStore = () => {
  const loadNotifications = () => {
    if (process.client && !initialized.value) {
      const stored = localStorage.getItem('app_notifications')
      if (stored) {
        try {
          notifications.value = JSON.parse(stored)
        } catch (e) {
          console.error(e)
        }
      }
      if (notifications.value.length === 0) {
        // Seed default notifications for initial merchant experience
        notifications.value = [
          {
            id: 'n1',
            title: 'Transaksi QRIS Masuk',
            message: 'Penjualan sebesar Rp 13000.0 telah ditambahkan ke pembukuan kasir.',
            type: 'NEW_TRANSACTION',
            date: new Date().toISOString(),
            read: false
          },
          {
            id: 'n2',
            title: 'Analisis AI Copilot',
            message: 'Stok Teh Celup Sariwangi menumpuk. Rekomendasi buat promo bundling diskon 10%.',
            type: 'AI_COPILOT',
            date: new Date(Date.now() - 3600000).toISOString(),
            read: false
          },
          {
            id: 'n3',
            title: 'Peringatan Stok Menipis',
            message: 'Indomie Goreng Spesial tersisa 5 pcs di gudang utama. Waktunya melakukan restock.',
            type: 'STOCK_ALERT',
            date: new Date(Date.now() - 86400000).toISOString(),
            read: true
          }
        ]
        saveNotifications()
      }
      initialized.value = true
    }
  }

  const saveNotifications = () => {
    if (process.client) {
      localStorage.setItem('app_notifications', JSON.stringify(notifications.value))
    }
  }

  const addNotification = (notif: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      read: false
    }
    // Add to top
    notifications.value.unshift(newNotif)
    
    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
    
    saveNotifications()
    return newNotif
  }

  const markAsRead = (id: string) => {
    const notif = notifications.value.find(n => n.id === id)
    if (notif && !notif.read) {
      notif.read = true
      saveNotifications()
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
    saveNotifications()
  }

  const clearAll = () => {
    notifications.value = []
    saveNotifications()
  }
  
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  return {
    notifications,
    loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount
  }
}
