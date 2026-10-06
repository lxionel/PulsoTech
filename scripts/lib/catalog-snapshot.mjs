// Explicit public fields only. Never copy a database row or private settings wholesale.
export function catalogProduct(row, media) {
  return {
    id: String(row.id), name: row.name || "", slug: row.slug || "", subtitle: row.subtitle || "", description: row.description || "",
    price: Number(row.price) || 0, ...(row.original_price ? { originalPrice: Number(row.original_price) } : {}),
    brand: row.brand || "", category: row.category || "", inStock: Boolean(row.in_stock), stockCount: Number(row.stock_count) || 0,
    isFeatured: Boolean(row.is_featured), isNew: Boolean(row.is_new), rating: Number(row.rating) || 0, reviewsCount: Number(row.reviews_count) || 0,
    colors: media.colors, images: media.images, specs: row.specs || {}, customSpecs: row.custom_specs || [],
    features: row.features || [], tags: row.tags || [], ...(row.video_url ? { videoUrl: row.video_url } : {}),
  };
}

export function exportableRow(row) {
  return row.specs?.storeStatus !== "draft";
}
