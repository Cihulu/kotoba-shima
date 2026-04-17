export type TokenType = 'noun' | 'particle' | 'verb' | 'adjective' | 'adverb' | 'conjunction' | 'skip';

export interface PuzzleToken {
  text: string;       // displayed text
  reading: string;    // furigana
  type: TokenType;
  question?: string;  // if present → interactive quiz token
  options?: string[]; // 4 choices
  correct?: number;   // index of correct option
  explanation?: string; // shown after correct
  skip?: boolean;     // punctuation
}

export interface PuzzleSentence {
  id: string;
  level: 'N5' | 'N4' | 'N3';
  theme: string;
  source: string;
  fullTranslation: string;
  tokens: PuzzleToken[];
}

// ─── Color map for token types ────────────────────────────────
export const typeStyle: Record<TokenType, { chip: string; solved: string; label: string }> = {
  noun:        { chip: 'bg-indigo-50 border-indigo-200 text-indigo-700',   solved: 'bg-indigo-100 border-indigo-300 text-indigo-800',   label: '名词' },
  particle:    { chip: 'bg-amber-50  border-amber-200  text-amber-700',    solved: 'bg-amber-100  border-amber-300  text-amber-800',    label: '助词' },
  verb:        { chip: 'bg-rose-50   border-rose-200   text-rose-700',     solved: 'bg-rose-100   border-rose-300   text-rose-800',     label: '动词' },
  adjective:   { chip: 'bg-teal-50   border-teal-200   text-teal-700',     solved: 'bg-teal-100   border-teal-300   text-teal-800',     label: '形容词' },
  adverb:      { chip: 'bg-purple-50 border-purple-200 text-purple-700',   solved: 'bg-purple-100 border-purple-300 text-purple-800',   label: '副词' },
  conjunction: { chip: 'bg-orange-50 border-orange-200 text-orange-700',   solved: 'bg-orange-100 border-orange-300 text-orange-800',   label: '接续' },
  skip:        { chip: 'bg-slate-50  border-transparent text-slate-400',   solved: 'bg-slate-50   border-transparent text-slate-400',   label: '' },
};

// ─── Sentences ────────────────────────────────────────────────
// Tokens WITH question → interactive (user must answer)
// Tokens WITHOUT question → pre-labeled (shown colored immediately, no quiz)
export const puzzles: PuzzleSentence[] = [
  {
    id: 'p1',
    level: 'N5',
    theme: '日常生活',
    source: '例句',
    fullTranslation: '我每天去学校。',
    tokens: [
      // 私 — common enough, no quiz
      { text: '私', reading: 'わたし', type: 'noun' },
      // は — topic marker, quiz
      {
        text: 'は', reading: 'は', type: 'particle',
        question: '「は」在这里起什么作用？',
        options: ['话题标记（说明在聊谁）', '宾语标记（动作的对象）', '主语标记（强调动作者）', '方向标记（表示去往）'],
        correct: 0,
        explanation: '「は」把「私」设为话题，相当于中文「至于我嘛……」。注意：は的发音在助词位置读「わ」。',
      },
      // 毎日 — meaning clear from kanji, no quiz
      { text: '毎日', reading: 'まいにち', type: 'adverb' },
      // 学校 — common word, no quiz
      { text: '学校', reading: 'がっこう', type: 'noun' },
      // へ — directional particle, quiz (vs に)
      {
        text: 'へ', reading: 'へ', type: 'particle',
        question: '「へ」和「に」都能接地点，这里「へ」表示什么？',
        options: ['移动的方向（强调朝那里走）', '存在的场所（在哪里）', '动作的来源（从哪里）', '动作的工具（用什么）'],
        correct: 0,
        explanation: '「へ」强调方向感，「に」更强调到达目的地。両者可互换但语感不同：へ偏诗意/方向，に更日常。',
      },
      // 行きます — verb form, quiz
      {
        text: '行きます', reading: 'いきます', type: 'verb',
        question: '「行きます」是什么形式？',
        options: ['现在/将来肯定（礼貌形）', '过去肯定（礼貌形）', '现在否定（礼貌形）', '现在进行时'],
        correct: 0,
        explanation: '动词「行く」的礼貌形（ます形）。ます形 = 现在或将来动作。过去是「行きました」，否定是「行きません」。',
      },
      { text: '。', reading: '', type: 'skip', skip: true },
    ],
  },

  {
    id: 'p2',
    level: 'N5',
    theme: '学习日语',
    source: '例句',
    fullTranslation: '我正在和朋友一起学日语。',
    tokens: [
      // 友達 — common word, no quiz
      { text: '友達', reading: 'ともだち', type: 'noun' },
      // と — comitative particle, quiz
      {
        text: 'と', reading: 'と', type: 'particle',
        question: '「と」接在名词后，这里表示什么？',
        options: ['和某人一起做', '去往某方向', '因为某原因', '对某人说'],
        correct: 0,
        explanation: '「と」（共同行动）= 和……一起。例：友達と食べる（和朋友一起吃）。注意「と」还有引用用法（"と言う"），但这里是伴随。',
      },
      // 一緒に — meaning clear, no quiz
      { text: '一緒に', reading: 'いっしょに', type: 'adverb' },
      // 日本語 — common, no quiz
      { text: '日本語', reading: 'にほんご', type: 'noun' },
      // を — object marker, quiz
      {
        text: 'を', reading: 'を', type: 'particle',
        question: '「を」（发音：お）在这里标记什么？',
        options: ['动作的直接对象（宾语）', '动作的起点（从哪里）', '话题（在聊什么）', '时间（什么时候）'],
        correct: 0,
        explanation: '「を」是宾语助词，标记动词直接作用的事物。日本語を勉強する = 学（宾语）日语。',
      },
      // 勉強しています — te-iru form, quiz
      {
        text: '勉強しています', reading: 'べんきょうしています', type: 'verb',
        question: '「勉強しています」是什么时态/形式？',
        options: ['正在进行（て形＋います）', '已经完成（た形）', '将要做（つもりです）', '想要做（たいです）'],
        correct: 0,
        explanation: '〜ています = ①正在做 ②持续状态。这里是「正在学习」。构成：勉強する → 勉強して（て形）+ います。',
      },
      { text: '。', reading: '', type: 'skip', skip: true },
    ],
  },

  {
    id: 'p3',
    level: 'N4',
    theme: '天气与出行',
    source: '例句',
    fullTranslation: '因为天气不好，今天不打算出门。',
    tokens: [
      // 天気 — common, no quiz
      { text: '天気', reading: 'てんき', type: 'noun' },
      // が — subject marker (vs は), quiz
      {
        text: 'が', reading: 'が', type: 'particle',
        question: '这里用「が」而不是「は」，为什么？',
        options: ['天气是原因从句的主语（新信息）', '天气是全句的话题', '表示天气的方向', '表示时间'],
        correct: 0,
        explanation: '「が」标记主语，尤其在从属/原因从句中。「天気が悪いので」= 天气（主）不好，所以……。如果是「天気は」会把重心转移到「天气」这个话题上，语感不同。',
      },
      // 悪い — adjective, pre-labeled no quiz
      { text: '悪い', reading: 'わるい', type: 'adjective' },
      // ので — causal conjunction, quiz (vs から)
      {
        text: 'ので', reading: 'ので', type: 'conjunction',
        question: '「ので」和「から」都表示原因，有什么区别？',
        options: ['ので更客观/礼貌，から更主观/口语', 'ので是假设，から是原因', '两者完全相同可互换', 'ので只用于书面语'],
        correct: 0,
        explanation: '「ので」语气客观，适合向上司/长辈说明原因；「から」更随意主观，口语常用。说"遅れてすみません、電車が遅れたので"比"から"更礼貌。',
      },
      // 今日 — reading is the quiz point actually, but let's show it pre-labeled
      { text: '今日', reading: 'きょう', type: 'adverb' },
      // は — contrastive は, quiz
      {
        text: 'は', reading: 'は', type: 'particle',
        question: '「今日は」的「は」这里有什么特别含义？',
        options: ['对比（今天和平时不同）', '纯粹的话题标记', '表示时间范围', '加强语气'],
        correct: 0,
        explanation: '「は」除了话题，还有对比含义：「今日は（外に出ません）」暗示"今天（不同于平时）不出门"。这种对比は很微妙但很重要。',
      },
      // 外 — common direction word, no quiz
      { text: '外', reading: 'そと', type: 'noun' },
      // に — goal particle with 出る, quiz
      {
        text: 'に', reading: 'に', type: 'particle',
        question: '「外に出る」的「に」表示什么？',
        options: ['移动的目标地点', '存在的场所（在外面）', '时间点（几点）', '原因'],
        correct: 0,
        explanation: '「に」接移动动词（出る・行く・来る）时，表示移动的目标地点。外に出る = 去到外面（到达方向）。',
      },
      // 出ません — negative verb form, quiz
      {
        text: '出ません', reading: 'でません', type: 'verb',
        question: '「出ません」是什么形式？',
        options: ['礼貌否定（现在/将来）', '礼貌过去肯定', '礼貌过去否定', '普通形否定'],
        correct: 0,
        explanation: '出る → 出ます（礼貌肯定）→ 出ません（礼貌否定）。对应：出る → 出ない（普通形否定）。注意「出」读「で」不读「だ」。',
      },
      { text: '。', reading: '', type: 'skip', skip: true },
    ],
  },
];
