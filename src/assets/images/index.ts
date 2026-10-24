import { IMAGE_PATHS, getCategoryThumbnail, getProductFallbackImage } from '../../constants/imagePaths';

export { IMAGE_PATHS, getCategoryThumbnail, getProductFallbackImage };

export const LOCAL_IMAGES = {
  jewelryKundanSet: IMAGE_PATHS.products.kundanChoker,
  cosmeticsMakeupKit: IMAGE_PATHS.products.matteLipstick,
  laceEmbroideryBorder: IMAGE_PATHS.products.zariVelvetLace,
  hairAccessoriesPearl: IMAGE_PATHS.products.bridalHairVine,
  skincareGlowSerum: IMAGE_PATHS.products.roseFacialMist,
  fashionPotliBag: IMAGE_PATHS.products.embroideredPotliBag,
  hyderabadiBangles: IMAGE_PATHS.products.hyderabadiBangles,
  goldJhumkas: IMAGE_PATHS.products.goldJhumkas,
} as const;

export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'Jewelry & Artificial Jewelry': IMAGE_PATHS.categories.jewelry,
  'Cosmetics & Makeup': IMAGE_PATHS.categories.cosmetics,
  'Laces, Borders & Embroidery': IMAGE_PATHS.categories.laces,
  'Hair Accessories': IMAGE_PATHS.categories.hairAccessories,
  'Skincare Products': IMAGE_PATHS.categories.skincare,
  'Ladies Fashion Accessories': IMAGE_PATHS.categories.fashionAccessories,
};

export const getFallbackImageForCategory = (category?: string): string => {
  return getProductFallbackImage(category);
};

export default IMAGE_PATHS;
