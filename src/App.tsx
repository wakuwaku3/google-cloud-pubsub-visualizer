import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth";
import { AppLayout } from "@/components/layout";
import { HomePage } from "@/pages/home";
import { LogoutPage } from "@/pages/logout";
import { LogoutLoadingPage } from "@/pages/logout-loading";
import { AuthCallbackPage } from "@/pages/auth-callback";
import { AuthErrorPage } from "@/pages/auth-error";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/error" element={<AuthErrorPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route
          path="/*"
          element={
            <AuthProvider>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <HomePage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/logout-loading" element={<LogoutLoadingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
