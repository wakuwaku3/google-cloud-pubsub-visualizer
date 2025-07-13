import React from "react";
import { useAuth } from "@/contexts/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isInitialized, login } = useAuth();

  if (isLoading || !isInitialized) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    // 初期化が完了し、認証されていない場合は直接Google認証を実行
    login();
    return <div className="loading-container">認証中...</div>;
  }

  return <>{children}</>;
}
