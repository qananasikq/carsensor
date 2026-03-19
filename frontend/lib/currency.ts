const JPY_TO_RUB = 0.58;

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("ru-RU").format(Math.round(value));
}

export function convertJpyToRub(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.round(value * JPY_TO_RUB);
}

export function formatPriceWithRub(value: number | null | undefined) {
  if (value === null || value === undefined) return "По запросу";
  const rub = convertJpyToRub(value);
  return `${formatNumber(value)} ¥ · ≈ ${formatNumber(rub)} ₽`;
}

export function formatPriceWithKnownRub(jpy: number | null | undefined, rub: number | null | undefined) {
  if (jpy === null || jpy === undefined) return "По запросу";
  const resolvedRub = rub === null || rub === undefined ? convertJpyToRub(jpy) : rub;
  return `${formatNumber(jpy)} ¥ · ≈ ${formatNumber(resolvedRub)} ₽`;
}

export function formatMoneyPair(jpy: number | null | undefined, rub: number | null | undefined) {
  if (jpy === null || jpy === undefined) return "—";
  const resolvedRub = rub === null || rub === undefined ? convertJpyToRub(jpy) : rub;
  return `${formatNumber(jpy)} ¥ · ≈ ${formatNumber(resolvedRub)} ₽`;
}

export function formatRubOnly(value: number | null | undefined) {
  const rub = convertJpyToRub(value);
  return rub === null ? "—" : `${formatNumber(rub)} ₽`;
}
