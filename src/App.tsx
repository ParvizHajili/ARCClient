import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/layout/Layout'
import { DashboardLayout } from './dashboard/components/DashboardLayout'
import { I18nProvider } from './i18n/I18nContext'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const CategoryPage = lazy(() =>
  import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })),
)
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
)
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  })),
)

const LoginPage = lazy(() =>
  import('./dashboard/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const DashboardHomePage = lazy(() =>
  import('./dashboard/pages/DashboardHomePage').then((m) => ({
    default: m.DashboardHomePage,
  })),
)

const AboutCreatePage = lazy(() =>
  import('./dashboard/pages/AboutCreatePage').then((m) => ({
    default: m.AboutCreatePage,
  })),
)
const AboutDetailPage = lazy(() =>
  import('./dashboard/pages/AboutDetailPage').then((m) => ({
    default: m.AboutDetailPage,
  })),
)
const AboutEditPage = lazy(() =>
  import('./dashboard/pages/AboutEditPage').then((m) => ({
    default: m.AboutEditPage,
  })),
)
const AboutListPage = lazy(() =>
  import('./dashboard/pages/AboutListPage').then((m) => ({
    default: m.AboutListPage,
  })),
)

const ContactInfoCreatePage = lazy(() =>
  import('./dashboard/pages/ContactInfoCreatePage').then((m) => ({
    default: m.ContactInfoCreatePage,
  })),
)
const ContactInfoDetailPage = lazy(() =>
  import('./dashboard/pages/ContactInfoDetailPage').then((m) => ({
    default: m.ContactInfoDetailPage,
  })),
)
const ContactInfoEditPage = lazy(() =>
  import('./dashboard/pages/ContactInfoEditPage').then((m) => ({
    default: m.ContactInfoEditPage,
  })),
)
const ContactInfoListPage = lazy(() =>
  import('./dashboard/pages/ContactInfoListPage').then((m) => ({
    default: m.ContactInfoListPage,
  })),
)

const HeroVideoPage = lazy(() =>
  import('./dashboard/pages/HeroVideoPage').then((m) => ({
    default: m.HeroVideoPage,
  })),
)
const InquiryDetailPage = lazy(() =>
  import('./dashboard/pages/InquiryDetailPage').then((m) => ({
    default: m.InquiryDetailPage,
  })),
)
const InquiryListPage = lazy(() =>
  import('./dashboard/pages/InquiryListPage').then((m) => ({
    default: m.InquiryListPage,
  })),
)
const OrderContactPage = lazy(() =>
  import('./dashboard/pages/OrderContactPage').then((m) => ({
    default: m.OrderContactPage,
  })),
)

const BrandCreatePage = lazy(() =>
  import('./dashboard/pages/BrandCreatePage').then((m) => ({
    default: m.BrandCreatePage,
  })),
)
const BrandDetailPage = lazy(() =>
  import('./dashboard/pages/BrandDetailPage').then((m) => ({
    default: m.BrandDetailPage,
  })),
)
const BrandEditPage = lazy(() =>
  import('./dashboard/pages/BrandEditPage').then((m) => ({
    default: m.BrandEditPage,
  })),
)
const BrandListPage = lazy(() =>
  import('./dashboard/pages/BrandListPage').then((m) => ({
    default: m.BrandListPage,
  })),
)

const SizeCreatePage = lazy(() =>
  import('./dashboard/pages/SizeCreatePage').then((m) => ({
    default: m.SizeCreatePage,
  })),
)
const SizeDetailPage = lazy(() =>
  import('./dashboard/pages/SizeDetailPage').then((m) => ({
    default: m.SizeDetailPage,
  })),
)
const SizeEditPage = lazy(() =>
  import('./dashboard/pages/SizeEditPage').then((m) => ({
    default: m.SizeEditPage,
  })),
)
const SizeListPage = lazy(() =>
  import('./dashboard/pages/SizeListPage').then((m) => ({
    default: m.SizeListPage,
  })),
)

const DiameterCreatePage = lazy(() =>
  import('./dashboard/pages/DiameterCreatePage').then((m) => ({
    default: m.DiameterCreatePage,
  })),
)
const DiameterDetailPage = lazy(() =>
  import('./dashboard/pages/DiameterDetailPage').then((m) => ({
    default: m.DiameterDetailPage,
  })),
)
const DiameterEditPage = lazy(() =>
  import('./dashboard/pages/DiameterEditPage').then((m) => ({
    default: m.DiameterEditPage,
  })),
)
const DiameterListPage = lazy(() =>
  import('./dashboard/pages/DiameterListPage').then((m) => ({
    default: m.DiameterListPage,
  })),
)

const PowerCreatePage = lazy(() =>
  import('./dashboard/pages/PowerCreatePage').then((m) => ({
    default: m.PowerCreatePage,
  })),
)
const PowerDetailPage = lazy(() =>
  import('./dashboard/pages/PowerDetailPage').then((m) => ({
    default: m.PowerDetailPage,
  })),
)
const PowerEditPage = lazy(() =>
  import('./dashboard/pages/PowerEditPage').then((m) => ({
    default: m.PowerEditPage,
  })),
)
const PowerListPage = lazy(() =>
  import('./dashboard/pages/PowerListPage').then((m) => ({
    default: m.PowerListPage,
  })),
)

const CategoryCreatePage = lazy(() =>
  import('./dashboard/pages/CategoryCreatePage').then((m) => ({
    default: m.CategoryCreatePage,
  })),
)
const CategoryDetailPage = lazy(() =>
  import('./dashboard/pages/CategoryDetailPage').then((m) => ({
    default: m.CategoryDetailPage,
  })),
)
const CategoryEditPage = lazy(() =>
  import('./dashboard/pages/CategoryEditPage').then((m) => ({
    default: m.CategoryEditPage,
  })),
)
const CategoryListPage = lazy(() =>
  import('./dashboard/pages/CategoryListPage').then((m) => ({
    default: m.CategoryListPage,
  })),
)

const ColorCreatePage = lazy(() =>
  import('./dashboard/pages/ColorCreatePage').then((m) => ({
    default: m.ColorCreatePage,
  })),
)
const ColorDetailPage = lazy(() =>
  import('./dashboard/pages/ColorDetailPage').then((m) => ({
    default: m.ColorDetailPage,
  })),
)
const ColorEditPage = lazy(() =>
  import('./dashboard/pages/ColorEditPage').then((m) => ({
    default: m.ColorEditPage,
  })),
)
const ColorListPage = lazy(() =>
  import('./dashboard/pages/ColorListPage').then((m) => ({
    default: m.ColorListPage,
  })),
)

const ManufacturerCountryCreatePage = lazy(() =>
  import('./dashboard/pages/ManufacturerCountryCreatePage').then((m) => ({
    default: m.ManufacturerCountryCreatePage,
  })),
)
const ManufacturerCountryDetailPage = lazy(() =>
  import('./dashboard/pages/ManufacturerCountryDetailPage').then((m) => ({
    default: m.ManufacturerCountryDetailPage,
  })),
)
const ManufacturerCountryEditPage = lazy(() =>
  import('./dashboard/pages/ManufacturerCountryEditPage').then((m) => ({
    default: m.ManufacturerCountryEditPage,
  })),
)
const ManufacturerCountryListPage = lazy(() =>
  import('./dashboard/pages/ManufacturerCountryListPage').then((m) => ({
    default: m.ManufacturerCountryListPage,
  })),
)

const ProductCreatePage = lazy(() =>
  import('./dashboard/pages/ProductFormPage').then((m) => ({
    default: m.ProductCreatePage,
  })),
)
const ProductEditPage = lazy(() =>
  import('./dashboard/pages/ProductFormPage').then((m) => ({
    default: m.ProductEditPage,
  })),
)
const DashboardProductDetailPage = lazy(() =>
  import('./dashboard/pages/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  })),
)
const HomeProductsPage = lazy(() =>
  import('./dashboard/pages/HomeProductsPage').then((m) => ({
    default: m.HomeProductsPage,
  })),
)
const ProductListPage = lazy(() =>
  import('./dashboard/pages/ProductListPage').then((m) => ({
    default: m.ProductListPage,
  })),
)

const UserCreatePage = lazy(() =>
  import('./dashboard/pages/UserCreatePage').then((m) => ({
    default: m.UserCreatePage,
  })),
)
const UserDetailPage = lazy(() =>
  import('./dashboard/pages/UserDetailPage').then((m) => ({
    default: m.UserDetailPage,
  })),
)
const UserEditPage = lazy(() =>
  import('./dashboard/pages/UserEditPage').then((m) => ({
    default: m.UserEditPage,
  })),
)
const UserListPage = lazy(() =>
  import('./dashboard/pages/UserListPage').then((m) => ({
    default: m.UserListPage,
  })),
)

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="categories/:id" element={<CategoryPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route
                  path="product-detail"
                  element={<Navigate to="/products" replace />}
                />
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
                <Route path="inquiries" element={<InquiryListPage />} />
                <Route path="inquiries/:id" element={<InquiryDetailPage />} />
                <Route path="order-contact" element={<OrderContactPage />} />

                <Route path="products" element={<ProductListPage />} />
                <Route path="products/home" element={<HomeProductsPage />} />
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

                <Route path="about" element={<AboutListPage />} />
                <Route path="about/create" element={<AboutCreatePage />} />
                <Route path="about/:id" element={<AboutDetailPage />} />
                <Route path="about/:id/edit" element={<AboutEditPage />} />

                <Route path="contact-info" element={<ContactInfoListPage />} />
                <Route
                  path="contact-info/create"
                  element={<ContactInfoCreatePage />}
                />
                <Route
                  path="contact-info/:id"
                  element={<ContactInfoDetailPage />}
                />
                <Route
                  path="contact-info/:id/edit"
                  element={<ContactInfoEditPage />}
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  )
}
