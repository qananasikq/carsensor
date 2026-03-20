const {
  cleanText,
  squashLines,
  readJapanesePrice,
  readMileage,
  readYear,
  translateSpecs,
  uniqueImageUrls,
  pauseBetweenRequests,
  translateLooseText,
  translateFreeText,
  translateSpecValue
} = require("./normalizers");
const { parseTitleParts, collectSpecValues, mergeBestText, applyRuLayer } = require("./normalize");
const { translateColor } = require("../shared/colorTranslator");

const SELECTORS = {
  title: "h1",
  tableRows: "tr",
  dlBlocks: "dl",
  description: ".comment",
  features: "ul li",
  images: "#js-mainPhoto-frame img, #js-slider img, #js-photoBox img, .detailSlider img, .subSliderMain img",
  dealerName: ".shop h3",
  dealerPhone: ".tel"
};

const JPY_TO_RUB = Number(process.env.JPY_TO_RUB || 0.58);

function uniqueStrings(items) {
  return [...new Set(items.filter(Boolean).map((item) => cleanText(item)))];
}

function collapseRepeatingWords(value = "") {
  const source = cleanText(value);
  if (!source) return "";
  const tokens = source.split(/\s+/).filter(Boolean);
  const seen = new Set();
  const result = [];

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(token);
  }

  return result.join(" ");
}

function trimModelName(value = "") {
  const source = cleanText(value);
  if (!source) return "";

  const stopHints = [
    "ETC",
    "Bluetooth",
    "BLUETOOTH",
    "ナビ",
    "カメラ",
    "クルーズ",
    "ドラレコ",
    "PKG",
    "パッケージ",
    "HID",
    "LED",
    "TV",
    "AW",
    "保証",
    "ワンオーナー",
    "禁煙"
  ];

  const tokens = source
    .replace(/[、,]/g, " ")
    .split(/\s+/)
    .map((x) => cleanText(x))
    .filter(Boolean);

  const result = [];
  for (const token of tokens) {
    if (stopHints.some((hint) => token.includes(hint))) break;
    if (/^[\-/:]+$/.test(token)) continue;
    result.push(token);
    if (result.length >= 5) break;
  }

  return collapseRepeatingWords(result.join(" "));
}

function extractModelFromTitle(title = "", brand = "") {
  const source = cleanText(title).replace(brand, "").trim();
  if (!source) return "";

  const stopHints = [
    "ワンオーナー",
    "禁煙",
    "修復歴",
    "ナビ",
    "ETC",
    "Bluetooth",
    "ドライブレコーダー",
    "バックカメラ",
    "オートライト",
    "保証",
    "限定車"
  ];

  const tokens = source
    .replace(/[、,]/g, " ")
    .split(/\s+/)
    .map((x) => cleanText(x))
    .filter(Boolean);

  const kept = [];
  for (const token of tokens) {
    if (stopHints.some((hint) => token.includes(hint))) break;
    kept.push(token);
    if (kept.length >= 6) break;
  }

  return collapseRepeatingWords(kept.join(" "));
}

function parsePriceValue(raw = "") {
  const text = cleanText(raw);
  if (!text) return null;
  if (!/[\d]/.test(text)) return null;
  if (text.length > 24) return null;
  if (/[。、※●◆■◇□]/.test(text)) return null;

  const parsed = readJapanesePrice(text);
  if (parsed === null || parsed === undefined) return null;
  if (parsed < 50000) return null;
  if (parsed > 200000000) return null;
  return parsed;
}

function extractInlinePrice(raw = "") {
  const text = cleanText(raw);
  if (!text) return null;

  const candidates = [
    ...text.matchAll(/([\d.,]+)\s*万\s*([\d,]+)?\s*円?/gi),
    ...text.matchAll(/([\d,]+)\s*円/gi)
  ];

  for (const match of candidates) {
    const value = parsePriceValue(match[0]);
    if (value !== null) return value;
  }

  return parsePriceValue(text);
}

function choosePriceValue(primary, fallbackList = []) {
  const direct = extractInlinePrice(primary);
  if (direct !== null) return direct;

  for (const item of fallbackList) {
    const value = extractInlinePrice(item);
    if (value !== null) return value;
  }

  return null;
}

function resolveFlagText(value = "", yes = "Да", no = "Нет") {
  const text = cleanText(String(value || ""));
  if (!text) return "";

  const noPattern = /(保証無|整備無|なし|無し|not included|\bno\b|\bНет\b|とも無|無$)/i;
  const yesPattern = /(保証付|整備付|あり|有り|included|\byes\b|\bДа\b|付)/i;

  if (noPattern.test(text)) return no;
  if (yesPattern.test(text)) return yes;

  return "";
}

function shouldSkipFeature(line = "") {
  const text = cleanText(line);
  if (!text) return true;
  if (/^[:/\\\-\s.,()]+$/.test(text)) return true;
  if (/:\s*[-/]+$/.test(text)) return true;
  if (/^[A-Za-zА-Яа-яЁё\s]+:\s*$/.test(text)) return true;
  if (/^[A-Za-z]?:?\s*[\-/]+/.test(text)) return true;
  if (/^\(?\d+\s*\/\s*\d+\)?$/.test(text)) return true;
  if (/^\(?\d+\s*枚\)?$/.test(text)) return true;
  if (/^々[\d,]+$/.test(text)) return true;
  if (/^\d+W$/i.test(text)) return true;
  if (/\([^)]*\)$/.test(text) && text.length < 28 && /Apple CarPlay|Android Auto/i.test(text)) return true;
  if (/^[^A-Za-zА-Яа-яЁё]*$/.test(text) && /[:/\\\-]/.test(text)) return true;

  const letters = (text.match(/[A-Za-zА-Яа-яЁё]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const punct = (text.match(/[:/\\\-.,()%]/g) || []).length;
  if (!letters && punct > 2) return true;
  if (!letters && digits > 0 && punct > 1) return true;

  return false;
}

function looksBrokenText(text = "") {
  const t = cleanText(text);
  if (!t) return true;
  if (t.length < 3) return true;

  const jpChars = (t.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g) || []).length;
  const weirdPunct = (t.match(/[。、※●◆■◇□]/g) || []).length;
  const ratio = (jpChars + weirdPunct) / Math.max(t.length, 1);

  return ratio > 0.18;
}

function buildDescription(value = "") {
  const text = cleanText(String(value || ""));
  if (!text) return "";

  const translated = cleanText(translateFreeText(text))
    .replace(/\b360\s*°\b/gi, " ")
    .replace(/LIBERALA/gi, " ")
    .replace(/\b\d{3,4}-\d{2,4}-\d{3,4}\b/g, " ")
    .replace(/\(\s*:?\s*20\d{2}[\/\-. ]\d{1,2}[\/\-. ]\d{1,2}\s*\)/g, " ")
    .replace(/\b\d+\s*\/\s*\d+\b/g, " ")
    .replace(/[●※☆★◇◆]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const badPatterns = [
    /カーセンサー/i,
    /ご不明点/i,
    /お問い合わ/i,
    /店舗スタッフ/i,
    /店頭在庫/i,
    /全国納車/i,
    /ローンプラン/i,
    /保証部品/i,
    /保証期間/i,
    /保証費用/i,
    /修理回数/i,
    /累積上限/i,
    /ガリバー/i,
    /LIBERALA/i,
    /電話/i,
    /メール/i
  ];

  if (!translated) return "";
  if (badPatterns.some((pattern) => pattern.test(translated))) return "";
  if (looksBrokenText(translated)) return "";
  if (translated.length < 24) return "";
  return translated.slice(0, 420);
}

function formatInspection(text = "") {
  const t = cleanText(text);
  if (!t) return "";

  const y = t.match(/(20\d{2}|19\d{2})/);
  const m = t.match(/(1[0-2]|0?[1-9])\s*月/);
  if (!y) return t;
  if (!m) return y[0];
  return `${y[0]}-${String(Number(m[1])).padStart(2, "0")}`;
}

function extractColorFromTitle(title = "") {
  const source = cleanText(title);
  if (!source) return "";

  const matches = [...source.matchAll(/[（(]([^()（）]{1,40})[）)]/g)];
  const candidate = cleanText(matches.at(-1)?.[1] || "");
  if (!candidate) return "";
  if (/\d{2,4}|km|cc|ETC|Bluetooth|TV|AW|PKG/i.test(candidate)) return "";

  return candidate;
}

function resolveColorValue(candidates = []) {
  for (const candidate of candidates) {
    const cleaned = cleanText(String(candidate || ""));
    if (!cleaned) continue;

    const translated = cleanText(translateColor(cleaned) || cleaned);
    if (translated) return translated;
  }

  return "";
}

function fixImageUrl(url = "") {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

function normalizeCarPhotoUrl(url = "") {
  const fixed = fixImageUrl(url).trim();
  if (!fixed) return "";

  return fixed.replace(/_(\d{3})S(\.(?:jpg|jpeg|png|webp))(\?.*)?$/i, "_$1L$2$3");
}

function isBlockedCarPhotoUrl(url = "") {
  const value = cleanText(String(url || ""));
  if (!value) return true;

  return [
    /360\.car\//i,
    /\/obvr\//i,
    /360_img/i,
    /\/shopinfo\//i,
    /logo\.(?:jpg|jpeg|png|gif|webp)(\?|$)/i,
    /qrcode/i,
    /logo_footer/i,
    /coupon/i,
    /placehold\.co/i,
    /\/static\//i,
    /\/common\//i
  ].some((pattern) => pattern.test(value));
}

function isLikelyCarPhotoUrl(url = "") {
  const value = normalizeCarPhotoUrl(url);
  if (!value || isBlockedCarPhotoUrl(value)) return false;

  if (!/^https?:/i.test(value)) return false;
  if (!/carsensor/i.test(value)) return false;
  if (!/\/(?:CSphoto)\//i.test(value)) return false;
  if (!/\.(?:jpg|jpeg|png|webp)(\?|$)/i.test(value)) return false;

  return true;
}

function isPromotionalImageAlt(alt = "") {
  const value = cleanText(String(alt || ""));
  if (!value) return false;

  if (/\d{2,4}-\d{2,4}-\d{3,4}/.test(value)) return true;

  return [
    /お問い合わせ|お問合せ|ご案内|専門スタッフ/i,
    /保証|ワランティ|保険|ローン|審査|金利/i,
    /WEB商談|オンライン商談|自宅に居ながら/i,
    /最寄り駅|駅までお迎え|徒歩/i,
    /コーティング|メンテナンス|自社指定工場|整備/i,
    /販売OK|販売ＯＫ|全国納車|地方のお客様/i,
    /TEL[:：]?|電話|0564-|0120-/i
  ].some((pattern) => pattern.test(value));
}

function extractSourceId(url = "") {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[parts.length - 2] || parts[parts.length - 1] || parsed.pathname;
  } catch {
    const parts = String(url).split("/").filter(Boolean);
    return parts[parts.length - 2] || parts[parts.length - 1] || String(url);
  }
}

function firstFilled(candidates = []) {
  for (const item of candidates) {
    const value = cleanText(item);
    if (value) return value;
  }
  return "";
}

function extractBodySpecValue(bodyText = "", label = "", stopLabels = []) {
  const text = squashLines(bodyText || "");
  if (!text || !label) return "";

  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lookahead = stopLabels.length
    ? `(?=\\s+(?:${stopLabels.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s|$)`
    : `(?=$)`;
  const pattern = new RegExp(`${escapedLabel}\\s+(.+?)${lookahead}`);
  const match = text.match(pattern);
  return cleanText(match?.[1] || "");
}

function toRub(value) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Math.round(num * JPY_TO_RUB);
}

function normalizeDriveCandidate(value = "") {
  const source = cleanText(String(value || ""));
  if (!source) return "";

  const translated = cleanText(translateSpecValue("привод", source));
  const text = cleanText(translated || source);
  if (!text) return "";

  if (/подключаемый полный привод|парт-тайм|part\s*time|パートタイム/i.test(text)) {
    return "Подключаемый полный привод";
  }
  if (/полный привод|awd|4\s*x\s*4|4\s*wd|四輪駆動|4駆|フルタイム/i.test(text)) {
    return "Полный привод";
  }
  if (/передний привод|ff|2\s*wd|前輪駆動/i.test(text)) {
    return "Передний привод";
  }
  if (/задний привод|fr|後輪駆動/i.test(text)) {
    return "Задний привод";
  }

  return text;
}

function resolveDriveValue(candidates = []) {
  for (const candidate of candidates) {
    const resolved = normalizeDriveCandidate(candidate);
    if (resolved) return resolved;
  }
  return "";
}

function ensureReasonablePrice(price, total, extra) {
  const safePrice = price ?? null;
  const safeTotal = total ?? null;
  let safeExtra = extra ?? null;

  if (safeExtra !== null && safeTotal !== null) {
    const derivedExtra = safeTotal - (safePrice ?? 0);
    if (safeExtra >= safeTotal || (safePrice !== null && safeExtra > safePrice) || (derivedExtra >= 0 && Math.abs(safeExtra - derivedExtra) > 200000)) {
      safeExtra = derivedExtra >= 0 ? derivedExtra : null;
    }
  }

  if (safePrice !== null) {
    return {
      price: safePrice,
      priceTotal: safeTotal !== null ? safeTotal : (safeExtra !== null ? safePrice + safeExtra : null),
      extraCosts: safeExtra !== null ? safeExtra : (safeTotal !== null && safeTotal >= safePrice ? safeTotal - safePrice : null)
    };
  }

  if (safeTotal !== null && safeExtra !== null && safeTotal >= safeExtra) {
    return {
      price: safeTotal - safeExtra,
      priceTotal: safeTotal,
      extraCosts: safeExtra
    };
  }

  return {
    price: safePrice,
    priceTotal: safeTotal,
    extraCosts: safeExtra
  };
}

function dedupeStatus(value = "") {
  const text = cleanText(value);
  if (!text) return "";

  const ruChunks = text.match(/[А-Яа-яЁё][А-Яа-яЁё\s-]+/g) || [];
  if (ruChunks.length > 0) {
    return cleanText(ruChunks.sort((a, b) => b.length - a.length)[0]);
  }

  const parts = text
    .split(/\s*\/\s*|\s{2,}/)
    .map((item) => cleanText(item))
    .filter(Boolean);

  const seen = new Set();
  const unique = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(part);
  }

  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0];
  return unique[0];
}

function normalizeStatusText(value = "", preferred = []) {
  const text = dedupeStatus(value);
  if (!text) return "";

  for (const item of preferred) {
    if (text.toLowerCase().includes(String(item).toLowerCase())) {
      return item;
    }
  }

  return text;
}

async function collectCarLinks(page, startUrl, maxPages, maxCars) {
  const seen = new Map();
  let currentUrl = startUrl;

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    await page.goto(currentUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await pauseBetweenRequests();

    const result = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a[href*='/usedcar/detail/']"));
      const items = [];
      const localSeen = new Set();

      for (const anchor of anchors) {
        const href = anchor.href;
        if (!href || localSeen.has(href)) continue;

        const card = anchor.closest("article, section, li, div");
        const text = (card?.innerText || anchor.innerText || "").trim();
        const img = card?.querySelector("img")?.getAttribute("data-src") || card?.querySelector("img")?.getAttribute("data-original") || card?.querySelector("img")?.src || "";

        localSeen.add(href);
        items.push({
          url: href,
          title: text.split("\n")[0] || "",
          image: img,
          previewText: text
        });
      }

      const nextLink = Array.from(document.querySelectorAll("a")).find((a) => {
        const text = (a.textContent || "").trim();
        return /次へ|次のページ|Next/i.test(text);
      });

      return {
        items,
        nextUrl: nextLink?.href || ""
      };
    });

    for (const item of result.items) {
      if (!seen.has(item.url)) {
        seen.set(item.url, { ...item, image: fixImageUrl(item.image) });
      }
      if (seen.size >= maxCars) {
        return Array.from(seen.values()).slice(0, maxCars);
      }
    }

    if (!result.nextUrl) {
      break;
    }

    currentUrl = result.nextUrl;
  }

  return Array.from(seen.values()).slice(0, maxCars);
}

async function parseCarDetail(page, url) {
  const listing = typeof url === "string" ? { url } : (url || {});
  const targetUrl = listing.url || "";

  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await pauseBetweenRequests();

  const raw = await page.evaluate((selectors) => {
    const getText = (selector) => {
      const node = document.querySelector(selector);
      return node ? node.textContent.trim() : "";
    };

    const getNodeText = (node) => (node?.textContent || "").replace(/\s+/g, " ").trim();

    const details = [];
    const pushDetail = (key, value) => {
      if (!key || !value) return;
      details.push({ key: getNodeText({ textContent: key }), value: getNodeText({ textContent: value }) });
    };

    for (const row of Array.from(document.querySelectorAll(selectors.tableRows))) {
      const th = row.querySelector("th");
      const td = row.querySelector("td");
      if (!th || !td) continue;
      pushDetail(getNodeText(th), getNodeText(td));
    }

    for (const dl of Array.from(document.querySelectorAll(selectors.dlBlocks))) {
      const dt = dl.querySelector("dt");
      const dd = dl.querySelector("dd");
      if (!dt || !dd) continue;
      pushDetail(getNodeText(dt), getNodeText(dd));
    }

    const galleryCandidates = [];
    const seenGallerySrc = new Set();
    const pushGalleryItem = (src, alt, width, height) => {
      const normalizedSrc = String(src || "").trim();
      if (!normalizedSrc || seenGallerySrc.has(normalizedSrc)) return;
      seenGallerySrc.add(normalizedSrc);
      galleryCandidates.push({
        src: normalizedSrc,
        alt: String(alt || "").trim(),
        width: Number(width || 0),
        height: Number(height || 0)
      });
    };

    const mainImg = document.querySelector("#js-mainPhoto-frame img, #js-mainPhoto");
    if (mainImg) {
      pushGalleryItem(
        mainImg.getAttribute("data-src") || mainImg.getAttribute("data-original") || mainImg.src || "",
        mainImg.getAttribute("alt") || "",
        mainImg.getAttribute("width") || mainImg.naturalWidth || 0,
        mainImg.getAttribute("height") || mainImg.naturalHeight || 0
      );
    }

    for (const anchor of Array.from(document.querySelectorAll("#js-slider a.js-photo"))) {
      const img = anchor.querySelector("img");
      pushGalleryItem(
        anchor.getAttribute("data-photo") || img?.getAttribute("data-src") || img?.getAttribute("data-original") || img?.src || "",
        img?.getAttribute("alt") || anchor.getAttribute("title") || "",
        img?.getAttribute("width") || img?.naturalWidth || 0,
        img?.getAttribute("height") || img?.naturalHeight || 0
      );
    }

    const isPromoAlt = (alt) => /お問い合わせ|お問合せ|ご案内|保証|ワランティ|WEB商談|オンライン商談|保険|ローン|審査|最寄り駅|徒歩|駅までお迎え|専門スタッフ|販売OK|販売ＯＫ|全国納車|全国どこからでも|ご来店なし|総在庫|理想の1台|自社指定工場|コーティング|TEL[:：]?|電話|0\d{1,4}-\d{1,4}-\d{3,4}|GOOD\s*SPEED|グッドスピード/i.test(String(alt || ""));

    const imageUrls = [];
    for (const item of galleryCandidates) {
      const src = String(item.src || "").trim();
      const alt = String(item.alt || "").trim();
      const smallImage = item.width > 0 && item.height > 0 && item.width <= 140 && item.height <= 140;

      if (!src) continue;
      if (/360\.car\//i.test(src) || /\/obvr\//i.test(src) || /360_img/i.test(src)) continue;
      if (/\/shopinfo\//i.test(src) || /qrcode|logo_footer|coupon/i.test(src)) continue;
      if (!/carsensor/i.test(src)) continue;
      if (!/\/(?:CSphoto)\//i.test(src)) continue;
      if (smallImage && !/車|car|auto|中古車/i.test(alt)) continue;

      if (isPromoAlt(alt)) {
        if (imageUrls.length >= 3) break;
        continue;
      }

      imageUrls.push(src);
    }

    const bodyText = document.body?.innerText || "";
    const title = getText(selectors.title) || document.title;

    const descriptionText = getText(selectors.description);

    const features = Array.from(document.querySelectorAll(selectors.features))
      .map((el) => getNodeText(el))
      .filter((line) => line.length >= 2 && line.length <= 48);

    const dealerName = getText(selectors.dealerName);
    const dealerPhone = getText(selectors.dealerPhone);

    const priceByClass = {
      priceTotal: getText("span.total"),
      price: getText("span.body"),
      extraCosts: getText("span.others")
    };

    const sourceParts = location.pathname.split("/").filter(Boolean);
    const sourceId = sourceParts[sourceParts.length - 2] || sourceParts[sourceParts.length - 1] || location.pathname;

    return {
      title,
      imageUrls,
      details,
      features,
      bodyText,
      sourceId,
      description: descriptionText,
      dealerName,
      dealerPhone,
      priceByClass
    };
  }, SELECTORS);

  const rawSpecs = {};
  for (const item of raw.details || []) {
    const key = cleanText(item.key);
    const value = cleanText(item.value);
    if (!key || !value) continue;
    rawSpecs[key] = value;
  }

  const specs = translateSpecs(rawSpecs);
  const title = cleanText(raw.title || listing.title || "");
  const normalizedTitle = parseTitleParts(title);
  const normalizedSpecs = collectSpecValues(rawSpecs);

  const titleParts = title.split(/\s+/).filter(Boolean);
  const brand = cleanText(normalizedTitle.brand || specs["марка"] || titleParts[0] || "");

  const rawModel = mergeBestText(
    normalizedTitle.model || "",
    specs["модель"] || extractModelFromTitle(title, brand) || titleParts.slice(1).join(" ")
  );
  const model = collapseRepeatingWords(cleanText(
    rawModel
      .replace(/[【\[].*?[】\]]/g, "")
      .replace(/（.*?）/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/\s{2,}/g, " ")
  ));

  function isGoodFeature(line = "") {
    if (!line) return false;
    if (line.length < 3 || line.length > 40) return false;
    if (/^[\d\s.,%/¥-]+$/.test(line)) return false;
    if (/[:：].*[-/]/.test(line) && !/[A-Za-zА-Яа-яЁё]{3,}/.test(line)) return false;
    if (/^[A-Za-zА-Яа-яЁё]+[:：]\s*[-/]?$/.test(line)) return false;
    if (/[。、※●◆■◇□]{2,}/.test(line)) return false;
    if (shouldSkipFeature(line)) return false;
    if (looksBrokenText(line)) return false;
    if (/^(—|-|нет|да)$/i.test(line)) return false;
    return true;
  }

  const featureCandidates = uniqueStrings([
    ...(normalizedTitle.features || []),
    ...(raw.features || []).map((line) => translateLooseText(line)).filter(isGoodFeature)
  ]).slice(0, 24);

  const preferredImages = (raw.imageUrls || [])
    .map(normalizeCarPhotoUrl)
    .filter(isLikelyCarPhotoUrl);

  const resolvedImages = uniqueImageUrls([
    ...preferredImages,
    ...(raw.imageUrls || []).map(normalizeCarPhotoUrl).filter(isLikelyCarPhotoUrl),
    listing.image || ""
  ]
    .map(normalizeCarPhotoUrl)
    .filter(isLikelyCarPhotoUrl)
  ).slice(0, 20);

  const normalizedDescription = buildDescription(raw.description);
  const driveStopLabels = ["色", "ハンドル", "車台末尾番号", "ミッション", "排気量", "乗車定員", "エンジン種別", "ドア数", "車検", "修復歴", "保証", "法定整備"];
  const inlineDrive = firstFilled([
    extractBodySpecValue(raw.bodyText, "駆動方式", driveStopLabels),
    extractBodySpecValue(raw.bodyText, "駆動", driveStopLabels),
    extractBodySpecValue(raw.bodyText, "駆動区分", driveStopLabels),
    rawSpecs["駆動方式"],
    rawSpecs["駆動"],
    rawSpecs["駆動区分"],
    rawSpecs["駆動タイプ"]
  ]);

  const region = firstFilled([
    specs["регион"],
    rawSpecs["地域"]
  ]);

  const priceTotalSource = firstFilled([
    raw.priceByClass?.priceTotal,
    rawSpecs["支払総額"],
    rawSpecs["総額"],
    specs["цена_с_расходами"]
  ]);

  const priceSource = firstFilled([
    raw.priceByClass?.price,
    rawSpecs["車両本体価格"],
    rawSpecs["本体価格"],
    rawSpecs["本体"],
    specs["цена"]
  ]);

  const extraCostsSource = firstFilled([
    raw.priceByClass?.extraCosts,
    rawSpecs["諸費用"],
    rawSpecs["その他"],
    specs["доп_расходы"]
  ]);

  const repairHistory = firstFilled([
    specs["ремонтная_история"],
    specs["repair_history"],
    rawSpecs["修復歴"]
  ]);

  const oneOwner = firstFilled([
    specs["one_owner"],
    specs["один_владелец"],
    rawSpecs["ワンオーナー"]
  ]);

  const nonSmoking = firstFilled([
    specs["non_smoking"],
    specs["некурящий_салон"],
    rawSpecs["禁煙車"]
  ]);

  const sourceId = cleanText(raw.sourceId || extractSourceId(targetUrl));

  const ruNormalized = applyRuLayer({
    brand: normalizedTitle.brand || "",
    model: normalizedTitle.model || model,
    trim: normalizedTitle.trim || "",
    features: normalizedTitle.features || [],
    specs: normalizedSpecs
  });

  const resolvedDrive = resolveDriveValue([
    specs["привод"],
    inlineDrive,
    ruNormalized?.specs?.drive,
    normalizedSpecs.drive
  ]);

  const resolvedColor = resolveColorValue([
    specs["цвет"],
    rawSpecs["色"],
    rawSpecs["カラー"],
    rawSpecs["ボディカラー"],
    ruNormalized?.specs?.color,
    normalizedSpecs.color,
    extractColorFromTitle(title)
  ]);

  const mergedBrand = mergeBestText(ruNormalized.brand || "", brand);
  const mergedModel = trimModelName(ruNormalized.model || model);

  const mergedFeatures = uniqueStrings([
    ...featureCandidates,
    ...(ruNormalized.features || [])
  ]).filter((line) => {
    const text = cleanText(line);
    if (!text) return false;
    if (text.length < 3) return false;
    if (text.length > 50) return false;
    if (/^[:/\\\-\s.,()]+$/.test(text)) return false;
    if (/^[A-Za-zА-Яа-яЁё]+[:：]\s*[-/]?$/.test(text)) return false;
    if (/[:：].*[-/]/.test(text) && !/[A-Za-zА-Яа-яЁё]{4,}/.test(text)) return false;
    if (/^:/.test(text)) return false;
    if (/^[A-Za-zА-Яа-яЁё]+:(?!$)/.test(text) && text.length < 20) return false;
    if (/^\(?\d+\s*\/\s*\d+\)?$/.test(text)) return false;
    if (/^\(?\d+\s*枚\)?$/.test(text)) return false;
    if (/["""]/.test(text)) return false;
    if (/^[\d\s.,%/¥W-]+$/i.test(text)) return false;
    if (/Apple CarPlay|Android Auto/i.test(text) && /[（(]/.test(text)) return false;
    if (/^(Передний|Полный|Задний).*привод/i.test(text)) return false;
    if (/^(Белый|Черный|Серый|Красный|Синий|Зеленый|Коричневый|Желтый|Серебристый|Перламутр|Золотистый|Оранжевый|Фиолетовый|Бежевый|Темно-синий)$/i.test(text)) return false;
    if (/^(500C|X1\/9|BMW|Audi|MINI|Volvo|Fiat|Jeep|V40|V60|V90|XC40|XC60|XC90|up!)$/i.test(text)) return false;
    if (/^[A-Z]\d?\s+(Передний|Полный)/i.test(text)) return false;
    if (/^\d+\s+(Передний|Полный)/i.test(text)) return false;
    if (/Передний\/задний привод|Полный привод/i.test(text)) return false;
    if (/^(Навигация|Кондиционер|Двухзонный климат)$/i.test(text)) return true;
    return true;
  });

  const resolvedPrices = ensureReasonablePrice(
    choosePriceValue(priceSource, [raw.bodyText, title]),
    choosePriceValue(priceTotalSource, [raw.bodyText]),
    choosePriceValue(extraCostsSource)
  );
  const resolvedPrice = resolvedPrices.price;
  const resolvedPriceTotal = resolvedPrices.priceTotal;
  const resolvedExtraCosts = resolvedPrices.extraCosts;
  const resolvedPriceRub = toRub(resolvedPrice);
  const resolvedPriceTotalRub = toRub(resolvedPriceTotal);
  const resolvedExtraCostsRub = toRub(resolvedExtraCosts);

  const warrantyStatus = resolveFlagText(
    mergeBestText(specs["гарантия"] || "", String(ruNormalized.specs?.warranty || "")),
    "С гарантией",
    "Без гарантии"
  );

  const serviceStatus = resolveFlagText(
    mergeBestText(specs["обслуживание"] || "", String(ruNormalized.specs?.maintenance || "")),
    "Обслуживание включено",
    "Обслуживание не включено"
  );

  const oneOwnerStatus = resolveFlagText(
    mergeBestText(oneOwner, String(ruNormalized.specs?.one_owner || "")),
    "Да",
    "Нет"
  );

  const nonSmokingStatus = resolveFlagText(
    mergeBestText(nonSmoking, String(ruNormalized.specs?.non_smoking || "")),
    "Да",
    "Нет"
  );

  const cleanRepairHistory = normalizeStatusText(
    collapseRepeatingWords(cleanText(mergeBestText(repairHistory, String(ruNormalized.specs?.repair_history || "")))),
    ["Без ремонтной истории", "Есть ремонтная история"]
  );
  const cleanOneOwner = normalizeStatusText(
    oneOwnerStatus || collapseRepeatingWords(cleanText(mergeBestText(oneOwner, String(ruNormalized.specs?.one_owner || "")))),
    ["Да", "Нет"]
  );
  const cleanNonSmoking = normalizeStatusText(
    nonSmokingStatus || collapseRepeatingWords(cleanText(mergeBestText(nonSmoking, String(ruNormalized.specs?.non_smoking || "")))),
    ["Да", "Нет"]
  );
  const cleanWarranty = normalizeStatusText(
    warrantyStatus || collapseRepeatingWords(cleanText(mergeBestText(specs["гарантия"] || "", String(ruNormalized.specs?.warranty || "")))),
    ["С гарантией", "Без гарантии"]
  );
  const cleanService = normalizeStatusText(
    serviceStatus || collapseRepeatingWords(cleanText(mergeBestText(specs["обслуживание"] || "", String(ruNormalized.specs?.maintenance || "")))),
    ["Обслуживание включено", "Обслуживание не включено"]
  );

  function buildSummary() {
    const parts = [];
    const b = cleanText(mergedBrand);
    const m = cleanText(mergedModel);
    if (b) parts.push(b);
    if (m && m !== b) parts.push(m);
    const y = readYear(specs["год"] || "");
    if (y) parts.push(`${y} г.`);
    const eng = cleanText(specs["объем_двигателя"] || "");
    if (eng) parts.push(eng);
    const fuel = cleanText(specs["топливо"] || "");
    if (fuel) parts.push(fuel);
    const trans = cleanText(specs["трансмиссия"] || "");
    if (trans) parts.push(trans);
    const col = cleanText(specs["цвет"] || "");
    if (col) parts.push(col);
    const mil = readMileage(specs["пробег"] || "");
    if (mil) parts.push(`${new Intl.NumberFormat("ru-RU").format(mil)} км`);
    const reg = cleanText(region);
    if (reg) parts.push(reg);
    if (mergedFeatures.length > 0) {
      parts.push(mergedFeatures.slice(0, 6).join(", "));
    }
    return parts.filter(Boolean).join(" · ");
  }

  const description = normalizedDescription || buildSummary() || "Подробности доступны по ссылке на исходное объявление.";

  return {
    sourceSite: "carsensor",
    sourceId,
    sourceUrl: targetUrl,
    title,
    brand: cleanText(mergedBrand),
    model: cleanText(mergedModel),
    year: readYear(specs["год"] || ""),
    mileage: readMileage(specs["пробег"] || ""),
    price: resolvedPrice,
    priceTotal: resolvedPriceTotal,
    extraCosts: resolvedExtraCosts,
    priceRub: resolvedPriceRub,
    priceTotalRub: resolvedPriceTotalRub,
    extraCostsRub: resolvedExtraCostsRub,
    currency: "JPY",
    region: cleanText(region),
    color: resolvedColor,
    transmission: specs["трансмиссия"] || "",
    fuel: cleanText(mergeBestText(specs["топливо"] || "", String(ruNormalized.specs?.fuel_type || ""))),
    engineVolume: cleanText(
      specs["объем_двигателя"] ||
      (normalizedSpecs.engine_cc !== null && normalizedSpecs.engine_cc !== undefined ? String(normalizedSpecs.engine_cc) : "") ||
      (normalizedTitle.engine_cc !== null && normalizedTitle.engine_cc !== undefined ? String(normalizedTitle.engine_cc) : "") ||
      ""
    ),
    bodyType: specs["тип_кузова"] || "",
    drive: cleanText(resolvedDrive),
    steering: specs["руль"] || "",
    doors: specs["двери"] || "",
    seats: specs["мест"] || "",
    inspection: formatInspection(specs["техосмотр"] || ""),
    repairHistory: cleanRepairHistory,
    oneOwner: cleanOneOwner,
    nonSmoking: cleanNonSmoking,
    seller: cleanText(raw.dealerName || specs["продавец"] || ""),
    dealerPhone: cleanText(raw.dealerPhone || specs["телефон"] || ""),
    sellerAddress: specs["адрес"] || "",
    vinTail: specs["vin_хвост"] || "",
    warranty: cleanWarranty,
    service: cleanService,
    imageUrls: resolvedImages,
    description,
    features: mergedFeatures,
    rawSpecs: {
      ...specs,
      normalized: normalizedSpecs,
      title: normalizedTitle,
      ruLayer: ruNormalized
    },
    scrapedAt: new Date(),
    lastSeenAt: new Date()
  };
}

module.exports = {
  collectCarLinks,
  parseCarDetail
};
