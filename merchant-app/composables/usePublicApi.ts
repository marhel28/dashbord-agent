const BASE_URL = 'https://cctv-api.desa-sidomukti.com'

async function publicFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.append(k, v)
    })
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export interface PublicMerchantProfile {
  uuid: string
  store_name: string
  category_store: string | null
  store_type: string | null
  address: string
  description: string | null
  photo_profile: string | null
  phone_number: string | null
  latitude: number | null
  longitude: number | null
  is_verified: boolean
}

export interface PublicProduct {
  uuid: string
  product_name: string
  description: string | null
  price: number
  stock_quantity: number
  unit: string
  category: string | null
  photo_url: string | null
  is_active: boolean
}

export const publicApi = {
  getMerchant: (merchantUuid: string) =>
    publicFetch(`/public/merchant/${merchantUuid}`) as Promise<PublicMerchantProfile>,

  getProducts: (merchantUuid: string, category?: string) =>
    publicFetch(`/public/merchant/${merchantUuid}/products`, category ? { category } : undefined) as Promise<{
      merchant: PublicMerchantProfile
      products: PublicProduct[]
      total: number
    }>,

  searchProducts: (merchantUuid: string, q: string) =>
    publicFetch(`/public/merchant/${merchantUuid}/products/search`, q ? { q } : undefined) as Promise<PublicProduct[]>,
}
