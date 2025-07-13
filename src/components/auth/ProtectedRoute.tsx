import React from "react";
import { useAuth } from "@/contexts/useAuth";
import { Loading } from "@/components/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isInitialized, login } = useAuth();

  if (isLoading || !isInitialized) {
    return <Loading message="Loading..." variant="fullscreen" />;
  }

  if (!user) {
    // 初期化が完了し、認証されていない場合は直接Google認証を実行
    login();
    return <Loading message="認証中..." variant="fullscreen" />;
  }

  return <>{children}</>;
}
