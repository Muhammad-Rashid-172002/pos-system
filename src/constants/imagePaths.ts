/**
 * Centralized Image Registry for Zebaish Ladies Boutique POS
 * All assets are locally stored under public/assets/ in highly-optimized WebP format
 * and served statically with zero external latency, predictable caching, and instant rendering.
 */

export const IMAGE_PATHS = {
  branding: {
    logo: '/assets/branding/store-logo.webp',
  },
  categories: {
    jewelry: '/assets/categories/jewelry.webp',
    cosmetics: '/assets/categories/cosmetics.webp',
    laces: '/assets/categories/laces.webp',
    hairAccessories: '/assets/categories/hair-accessories.webp',
    skincare: '/assets/categories/skincare.webp',
    fashionAccessories: '/assets/categories/fashion-accessories.webp',
  },
  products: {
    kundanChoker: '/assets/products/jewelry/kundan-bridal-choker.webp',
    goldJhumkas: '/assets/products/jewelry/gold-plated-jhumkas.webp',
    hyderabadiBangles: '/assets/products/jewelry/hyderabadi-bangles.webp',
    matteLipstick: '/assets/products/cosmetics/matte-liquid-lipstick.webp',
    radiantFoundation: '/assets/products/cosmetics/radiant-liquid-foundation.webp',
    zariVelvetLace: '/assets/products/laces/embroidered-zari-velvet-lace.webp',
    gotaCutworkLace: '/assets/products/laces/gota-cutwork-lace.webp',
    mirrorWorkLace: '/assets/products/laces/mirror-work-daman-lace.webp',
    bridalHairVine: '/assets/products/hair/bridal-pearl-hair-vine.webp',
    silkScrunchies: '/assets/products/hair/silk-mulberry-scrunchies.webp',
    roseFacialMist: '/assets/products/skincare/damask-rose-facial-mist.webp',
    embroideredPotliBag: '/assets/products/accessories/embroidered-velvet-potli-bag.webp',
  },
} as const;

export type ImagePathCategory = keyof typeof IMAGE_PATHS.categories;
export type ProductImageKey = keyof typeof IMAGE_PATHS.products;

/**
 * Returns the optimized local category image path for any business category
 */
export const getCategoryThumbnail = (category?: string): string => {
  if (!category) return IMAGE_PATHS.categories.cosmetics;
  switch (category) {
    case 'Jewelry & Artificial Jewelry':
      return IMAGE_PATHS.categories.jewelry;
    case 'Cosmetics & Makeup':
      return IMAGE_PATHS.categories.cosmetics;
    case 'Laces, Borders & Embroidery':
      return IMAGE_PATHS.categories.laces;
    case 'Hair Accessories':
      return IMAGE_PATHS.categories.hairAccessories;
    case 'Skincare Products':
      return IMAGE_PATHS.categories.skincare;
    case 'Ladies Fashion Accessories':
      return IMAGE_PATHS.categories.fashionAccessories;
    default:
      return IMAGE_PATHS.categories.cosmetics;
  }
};

/**
 * Returns a fallback product image if a custom product does not specify one
 */
export const getProductFallbackImage = (category?: string): string => {
  return getCategoryThumbnail(category);
};

export default IMAGE_PATHS;
