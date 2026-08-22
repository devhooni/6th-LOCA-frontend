import { useState, useEffect } from "react";
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
import FriendsPage from "./pages/FriendsPage";
import NotFoundPage from "./pages/NotFoundPage";

// 핵심 로카프렌즈 마스코트 및 PC 배경 이미지 프리로딩 목록
const CRITICAL_IMAGES = [
  "/brand-icon.svg",
  "/imgs/start.png",
  "/imgs/Foryou.png",
  "/imgs/alone.png",
  "/imgs/friends.png",
  "/imgs/couple.png",
  "/imgs/family.png",
  "/imgs/etc.png",
  "/imgs/Login.png",
  "/imgs/Signup.png",
  "/imgs/notfound.png",
  "/imgs/Loki.png",
  "/imgs/Odi.png",
  "/imgs/CoCo.png",
  "/imgs/Archie.png",
  "/imgs/bg1.png",
  "/imgs/bg2.png",
  "/imgs/bg3.png",
  "/imgs/bg4.png",
];


// 인증 필요 라우트 가드 (로그인 미완료 시 어떤 링크로 들어가도 /onboarding으로 리다이렉트)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  return children;
}

// 관리자 전용 라우트 가드 (isAdmin === "true" 또는 관리자 이메일일 때만 진입 허용, 아니면 404 NotFoundPage 렌더링)
function AdminRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const userEmail = localStorage.getItem("userEmail") || "";
  const isAdmin = localStorage.getItem("isAdmin") === "true" || userEmail.toLowerCase().includes("admin");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <NotFoundPage />;
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
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // 앱 시작 시 로카프렌즈 이미지들을 브라우저 메모리에 미리 로드
    let isMounted = true;

    const preloadImages = async () => {
      const promises = CRITICAL_IMAGES.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(src);
          img.onerror = () => resolve(src); // 에러가 나도 진행
        });
      });

      // 최대 1.2초 기다리거나, 모든 이미지 로딩 완료 시 앱 렌더링
      const timeout = new Promise((resolve) => setTimeout(resolve, 1200));
      await Promise.race([Promise.all(promises), timeout]);

      if (isMounted) {
        setIsAppReady(true);
      }
    };

    preloadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAppReady) {
    // 리소스 로딩 중 깔끔한 브랜드 스플래시 화면
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center select-none z-50 animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 flex items-center justify-center animate-bounce">
            <img src="/brand-icon.svg" alt="LOCA" className="w-14 h-14 object-contain" />
          </div>
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-black text-gray-900 tracking-[0.2em]">LOCA</h1>
            <p className="text-xs text-gray-400 font-medium tracking-tight">
              로카프렌즈를 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage />
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
        {/* 관리자 라우트: POST /api/auth/login 시 응답받은 isAdmin 값이 true일 때만 접근 가능 (아니면 404) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* 미정의 와일드카드 경로(예: /asdfsd 등) 진입 시 404 Not Found 및 로카 브랜드 이미지 표시 */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </AppShell>
  );
}
