const BRANDS = require("./dictionaries/brands.json");
const MODELS = require("./dictionaries/models.json");
const TRIMS = require("./dictionaries/trims.json");
const FEATURES = require("./dictionaries/features.json");
const SPEC_KEYS = require("./dictionaries/spec_keys.json");
const SPEC_VALUES = require("./dictionaries/spec_values.json");

const RU_LAYER = {
  brands: {
    Nissan: "Ниссан",
    Toyota: "Тойота",
    Honda: "Хонда",
    Suzuki: "Сузуки",
    Mazda: "Мазда",
    Mitsubishi: "Мицубиси",
    Daihatsu: "Дайхатсу",
    Subaru: "Субару",
    Lexus: "Лексус",
    Isuzu: "Исузу"
  },
  features: {
    ProPilot: "ProPilot",
    Hybrid: "Гибрид",
    Turbo: "Турбо",
    "Collision Mitigation": "Система предотвращения столкновений",
    "Lane Assist": "Контроль полосы",
    "Cruise Control": "Круиз-контроль",
    "360 Camera": "Камера 360°",
    "Rear Camera": "Камера заднего вида",
    Navigation: "Навигация",
    "LED Headlights": "LED-фары"
  },
  specEnums: {
    fuel_type: {
      petrol: "Бензин",
      hybrid: "Гибрид",
      diesel: "Дизель",
      electric: "Электро"
    },
    transmission: {
      cvt: "Вариатор",
      automatic: "Автомат",
      manual: "Механика"
    },
    drive: {
      awd: "Полный привод",
      fwd: "Передний привод",
      rwd: "Задний привод"
    },
    repair_history: {
      true: "Есть ремонтная история",
      false: "Без ремонтной истории"
    },
    one_owner: {
      true: "Да",
      false: "Нет"
    },
    non_smoking: {
      true: "Да",
      false: "Нет"
    },
    warranty: {
      true: "Да",
      false: "Нет"
    },
    maintenance: {
      true: "Да",
      false: "Нет"
    }
  }
};

function clean(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function buildSearchForms(text = "") {
  const source = clean(text);
  return {
    source,
    compact: source.replace(/[\s\-_/()（）\[\]【】・]+/g, "")
  };
}

function findBestTitleMatch(text = "", dictionary = {}) {
  const { source, compact } = buildSearchForms(text);
  if (!source) return null;

  const entries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
  for (const [jp, value] of entries) {
    const jpText = clean(jp);
    const jpCompact = jpText.replace(/[\s\-_/()（）\[\]【】・]+/g, "");
    if (!jpText) continue;
    if (source.includes(jpText) || (jpCompact && compact.includes(jpCompact))) {
      return { key: jp, value };
    }
  }

  return null;
}

function firstNumber(text = "") {
  const normalized = clean(text).replace(/,/g, "");
  const matches = normalized.match(/\d+(\.\d+)?/g);
  if (!matches || !matches.length) return null;
  return Number(matches[0]);
}

function mileageFromText(text = "") {
  const normalized = clean(text)
    .replace(/[，]/g, ",")
    .replace(/[．]/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const manKmMatch = normalized.match(/([\d.,]+)\s*万\s*(?:km)?/i);
  if (manKmMatch) {
    return Math.round(Number(manKmMatch[1].replace(/,/g, "")) * 10000);
  }

  const kmMatch = normalized.match(/([\d.,]+)\s*km/i);
  if (kmMatch) {
    return Math.round(Number(kmMatch[1].replace(/,/g, "")));
  }

  return firstNumber(normalized);
}

function readBooleanMark(value = "") {
  const v = clean(value);
  if (!v) return null;
  if (/^(なし|無|×|✕|-)$/.test(v)) return false;
  if (/^(あり|有|◯|○|〇|◎)$/.test(v)) return true;
  return null;
}

function parseTitleParts(title = "") {
  const source = clean(title);
  const parts = source
    .replace(/[（）()【】\[\]]/g, " ")
    .split(/\s+/)
    .map((x) => clean(x))
    .filter(Boolean);

  const brandMatch = findBestTitleMatch(source, BRANDS);
  const modelMatch = findBestTitleMatch(source, MODELS);

  let brand = brandMatch?.value || null;
  let model = modelMatch?.value || null;
  let engine = null;
  const trims = [];
  const features = [];

  for (const part of parts) {
    if (!brand && BRANDS[part]) {
      brand = BRANDS[part];
      continue;
    }

    if (!model && MODELS[part]) {
      model = MODELS[part];
      continue;
    }

    if (!model) {
      const modelEntry = Object.entries(MODELS).find(([jp]) => part === jp || (jp.length >= 3 && part.includes(jp)));
      if (modelEntry) {
        model = modelEntry[1];
        continue;
      }
    }

    if (!engine) {
      const engineMatch = part.match(/(\d{2,4})(?:cc|CC)?/);
      if (engineMatch) {
        engine = Number(engineMatch[1]);
        continue;
      }
    }

    if (/^([A-Z]{1,4}\d*|[A-Z]{1,4})$/i.test(part)) {
      continue;
    }

    if (/^[\d.,]+$/.test(part)) {
      continue;
    }

    let trimFound = false;
    for (const [jp, en] of Object.entries(TRIMS)) {
      const isShort = jp.length <= 2;
      const matched = isShort ? part === jp : part.includes(jp);
      if (matched) {
        trims.push(en);
        trimFound = true;
        break;
      }
    }

    if (trimFound) continue;

    if (FEATURES[part]) {
      features.push(FEATURES[part]);
      continue;
    }
  }

  return {
    brand,
    model,
    engine_cc: engine,
    trim: clean(trims.join(" ")),
    features: [...new Set(features)],
    raw: source
  };
}

function parseSpecField(key = "", value = "") {
  const rawKey = clean(key);
  const rawValue = clean(value);
  if (!rawKey || !rawValue) return null;

  const canonicalKey = SPEC_KEYS[rawKey] || rawKey;

  if (canonicalKey === "mileage") {
    return mileageFromText(rawValue);
  }

  if (["year", "mileage", "engine_cc", "seats", "doors"].includes(canonicalKey)) {
    return firstNumber(rawValue);
  }

  if (canonicalKey === "fuel_type") {
    return SPEC_VALUES.fuel[rawValue] || rawValue;
  }

  if (canonicalKey === "transmission") {
    return SPEC_VALUES.transmission[rawValue] || rawValue;
  }

  if (canonicalKey === "drive") {
    return SPEC_VALUES.drive[rawValue] || rawValue;
  }

  if (["repair_history", "one_owner", "non_smoking", "warranty", "maintenance"].includes(canonicalKey)) {
    const asBool = readBooleanMark(rawValue);
    if (asBool === null) return rawValue;
    return asBool;
  }

  return rawValue;
}

function collectSpecValues(specs = {}) {
  const collected = {};

  for (const [key, value] of Object.entries(specs)) {
    const canonicalKey = SPEC_KEYS[clean(key)] || clean(key);
    collected[canonicalKey] = parseSpecField(key, value);
  }

  return collected;
}

function mergeBestText(a = "", b = "") {
  const left = clean(a);
  const right = clean(b);
  if (!left) return right;
  if (!right) return left;

  if (left.toLowerCase() === right.toLowerCase()) return left;
  if (left.toLowerCase().includes(right.toLowerCase())) return left;
  if (right.toLowerCase().includes(left.toLowerCase())) return right;

  const leftTokens = new Set(left.toLowerCase().split(/\s+/).filter(Boolean));
  const merged = [left, ...right.split(/\s+/).filter((token) => !leftTokens.has(token.toLowerCase()))].join(" ");
  return clean(merged);
}

function toRuSpecEnum(key, value) {
  if (value === null || value === undefined) return value;
  const map = RU_LAYER.specEnums[key] || null;
  if (typeof value === "boolean") {
    if (map) return map[String(value)] || (value ? "Да" : "Нет");
    return value ? "Да" : "Нет";
  }
  if (!map) return value;
  return map[value] || value;
}

function applyRuLayer(payload = {}) {
  const brandEn = clean(payload.brand || "");
  const modelEn = clean(payload.model || "");
  const trimEn = clean(payload.trim || "");
  const featuresEn = Array.isArray(payload.features) ? payload.features : [];
  const specsEn = payload.specs && typeof payload.specs === "object" ? payload.specs : {};

  const brandRu = RU_LAYER.brands[brandEn] || brandEn;
  const modelRu = modelEn;
  const trimRu = trimEn;
  const featuresRu = [...new Set(featuresEn.map((x) => RU_LAYER.features[x] || x).filter(Boolean))];

  const specsRu = {};
  for (const [k, v] of Object.entries(specsEn)) {
    specsRu[k] = toRuSpecEnum(k, v);
  }

  return {
    brand: brandRu,
    model: modelRu,
    trim: trimRu,
    features: featuresRu,
    specs: specsRu
  };
}

module.exports = {
  BRANDS,
  MODELS,
  TRIMS,
  FEATURES,
  SPEC_KEYS,
  parseTitleParts,
  parseSpecField,
  collectSpecValues,
  firstNumber,
  mergeBestText,
  applyRuLayer
};
