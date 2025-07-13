# google-cloud-pubsub-visualizer

## For Development

### OAuth 2.0 クライアント ID を追加する

<https://console.cloud.google.com/auth/clients>

- 承認済みの JavaScript 生成元
  - <http://localhost:5173>
- 承認済みのリダイレクト URI
  - <http://localhost:5173/>
  - <http://localhost:5173>
  - <http://localhost:5173/auth/callback>

### [Cloud Resource Manager API](https://console.cloud.google.com/marketplace/product/google/cloudresourcemanager.googleapis.com) を有効にする

### 環境変数の設定

上記で取得した Client ID, Client Secret を .env.local に設定する

```sh
envsubst < ./.devcontainer/.env.local.template > ./.devcontainer/.env.local
```

### deploy 方法

#### application

```sh
export VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
export VITE_GOOGLE_CLIENT_SECRET=${VITE_GOOGLE_CLIENT_SECRET}
firebase login
firebase init
npm run build
firebase deploy --only hosting
```

#### functions

```sh
cd functions/oauth-handler
npm install
npm run build
cd ../../

firebase deploy --only functions
```
