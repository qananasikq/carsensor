type RawSpecsLike = Record<string, unknown> & {
  normalized?: {
    mileage?: number | null;
  };
};

type CarMileageLike = {
  mileage?: number | null;
  rawSpecs?: RawSpecsLike | null;
};

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value !== "string") return null;

  const normalized = value
    .replace(/[，]/g, ",")
    .replace(/[．]/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const direct = Number(normalized.replace(/,/g, ""));
  return Number.isFinite(direct) ? Math.round(direct) : null;
}

export function parseMileageToKm(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value !== "string") return null;

  const text = value
    .replace(/[，]/g, ",")
    .replace(/[．]/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || /不明/i.test(text)) return null;

  const manMatch = text.match(/([\d.,]+)\s*万\s*(?:km)?/i);
  if (manMatch) {
    return Math.round(Number(manMatch[1].replace(/,/g, "")) * 10000);
  }

  const kmMatch = text.match(/([\d.,]+)\s*km/i);
  if (kmMatch) {
    return Math.round(Number(kmMatch[1].replace(/,/g, "")));
  }

  return toNumber(text.replace(/[^\d.,-]/g, ""));
}

export function resolveMileageKm(car: CarMileageLike) {
  const directMileage = toNumber(car?.mileage ?? null);
  if (directMileage !== null && directMileage >= 1000) {
    return directMileage;
  }

  const rawSpecs = car?.rawSpecs;
  const rawMileage = parseMileageToKm(rawSpecs?.["пробег"]);
  if (rawMileage !== null) {
    return rawMileage;
  }

  const normalizedMileage = toNumber(rawSpecs?.normalized?.mileage ?? null);
  if (normalizedMileage !== null) {
    if (normalizedMileage < 1000 && typeof rawSpecs?.["пробег"] === "string" && /万/.test(rawSpecs["пробег"] as string)) {
      return normalizedMileage * 10000;
    }
    return normalizedMileage;
  }

  return directMileage;
}
