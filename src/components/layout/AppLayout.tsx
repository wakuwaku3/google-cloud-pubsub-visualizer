import React from "react";
import { Header } from "@/components/layout/Header";
import "./AppLayout.css";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">{children}</main>
    </div>
  );
}
