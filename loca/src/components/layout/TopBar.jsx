import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Sparkles,
  Lock,
  ChevronRight,
  X,
  Trash2,
  Mail,
  Inbox,
  Megaphone,
  Pin,
  Calendar,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { fetchForYouStatus, fetchMyReviews } from "../../services/placeService";

// LOCA 공식 공지사항 목록
const NOTICES = [
  {
    id: "notice_1",
    title: "🎉 LOCA 정식 오픈 & 로카프렌즈 소개",
    date: "2026.08.18",
    badge: "공지",
    isPinned: true,
    content:
      "홍익대학교 주변의 숨겨진 핫스팟과 나만의 감성을 기록하는 LOCA가 정식 오픈했습니다! 로키, 아키, 오디, 코코와 함께 취향 맞춤 스팟을 발견해보세요.",
  },
  {
    id: "notice_2",
    title: "✨ For You 맞춤 추천 기능 안내",
    date: "2026.08.17",
    badge: "안내",
    isPinned: true,
    content:
      "방문 리뷰를 3개 이상 작성하시면, 로카프렌즈 AI가 내 취향을 분석하여 딱 맞는 5개의 스팟을 엄선해 추천해 드립니다. 지금 리뷰를 남겨보세요!",
  },
  {
    id: "notice_3",
    title: "🔒 서비스 이용 수칙 및 매너 리뷰 가이드",
    date: "2026.08.15",
    badge: "가이드",
    isPinned: false,
    content:
      "모두가 쾌적하고 신뢰할 수 있는 정보를 나눌 수 있도록 허위 정보나 부적절한 언어 사용은 자제해 주시기 바랍니다. 여러분의 따뜻한 리뷰를 환영합니다.",
  },
];

export function TopBar({ className }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 탭 상태: 'notification' (알림 메일함) | 'notice' (공지사항)
  const [activeTab, setActiveTab] = useState("notification");
  const [showModal, setShowModal] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // 알림 목록 구성 함수
  const syncNotifications = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let isUnlocked = false;
    let reviewCount = 0;
    const requiredCount = 3;

    try {
      const [statusRes, myReviewsRes] = await Promise.allSettled([
        fetchForYouStatus(),
        fetchMyReviews(),
      ]);

      if (
        myReviewsRes.status === "fulfilled" &&
        Array.isArray(myReviewsRes.value)
      ) {
        reviewCount = myReviewsRes.value.length;
      }

      if (statusRes.status === "fulfilled" && statusRes.value) {
        const s = statusRes.value;
        isUnlocked =
          Boolean(s.unlocked) ||
          s.remainingReviewCount === 0 ||
          (s.reviewCount ?? reviewCount) >= requiredCount;
        if (s.reviewCount) reviewCount = Math.max(reviewCount, s.reviewCount);
      } else {
        isUnlocked = reviewCount >= requiredCount;
      }
    } catch {
      isUnlocked = reviewCount >= requiredCount;
    }

    const remainingCount = Math.max(0, requiredCount - reviewCount);

    const deletedIds = JSON.parse(
      localStorage.getItem("deletedNotificationIds") || "[]",
    );
    const readIds = JSON.parse(
      localStorage.getItem("readNotificationIds") || "[]",
    );

    const list = [];

    // 1. 해금 완료 알림
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

    // 2. 잠김 안내 알림
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

    // 3. 웰컴 온보딩 알림
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

  useEffect(() => {
    syncNotifications();
  }, [location.pathname, syncNotifications]);

  // 알림 모달 열기 (알림 탭 기본 열기)
  const handleOpenNotification = () => {
    setActiveTab("notification");
    setShowModal(true);
    setHasUnread(false);

    const currentIds = notifications.map((n) => n.id);
    const readIds = Array.from(
      new Set([
        ...JSON.parse(localStorage.getItem("readNotificationIds") || "[]"),
        ...currentIds,
      ]),
    );
    localStorage.setItem("readNotificationIds", JSON.stringify(readIds));

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // 공지사항 바로 열기
  const handleOpenNotice = () => {
    setActiveTab("notice");
    setShowModal(true);
    setSelectedNotice(null);
  };

  // 개별 알림 삭제
  const handleDeleteNotification = (e, notifId) => {
    e.stopPropagation();
    const deletedIds = Array.from(
      new Set([
        ...JSON.parse(localStorage.getItem("deletedNotificationIds") || "[]"),
        notifId,
      ]),
    );
    localStorage.setItem("deletedNotificationIds", JSON.stringify(deletedIds));

    const updatedList = notifications.filter((n) => n.id !== notifId);
    setNotifications(updatedList);
    setHasUnread(updatedList.some((item) => !item.isRead));
  };

  // 전체 알림 삭제
  const handleClearAllNotifications = () => {
    const allIds = notifications.map((n) => n.id);
    const deletedIds = Array.from(
      new Set([
        ...JSON.parse(localStorage.getItem("deletedNotificationIds") || "[]"),
        ...allIds,
      ]),
    );
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
          className,
        )}>
        {/* LOCA 로고 */}
        <div
          onClick={() => navigate("/explore")}
          className="flex items-center space-x-2 cursor-pointer select-none">
          <img
            src="/brand-icon.svg"
            alt="LOCA"
            className="w-5 h-5 object-contain"
          />
          <span className="text-base font-black text-[var(--color-text-primary)] tracking-tight">
            LOCA
          </span>
        </div>

        {/* 상단바 우측 액션: 공지사항 버튼 & 알림 벨 버튼 */}
        <div className="flex items-center space-x-1">
          {/* 공지사항 아이콘 버튼 */}
          <button
            onClick={handleOpenNotice}
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="공지사항">
            <Megaphone size={18} strokeWidth={1.8} />
          </button>

          {/* 알림 벨 버튼 + 빨간 작은 점 */}
          <button
            onClick={handleOpenNotification}
            className="relative p-1.5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="알림">
            <Bell size={18} strokeWidth={1.8} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* 위에서 스르륵 내려오는 슬릭한 탑 드롭다운 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-2xs animate-fade-in px-4 pt-14">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => {
              setShowModal(false);
              setSelectedNotice(null);
            }}
          />

          {/* Top Dropdown Card */}
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl border border-gray-100 space-y-3 animate-slide-down select-none max-h-[82vh] flex flex-col">
            {/* Header: [공지사항] / [알림] 세그먼트 탭 전환기 */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 flex-none">
              <div className="flex items-center space-x-1 p-0.5 bg-gray-100 rounded-xl">
                {/* 1. 공지사항 탭 (왼쪽) */}
                <button
                  onClick={() => {
                    setActiveTab("notice");
                    setSelectedNotice(null);
                  }}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeTab === "notice"
                      ? "bg-white text-[#111] shadow-2xs"
                      : "text-gray-400 hover:text-gray-600",
                  )}>
                  <Megaphone size={12} />
                  <span>공지사항</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
                    {NOTICES.length}
                  </span>
                </button>

                {/* 2. 알림 탭 (오른쪽) */}
                <button
                  onClick={() => {
                    setActiveTab("notification");
                    setSelectedNotice(null);
                  }}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeTab === "notification"
                      ? "bg-white text-[#111] shadow-2xs"
                      : "text-gray-400 hover:text-gray-600",
                  )}>
                  <Mail size={12} />
                  <span>알림</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* 우측 닫기 & 알림 모두 지우기 */}
              <div className="flex items-center space-x-2">
                {activeTab === "notification" && notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifications}
                    className="text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                    모두 지우기
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedNotice(null);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* TAB 1: 알림 메일함 (Notification Inbox) */}
            {activeTab === "notification" && (
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
                      className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100/90 space-y-2.5 hover:border-gray-200 transition-all text-left relative group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center flex-none shadow-2xs mt-0.5",
                              item.type === "UNLOCKED"
                                ? "bg-amber-100 text-amber-700"
                                : item.type === "LOCKED"
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-indigo-50 text-indigo-600",
                            )}>
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
                              <span className="text-[10px] text-gray-400">
                                {item.time}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        {/* 개별 삭제 버튼 */}
                        <button
                          onClick={(e) => handleDeleteNotification(e, item.id)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-none cursor-pointer"
                          title="알림 삭제">
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-500 leading-relaxed pl-10.5">
                        {item.desc}
                      </p>

                      {/* 바로가기 버튼 */}
                      <div className="pl-10.5 pt-0.5">
                        <button
                          onClick={() => {
                            setShowModal(false);
                            navigate(item.link);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-[#111] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 active:scale-98 transition-transform cursor-pointer shadow-2xs">
                          <span>{item.btnText}</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: 공지사항 (Notices) */}
            {activeTab === "notice" && (
              <div className="overflow-y-auto space-y-2.5 flex-1 pr-0.5 no-scrollbar">
                {selectedNotice ? (
                  /* 공지사항 상세 보기 */
                  <div className="p-4 rounded-2xl bg-gray-50/90 border border-gray-100 space-y-3 text-left animate-fade-in">
                    <button
                      onClick={() => setSelectedNotice(null)}
                      className="text-xs text-gray-400 hover:text-gray-700 font-semibold flex items-center space-x-1 cursor-pointer mb-1">
                      <span>← 목록으로 돌아가기</span>
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#111] text-white text-[10px] font-bold">
                          {selectedNotice.badge}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {selectedNotice.date}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 pt-1">
                        {selectedNotice.title}
                      </h4>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-100 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                      {selectedNotice.content}
                    </div>

                    {/* 'LOCA 정식 오픈 & 로카프렌즈 소개' 공지(notice_1)를 눌렀을 때만 로카프렌즈 소개 바로가기 버튼 표시 */}
                    {selectedNotice.id === "notice_1" && (
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setSelectedNotice(null);
                          navigate("/friends");
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-98 transition-transform cursor-pointer shadow-sm mt-2"
                      >
                        <Sparkles size={14} className="text-amber-200" />
                        <span>로카프렌즈를 소개합니다!</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  /* 공지사항 목록 */
                  NOTICES.map((notice) => (
                    <div
                      key={notice.id}
                      onClick={() => setSelectedNotice(notice)}
                      className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100/90 space-y-1.5 hover:bg-gray-100/70 hover:border-gray-200 transition-all text-left cursor-pointer active:scale-99">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          {notice.isPinned && (
                            <Pin
                              size={11}
                              className="text-amber-600 flex-none"
                            />
                          )}
                          <span
                            className={cn(
                              "px-1.5 py-0.2 rounded text-[10px] font-bold",
                              notice.isPinned
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-200 text-gray-700",
                            )}>
                            {notice.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {notice.date}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {notice.title}
                      </h4>

                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {notice.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
