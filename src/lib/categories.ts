export function normalizeCategory(category: string): string {
  return category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const categoryGroups = [
  ["audifono", "audio", "auricular"],
  ["smartwatch", "reloj"],
  ["cargador", "bateria", "powerbank"],
  ["periferico", "teclado", "mouse", "computadora", "pc"],
];

export function isAudioCategory(category: string): boolean {
  const normalized = normalizeCategory(category);
  return categoryGroups[0].some(keyword => normalized.includes(keyword));
}

export function matchesProductCategory(productCategory: string, selectedCategory: string): boolean {
  const selected = normalizeCategory(selectedCategory);
  if (selected === "todos") return true;
  const product = normalizeCategory(productCategory);
  if (!product || !selected) return false;
  if (product === selected || product.includes(selected) || selected.includes(product)) return true;
  return categoryGroups.some(keywords =>
    keywords.some(keyword => selected.includes(keyword)) &&
    keywords.some(keyword => product.includes(keyword))
  );
}
