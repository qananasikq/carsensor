import { translateJpFragments } from "@/lib/translate";

const DASH = "—";
const RU_NUMBER_FORMATTER = new Intl.NumberFormat("ru-RU");

function normalizeUiText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*\(\s*/g, " (")
    .replace(/\s*\)\s*/g, ") ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeUiText(value: string | null | undefined) {
  const source = normalizeUiText(translateJpFragments(String(value || "")));
  if (!source) return "";

  return source
    .replace(/\b(TV)\s*\1\b/gi, "TV")
    .replace(/\b(BLUETOOTH)\s*\1\b/gi, "BLUETOOTH")
    .replace(/\b(ETC)\s*\1\b/gi, "ETC")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/(^|\s)[:/\\\-]+(?=\s|$)/g, " ")
    .replace(/["“”]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function collapseRepeatedText(value: string): string {
  const normalized = value.trim().replace(/\s{2,}/g, " ");
  if (!normalized) return "";

  const tokens = normalized.split(" ");
  if (tokens.length % 2 === 0) {
    const mid = tokens.length / 2;
    const left = tokens.slice(0, mid).join(" ");
    const right = tokens.slice(mid).join(" ");
    if (left.toLowerCase() === right.toLowerCase()) return left;
  }

  const compact = normalized.replace(/[\s,.;:!?/\\-]+/g, "").toLowerCase();
  if (compact.length >= 6 && compact.length % 2 === 0) {
    const half = compact.length / 2;
    if (compact.slice(0, half) === compact.slice(half)) {
      return normalized.slice(0, Math.floor(normalized.length / 2)).trim();
    }
  }

  return normalized;
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return DASH;
  return RU_NUMBER_FORMATTER.format(value);
}

export function formatMileage(value: number | null | undefined) {
  return value === null || value === undefined ? DASH : `${formatNumber(value)} км`;
}
