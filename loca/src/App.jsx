import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import ReviewPage from "./pages/ReviewPage";
import OnboardingPage from "./pages/OnboardingPage";
import ExplorePage from "./pages/ExplorePage";
import AddPlacePage from "./pages/AddPlacePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import MyPage from "./pages/MyPage";
import AdminPage from "./pages/AdminPage";
import ForYouPage from "./pages/ForYouPage";

// 인증 필요 라우트 가드 (로그인 미완료 시 어떤 링크로 들어가도 /onboarding으로 리다이렉트)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  return children;
}

// 이미 로그인된 사용자가 온보딩/로그인/회원가입 페이지 진입 시 메인 탐색(/explore)으로 리다이렉트
function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    return <Navigate to="/explore" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        
        {/* 공개 라우트 (온보딩, 로그인, 회원가입) */}
        <Route
          path="/onboarding"
          element={
            <PublicOnlyRoute>
              <OnboardingPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignUpPage />
            </PublicOnlyRoute>
          }
        />

        {/* 보호된 라우트 (로그인 상태 필수 - 미인증 시 무조건 /onboarding으로 리다이렉트) */}
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/foryou"
          element={
            <ProtectedRoute>
              <ForYouPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddPlacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 미정의 와일드카드 경로 진입 시에도 로그인 여부에 따라 리다이렉트 */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Navigate to="/explore" replace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  );
}
