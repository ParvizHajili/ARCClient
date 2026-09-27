import { apiClient } from './apiClient'

export interface ProductSpinImage {
  id: number
  imageUrl: string
  order: number
}

export interface ProductSpin {
  productId: number
  code: string
  name: string
  images: ProductSpinImage[]
}

export type SpinFrameKey = `e:${number}` | `n:${number}`

export function getProductSpin(productId: number): Promise<ProductSpin> {
  return apiClient.get<ProductSpin>(`/api/dashboard/products/${productId}/spin`)
}

export function saveProductSpin(
  productId: number,
  frameKeys: string[],
  images: File[],
): Promise<ProductSpin> {
  const form = new FormData()
  form.append('FrameKeys', JSON.stringify(frameKeys))
  for (const file of images) {
    form.append('Images', file)
  }
  return apiClient.put<ProductSpin>(
    `/api/dashboard/products/${productId}/spin`,
    form,
  )
}
