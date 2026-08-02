export const FALLBACK_IMAGES = {
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  appliances: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  electronics: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
};

export function getProductImage(product, index = 0) {
  if (!product) return FALLBACK_IMAGES.default;
  
  const category = (product.category || '').toLowerCase();
  let defaultImg = FALLBACK_IMAGES.furniture;
  if (category.includes('appliance')) defaultImg = FALLBACK_IMAGES.appliances;
  if (category.includes('electronic')) defaultImg = FALLBACK_IMAGES.electronics;

  if (product.images && Array.isArray(product.images) && product.images.length > index && product.images[index]) {
    return product.images[index];
  }

  if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
    return product.image;
  }

  return defaultImg;
}

export function handleImageError(e, category = 'furniture') {
  const cat = (category || '').toLowerCase();
  let fallback = FALLBACK_IMAGES.furniture;
  if (cat.includes('appliance')) fallback = FALLBACK_IMAGES.appliances;
  if (cat.includes('electronic')) fallback = FALLBACK_IMAGES.electronics;

  e.target.onerror = null;
  e.target.src = fallback;
}
