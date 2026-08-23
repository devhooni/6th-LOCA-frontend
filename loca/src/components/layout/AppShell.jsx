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

  const isSharedListPage = location.pathname.startsWith("/share/list");
  const isAuthOrSpecialPage = ["/onboarding", "/login", "/signup", "/friends"].includes(location.pathname) || isSharedListPage;
  const isNotFoundPage = !KNOWN_NAV_ROUTES.includes(location.pathname) && !["/onboarding", "/login", "/signup", "/friends", "/"].includes(location.pathname) && !isSharedListPage;

  const hideNav = isAuthOrSpecialPage || isNotFoundPage;


  const isExplore = location.pathname === "/explore";
  const isAdd = location.pathname === "/add";
  const isFriends = location.pathname === "/friends";

  return (
    <div className="w-full h-full h-[100dvh] bg-white flex flex-col md:bg-[#f4f4f5] md:min-h-screen md:items-center md:justify-center">
      <div className="mx-auto flex h-full h-[100dvh] w-full max-w-[430px] flex-col bg-white overflow-hidden relative md:shadow-sm">
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




