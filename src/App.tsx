import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/layout/Layout'
import { DashboardLayout } from './dashboard/components/DashboardLayout'
import { DashboardHomePage } from './dashboard/pages/DashboardHomePage'
import { HeroVideoPage } from './dashboard/pages/HeroVideoPage'
import { BrandCreatePage } from './dashboard/pages/BrandCreatePage'
import { BrandDetailPage } from './dashboard/pages/BrandDetailPage'
import { BrandEditPage } from './dashboard/pages/BrandEditPage'
import { BrandListPage } from './dashboard/pages/BrandListPage'
import { SizeCreatePage } from './dashboard/pages/SizeCreatePage'
import { SizeDetailPage } from './dashboard/pages/SizeDetailPage'
import { SizeEditPage } from './dashboard/pages/SizeEditPage'
import { SizeListPage } from './dashboard/pages/SizeListPage'
import { DiameterCreatePage } from './dashboard/pages/DiameterCreatePage'
import { DiameterDetailPage } from './dashboard/pages/DiameterDetailPage'
import { DiameterEditPage } from './dashboard/pages/DiameterEditPage'
import { DiameterListPage } from './dashboard/pages/DiameterListPage'
import { PowerCreatePage } from './dashboard/pages/PowerCreatePage'
import { PowerDetailPage } from './dashboard/pages/PowerDetailPage'
import { PowerEditPage } from './dashboard/pages/PowerEditPage'
import { PowerListPage } from './dashboard/pages/PowerListPage'
import { CategoryCreatePage } from './dashboard/pages/CategoryCreatePage'
import { CategoryDetailPage } from './dashboard/pages/CategoryDetailPage'
import { CategoryEditPage } from './dashboard/pages/CategoryEditPage'
import { CategoryListPage } from './dashboard/pages/CategoryListPage'
import { ColorCreatePage } from './dashboard/pages/ColorCreatePage'
import { ColorDetailPage } from './dashboard/pages/ColorDetailPage'
import { ColorEditPage } from './dashboard/pages/ColorEditPage'
import { ColorListPage } from './dashboard/pages/ColorListPage'
import { LoginPage } from './dashboard/pages/LoginPage'
import { ManufacturerCountryCreatePage } from './dashboard/pages/ManufacturerCountryCreatePage'
import { ManufacturerCountryDetailPage } from './dashboard/pages/ManufacturerCountryDetailPage'
import { ManufacturerCountryEditPage } from './dashboard/pages/ManufacturerCountryEditPage'
import { ManufacturerCountryListPage } from './dashboard/pages/ManufacturerCountryListPage'
import { ProductCreatePage, ProductEditPage } from './dashboard/pages/ProductFormPage'
import { ProductSpinEditPage } from './dashboard/pages/ProductSpinEditPage'
import { ProductSpinPage } from './dashboard/pages/ProductSpinPage'
import { ProductDetailPage as DashboardProductDetailPage } from './dashboard/pages/ProductDetailPage'
import { ProductListPage } from './dashboard/pages/ProductListPage'
import { UserCreatePage } from './dashboard/pages/UserCreatePage'
import { UserDetailPage } from './dashboard/pages/UserDetailPage'
import { UserEditPage } from './dashboard/pages/UserEditPage'
import { UserListPage } from './dashboard/pages/UserListPage'
import { I18nProvider } from './i18n/I18nContext'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsPage } from './pages/ProductsPage'

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="product-detail" element={<ProductDetailPage />} />
            </Route>

            <Route path="login" element={<LoginPage />} />

            <Route
              path="dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardHomePage />} />
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

              <Route path="sizes" element={<SizeListPage />} />
              <Route path="sizes/create" element={<SizeCreatePage />} />
              <Route path="sizes/:id" element={<SizeDetailPage />} />
              <Route path="sizes/:id/edit" element={<SizeEditPage />} />

              <Route path="diameters" element={<DiameterListPage />} />
              <Route path="diameters/create" element={<DiameterCreatePage />} />
              <Route path="diameters/:id" element={<DiameterDetailPage />} />
              <Route path="diameters/:id/edit" element={<DiameterEditPage />} />

              <Route path="powers" element={<PowerListPage />} />
              <Route path="powers/create" element={<PowerCreatePage />} />
              <Route path="powers/:id" element={<PowerDetailPage />} />
              <Route path="powers/:id/edit" element={<PowerEditPage />} />

              <Route path="colors" element={<ColorListPage />} />
              <Route path="colors/create" element={<ColorCreatePage />} />
              <Route path="colors/:id" element={<ColorDetailPage />} />
              <Route path="colors/:id/edit" element={<ColorEditPage />} />

              <Route path="hero-video" element={<HeroVideoPage />} />

              <Route path="products" element={<ProductListPage />} />
              <Route path="products/spin" element={<ProductSpinPage />} />
              <Route path="products/:id/spin" element={<ProductSpinEditPage />} />
              <Route path="products/create" element={<ProductCreatePage />} />
              <Route
                path="products/:id"
                element={<DashboardProductDetailPage />}
              />
              <Route path="products/:id/edit" element={<ProductEditPage />} />

              <Route path="users" element={<UserListPage />} />
              <Route path="users/create" element={<UserCreatePage />} />
              <Route path="users/:id" element={<UserDetailPage />} />
              <Route path="users/:id/edit" element={<UserEditPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  )
}
