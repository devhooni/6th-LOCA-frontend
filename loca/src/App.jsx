import { Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/foryou" element={<ForYouPage />} />
        <Route path="/add" element={<AddPlacePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-lg font-bold text-[var(--color-text-secondary)]">Coming Soon</p>
          </div>
        } />
      </Routes>
    </AppShell>
  );
}
