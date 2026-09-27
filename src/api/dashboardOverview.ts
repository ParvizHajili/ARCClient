import { apiClient } from './apiClient'

export interface DashboardCategoryStat {
  categoryId: number
  name: string
  productCount: number
}

export interface DashboardTopProduct {
  id: number
  name: string
  code: string
  viewCount: number
}

export interface DashboardOverview {
  categoryCount: number
  subCategoryCount: number
  productCount: number
  userCount: number
  brandCount: number
  colorCount: number
  manufacturerCountryCount: number
  warrantyCount: number
  madeToOrderCount: number
  spinProductCount: number
  totalViews: number
  addedLast30Days: number
  productsByCategory: DashboardCategoryStat[]
  topProducts: DashboardTopProduct[]
}

export function getDashboardOverview(): Promise<DashboardOverview> {
  return apiClient.get<DashboardOverview>('/api/dashboard/overview')
}

export async function recordProductView(code: string): Promise<void> {
  try {
    await apiClient.post<void>(
      '/api/products/views',
      null,
      { query: { code }, skipAuth: true, emptyResponse: true },
    )
  } catch {
    // Baxış sayı naviqasiyanı dayandırmamalıdır.
  }
}
