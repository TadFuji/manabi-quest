// Monster definitions: subject mapping, battle parameters and zukan entries.

import type { Category, MonsterId } from '../data/types';

export interface MonsterDef {
  id: MonsterId;
  name: string;
  cats: Category[];
  /** correct answers needed to defeat */
  need: number;
  xp: number;
  intro: string;
  zukan: string;
}

export const MONSTER_DEFS: Record<MonsterId, MonsterDef> = {
  slimy: {
    id: 'slimy',
    name: 'スライミー',
    cats: ['tashizan'],
    need: 1,
    xp: 5,
    intro: 'スライミーが あらわれた!\nプニプニと かずを のみこんでくる!',
    zukan:
      'かずを のみこむ ぷにぷにの しずく。おなかの なかでは いつも たしざんの おとが ひびいている。じつは さみしがりやで、ともだちが ほしいだけ らしい。',
  },
  kazoenma: {
    id: 'kazoenma',
    name: 'カゾエンマ',
    cats: ['hikizan'],
    need: 1,
    xp: 5,
    intro: 'カゾエンマが あらわれた!\n「いくつ きえた?」と ゆびを ふる!',
    zukan:
      'かずを かくす いたずら こおに。ゆびを ふるたびに かずが ひとつ きえる。ほんとうは かくれんぼが だいすきなだけ、という うわさ。',
  },
  kakezaru: {
    id: 'kakezaru',
    name: 'カケザルー',
    cats: ['kakezan'],
    need: 2,
    xp: 5,
    intro: 'カケザルーが あらわれた!\nキキッ! 九九を かくして にげまわる!',
    zukan:
      '九九を ぬすんで にげる すばしっこい さる。しっぽに 九九の ひょうを まきつけている。いちばん すきな だんは 8のだん らしい。',
  },
  warioni: {
    id: 'warioni',
    name: 'ワリオーニ',
    cats: ['warizan', 'bunshoudai'],
    need: 2,
    xp: 5,
    intro: 'ワリオーニが あらわれた!\n「ぜんぶ わけてみろ!」と せまってくる!',
    zukan:
      'なんでも おなじ かずに わけたがる おに。おやつも おもちゃも きっちり わけないと きが すまない。じつは とても こうへいな せいかく。',
  },
  yomiganago: {
    id: 'yomiganago',
    name: 'ヨミガナーゴ',
    cats: ['kanji-yomi', 'kotoba'],
    need: 2,
    xp: 5,
    intro: 'ヨミガナーゴが あらわれた!\nニャゴ! ことばの よみかたを たべちゃった!',
    zukan:
      'かんじの よみがなを たべてしまう くろねこ。おなかが すくと ほんの ページを ぺろぺろ なめる。よみかたを とりもどすと のどを ならして よろこぶ。',
  },
  kakitorin: {
    id: 'kakitorin',
    name: 'カキトリン',
    cats: ['kanji-kaki'],
    need: 2,
    xp: 5,
    intro: 'カキトリンが あらわれた!\nふでを ふって まちがい字を ばらまく!',
    zukan:
      'おおきな ふでを もった ようせい。ふでを ひとふりすると、にせものの 字が ふわふわ まいおちる。ただしい 字を えらべる ひとが だいすき。',
  },
  teniwohappa: {
    id: 'teniwohappa',
    name: 'テニヲハッパ',
    cats: ['teniwoha'],
    need: 2,
    xp: 5,
    intro: 'テニヲハッパが あらわれた!\nヒラヒラ! ただしい ことばを ちらかす!',
    zukan:
      '「て」「に」「を」「は」を かぜに のせて ちらかす はっぱの おばけ。ことばが ただしく ならぶと、うれしくて くるくる まわる。',
  },
  nazora: {
    id: 'nazora',
    name: 'まおう ナゾラー',
    cats: [
      'tashizan',
      'hikizan',
      'kakezan',
      'warizan',
      'bunshoudai',
      'kanji-yomi',
      'kanji-kaki',
      'teniwoha',
      'kotoba',
    ],
    need: 3,
    xp: 30,
    intro: 'まおう ナゾラーが あらわれた!\n「ことばも かずも、ぜんぶ わたしの ものだ!」',
    zukan:
      'せかいじゅうの ことばと かずを うばった かげの まおう。だが ほんとうは、だれよりも べんきょうが すきだった という せつも ある。',
  },
};

export const REGULAR_IDS: MonsterId[] = [
  'slimy',
  'kazoenma',
  'kakezaru',
  'warioni',
  'yomiganago',
  'kakitorin',
  'teniwohappa',
];

export const ZUKAN_FOOTER =
  'この ゲームの え・おと・ことばは、ぜんぶ ひとつの AI が つくりました';
