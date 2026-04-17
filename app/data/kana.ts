export interface KanaItem {
  hiragana: string;
  katakana: string;
  romaji: string;
}

// null = empty cell (e.g. yi, ye, wi, wu, we)
export type KanaCell = KanaItem | null;

// Rows: vowel, k, s, t, n, h, m, y, r, w, n(ん)
// Cols: a, i, u, e, o
export const kanaRows: { label: string; cells: KanaCell[] }[] = [
  {
    label: 'あ行',
    cells: [
      { hiragana: 'あ', katakana: 'ア', romaji: 'a' },
      { hiragana: 'い', katakana: 'イ', romaji: 'i' },
      { hiragana: 'う', katakana: 'ウ', romaji: 'u' },
      { hiragana: 'え', katakana: 'エ', romaji: 'e' },
      { hiragana: 'お', katakana: 'オ', romaji: 'o' },
    ],
  },
  {
    label: 'か行',
    cells: [
      { hiragana: 'か', katakana: 'カ', romaji: 'ka' },
      { hiragana: 'き', katakana: 'キ', romaji: 'ki' },
      { hiragana: 'く', katakana: 'ク', romaji: 'ku' },
      { hiragana: 'け', katakana: 'ケ', romaji: 'ke' },
      { hiragana: 'こ', katakana: 'コ', romaji: 'ko' },
    ],
  },
  {
    label: 'さ行',
    cells: [
      { hiragana: 'さ', katakana: 'サ', romaji: 'sa' },
      { hiragana: 'し', katakana: 'シ', romaji: 'shi' },
      { hiragana: 'す', katakana: 'ス', romaji: 'su' },
      { hiragana: 'せ', katakana: 'セ', romaji: 'se' },
      { hiragana: 'そ', katakana: 'ソ', romaji: 'so' },
    ],
  },
  {
    label: 'た行',
    cells: [
      { hiragana: 'た', katakana: 'タ', romaji: 'ta' },
      { hiragana: 'ち', katakana: 'チ', romaji: 'chi' },
      { hiragana: 'つ', katakana: 'ツ', romaji: 'tsu' },
      { hiragana: 'て', katakana: 'テ', romaji: 'te' },
      { hiragana: 'と', katakana: 'ト', romaji: 'to' },
    ],
  },
  {
    label: 'な行',
    cells: [
      { hiragana: 'な', katakana: 'ナ', romaji: 'na' },
      { hiragana: 'に', katakana: 'ニ', romaji: 'ni' },
      { hiragana: 'ぬ', katakana: 'ヌ', romaji: 'nu' },
      { hiragana: 'ね', katakana: 'ネ', romaji: 'ne' },
      { hiragana: 'の', katakana: 'ノ', romaji: 'no' },
    ],
  },
  {
    label: 'は行',
    cells: [
      { hiragana: 'は', katakana: 'ハ', romaji: 'ha' },
      { hiragana: 'ひ', katakana: 'ヒ', romaji: 'hi' },
      { hiragana: 'ふ', katakana: 'フ', romaji: 'fu' },
      { hiragana: 'へ', katakana: 'ヘ', romaji: 'he' },
      { hiragana: 'ほ', katakana: 'ホ', romaji: 'ho' },
    ],
  },
  {
    label: 'ま行',
    cells: [
      { hiragana: 'ま', katakana: 'マ', romaji: 'ma' },
      { hiragana: 'み', katakana: 'ミ', romaji: 'mi' },
      { hiragana: 'む', katakana: 'ム', romaji: 'mu' },
      { hiragana: 'め', katakana: 'メ', romaji: 'me' },
      { hiragana: 'も', katakana: 'モ', romaji: 'mo' },
    ],
  },
  {
    label: 'や行',
    cells: [
      { hiragana: 'や', katakana: 'ヤ', romaji: 'ya' },
      null,
      { hiragana: 'ゆ', katakana: 'ユ', romaji: 'yu' },
      null,
      { hiragana: 'よ', katakana: 'ヨ', romaji: 'yo' },
    ],
  },
  {
    label: 'ら行',
    cells: [
      { hiragana: 'ら', katakana: 'ラ', romaji: 'ra' },
      { hiragana: 'り', katakana: 'リ', romaji: 'ri' },
      { hiragana: 'る', katakana: 'ル', romaji: 'ru' },
      { hiragana: 'れ', katakana: 'レ', romaji: 're' },
      { hiragana: 'ろ', katakana: 'ロ', romaji: 'ro' },
    ],
  },
  {
    label: 'わ行',
    cells: [
      { hiragana: 'わ', katakana: 'ワ', romaji: 'wa' },
      null,
      null,
      null,
      { hiragana: 'を', katakana: 'ヲ', romaji: 'wo' },
    ],
  },
  {
    label: 'ん',
    cells: [
      { hiragana: 'ん', katakana: 'ン', romaji: 'n' },
      null,
      null,
      null,
      null,
    ],
  },
];

// Flat list of all kana for quiz mode
export const allKana: KanaItem[] = kanaRows.flatMap((row) =>
  row.cells.filter((c): c is KanaItem => c !== null)
);
