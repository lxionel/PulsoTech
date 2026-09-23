export const isProd = process.env.NODE_ENV === "production";
export const basePath = isProd ? "/PulsoTech" : "";

export function getAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  if (basePath && path.startsWith(basePath)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${clean}`;
}
