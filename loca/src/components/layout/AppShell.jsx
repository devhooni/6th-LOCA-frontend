import { useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { cn } from "@/src/lib/utils";

export function AppShell({ children, className }) {
  const location = useLocation();

  // 알려진 메인 앱 라우트 목록 (이외의 와일드카드 경로는 404 NotFoundPage)
  const KNOWN_NAV_ROUTES = [
    "/explore",
    "/foryou",
    "/add",
    "/review",
    "/my",
    "/admin",
  ];

  // 상단바/하단바 숨김 처리 대상: 온보딩/로그인/회원가입, 로카프렌즈 소개(/friends), 404 Not Found 페이지
  const isAuthOrSpecialPage = ["/onboarding", "/login", "/signup", "/friends"].includes(location.pathname);
  const isNotFoundPage = !KNOWN_NAV_ROUTES.includes(location.pathname) && !["/onboarding", "/login", "/signup", "/friends", "/"].includes(location.pathname);

  const hideNav = isAuthOrSpecialPage || isNotFoundPage;

  const isExplore = location.pathname === "/explore";
  const isAdd = location.pathname === "/add";
  const isFriends = location.pathname === "/friends";

  return (
    <div className="min-h-screen w-full bg-[#f4f4f5] flex items-center justify-center">
      <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col bg-white overflow-x-hidden overflow-y-hidden relative shadow-sm">
        {!hideNav && (
          <div className="flex-none w-full">
            <TopBar />
          </div>
        )}
        
        <main 
          className={cn(
            "flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden",
            !hideNav && !isExplore && !isAdd && !isFriends && "px-5 py-4",
            className
          )}
        >
          {children}
        </main>

        {!hideNav && (
          <div className="flex-none w-full">
            <BottomBar />
          </div>
        )}
      </div>
    </div>
  );
}



