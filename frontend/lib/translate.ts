import { translateColor } from './colorTranslator';

const JP_TO_RU: Record<string, string> = {
  "アウディ": "Audi",
  "ボルボ": "Volvo",
  "ミニ": "MINI",
  "フィアット": "Fiat",
  "ジープ": "Jeep",
  "プジョー": "Peugeot",
  "ルノー": "Renault",
  "シトロエン": "Citroen",
  "フォルクスワーゲン": "Volkswagen",
  "メルセデス・ベンツ": "Mercedes-Benz",
  "メルセデスベンツ": "Mercedes-Benz",
  "アルファロメオ": "Alfa Romeo",
  "スマート": "Smart",
  "ポルシェ": "Porsche",
  "ジャガー": "Jaguar",
  "ランドローバー": "Land Rover",
  "日産": "Nissan",
  "トヨタ": "Toyota",
  "ホンダ": "Honda",
  "スズキ": "Suzuki",
  "マツダ": "Mazda",
  "三菱": "Mitsubishi",
  "ダイハツ": "Daihatsu",
  "スバル": "Subaru",
  "レクサス": "Lexus",
  "A1スポーツバック": "A1 Sportback",
  "ミニクーパーSD": "Cooper SD",
  "ミニクーパーS": "Cooper S",
  "ミニクーパーD": "Cooper D",
  "ミニクーパー": "Cooper",
  "ミニクロスオーバークーパー": "Crossover Cooper",
  "ミニクロスオーバー": "Crossover",
  "トゥインゴインテンス": "Twingo Intens",
  "トゥインゴ": "Twingo",
  "2シリーズグランツアラー": "2 Series Gran Tourer",
  "2シリーズ": "2 Series",
  "3シリーズ": "3 Series",
  "Bクラス": "B-Class",
  "BクラスB180": "B180",
  "ザ・ビートルRライン": "The Beetle R-Line",
  "ザ・ビートル": "The Beetle",
  "V40T3": "V40 T3",
  "V40D4": "V40 D4",
  "ジュリエッタヴェローチェ": "Giulietta Veloce",
  "ジュリエッタ": "Giulietta",
  "フォーフォーブラバス": "forfour BRABUS",
  "フォーフォー": "forfour",
  "レネゲード": "Renegade",
  "パンダイージー": "Panda",
  "パンダ": "Panda",
  "チンクエチェント": "500",
  "インスクリプション": "Inscription",
  "モメンタム": "Momentum",
  "マイスター": "Meister",
  "ナイトイーグル": "Night Eagle",
  "アリュール": "Allure",
  "フィール": "Feel",
  "リミテ": "Limited",
  "インテンス": "Intens",
  "セブン": "Seven",
  "ペッパーPKG": "Pepper Package",
  "コンフォートPKG": "Comfort Package",
  "ライトPKG": "Light Package",
  "ストレージコンパートメントPKG": "Storage Compartment Package",
  "インテリジェントセーフティ": "Intelligent Safety",
  "パーキングサポート": "Parking Support",
  "アンビエントライト": "Ambient Light",
  "レーダーセーフティーP": "Radar Safety Package",
  "ディーゼルターボ": "Diesel Turbo",
  "ツインエアターボ": "TwinAir Turbo",
  "ツインエア": "TwinAir",
  "デュアロジック": "Dualogic",
  "バイカラーシート": "Bi-Color Seats",
  "シティブレーキ": "City Brake",
  "衝突被害軽減": "Collision Mitigation",
  "xドライブ": "xDrive",
  "ハンズフリー電動トランク": "Hands-Free Power Tailgate",
  "ドライビングアシスト": "Driving Assist",
  "ソナー": "Sonar",
  "スモークフィルム": "Smoke Film",
  "ジャングルグリーン": "Jungle Green",
  "ストレージコンパートメント": "Storage Compartment",
  "キーレスキー": "Keyless Entry",
  "harmankardonサウンド": "Harman Kardon Sound",
  "harmankardon": "Harman Kardon",
  "黒革シート": "Black Leather Seats",
  "白半革シート": "White Half-Leather Seats",
  "黒半革": "Black Half-Leather",
  "半革シート": "Half-Leather Seats",
  "レザーシート": "Leather Seats",
  "ガラスルーフ": "Glass Roof",
  "パノラマルーフ": "Panoramic Roof",
  "レーンキピングアシスト": "Lane Keep Assist",
  "自動追従": "Auto Follow",
  "1オナ": "One Owner",
  "軽油": "Diesel",
  "ATモード搭載5段": "5-Speed AT Mode",
  "ATモード搭載": "AT Mode",
  "スタート&ストップ": "Start & Stop",
  "後席プライバシーガラス": "Rear Privacy Glass",
  "USB対応オーディオ": "USB Audio",
  "フォグ": "Fog Lamps",
  "下まわり防錆施工": "Underbody Rust Protection",
  "夏冬タイヤ": "Summer/Winter Tires",
  "純正16AW": "OEM 16\" Alloy Wheels",
  "純正17AW": "OEM 17\" Alloy Wheels",
  "純正18AW": "OEM 18\" Alloy Wheels",
  "修復歴Без ремонтной истории": "Без ремонтной истории",
  "修復歴Есть ремонтная история": "Есть ремонтная история",
  "修復歴なし": "Без ремонтной истории",
  "修復歴あり": "Есть ремонтная история",
  "修復歴": "Ремонтная история",
  "保証付": "С гарантией",
  "保証無": "Без гарантии",
  "法定整備付": "Обслуживание включено",
  "法定整備無": "Обслуживание не включено",
  "禁煙車": "Некурящий салон",
  "ワンオーナー": "Один владелец",
  "バックカメラ": "Камера заднего вида",
  "コーナーセンサー": "Парктроник",
  "クリアランスソナー": "Парковочный сонар",
  "レーダークルーズコントロール": "Радарный круиз-контроль",
  "アダプティブクルーズコントロール": "Адаптивный круиз-контроль",
  "プリクラッシュセーフティー": "Система предотвращения столкновений",
  "自動ブレーキ": "Автоматическое торможение",
  "純正MMIナビ": "Штатная MMI навигация",
  "パイオニアナビTV": "Pioneer навигация + TV",
  "地デジTV": "Цифровое ТВ",
  "地デジ": "Цифровое ТВ",
  "地デジチューナー": "Тюнер цифрового ТВ",
  "当店買取車両": "Авто выкуплено дилером",
  "限定車": "Лимитированная версия",
  "後期": "Рестайлинг",
  "TwinAirエンジン": "Двигатель TwinAir",
  "純正ナビ": "Штатная навигация",
  "メモリーナビ": "Мультимедиа-навигация",
  "ナビ": "Навигация",
  "エアコン": "Кондиционер",
  "オートエアコン": "Климат-контроль",
  "Wエアコン": "Двухзонный климат",
  "AAC": "Климат-контроль",
  "フルセグ": "Full Seg TV",
  "ワンセグ": "1Seg TV",
  "ドライブレコーダー": "Видеорегистратор",
  "ドラレコ": "Видеорегистратор",
  "スマートキー": "Смарт-ключ",
  "プッシュスタート": "Кнопка Start",
  "シートヒーター": "Подогрев сидений",
  "両側電動スライドドア": "Две электросдвижные двери",
  "オートライト": "Автосвет",
  "純正ブラック18in": "Штатные черные диски 18\"",
  "社外AW": "Нештатные литые диски",
  "純正AW": "Штатные литые диски",
  "スペアキー": "Запасной ключ",
  "ステアリモコン": "Кнопки управления на руле",
  "電格ドアミラー": "Электроскладывание зеркал",
  "ウインカーミラー": "Зеркала с поворотниками",
  "ホイールキャップ": "Колпаки колес",
  "ドアバイザー": "Дефлекторы окон",
  "プライバシーガラス": "Тонированные стекла",
  "ベンチシート": "Цельный передний диван",
  "標識認識": "Распознавание дорожных знаков",
  "先行車発進": "Оповещение о начале движения впереди",
  "Fフォグ": "Передние противотуманки",
  "Bカメラ": "Камера заднего вида",
  "車線逸脱支援": "Ассистент удержания полосы",
  "ホンダセンシング": "Honda Sensing",
  "オートマチックハイビーム": "Автодальний свет",
  "ハイビームアシスト": "Ассистент дальнего света",
  "ステアリングリモコン": "Кнопки на руле",
  "横滑り防止装置": "Система стабилизации",
  "MTモード": "MT-режим",
  "タイミングチェーン": "Цепь ГРМ",
  "純正マット": "Штатные коврики",
  "純正トランクマット": "Штатный коврик багажника",
  "前後ドラレコ": "Передний/задний видеорегистратор",
  "前後ドライブレコーダー": "Передний/задний видеорегистратор",
  "法人ワンオーナー": "Один владелец (юр. лицо)",
  "保証書": "Гарантийная книжка",
  "取扱説明書": "Руководство",
  "記録簿": "Сервисная книжка",
  "パワーステアリング": "ГУР",
  "パワーウィンドウ": "Электростеклоподъемники",
  "AT": "Автомат",
  "MT": "Механика",
  "CVT": "Вариатор",
  "4WD": "Полный привод",
  "AWD": "Полный привод",
  "FF": "Передний привод",
  "FR": "Задний привод",
  "ガソリン": "Бензин",
  "ディーゼル": "Дизель",
  "ハイブリッド": "Гибрид",
  "電気": "Электро",
  "純正": "Штатный",
  "オート": "Авто",
  "車検": "Техосмотр",
  "点検": "Осмотр",
  "有": "Есть",
  "無": "Нет",
  "ブラック": "Черный",
  "ホワイト": "Белый",
  "パール": "Перламутр",
  "メタリック": "Металлик",
  "マイカ": "Mica"
};

const JAPANESE_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;
const SORTED_TRANSLATION_ENTRIES = Object.entries(JP_TO_RU).sort((a, b) => b[0].length - a[0].length);

function uniqCommaItems(value: string): string {
  const items = value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (!items.length) return "";

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const part of items) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(part);
  }

  return unique.join(", ");
}

function finalizeTranslation(value: string): string {
  const cleaned = value
    .normalize("NFKC")
    .replace(/\u3000/g, " ")
    .replace(JAPANESE_REGEX, " ")
    .replace(/\b(ETC|TV|HID|LED|ABS|ESP|AUX|USB|DVD|CD|BT|Bluetooth)\b/gi, (m) => m.toUpperCase())
    .replace(/[・]+/g, " ")
    .replace(/[|｜]+/g, " ")
    .replace(/[／]+/g, "/")
    .replace(/[【】「」『』]/g, " ")
    .replace(/\(\s*\)/g, " ")
    .replace(/（\s*）/g, " ")
    .replace(/[！!]{2,}/g, "!")
    .replace(/[？?]{2,}/g, "?")
    .replace(/\s*[,:;]\s*/g, ", ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/([А-Яа-яЁё])([A-Za-z0-9])/g, "$1 $2")
    .replace(/([A-Za-z0-9])([А-Яа-яЁё])/g, "$1 $2")
    .replace(/([A-Za-z])([0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Za-z])/g, "$1 $2")
    .replace(/(,\s*){2,}/g, ", ")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/(^[\s\-–—,.;:/]+|[\s\-–—,.;:/]+$)/g, "")
    .trim();

  return uniqCommaItems(cleaned);
}

export function translateJpFragments(value: string | null | undefined): string {
  const source = String(value || "").trim();
  if (!source) return "";

  let result = source;

  for (const [from, to] of SORTED_TRANSLATION_ENTRIES) {
    result = result.split(from).join(to);
  }

  return finalizeTranslation(result);
}

export { translateColor };

