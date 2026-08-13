import API_BASE_URL from "./api";

export function resolveImg(src: string): string {
  if (!src) return "/images/hero.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("data:")) return src;

  // Handle paths starting with /admin/ or /uploads/
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  const encoded = cleanPath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  if (cleanPath.startsWith("/uploads/")) {
    return `${API_BASE_URL}${encoded}`;
  }

  if (cleanPath.startsWith("/admin/")) {
    // If uploaded filename was prefixed with /admin/
    const filename = cleanPath.replace("/admin/", "");
    return `${API_BASE_URL}/uploads/${encodeURIComponent(filename)}`;
  }

  return `${API_BASE_URL}/uploads${encoded}`;
}
