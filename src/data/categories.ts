export type CategoryItem = {
  id: string
  image: string
  /** Optional deeper children shown on hover */
  children?: string[]
}

export type CategoryGroup = {
  id: string
  items: CategoryItem[]
}

/**
 * Hierarchy mirrors raduga-light.com catalog grouping:
 * parent groups → subcategory cards (some with nested children).
 */
export const categoryGroups: CategoryGroup[] = [
  {
    id: 'architectural',
    items: [
      {
        id: 'decorative',
        image: '/assets/images/products/image3.png',
        children: ['pendants', 'wallLights', 'ceiling'],
      },
      {
        id: 'spotlights',
        image: '/assets/images/products/image2.png',
      },
      {
        id: 'lowPowerSpotlights',
        image: '/assets/images/products/image1.png',
      },
      {
        id: 'ground',
        image: '/assets/images/products/image4.png',
      },
      {
        id: 'linear',
        image: '/assets/images/products/image5.png',
        children: ['profiles', 'recessed', 'surface'],
      },
      {
        id: 'flex',
        image: '/assets/images/products/image6.png',
      },
    ],
  },
  {
    id: 'landscape',
    items: [
      {
        id: 'decorativeOutdoor',
        image: '/assets/images/products/image3.png',
      },
      {
        id: 'bollards',
        image: '/assets/images/products/image4.png',
      },
      {
        id: 'floorLamps',
        image: '/assets/images/products/image5.png',
      },
      {
        id: 'park',
        image: '/assets/images/products/image1.png',
      },
      {
        id: 'systems',
        image: '/assets/images/products/image2.png',
        children: ['path', 'garden', 'facade'],
      },
      {
        id: 'flood',
        image: '/assets/images/products/image6.png',
      },
    ],
  },
  {
    id: 'professional',
    items: [
      {
        id: 'street',
        image: '/assets/images/products/image1.png',
      },
      {
        id: 'industrial',
        image: '/assets/images/products/image2.png',
      },
      {
        id: 'commercial',
        image: '/assets/images/products/image3.png',
        children: ['retail', 'office', 'hospitality'],
      },
      {
        id: 'sports',
        image: '/assets/images/products/image4.png',
      },
      {
        id: 'poles',
        image: '/assets/images/products/image5.png',
      },
      {
        id: 'track',
        image: '/assets/images/products/image6.png',
      },
    ],
  },
]
