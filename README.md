# VibeCode Market - ローカル起動手順

## 必要なもの
- Node.js 18以上（https://nodejs.org/）

## 起動方法

```bash
# 1. このフォルダに移動
cd vibecode-market

# 2. 依存パッケージをインストール（初回のみ）
npm install

# 3. 開発サーバーを起動
npm run dev
```

起動後、ブラウザで **http://localhost:5173** を開いてください。

## AIチャット機能について
- AIチャットページはClaude APIを使用しています
- `src/App.jsx` の中の API呼び出し部分はそのまま動作します
- ※ Anthropicのプロキシ経由なのでAPIキーの設定は不要です

## ビルド（本番用）

```bash
npm run build
```

`dist/` フォルダに本番用ファイルが生成されます。
Vercel・Netlify・Githubページ等にそのままデプロイ可能です。

## フォルダ構成

```
vibecode-market/
├── index.html          # エントリーHTML
├── package.json        # 依存パッケージ定義
├── vite.config.js      # Viteの設定
└── src/
    ├── main.jsx        # Reactのエントリーポイント
    └── App.jsx         # メインアプリ（全コード）
```
