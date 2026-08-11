import { ref, computed } from 'vue'

export interface CartProduct {
  uuid: string
  product_name: string
  price: number
  photo_url: string | null
  unit: string
  category: string | null
  stock_quantity: number
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

const items = ref<CartItem[]>([])

export const useCart = () => {
  const addItem = (product: CartProduct) => {
    const existing = items.value.find(i => i.product.uuid === product.uuid)
    if (existing) {
      if (existing.quantity < product.stock_quantity) {
        existing.quantity++
      }
    } else {
      items.value.push({ product, quantity: 1 })
    }
  }

  const removeItem = (productUuid: string) => {
    items.value = items.value.filter(i => i.product.uuid !== productUuid)
  }

  const setQuantity = (productUuid: string, qty: number) => {
    const item = items.value.find(i => i.product.uuid === productUuid)
    if (!item) return
    if (qty <= 0) {
      removeItem(productUuid)
      return
    }
    item.quantity = Math.min(qty, item.product.stock_quantity)
  }

  const clear = () => {
    items.value = []
  }

  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  )

  return {
    items,
    addItem,
    removeItem,
    setQuantity,
    clear,
    totalItems,
    subtotal,
  }
}
