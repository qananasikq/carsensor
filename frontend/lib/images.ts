export const PLACEHOLDER_IMAGE = "https://placehold.co/1200x800?text=Фото+отсутствует";

function normalizeImageUrl(value: string) {
  return String(value || "").trim();
}

function isBlockedImageUrl(url: string) {
  return (
    /360\.car\//i.test(url) ||
    /\/obvr\//i.test(url) ||
    /360_img/i.test(url) ||
    /_001S\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)
  );
}

export function getDisplayImageUrls(images: string[]) {
  const unique = Array.from(new Set((images || []).map(normalizeImageUrl).filter(Boolean)));
  const filtered = unique.filter((url) => !isBlockedImageUrl(url));
  return filtered.length ? filtered : unique;
}
