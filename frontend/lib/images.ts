export const PLACEHOLDER_IMAGE = "https://placehold.co/1200x800?text=Фото+отсутствует";

function normalizeImageUrl(value: string) {
  return String(value || "")
    .trim()
    .replace(/_(\d{3})S(\.(?:jpg|jpeg|png|webp))(\?.*)?$/i, "_$1L$2$3");
}

function isBlockedImageUrl(url: string) {
  return (
    /360\.car\//i.test(url) ||
    /\/obvr\//i.test(url) ||
    /360_img/i.test(url) ||
    /\/shopinfo\//i.test(url) ||
    /logo\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) ||
    /qrcode/i.test(url) ||
    /coupon/i.test(url) ||
    /logo_footer/i.test(url) ||
    !/\/(?:CSphoto)\//i.test(url)
  );
}

export function getDisplayImageUrls(images: string[]) {
  const unique = Array.from(new Set((images || []).map(normalizeImageUrl).filter(Boolean)));
  const filtered = unique.filter((url) => !isBlockedImageUrl(url));
  return filtered.length ? filtered : unique;
}
