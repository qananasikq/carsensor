const dictionary = require("../shared/japaneseDictionary.json");

const JAPANESE_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;

const valueDictionary = {
  common: {
    "AT": "Автомат",
    "MT": "Механика",
    "CVT": "Вариатор",
    "DCT": "Робот",
    "2WD": "Передний/задний привод (2WD)",
    "4WD": "Полный привод (4WD)",
    "AWD": "Полный привод (AWD)",
    "FF": "Передний привод",
    "FR": "Задний привод",
    "燃費": "Расход топлива",
    "修復歴なし": "Без ремонтной истории",
    "修復歴あり": "Есть ремонтная история",
    "保証付": "С гарантией",
    "保証無": "Без гарантии",
    "法定整備付": "Обслуживание включено",
    "法定整備無": "Обслуживание не включено",
    "禁煙車": "Некурящий салон",
    "ワンオーナー": "Один владелец",
    "バックカメラ": "Камера заднего вида",
    "ナビ": "Навигация",
    "エアコン": "Кондиционер",
    "Wエアコン": "Двухзонный климат",
    "パワーステアリング": "ГУР",
    "パワーウィンドウ": "Электростеклоподъемники",
    "ブラック": "Черный",
    "ホワイト": "Белый",
    "シルバー": "Серебристый",
    "グレー": "Серый",
    "レッド": "Красный",
    "ブルー": "Синий",
    "ネイビー": "Темно-синий",
    "グリーン": "Зеленый",
    "ブラウン": "Коричневый",
    "イエロー": "Желтый",
    "ゴールド": "Золотистый",
    "パール": "Перламутр",
    "メタリック": "Металлик"
  },
  byKey: {
    "трансмиссия": {
      "オートマ": "Автомат",
      "AT": "Автомат",
      "CVT": "Вариатор",
      "MT": "Механика",
      "インパネAT": "Автомат (рычаг на панели)",
      "フロアAT": "Автомат (рычаг на полу)",
      "コラムAT": "Автомат (рычаг на рулевой колонке)"
    },
    "топливо": {
      "ガソリン": "Бензин",
      "ハイオク": "Бензин премиум",
      "軽油": "Дизель",
      "ディーゼル": "Дизель",
      "ハイブリッド": "Гибрид",
      "電気": "Электро",
      "LPG": "Газ (LPG)",
      "CNG": "Газ (CNG)",
      "EV": "Электро"
    },
    "привод": {
      "2WD": "Передний привод",
      "2ＷＤ": "Передний привод",
      "4WD": "Полный привод",
      "4ＷＤ": "Полный привод",
      "AWD": "Полный привод",
      "ＡＷＤ": "Полный привод",
      "FF": "Передний привод",
      "ＦＦ": "Передний привод",
      "FR": "Задний привод",
      "ＦＲ": "Задний привод",
      "前輪駆動": "Передний привод",
      "前輪駆動(FF)": "Передний привод",
      "後輪駆動": "Задний привод",
      "後輪駆動(FR)": "Задний привод",
      "四輪駆動": "Полный привод",
      "四輪駆動(4WD)": "Полный привод",
      "フルタイム4WD": "Полный привод",
      "フルタイム４WD": "Полный привод",
      "パートタイム4WD": "Подключаемый полный привод",
      "パートタイム４WD": "Подключаемый полный привод",
      "электронно управляемый 4wd": "Полный привод",
      "электронно-управляемый 4wd": "Полный привод",
      "подключаемый 4wd": "Подключаемый полный привод",
      "постоянный 4wd": "Полный привод",
      "MR": "Среднемоторный привод",
      "RR": "Заднемоторный привод"
    },
    "руль": {
      "右": "Правый",
      "左": "Левый"
    },
    "ремонтная_история": {
      "修復歴なし": "Без ремонтной истории",
      "修復歴あり": "Есть ремонтная история",
      "なし": "Без ремонтной истории",
      "あり": "Есть ремонтная история",
      "有": "Есть",
      "無": "Нет"
    },
    "техосмотр": {
      "車検整備付": "Техосмотр включен",
      "車検整備無": "Техосмотр не включен",
      "車検残": "Остаток техосмотра"
    },
    "гарантия": {
      "保証付": "С гарантией",
      "保証無": "Без гарантии",
      "販売店保証": "Гарантия продавца"
    },
    "обслуживание": {
      "法定整備付": "Включено",
      "法定整備無": "Не включено",
      "法定整備別": "Оплачивается отдельно"
    },
    "тип_кузова": {
      "セダン": "Седан",
      "クーペ": "Купе",
      "ハッチバック": "Хэтчбек",
      "SUV・クロカン": "SUV/Кроссовер",
      "SUV": "SUV/Кроссовер",
      "ミニバン": "Минивэн",
      "ワゴン": "Универсал",
      "軽自動車": "Кей-кар",
      "オープン": "Кабриолет",
      "ピックアップ": "Пикап"
    },
    "цвет": {
      "白": "Белый",
      "真珠白": "Белый перламутр",
      "黒": "Черный",
      "艶黒": "Глянцево-черный",
      "銀": "Серебристый",
      "灰": "Серый",
      "濃灰": "Темно-серый",
      "薄灰": "Светло-серый",
      "赤": "Красный",
      "えんじ": "Бордовый",
      "青": "Синий",
      "紺": "Темно-синий",
      "水色": "Голубой",
      "空色": "Небесно-голубой",
      "緑": "Зеленый",
      "深緑": "Темно-зеленый",
      "黄緑": "Светло-зеленый",
      "茶": "Коричневый",
      "薄茶": "Светло-коричневый",
      "黄": "Желтый",
      "橙": "Оранжевый",
      "金": "Золотистый",
      "紫": "Фиолетовый",
      "桃": "Розовый",
      "象牙": "Слоновая кость",
      "乳白": "Молочно-белый",
      "ブラック": "Черный",
      "ブラックメタリック": "Черный металлик",
      "ブラックマイカ": "Черный mica",
      "ブラックパール": "Черный перламутр",
      "ホワイト": "Белый",
      "ホワイトパール": "Белый перламутр",
      "パールホワイト": "Белый перламутр",
      "クリスタルホワイト": "Кристально-белый",
      "アイボリー": "Слоновая кость",
      "クリーム": "Кремовый",
      "シルバー": "Серебристый",
      "シルバーメタリック": "Серебристый металлик",
      "グレー": "Серый",
      "ダークグレー": "Темно-серый",
      "ライトグレー": "Светло-серый",
      "チャコールグレー": "Угольно-серый",
      "ガンメタ": "Графитовый",
      "ガンメタリック": "Графитовый металлик",
      "レッド": "Красный",
      "ワインレッド": "Бордовый",
      "ボルドー": "Бордовый",
      "マルーン": "Темно-бордовый",
      "ピンク": "Розовый",
      "ブルー": "Синий",
      "ダークブルー": "Темно-синий",
      "ライトブルー": "Голубой",
      "スカイブルー": "Небесно-голубой",
      "ターコイズ": "Бирюзовый",
      "ターコイズブルー": "Бирюзово-синий",
      "アクア": "Аквамариновый",
      "アクアブルー": "Аква-синий",
      "コバルトブルー": "Кобальтовый",
      "ネイビー": "Темно-синий",
      "グリーン": "Зеленый",
      "ダークグリーン": "Темно-зеленый",
      "ライトグリーン": "Светло-зеленый",
      "エメラルド": "Изумрудный",
      "エメラルドグリーン": "Изумрудно-зеленый",
      "ミント": "Мятный",
      "ミントグリーン": "Мятно-зеленый",
      "オリーブ": "Оливковый",
      "カーキ": "Хаки",
      "ライム": "Лаймовый",
      "ブラウン": "Коричневый",
      "ダークブラウン": "Темно-коричневый",
      "ライトブラウン": "Светло-коричневый",
      "ブロンズ": "Бронзовый",
      "イエロー": "Желтый",
      "ゴールド": "Золотистый",
      "シャンパン": "Шампань",
      "シャンパンゴールド": "Шампань-золото",
      "パール": "Перламутр",
      "メタリック": "Металлик",
      "オレンジ": "Оранжевый",
      "パープル": "Фиолетовый",
      "バイオレット": "Фиолетовый",
      "ラベンダー": "Лавандовый",
      "ツートン": "Двухцветный",
      "2トーン": "Двухцветный",
      "ツートンカラー": "Двухцветный",
      "マイカ": "Mica"
    },
    "регион": {
      "北海道": "Хоккайдо",
      "青森県": "Аомори",
      "岩手県": "Иватэ",
      "宮城県": "Мияги",
      "秋田県": "Акита",
      "山形県": "Ямагата",
      "福島県": "Фукусима",
      "茨城県": "Ибараки",
      "栃木県": "Тотиги",
      "群馬県": "Гумма",
      "埼玉県": "Сайтама",
      "千葉県": "Тиба",
      "東京都": "Токио",
      "神奈川県": "Канагава",
      "新潟県": "Ниигата",
      "富山県": "Тояма",
      "石川県": "Исикава",
      "福井県": "Фукуи",
      "山梨県": "Яманаси",
      "長野県": "Нагано",
      "岐阜県": "Гифу",
      "静岡県": "Сидзуока",
      "愛知県": "Айти",
      "三重県": "Миэ",
      "滋賀県": "Сига",
      "京都府": "Киото",
      "大阪府": "Осака",
      "兵庫県": "Хего",
      "奈良県": "Нара",
      "和歌山県": "Вакаяма",
      "鳥取県": "Тоттори",
      "島根県": "Симанэ",
      "岡山県": "Окаяма",
      "広島県": "Хиросима",
      "山口県": "Ямагути",
      "徳島県": "Токусима",
      "香川県": "Кагава",
      "愛媛県": "Эхимэ",
      "高知県": "Коти",
      "福岡県": "Фукуока",
      "佐賀県": "Сага",
      "長崎県": "Нагасаки",
      "熊本県": "Кумамото",
      "大分県": "Оита",
      "宮崎県": "Миядзаки",
      "鹿児島県": "Кагосима",
      "沖縄県": "Окинава"
    }
  }
};

function cleanText(value = "") {
  const normalizedWidth = String(value).replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)).replace(/　/g, " ");
  return normalizedWidth.replace(/\s+/g, " ").trim();
}

function squashLines(value = "") {
  return String(value)
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean)
    .join("\n");
}

function digitsToNumber(value = "") {
  const digits = String(value).replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function readJapanesePrice(value = "") {
  const text = cleanText(value);
  if (!text) return null;

  const cleaned = text.replace(/\s+/g, "");

  if (/^\d+(\.\d+)?$/.test(text)) {
    return Math.round(Number(text) * 10000);
  }

  const manOnlyMatch = cleaned.match(/^([\d.,]+)万$/);
  if (manOnlyMatch) {
    return Math.round(Number(manOnlyMatch[1].replace(/,/g, "")) * 10000);
  }

  const manEnOnlyMatch = cleaned.match(/^([\d.,]+)万円$/);
  if (manEnOnlyMatch) {
    return Math.round(Number(manEnOnlyMatch[1].replace(/,/g, "")) * 10000);
  }

  const manMatch = text.match(/([\d.,]+)\s*万/);
  if (manMatch) {
    return Math.round(Number(manMatch[1].replace(/,/g, "")) * 10000);
  }

  const yenMatch = text.match(/([\d,]+)\s*円/);
  if (yenMatch) {
    return Number(yenMatch[1].replace(/,/g, ""));
  }

  return digitsToNumber(text);
}

function readMileage(value = "") {
  const text = cleanText(value);
  if (!text) return null;
  if (/不明/.test(text)) return null;

  const normalized = text
    .replace(/[，]/g, ",")
    .replace(/[．]/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  const manKmMatch = normalized.match(/([\d.,]+)\s*万\s*(?:km)?/i);
  if (manKmMatch) {
    return Math.round(Number(manKmMatch[1].replace(/,/g, "")) * 10000);
  }

  const kmMatch = normalized.match(/([\d.,]+)\s*km/i);
  if (kmMatch) {
    return Math.round(Number(kmMatch[1].replace(/,/g, "")));
  }

  return digitsToNumber(normalized);
}

function readYear(value = "") {
  const text = cleanText(value);
  const reiwaMatch = text.match(/令和\s*(\d+)/);
  if (reiwaMatch) {
    return 2018 + Number(reiwaMatch[1]);
  }

  const heiseiMatch = text.match(/平成\s*(\d+)/);
  if (heiseiMatch) {
    return 1988 + Number(heiseiMatch[1]);
  }

  const showaMatch = text.match(/昭和\s*(\d+)/);
  if (showaMatch) {
    return 1925 + Number(showaMatch[1]);
  }

  const yearMatch = text.match(/(19|20)\d{2}/);
  return yearMatch ? Number(yearMatch[0]) : digitsToNumber(text);
}

function translateKey(jpKey = "") {
  const source = cleanText(jpKey);
  if (!source) return "";

  if (dictionary[source]) {
    return dictionary[source];
  }

  const normalized = source
    .replace(/[\(（【［\[].*?[\)）】］\]]/g, "")
    .replace(/\s+/g, "")
    .trim();

  if (dictionary[normalized]) {
    return dictionary[normalized];
  }

  const dictionaryKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const key of dictionaryKeys) {
    if (source.includes(key) || normalized.includes(key)) {
      return dictionary[key];
    }
  }

  return source;
}

function replaceFromMap(text, map = {}) {
  let result = text;

  const replacements = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of replacements) {
    if (!from || !to) continue;
    result = result.split(from).join(to);
  }

  return result;
}

function swapBooleanMarks(text = "") {
  return text
    .replace(/(^|\s)〇(\s|$)/g, "$1Да$2")
    .replace(/(^|\s)○(\s|$)/g, "$1Да$2")
    .replace(/(^|\s)◯(\s|$)/g, "$1Да$2")
    .replace(/(^|\s)◎(\s|$)/g, "$1Да$2")
    .replace(/(^|\s)×(\s|$)/g, "$1Нет$2")
    .replace(/(^|\s)✕(\s|$)/g, "$1Нет$2")
    .replace(/(^|\s)－(\s|$)/g, "$1—$2");
}

function stripTranslatedNoise(text = "") {
  return cleanText(
    String(text)
      .replace(JAPANESE_REGEX, " ")
      .replace(/[・]+/g, " ")
      .replace(/[|｜]+/g, " ")
      .replace(/[／]+/g, " /")
      .replace(/(^|\s)[:/\\\-]+(?=\s|$)/g, " ")
      .replace(/\b(TV)\s*\1\b/gi, "TV")
      .replace(/\b(BLUETOOTH)\s*\1\b/gi, "BLUETOOTH")
      .replace(/\b(ETC)\s*\1\b/gi, "ETC")
      .replace(/[【】「」『』]/g, " ")
      .replace(/[\(（]\s*[\)）]/g, " ")
      .replace(/["“”]+/g, " ")
      .replace(/\s{2,}/g, " ")
  );
}

function keepRawValueForKey(translatedKey = "") {
  return [
    "объем_двигателя",
    "price",
    "цена",
    "цена_с_расходами",
    "доп_расходы",
    "техосмотр",
    "год",
    "пробег",
    "vin_хвост"
  ].includes(translatedKey);
}

function translateSpecValue(translatedKey = "", value = "") {
  let text = cleanText(value);
  if (!text) return "";

  if (translatedKey === "пробег") {
    return text;
  }

  const keyDictionary = valueDictionary.byKey[translatedKey] || {};
  text = replaceFromMap(text, keyDictionary);
  text = replaceFromMap(text, valueDictionary.common);
  text = swapBooleanMarks(text);
  text = stripTranslatedNoise(text);

  if (!text && keepRawValueForKey(translatedKey)) {
    text = cleanText(value);
  }

  return cleanText(text);
}

function translateLooseText(value = "") {
  const text = cleanText(value);
  if (!text) return "";

  if (/^[:/\\\-\s.,()]+$/.test(text)) return "";
  if (/^\(?\d+\s*\/\s*\d+\)?$/.test(text)) return "";
  if (/^\(?\d+\s*枚\)?$/.test(text)) return "";
  if (/^[A-Za-zА-Яа-яЁё]+[:：]\s*[-/]?$/.test(text)) return "";
  if (/^[^A-Za-zА-Яа-яЁё\d]*$/.test(text)) return "";

  if (/^[\d\s,.]+(万|万円|円|km|cc|L|R|R\d+|H\d+|TFSI|TDI|TSI)$/i.test(text)) {
    return text;
  }

  const translated = swapBooleanMarks(replaceFromMap(text, valueDictionary.common));
  return stripTranslatedNoise(translated);
}

function translateFreeText(value = "") {
  const text = cleanText(value);
  if (!text) return "";

  const translated = swapBooleanMarks(replaceFromMap(text, valueDictionary.common));
  return cleanText(
    String(translated)
      .replace(/[【】「」『』]/g, " ")
      .replace(/[●※☆★◇◆]/g, " ")
      .replace(/\s*\/\s*/g, " / ")
      .replace(/\s{2,}/g, " ")
  );
}

function translateSpecs(rawSpecs = {}) {
  const result = {};

  for (const [key, value] of Object.entries(rawSpecs)) {
    const translatedKey = translateKey(cleanText(key));
    if (!translatedKey) continue;
    result[translatedKey] = translateSpecValue(translatedKey, value);
  }

  return result;
}

function uniqueImageUrls(urls = []) {
  return [...new Set(urls.filter(Boolean).map((url) => String(url).trim()))];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pauseBetweenRequests() {
  const delay = 2000 + Math.floor(Math.random() * 2000);
  await sleep(delay);
}

module.exports = {
  cleanText,
  squashLines,
  readJapanesePrice,
  readMileage,
  readYear,
  translateKey,
  translateSpecValue,
  translateLooseText,
  translateFreeText,
  translateSpecs,
  uniqueImageUrls,
  pauseBetweenRequests,
  sleep
};
