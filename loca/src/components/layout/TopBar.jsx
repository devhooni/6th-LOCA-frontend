import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Sparkles, Lock, ChevronRight, X, Trash2, Mail, CheckCircle2, Inbox } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { fetchForYouStatus, fetchMyReviews } from "../../services/placeService";

export function TopBar({ className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  // 알림 목록 구성 함수
  const syncNotifications = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let isUnlocked = false;
    let reviewCount = 0;
    const requiredCount = 3;

    try {
      // 1. fetchForYouStatus 및 fetchMyReviews 병렬 확인으로 정확한 실시간 해금 상태 파악
      const [statusRes, myReviewsRes] = await Promise.allSettled([
        fetchForYouStatus(),
        fetchMyReviews(),
      ]);

      if (myReviewsRes.status === "fulfilled" && Array.isArray(myReviewsRes.value)) {
        reviewCount = myReviewsRes.value.length;
      }

      if (statusRes.status === "fulfilled" && statusRes.value) {
        const s = statusRes.value;
        isUnlocked = Boolean(s.unlocked) || s.remainingReviewCount === 0 || (s.reviewCount ?? reviewCount) >= requiredCount;
        if (s.reviewCount) reviewCount = Math.max(reviewCount, s.reviewCount);
      } else {
        isUnlocked = reviewCount >= requiredCount;
      }
    } catch {
      isUnlocked = reviewCount >= requiredCount;
    }

    const remainingCount = Math.max(0, requiredCount - reviewCount);

    // 사용자가 삭제한 알림 ID 목록
    const deletedIds = JSON.parse(localStorage.getItem("deletedNotificationIds") || "[]");
    const readIds = JSON.parse(localStorage.getItem("readNotificationIds") || "[]");

    const list = [];

    // 1. 해금 완료 알림 (해금 상태일 때)
    if (isUnlocked) {
      if (!deletedIds.includes("foryou_unlocked")) {
        list.push({
          id: "foryou_unlocked",
          type: "UNLOCKED",
          title: "축하해요! 맞춤 추천이 해금되었어요! 🎉",
          badge: "✨ 맞춤 추천 해금 완료",
          desc: "작성해주신 리뷰를 바탕으로 로카프렌즈 4인방이 딱 맞는 5개의 추천 장소를 엄선했습니다. 지금 바로 확인해보세요!",
          time: "방금 전",
          link: "/foryou",
          btnText: "For You 추천 보러가기",
          isRead: readIds.includes("foryou_unlocked"),
        });
      }
    }

    // 2. 잠김 안내 알림 (해금 미완료 상태일 때)
    if (!isUnlocked) {
      if (!deletedIds.includes("foryou_locked")) {
        list.push({
          id: "foryou_locked",
          type: "LOCKED",
          title: `리뷰 ${remainingCount}개만 더 쓰면 맞춤 추천 오픈!`,
          badge: "🔒 For You 추천 잠김",
          desc: `현재 리뷰 ${reviewCount}/${requiredCount}개 작성 완료! 친구들이 내 취향을 분석할 수 있도록 리뷰를 채워보세요.`,
          time: "방금 전",
          link: "/review",
          btnText: "리뷰 작성하러 가기",
          isRead: readIds.includes("foryou_locked"),
        });
      }
    }

    // 3. 웰컴 온보딩 알림 (메일함 느낌을 위한 상시 알림)
    if (!deletedIds.includes("welcome_loca")) {
      list.push({
        id: "welcome_loca",
        type: "WELCOME",
        title: "LOCA에 오신 것을 환영합니다! 🗺️",
        badge: "👋 웰컴 메시지",
        desc: "홍대 곳곳의 숨겨진 나만의 스팟을 저장하고, 친구들과 리뷰를 공유해보세요.",
        time: "1일 전",
        link: "/explore",
        btnText: "홍대 장소 탐색하기",
        isRead: readIds.includes("welcome_loca"),
      });
    }

    setNotifications(list);
    setHasUnread(list.some((item) => !item.isRead));
  }, []);

  // 페이지 이동하거나 마운트될 때마다 실시간 동기화
  useEffect(() => {
    syncNotifications();
  }, [location.pathname, syncNotifications]);

  // 알림 모달 열기 (모두 읽음 처리)
  const handleOpenNotification = () => {
    setShowModal(true);
    setHasUnread(false);

    // 현재 목록에 있는 모든 알림을 읽음 처리로 저장
    const currentIds = notifications.map((n) => n.id);
    const readIds = Array.from(new Set([...JSON.parse(localStorage.getItem("readNotificationIds") || "[]"), ...currentIds]));
    localStorage.setItem("readNotificationIds", JSON.stringify(readIds));

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // 개별 알림 삭제
  const handleDeleteNotification = (e, notifId) => {
    e.stopPropagation();
    const deletedIds = Array.from(new Set([...JSON.parse(localStorage.getItem("deletedNotificationIds") || "[]"), notifId]));
    localStorage.setItem("deletedNotificationIds", JSON.stringify(deletedIds));

    const updatedList = notifications.filter((n) => n.id !== notifId);
    setNotifications(updatedList);
    setHasUnread(updatedList.some((item) => !item.isRead));
  };

  // 전체 알림 삭제 (모두 지우기)
  const handleClearAllNotifications = () => {
    const allIds = notifications.map((n) => n.id);
    const deletedIds = Array.from(new Set([...JSON.parse(localStorage.getItem("deletedNotificationIds") || "[]"), ...allIds]));
    localStorage.setItem("deletedNotificationIds", JSON.stringify(deletedIds));

    setNotifications([]);
    setHasUnread(false);
  };

  return (
    <>
      <header
        className={cn(
          "w-full h-12 flex items-center justify-between px-5 flex-none",
          "bg-white border-b border-[var(--color-neutral-border)] relative z-30",
          className
        )}
      >
        <div 
          onClick={() => navigate("/explore")}
          className="flex items-center space-x-2 cursor-pointer select-none"
        >
          <img src="/brand-icon.svg" alt="LOCA" className="w-5 h-5 object-contain" />
          <span className="text-base font-black text-[var(--color-text-primary)] tracking-tight">LOCA</span>
        </div>

        {/* 알림 벨 버튼 + 빨간 작은 점 (Red Badge Dot) */}
        <button
          onClick={handleOpenNotification}
          className="relative p-1.5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          aria-label="알림"
        >
          <Bell size={20} strokeWidth={1.8} />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          )}
        </button>
      </header>

      {/* 위에서 스르륵 내려오는 슬릭한 알림 메일함 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-2xs animate-fade-in px-4 pt-14">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setShowModal(false)}
          />

          {/* Top Dropdown Notification Inbox Card */}
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl border border-gray-100 space-y-3 animate-slide-down select-none max-h-[82vh] flex flex-col">
            {/* Header: 메일함 헤더 & 모두 지우기 & X 닫기 */}
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 flex-none">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Mail size={13} />
                </div>
                <span className="text-xs font-bold text-[#111]">알림 메일함</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600 font-semibold">
                  {notifications.length}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifications}
                    className="text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    모두 지우기
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Notification List (Scrollable Inbox) */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-0.5 no-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-gray-400 space-y-2">
                  <Inbox size={28} strokeWidth={1.5} />
                  <p className="text-xs">새로운 알림이 없습니다.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100/90 space-y-2.5 hover:border-gray-200 transition-all text-left relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center flex-none shadow-2xs mt-0.5",
                            item.type === "UNLOCKED"
                              ? "bg-amber-100 text-amber-700"
                              : item.type === "LOCKED"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-indigo-50 text-indigo-600"
                          )}
                        >
                          {item.type === "UNLOCKED" ? (
                            <Sparkles size={16} />
                          ) : item.type === "LOCKED" ? (
                            <Lock size={16} />
                          ) : (
                            <Mail size={16} />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-600">
                              {item.badge}
                            </span>
                            <span className="text-[10px] text-gray-400">{item.time}</span>
                          </div>

                          <h4 className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      {/* 개별 삭제 휴지통 버튼 */}
                      <button
                        onClick={(e) => handleDeleteNotification(e, item.id)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-none cursor-pointer"
                        title="알림 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed pl-10.5">
                      {item.desc}
                    </p>

                    {/* 바로가기 CTA 버튼 */}
                    <div className="pl-10.5 pt-0.5">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          navigate(item.link);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#111] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 active:scale-98 transition-transform cursor-pointer shadow-2xs"
                      >
                        <span>{item.btnText}</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
