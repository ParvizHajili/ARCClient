import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardLayout } from './dashboard/components/DashboardLayout'
import { CategoryCreatePage } from './dashboard/pages/CategoryCreatePage'
import { CategoryDetailPage } from './dashboard/pages/CategoryDetailPage'
import { CategoryEditPage } from './dashboard/pages/CategoryEditPage'
import { CategoryListPage } from './dashboard/pages/CategoryListPage'
import { BrandCreatePage } from './dashboard/pages/BrandCreatePage'
import { BrandDetailPage } from './dashboard/pages/BrandDetailPage'
import { BrandEditPage } from './dashboard/pages/BrandEditPage'
import { BrandListPage } from './dashboard/pages/BrandListPage'
import { ColorCreatePage } from './dashboard/pages/ColorCreatePage'
import { ColorDetailPage } from './dashboard/pages/ColorDetailPage'
import { ColorEditPage } from './dashboard/pages/ColorEditPage'
import { ColorListPage } from './dashboard/pages/ColorListPage'
import { ManufacturerCountryCreatePage } from './dashboard/pages/ManufacturerCountryCreatePage'
import { ManufacturerCountryDetailPage } from './dashboard/pages/ManufacturerCountryDetailPage'
import { ManufacturerCountryEditPage } from './dashboard/pages/ManufacturerCountryEditPage'
import { ManufacturerCountryListPage } from './dashboard/pages/ManufacturerCountryListPage'
import { ProductCreatePage, ProductEditPage } from './dashboard/pages/ProductFormPage'
import { ProductDetailPage as DashboardProductDetailPage } from './dashboard/pages/ProductDetailPage'
import { ProductListPage } from './dashboard/pages/ProductListPage'
import { I18nProvider } from './i18n/I18nContext'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsPage } from './pages/ProductsPage'

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product-detail" element={<ProductDetailPage />} />
          </Route>

          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="categories" replace />} />
            <Route path="categories" element={<CategoryListPage />} />
            <Route path="categories/create" element={<CategoryCreatePage />} />
            <Route path="categories/:id" element={<CategoryDetailPage />} />
            <Route path="categories/:id/edit" element={<CategoryEditPage />} />

            <Route
              path="manufacturer-countries"
              element={<ManufacturerCountryListPage />}
            />
            <Route
              path="manufacturer-countries/create"
              element={<ManufacturerCountryCreatePage />}
            />
            <Route
              path="manufacturer-countries/:id"
              element={<ManufacturerCountryDetailPage />}
            />
            <Route
              path="manufacturer-countries/:id/edit"
              element={<ManufacturerCountryEditPage />}
            />

            <Route path="brands" element={<BrandListPage />} />
            <Route path="brands/create" element={<BrandCreatePage />} />
            <Route path="brands/:id" element={<BrandDetailPage />} />
            <Route path="brands/:id/edit" element={<BrandEditPage />} />

            <Route path="colors" element={<ColorListPage />} />
            <Route path="colors/create" element={<ColorCreatePage />} />
            <Route path="colors/:id" element={<ColorDetailPage />} />
            <Route path="colors/:id/edit" element={<ColorEditPage />} />

            <Route path="products" element={<ProductListPage />} />
            <Route path="products/create" element={<ProductCreatePage />} />
            <Route
              path="products/:id"
              element={<DashboardProductDetailPage />}
            />
            <Route path="products/:id/edit" element={<ProductEditPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}
