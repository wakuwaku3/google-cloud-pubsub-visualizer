import { sha256 } from "js-sha256";

// PKCE 用の code_verifier を生成
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// PKCE 用の code_challenge を生成
export function generateCodeChallenge(codeVerifier: string): string {
  const hash = sha256(codeVerifier);
  const hashArray = new Uint8Array(
    hash.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  return base64URLEncode(hashArray);
}

// Base64URL エンコード
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// OAuth 認証 URL を生成
export function generateAuthUrl(codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    redirect_uri: import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173",
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/cloud-platform.read-only https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// トークン情報の型定義
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

// アクセストークンを取得（プロキシ経由）
export async function getAccessToken(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const requestBody = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
    redirect_uri: import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173",
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier,
  });

  console.log("Token request body:", {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    redirect_uri: import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173",
    code: code.substring(0, 20) + "...",
    code_verifier: codeVerifier.substring(0, 20) + "...",
  });

  const response = await fetch("/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token request failed:", response.status, errorText);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// リフレッシュトークンを使って新しいアクセストークンを取得
export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const requestBody = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  console.log("Refreshing access token...");

  const response = await fetch("/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token refresh failed:", response.status, errorText);
    throw new Error(`Failed to refresh access token: ${response.status}`);
  }

  const data = await response.json();
  console.log("Token refreshed successfully");
  return data;
}

// ユーザー情報を取得
export async function getUserInfo(accessToken: string) {
  console.log(
    "Fetching user info with token:",
    accessToken.substring(0, 20) + "..."
  );

  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("User info request failed:", response.status, errorText);
    throw new Error(`Failed to get user info: ${response.status}`);
  }

  const userInfo = await response.json();
  console.log("User info received:", userInfo);
  return userInfo;
}

// プロジェクト一覧を取得
export async function getProjects(accessToken: string) {
  console.log(
    "Fetching projects with token:",
    accessToken.substring(0, 20) + "..."
  );

  const response = await fetch(
    "https://cloudresourcemanager.googleapis.com/v1/projects",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Projects request failed:", response.status, errorText);

    if (response.status === 403) {
      throw new Error(
        "Access denied. Please check if Cloud Resource Manager API is enabled and you have proper permissions."
      );
    }

    throw new Error(`Failed to get projects: ${response.status}`);
  }

  const data = await response.json();
  console.log("Projects received:", data);
  return data.projects || [];
}
