/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_REDIRECT_URI: string;
  // 他に必要な環境変数があればここに追加
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
