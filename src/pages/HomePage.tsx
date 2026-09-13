import { About } from '../components/home/About'
import { Categories } from '../components/home/Categories'
import { Contact } from '../components/home/Contact'
import { Hero } from '../components/home/Hero'
import { SelectedProducts } from '../components/home/SelectedProducts'

export function HomePage() {
  return (
    <main id="main-content" className="page-content page-home">
      <Hero />
      <Categories />
      <SelectedProducts />
      <About />
      <Contact />
    </main>
  )
}
