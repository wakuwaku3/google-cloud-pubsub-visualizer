# google-cloud-pubsub-visualizer

Google Cloud 上の Pub/Sub コンポーネント（topics / subscriptions）を視覚的にわかりやすく表示する Web アプリケーションです。

## 概要

このアプリケーションは、Google Cloud Platform の Pub/Sub サービスで管理されているトピックとサブスクリプションの関係を可視化し、クラウドインフラストラクチャの理解を促進するためのツールです。

## 主な機能

### 1. Google アカウントでのログイン

- Google Cloud の OAuth2 認証を使用（Firebase Authentication は使用しない）
- クライアント側のみで完結する PKCE フローを採用
- ユーザーがログインするとアクセストークンを取得し、Google Cloud API にアクセス可能になる

### 2. プロジェクト選択

- ログイン後、`cloudresourcemanager.projects.list` API を使用してユーザーがアクセス可能な GCP プロジェクトの一覧を取得
- UI 上でセレクトボックスに表示し、プロジェクトを1つ選択できるようにする

### 3. Pub/Sub コンポーネントの取得と表示

- 選択されたプロジェクトに対して `pubsub.projects.topics.list` と `pubsub.projects.subscriptions.list` を呼び出し、Pub/Sub の構成を取得
- トピックとサブスクリプションの関係を可視化（例: グラフビュー）
- データはリアクティブに更新可能にする（ポーリングまたは手動更新）
- **エンドポイントとトピックの紐づけ**: subscription の label に `publishing_event_id_1` のようなラベルを追加することで、特定のエンドポイントとトピックを関連付けることができます。これにより、メッセージの流れやシステム間の依存関係をより明確に理解できます

## 技術スタック

- **フロントエンド**: React + TypeScript
- **バンドラー**: Vite + SWC
- **UI ライブラリ**: shadcn/ui
- **認証**: Google OAuth2 (PKCE フロー)
- **API 呼び出し**: Google API Client Library (`gapi`)
- **実行環境**: Dev Container (VS Code 用)

## セキュリティとプライバシー

- 使用スコープは必要最小限に制限（例: `https://www.googleapis.com/auth/cloud-platform.read-only`）
- セキュリティ上、アクセストークンの保存は `sessionStorage` を基本とし、永続化しない方針
- クライアント側のみで完結するため、サーバーサイドでのトークン管理は不要

## 前提条件

- GCP 側で「Cloud Resource Manager API」および「Pub/Sub API」を有効化しておく必要がある
- gapi の初期化は認証後に必要（`gapi.load('client')` → `gapi.client.init()`）

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
