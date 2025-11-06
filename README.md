# maintenance-chat

A simple chat application served by a Cloudflare Worker.

## ローカル開発

1. 依存関係をインストールします。

   ```bash
   npm install
   ```

2. Wrangler でローカル開発サーバーを起動します。

   ```bash
   npm run dev
   ```

   Wrangler が <http://localhost:8787> でワーカーを公開します。

## デプロイ

Wrangler で Cloudflare Workers にデプロイします。

```bash
npm run deploy
```

デプロイ前に `wrangler login` で Cloudflare アカウントに認証しておいてください。
