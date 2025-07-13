import { sha256 } from "js-sha256";
import type { User, Project, ProjectsResponse } from "@/types";

// PKCE 用の code_verifier を生成
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// PKCE 用の code_challenge を生成
export function generateCodeChallenge(codeVerifier: string): string {
  const hash = sha256(codeVerifier);
  const matches = hash.match(/.{1,2}/g);
  if (!matches) {
    throw new Error("Failed to generate code challenge");
  }
  const hashArray = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
  return base64URLEncode(hashArray);
}

// Base64URL エンコード
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// OAuth 認証 URL を生成
export function generateAuthUrl(codeChallenge: string): string {
  const baseUrl = import.meta.env.VITE_REDIRECT_URI;
  const redirectUri = `${baseUrl}/auth/callback`;

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/cloud-platform.read-only https://www.googleapis.com/auth/pubsub https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
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
  const baseUrl = import.meta.env.VITE_REDIRECT_URI;
  const redirectUri = `${baseUrl}/auth/callback`;

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  const requestBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier,
  });

  console.log("Token request body:", {
    client_id: clientId,
    redirect_uri: redirectUri,
    code: `${code.substring(0, 20)}...`,
    code_verifier: `${codeVerifier.substring(0, 20)}...`,
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
    console.error("Token request failed:", String(response.status), errorText);
    throw new Error(`Failed to get access token: ${String(response.status)}`);
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("access_token" in data)) {
    throw new Error("Invalid token response");
  }
  return data as TokenResponse;
}

// リフレッシュトークンを使って新しいアクセストークンを取得
export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  const requestBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
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
    console.error("Token refresh failed:", String(response.status), errorText);
    throw new Error(
      `Failed to refresh access token: ${String(response.status)}`
    );
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("access_token" in data)) {
    throw new Error("Invalid token response");
  }
  return data as TokenResponse;
}

// ユーザー情報を取得
export async function getUserInfo(accessToken: string): Promise<User> {
  const tokenStr =
    typeof accessToken === "string" ? accessToken : String(accessToken);
  console.log(
    "Fetching user info with token:",
    `${tokenStr.substring(0, 20)}...`
  );

  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${String(accessToken)}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "User info request failed:",
      String(response.status),
      errorText
    );
    throw new Error(`Failed to get user info: ${String(response.status)}`);
  }

  const userInfo: unknown = await response.json();
  if (!userInfo || typeof userInfo !== "object" || !("id" in userInfo)) {
    throw new Error("Invalid user info response");
  }
  return userInfo as User;
}

// プロジェクト一覧を取得
export async function getProjects(accessToken: string): Promise<Project[]> {
  const tokenStr =
    typeof accessToken === "string" ? accessToken : String(accessToken);
  console.log(
    "Fetching projects with token:",
    `${tokenStr.substring(0, 20)}...`
  );

  const response = await fetch(
    "https://cloudresourcemanager.googleapis.com/v1/projects",
    {
      headers: {
        Authorization: `Bearer ${String(accessToken)}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Projects request failed:",
      String(response.status),
      errorText
    );

    if (response.status === 403) {
      throw new Error(
        "Access denied. Please check if Cloud Resource Manager API is enabled and you have proper permissions."
      );
    }

    throw new Error(`Failed to get projects: ${String(response.status)}`);
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("projects" in data)) {
    throw new Error("Invalid projects response");
  }
  return (data as ProjectsResponse).projects;
}
