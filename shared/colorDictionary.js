const colorDictionary = require('./colorDictionary.json');

const COLOR_SUFFIX_NORMALIZERS = [
  [/\s+/g, ' '],
  [/\s*\/\s*/g, ' / '],
  [/\s*・\s*/g, ' / '],
  [/\s*\+\s*/g, ' / '],
  [/\s*×\s*/g, ' / '],
  [/\s*x\s*/gi, ' / '],
  [/\bII\b/g, ''],
  [/\bIII\b/g, ''],
  [/\bIV\b/g, ''],
  [/\bV\b/g, ''],
  [/\s{2,}/g, ' ']
];

function replaceAllByMap(text, map) {
  let result = String(text || '');
  const replacements = Object.entries(map).sort((a, b) => b[0].length - a[0].length);

  for (const [from, to] of replacements) {
    if (!from || !to) continue;
    result = result.split(from).join(to);
  }

  return result;
}

function cleanupColorText(value) {
  let text = String(value || '').normalize('NFKC').trim();

  for (const [pattern, replacement] of COLOR_SUFFIX_NORMALIZERS) {
    text = text.replace(pattern, replacement);
  }

  return text
    .replace(/[()（）【】「」『』]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/(^[\s/,-]+|[\s/,-]+$)/g, '')
    .trim();
}

function translateColor(value) {
  const source = cleanupColorText(value);
  if (!source) return '';

  const translated = cleanupColorText(replaceAllByMap(source, colorDictionary));
  return translated;
}

module.exports = {
  COLOR_DICTIONARY: colorDictionary,
  translateColor,
  cleanupColorText
};

