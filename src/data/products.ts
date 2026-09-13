export type Product = {
  name: string
  description: string
  code: string
  category: string
  country: string
  brand: string
  size: string
  image: string
}

export const products: Product[] = [
  {
    name: 'Linear Flux Pro',
    description: 'Yüksək intensivlikli LED zolaq sistemi, 3000K isti işıq.',
    code: 'LX-4029',
    category: 'led',
    country: 'Almaniya',
    brand: 'ARC',
    size: '5m',
    image: '/assets/images/products/image1.png',
  },
  {
    name: 'Eclipse Focus',
    description: 'Daxili quraşdırılan minimalist tavan işıqlandırması.',
    code: 'EF-9912',
    category: 'spots',
    country: 'İtaliya',
    brand: 'NovaLux',
    size: '12cm',
    image: '/assets/images/products/image2.png',
  },
  {
    name: 'Aura Pendant',
    description: 'Zərif şüşə və metalın harmoniyası, dekorativ çilçıraq.',
    code: 'AP-0081',
    category: 'chandeliers',
    country: 'Türkiyə',
    brand: 'Luma',
    size: '60cm',
    image: '/assets/images/products/image3.png',
  },
  {
    name: 'Vector Wall',
    description: 'Vertikal istiqamətli divarüstü dekorativ işıqlandırma.',
    code: 'VW-2401',
    category: 'spots',
    country: 'Almaniya',
    brand: 'ARC',
    size: '30cm',
    image: '/assets/images/products/image4.png',
  },
  {
    name: 'Zenith Desk',
    description: 'İş masası üçün peşəkar və yumşaq işıqlandırma.',
    code: 'ZD-7300',
    category: 'led',
    country: 'Çin',
    brand: 'NovaLux',
    size: '40cm',
    image: '/assets/images/products/image5.png',
  },
  {
    name: 'Orbit Track',
    description: 'Maqnitli rels sistemi ilə çoxfunksiyalı işıqlandırma.',
    code: 'OT-6602',
    category: 'led',
    country: 'Türkiyə',
    brand: 'Luma',
    size: '2m',
    image: '/assets/images/products/image6.png',
  },
]
