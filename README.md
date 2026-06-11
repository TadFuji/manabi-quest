# ことばと かずの ぼうけん 〜マナビクエスト〜

小学3年生向けの、ドラクエ1風 8bit 学習RPGです。
絵(ドット絵)・音(チップチューン)・問題(205問)・プログラムのすべてを、
画像ファイル・音声ファイルを一切使わず、ひとつのAI(Claude)がコードだけで作りました。

## あそぶ

ここをひらくだけで遊べます(パソコンでもスマホでもOK):

**https://tadfuji.github.io/manabi-quest/**

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
```

main ブランチに送ると、GitHub Actions が自動でビルドして
GitHub Pages に公開します(`.github/workflows/deploy.yml`)。
