# ことばと かずの ぼうけん 〜マナビクエスト〜

小学3年生向けの、ドラクエ1風 8bit 学習RPGです。
絵(ドット絵)・音(チップチューン)・問題(205問)・プログラムのすべてを、
画像ファイル・音声ファイルを一切使わず、ひとつのAI(Claude)がコードだけで作りました。

## 遊び方(いちばん簡単)

`dist\manabi-quest.html` をダブルクリックするだけで、ブラウザで遊べます。
(1ファイルにすべて入った完成品です)

## 操作

- 移動: 矢印キー(スマホは画面のボタン)
- けってい(A): Enter / Z / 画面タップ
- メニュー・もどる(B): Esc / X
- 答えはマウスやタップで直接選ぶこともできます

## 開発者向け

```
npm install        # 部品をそろえる(初回のみ)
npm run dev        # 開発用サーバーで遊ぶ
npm run build      # 完成品を dist/ に作る(型チェック込み)
node scripts/make-single-file.mjs   # dist/manabi-quest.html(1ファイル版)を作る
node scripts/validate-data.mjs      # 絵・音・問題データの機械検証
```

仕様書は `PLAN.md` を参照してください。
