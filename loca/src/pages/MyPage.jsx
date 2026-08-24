import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  LogOut,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Lock,
  Globe,
  Loader2,
  RefreshCw,
  AlertCircle,
  Plus,
  MessageSquareText,
  Calendar,
  Check,
  Compass,
  Sparkles,
  X,
  HelpCircle,
  Folder,
  Share2,
  ExternalLink,
  Copy,
  CheckCheck,
  ChevronDown,
  Search,
} from "lucide-react";


import {
  fetchUserLists,
  fetchUserListDetail,
  createUserList,
  updateUserList,
  deleteUserList,
  shareUserList,
  unshareUserList,
  addPlaceToUserList,
  removePlaceFromUserList,
  fetchPrivatePlaces,
  fetchPublicPlaces,
  fetchAllPublicPlaces,
  fetchTags,

  updatePrivatePlace,
  deletePrivatePlace,
  fetchMyReviews,
  deleteReview,
  fetchUserIcon,
  updateUserIcon,
  invalidateCache,
} from "../services/placeService";




import aloneImg from "/imgs/alone.png";
import friendsImg from "/imgs/friends.png";
import coupleImg from "/imgs/couple.png";
import familyImg from "/imgs/family.png";
import etcImg from "/imgs/etc.png";
import ImageWithSkeleton from "../components/common/ImageWithSkeleton";


// LOCA 서비스 이용방법 4단계 가이드 데이터 (GIF 시연 및 상세 설명 포함)
const GUIDE_STEPS = [
  {
    id: "explore",
    number: "1",
    title: "1. EXPLORE (탐색)",
    summary: "지도와 카테고리로 홍대 주변의 추천 공용 스팟과 개인 장소를 한눈에 확인하세요.",
    icon: Compass,
    iconColor: "text-zinc-800",
    iconBg: "bg-zinc-100",
    gif: "/imgs/guide_explore.gif",
    fallbackImg: "/imgs/start.png",
    description: "홍대 곳곳의 감성 카페와 맛집을 인터랙티브 지도로 탐험하고, 카카오맵 길찾기와 생생한 리뷰를 즉시 확인할 수 있습니다.",
    features: [
      "지도 기반 실시간 스팟 마커 & 카카오맵 연동",
      "분위기/카테고리 태그별 원클릭 필터링",
      "공개 장소와 나만의 비밀 장소(개인) 토글",
    ],
  },
  {
    id: "foryou",
    number: "2",
    title: "2. FOR YOU (맞춤 추천)",
    summary: "작성한 리뷰 데이터를 바탕으로 내 취향에 딱 맞는 장소를 추천받으세요.",
    icon: Sparkles,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    gif: "/imgs/guide_foryou.gif",
    fallbackImg: "/imgs/Foryou.png",
    description: "로카프렌즈 4인방이 내가 작성한 리뷰 키워드를 분석하여 취향에 꼭 맞는 장소 5곳을 엄선해 해금해드립니다.",
    features: [
      "리뷰 3개 작성 시 취향 분석 알고리즘 해금",
      "나만을 위해 엄선된 Top 5 추천 카드 슬라이더",
      "새로운 장소 발굴을 위한 실시간 다시 추천받기",
    ],
  },
  {
    id: "review",
    number: "3",
    title: "3. ADD & REVIEW (기록 & 공유)",
    summary: "새로운 장소를 등록하고, 방문 경험과 동행자, 분위기 태그를 리뷰로 남겨보세요.",
    icon: MapPin,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
    gif: "/imgs/guide_review.gif",
    fallbackImg: "/imgs/alone.png",
    description: "누구와 방문했는지(혼자/친구/연인/가족), 어떤 분위기였는지 솔직한 리뷰와 사진을 남겨 다른 사람들과 공유해보세요.",
    features: [
      "4가지 동행인(혼자/친구/연인/가족)별 감성 기록",
      "0ms 즉각 검색과 스마트 장소 선택 박스",
      "사진 업로드 및 다채로운 키워드 태그 지정",
    ],
  },
  {
    id: "my",
    number: "4",
    title: "4. MY (나만의 보관함)",
    summary: "내가 등록한 장소와 남긴 리뷰들을 편리하게 모아보고 관리하세요.",
    icon: User,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50",
    gif: "/imgs/guide_my.gif",
    fallbackImg: "/imgs/Login.png",
    description: "내가 저장한 비밀 스팟과 작성한 리뷰를 언제든 수정·삭제하고, 12종의 귀여운 로카프렌즈 아바타로 프로필을 꾸며보세요.",
    features: [
      "12종의 2D 카툰 로카프렌즈 프로필 아바타 꾸미기",
      "내가 등록한 장소와 남긴 리뷰 모아보기 및 관리",
      "언제 어디서나 간편한 계정 정보 동기화",
    ],
  },
];

// 12종 프로필 아이콘 프리셋 (id 1: 기본 프로필 + id 2~12: 11종 2D 카툰 로카프렌즈 아이콘)
export const PROFILE_ICONS = [
  { id: 1, type: "icon", icon: User, bg: "bg-gray-100", color: "text-gray-500" },
  { id: 2, type: "image", src: "/imgs/icons/icon_2.png", bg: "bg-white" },
  { id: 3, type: "image", src: "/imgs/icons/icon_3.png", bg: "bg-white" },
  { id: 4, type: "image", src: "/imgs/icons/icon_4.png", bg: "bg-white" },
  { id: 5, type: "image", src: "/imgs/icons/icon_5.png", bg: "bg-white" },
  { id: 6, type: "image", src: "/imgs/icons/icon_6.png", bg: "bg-white" },
  { id: 7, type: "image", src: "/imgs/icons/icon_7.png", bg: "bg-white" },
  { id: 8, type: "image", src: "/imgs/icons/icon_8.png", bg: "bg-white" },
  { id: 9, type: "image", src: "/imgs/icons/icon_9.png", bg: "bg-white" },
  { id: 10, type: "image", src: "/imgs/icons/icon_10.png", bg: "bg-white" },
  { id: 11, type: "image", src: "/imgs/icons/icon_11.png", bg: "bg-white" },
  { id: 12, type: "image", src: "/imgs/icons/icon_12.png", bg: "bg-white" },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [expandedGuideStep, setExpandedGuideStep] = useState(null);

  // 이용방법 모달이 열릴 때 항상 모든 아코디언이 닫힌 상태로 초기화
  useEffect(() => {
    if (showGuideModal) {
      setExpandedGuideStep(null);
    }
  }, [showGuideModal]);




  // 탭 상태: 'places' | 'reviews'
  // 탭 상태: 'places' | 'lists' | 'reviews'
  const [activeTab, setActiveTab] = useState("places");

  // 내 장소 목록 관련 상태
  const [myPlaces, setMyPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState(null);

  // 내 리스트 목록 관련 상태 (GET/POST /api/users/me/lists, GET/PUT/DELETE /api/users/me/lists/{id}, share, items)
  const [userLists, setUserLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [listsError, setListsError] = useState(null);
  const [deletingListId, setDeletingListId] = useState(null);
  const [sharingListId, setSharingListId] = useState(null);
  const [sharedLinks, setSharedLinks] = useState({}); // { [listId]: { shareToken, sharedAt, shareUrl, copied } }
  const [toastMessage, setToastMessage] = useState(null);

  // 리스트 생성 모달 상태
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [createListError, setCreateListError] = useState(null);

  // 리스트 수정 모달 상태
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editListName, setEditListName] = useState("");
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  const [updateListError, setUpdateListError] = useState(null);



  // 리스트 상세 & 포함 장소 보기 모달 상태
  const [selectedListDetail, setSelectedListDetail] = useState(null);
  const [isLoadingListDetail, setIsLoadingListDetail] = useState(false);
  const [listDetailError, setListDetailError] = useState(null);
  const [deletingListItemId, setDeletingListItemId] = useState(null);

  // 리스트에 장소 추가 모달 상태
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [addPlaceTab, setAddPlaceTab] = useState("private"); // "private" (개인 장소) | "public" (공용 장소)
  const [addPlaceSearch, setAddPlaceSearch] = useState("");
  const [addingPlaceId, setAddingPlaceId] = useState(null);
  const [publicPlaces, setPublicPlaces] = useState([]);
  const [isLoadingPublicPlaces, setIsLoadingPublicPlaces] = useState(false);
  const [addPlaceError, setAddPlaceError] = useState(null);


  // 내 리뷰 목록 관련 상태
  const [myReviews, setMyReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // 장소 수정 모달 상태
  const [editingPlace, setEditingPlace] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    lat: "37.5563",
    lng: "126.9227",
    isShareable: false,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // 장소 삭제 진행 중인 ID
  const [deletingPlaceId, setDeletingPlaceId] = useState(null);

  // 장소 ID별 장소 객체/이름 매핑 맵 & 태그 ID별 태그명 매핑 맵
  const [placeMap, setPlaceMap] = useState({});
  const [tagMap, setTagMap] = useState({});

  // 전체 태그 목록 불러와 tagMap 완성 (비동기 독립 실행)
  const loadTags = async () => {
    try {
      const tags = await fetchTags();
      if (Array.isArray(tags)) {
        const tMap = {};
        tags.forEach((t) => {
          const tId = t.tagId ?? t.id;
          const tName = t.name ?? t.tagName;
          if (tId !== undefined && tName) {
            tMap[tId] = tName;
          }
        });
        setTagMap(tMap);
      }
    } catch (e) {
      console.warn("Tags load in MyPage warn:", e);
    }
  };

  // 내 등록 장소 목록 불러오기 (GET /api/places/custom)
  const loadMyPlaces = async (forceRefresh = false) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (forceRefresh) {
      invalidateCache("privatePlaces");
    }

    setIsLoadingPlaces(true);
    setPlacesError(null);

    try {
      const privates = await fetchPrivatePlaces();
      const list = Array.isArray(privates) ? privates : (privates?.content || []);
      setMyPlaces(list);
      setPlaceMap((prev) => {
        const mapObj = { ...prev };
        list.forEach((p) => {
          const pId = p.placeId ?? p.id;
          if (pId !== undefined && pId !== null) mapObj[pId] = p;
          if (p.kakaoPlaceId) mapObj[p.kakaoPlaceId] = p;
        });
        return mapObj;
      });
    } catch (err) {
      console.error("Load My Places Error:", err);
      setPlacesError(err.message || "내 장소 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // 내 리스트 목록 불러오기 (GET /api/users/me/lists)
  const hasLoadedListsRef = useRef(false);
  const loadUserLists = async (forceRefresh = false) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (forceRefresh) {
      invalidateCache("userLists");
    }

    setIsLoadingLists(true);
    setListsError(null);

    try {
      const data = await fetchUserLists();
      const lists = Array.isArray(data) ? data : (data?.content || []);
      setUserLists(lists);
      hasLoadedListsRef.current = true;
    } catch (err) {
      console.error("Load User Lists Error:", err);
      setListsError(err.message || "내 리스트 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingLists(false);
    }
  };

  // 새 리스트 생성 (POST /api/users/me/lists)
  const handleCreateListSubmit = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) {
      setCreateListError("리스트 이름을 입력해주세요.");
      return;
    }

    setIsCreatingList(true);
    setCreateListError(null);

    try {
      await createUserList({ name: newListName.trim() });
      setNewListName("");
      setShowCreateListModal(false);
      loadUserLists(true);
    } catch (err) {
      console.error("Create User List Error:", err);
      setCreateListError(err.message || "리스트 생성에 실패했습니다.");
    } finally {
      setIsCreatingList(false);
    }
  };

  // 리스트 수정 (PUT /api/users/me/lists/{listId})
  const handleUpdateListSubmit = async (e) => {
    e.preventDefault();
    if (!editingList || !editListName.trim()) {
      setUpdateListError("리스트 이름을 입력해주세요.");
      return;
    }

    setIsUpdatingList(true);
    setUpdateListError(null);

    try {
      const listId = editingList.listId || editingList.id;
      await updateUserList(listId, { name: editListName.trim() });
      setShowEditListModal(false);
      setEditingList(null);
      loadUserLists(true);
      if (selectedListDetail && (selectedListDetail.listId || selectedListDetail.id) === listId) {
        setSelectedListDetail((prev) => ({ ...prev, name: editListName.trim() }));
      }
    } catch (err) {
      console.error("Update User List Error:", err);
      setUpdateListError(err.message || "리스트 수정에 실패했습니다.");
    } finally {
      setIsUpdatingList(false);
    }
  };

  // 리스트 삭제 (DELETE /api/users/me/lists/{listId})
  const handleDeleteList = async (list) => {
    const listId = list.listId || list.id;
    if (!window.confirm(`정말로 [${list.name}] 리스트를 삭제하시겠습니까?`)) return;

    setDeletingListId(listId);
    try {
      await deleteUserList(listId);
      setUserLists((prev) => prev.filter((l) => (l.listId || l.id) !== listId));
      if (selectedListDetail && (selectedListDetail.listId || selectedListDetail.id) === listId) {
        setSelectedListDetail(null);
      }
    } catch (err) {
      console.error("Delete User List Error:", err);
      alert(err.message || "리스트 삭제에 실패했습니다.");
    } finally {
      setDeletingListId(null);
    }
  };

  // 리스트 공유 링크 생성 및 멘트와 함께 복사 (POST /api/users/me/lists/{listId}/share)
  const handleShareList = async (list, e) => {
    if (e) e.stopPropagation();
    const listId = list.listId || list.id;

    setSharingListId(listId);
    try {
      const res = await shareUserList(listId);
      const token = res?.shareToken || res?.token || "";
      const shareUrl = token
        ? `${window.location.origin}/share/list/${token}`
        : `${window.location.origin}/list/${listId}`;

      const listName = list?.name || "LOCA 장소 리스트";
      const count = list?.itemCount ?? (Array.isArray(list?.items) ? list.items.length : 0);
      const countText = count > 0 ? ` (${count}곳)` : "";
      const shareText = `[LOCA] 📍 '${listName}'${countText} 장소 모음을 공유받았어요!\n\n제가 추천하는 특별한 스팟들을 확인해보세요 ✨\n🔗 ${shareUrl}`;

      // 클립보드에 멘트 + 링크 함께 복사
      try {
        await navigator.clipboard.writeText(shareText);
      } catch (clipErr) {
        console.warn("Clipboard copy fallback:", clipErr);
      }

      // 카드 아래쪽에 링크 및 멘트 정보 저장
      setSharedLinks((prev) => ({
        ...prev,
        [listId]: {
          shareToken: token,
          sharedAt: res?.sharedAt || new Date().toISOString(),
          shareUrl,
          shareText,
          copied: true,
        },
      }));

      // 하단 토스트 알림
      setToastMessage("링크 복사 완료!");
      setTimeout(() => setToastMessage(null), 3000);

    } catch (err) {
      console.error("Share List Error:", err);
      alert(err.message || "리스트 공유에 실패했습니다.");
    } finally {
      setSharingListId(null);
    }
  };



  // 리스트 상세 보기 및 장소 목록 열기 (GET /api/users/me/lists/{listId})
  const handleOpenListDetail = async (list) => {
    const listId = list.listId || list.id;
    setSelectedListDetail(list);
    setIsLoadingListDetail(true);
    setListDetailError(null);

    try {
      const detail = await fetchUserListDetail(listId);
      setSelectedListDetail(detail || list);
    } catch (err) {
      console.error("Load List Detail Error:", err);
      setListDetailError(err.message || "리스트 상세 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoadingListDetail(false);
    }
  };

  // 리스트에서 장소 삭제 (DELETE /api/users/me/lists/{listId}/items/{placeId})
  const handleRemovePlaceFromList = async (listId, placeId) => {
    if (!window.confirm("이 장소를 리스트에서 삭제하시겠습니까?")) return;

    setDeletingListItemId(placeId);
    try {
      await removePlaceFromUserList(listId, placeId);
      if (selectedListDetail) {
        setSelectedListDetail((prev) => ({
          ...prev,
          items: (prev.items || []).filter((item) => (item.placeId || item.id) !== placeId),
          itemCount: Math.max(0, (prev.itemCount || (prev.items || []).length) - 1),
        }));
      }
      loadUserLists(true);
    } catch (err) {
      console.error("Remove Place From List Error:", err);
      alert(err.message || "장소 삭제에 실패했습니다.");
    } finally {
      setDeletingListItemId(null);
    }
  };

  // 공용 장소 목록 전체 불러오기 (장소 담기 모달용 - explore와 동일한 전수 로딩 & 캐시 메커니즘)
  const loadPublicPlacesForAddModal = async () => {
    if (publicPlaces.length >= 100) return;
    setIsLoadingPublicPlaces(publicPlaces.length === 0);
    try {
      // 1단계: 첫 페이지 즉시 표시 (빠른 체감 속도)
      if (publicPlaces.length === 0) {
        const page0 = await fetchPublicPlaces(0, 30);
        const page0List = page0?.content || (Array.isArray(page0) ? page0 : []);
        if (page0List.length > 0) {
          setPublicPlaces(page0List);
        }
      }

      // 2단계: 전체 페이지 병렬 전수 로드 (최대 15개 페이지 = 450개+ 장소)
      const fullList = await fetchAllPublicPlaces(15);
      if (fullList && fullList.length > 0) {
        setPublicPlaces(fullList);
      }
    } catch (err) {
      console.error("Load Public Places For Modal Error:", err);
    } finally {
      setIsLoadingPublicPlaces(false);
    }
  };



  // 리스트에 장소 추가 (POST /api/users/me/lists/{listId}/items)
  const handleAddPlaceToListSubmit = async (placeId) => {
    if (!selectedListDetail) return;
    const listId = selectedListDetail.listId || selectedListDetail.id;

    setAddingPlaceId(placeId);
    setAddPlaceError(null);

    try {
      await addPlaceToUserList(listId, placeId);
      const freshDetail = await fetchUserListDetail(listId);
      setSelectedListDetail(freshDetail || selectedListDetail);
      loadUserLists(true);
      setToastMessage("리스트에 장소가 추가되었습니다!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Add Place To List Error:", err);
      setAddPlaceError(err.message || "장소 추가에 실패했습니다.");
    } finally {
      setAddingPlaceId(null);
    }
  };


  // 공유 링크 복사 핸들러
  const handleCopyShareLink = (list) => {
    const listId = list.listId || list.id;
    const url = `${window.location.origin}/list/${listId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShareId(listId);
      setTimeout(() => setCopiedShareId(null), 2000);
    });
  };

  // 내 작성 리뷰 목록 및 장소 매핑 불러오기 (작성 리뷰 탭 진입 시 지연 로딩)
  const hasLoadedReviewsRef = useRef(false);
  const loadMyReviews = async (forceRefresh = false) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (forceRefresh) {
      invalidateCache("myReviews");
    }

    setIsLoadingReviews(true);
    setReviewsError(null);

    try {
      const [reviews, pubRes] = await Promise.allSettled([
        fetchMyReviews(),
        fetchPublicPlaces(0, 100),
      ]);

      if (reviews.status === "fulfilled") {
        const rList = Array.isArray(reviews.value) ? reviews.value : (reviews.value?.content || []);
        setMyReviews(rList);
        hasLoadedReviewsRef.current = true;
      } else {
        throw reviews.reason;
      }

      if (pubRes.status === "fulfilled") {
        const publics = Array.isArray(pubRes.value) ? pubRes.value : (pubRes.value?.content || []);
        setPlaceMap((prev) => {
          const mapObj = { ...prev };
          publics.forEach((p) => {
            const pId = p.placeId ?? p.id;
            if (pId !== undefined && pId !== null && !mapObj[pId]) mapObj[pId] = p;
            if (p.kakaoPlaceId && !mapObj[p.kakaoPlaceId]) mapObj[p.kakaoPlaceId] = p;
          });
          return mapObj;
        });
      }
    } catch (err) {
      console.error("Load My Reviews Error:", err);
      setReviewsError(err.message || "내 리뷰 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // 프로필 아이콘 관련 상태 (1~12)
  const [currentIconId, setCurrentIconId] = useState(1);
  const [showIconModal, setShowIconModal] = useState(false);
  const [isSavingIcon, setIsSavingIcon] = useState(false);
  const [iconError, setIconError] = useState(null);

  // 유저 아이콘 ID 불러오기 (GET /api/users/me/icon)
  const loadUserIcon = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const iconId = await fetchUserIcon();
      if (iconId) {
        setCurrentIconId(Number(iconId));
      }
    } catch (e) {
      console.warn("User icon load warn:", e);
    }
  };

  // 아이콘 변경 제출 (PUT /api/users/me/icon)
  const handleSelectIcon = async (iconId) => {
    setIsSavingIcon(true);
    setIconError(null);
    try {
      await updateUserIcon(iconId);
      setCurrentIconId(Number(iconId));
      setShowIconModal(false);
    } catch (err) {
      console.error("Update User Icon Error:", err);
      setIconError(err.message || "아이콘 변경에 실패했습니다.");
    } finally {
      setIsSavingIcon(false);
    }
  };

  // 초기 마운트: 기본 탭(등록 장소)과 프로필만 즉시 로드하여 초고속 렌더링
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setUserEmail(savedEmail);
    }

    loadUserIcon();
    loadTags();
    loadMyPlaces();
    loadPublicPlacesForAddModal();
  }, []);


  // '내 리스트' 탭으로 전환 시 로딩
  useEffect(() => {
    if (activeTab === "lists") {
      loadUserLists();
    }
  }, [activeTab]);


  // '작성 리뷰' 탭으로 전환 시 지연 로딩
  useEffect(() => {
    if (activeTab === "reviews" && !hasLoadedReviewsRef.current) {
      loadMyReviews();
    }
  }, [activeTab]);



  // 장소 수정 모달 열기
  const handleOpenEditModal = (place) => {
    setEditingPlace(place);
    setEditForm({
      name: place.name || "",
      address: place.address || "",
      lat: place.lat ? place.lat.toString() : "37.5563",
      lng: place.lng ? place.lng.toString() : "126.9227",
      isShareable: Boolean(place.isShareable),
    });
    setEditError(null);
  };

  // 장소 수정 API 전송
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlace) return;

    if (!editForm.name.trim()) {
      setEditError("장소 이름을 입력해주세요.");
      return;
    }
    if (!editForm.address.trim()) {
      setEditError("주소를 입력해주세요.");
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);

    const placeId = editingPlace.placeId || editingPlace.id;

    try {
      await updatePrivatePlace(placeId, {
        name: editForm.name.trim(),
        address: editForm.address.trim(),
        lat: editForm.lat,
        lng: editForm.lng,
        isShareable: editForm.isShareable,
      });

      alert(`[${editForm.name}] 장소 정보가 수정되었습니다.`);
      setEditingPlace(null);
      loadMyPlaces();
    } catch (err) {
      console.error("Update Custom Place Error:", err);
      setEditError(err.message || "장소 수정 중 에러가 발생했습니다.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // 장소 삭제 API 전송
  const handleDeletePlace = async (place) => {
    const placeId = place.placeId || place.id;
    if (!window.confirm(`정말로 [${place.name}] 장소를 삭제하시겠습니까?`)) return;

    setDeletingPlaceId(placeId);
    try {
      await deletePrivatePlace(placeId);
      alert("장소가 삭제되었습니다.");
      loadMyPlaces();
    } catch (err) {
      console.error("Delete Custom Place Error:", err);
      alert(err.message || "장소 삭제 중 에러가 발생했습니다.");
    } finally {
      setDeletingPlaceId(null);
    }
  };

  // 리뷰 삭제 API 전송
  const handleDeleteReview = async (review) => {
    const reviewId = review.reviewId || review.visitId || review.id;
    if (!window.confirm(`정말로 이 리뷰([${review.title}])를 삭제하시겠습니까?`)) return;

    setDeletingReviewId(reviewId);
    try {
      await deleteReview(reviewId);
      alert("리뷰가 삭제되었습니다.");
      loadMyReviews();
    } catch (err) {
      console.error("Delete Review Error:", err);
      alert(err.message || "리뷰 삭제 중 에러가 발생했습니다.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    navigate("/onboarding", { replace: true });
  };

  const companionConfigMap = {
    ALONE: { label: "혼자", img: aloneImg },
    FRIEND: { label: "친구와", img: friendsImg },
    LOVER: { label: "연인과", img: coupleImg },
    FAMILY: { label: "가족과", img: familyImg },
    ETC: { label: "기타", img: etcImg },
  };

  const companionLabelMap = {
    ALONE: "혼자",
    FRIEND: "친구와",
    LOVER: "연인과",
    FAMILY: "가족과",
    ETC: "기타",
  };

  return (
    <div className="w-full space-y-5 bg-white flex flex-col h-full select-none text-left overflow-y-auto">
      {/* Header Title & LOCA 이용방법 버튼 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#111]">마이페이지</h1>
        <button
          type="button"
          onClick={() => {
            setExpandedGuideStep(null);
            setShowGuideModal(true);
          }}
          className="text-xs text-gray-400 hover:text-gray-600 bg-transparent transition-colors cursor-pointer py-1"
        >
          LOCA 이용방법
        </button>

      </div>


      {/* User Info Profile Card */}
      <div className="flex items-center justify-between bg-white py-2">
        <div className="flex items-center space-x-3.5">
          {/* 내 프로필 아이콘 아바타 + 우측 하단 수정 버튼 */}
          <div className="relative group">
            {/* 아바타 원형 컨테이너 */}
            <div
              onClick={() => setShowIconModal(true)}
              className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 shadow-2xs cursor-pointer transition-transform active:scale-95 ${
                PROFILE_ICONS.find((i) => i.id === currentIconId)?.bg || "bg-gray-100"
              }`}
            >
              {(() => {
                const current = PROFILE_ICONS.find((i) => i.id === currentIconId) || PROFILE_ICONS[0];
                if (current.type === "image") {
                  return (
                    <img
                      src={current.src}
                      alt={current.name}
                      className="w-11 h-11 object-contain drop-shadow-xs"
                    />
                  );
                }
                if (current.type === "icon-svg") {
                  return <span className="text-2xl">{current.emoji}</span>;
                }
                return <User size={26} className={current.color || "text-gray-500"} />;
              })()}
            </div>

            {/* 오른쪽 아래 수정(연필) 아이콘 버튼 */}
            <button
              type="button"
              onClick={() => setShowIconModal(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#111] text-white flex items-center justify-center shadow-md hover:bg-gray-800 active:scale-90 transition-all cursor-pointer ring-2 ring-white"
              aria-label="아이콘 수정"
            >
              <Edit2 size={11} strokeWidth={2.5} />
            </button>
          </div>

          <div>
            <p className="text-base font-bold text-[#111]">
              {userEmail ? userEmail.split("@")[0] : "사용자"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{userEmail || "로그인이 필요합니다"}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
        >
          로그아웃
        </button>
      </div>

      {/* 탭 구분 (3개 탭: 등록 장소 | 내 리스트 | 작성 리뷰) */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("places")}
          className={`flex-1 py-3 text-sm transition-all text-center cursor-pointer ${
            activeTab === "places"
              ? "text-[#111] font-bold border-b-2 border-[#111]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          등록 장소
        </button>
        <button
          onClick={() => setActiveTab("lists")}
          className={`flex-1 py-3 text-sm transition-all text-center cursor-pointer ${
            activeTab === "lists"
              ? "text-[#111] font-bold border-b-2 border-[#111]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          내 리스트
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 py-3 text-sm transition-all text-center cursor-pointer ${
            activeTab === "reviews"
              ? "text-[#111] font-bold border-b-2 border-[#111]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          작성 리뷰
        </button>
      </div>

      {/* TAB 1: 등록 장소 */}
      {activeTab === "places" && (
        <div className="flex flex-col flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-[#111]">총 {myPlaces.length}개</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadMyPlaces(true)}
                disabled={isLoadingPlaces}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title="새로고침"
              >
                <RefreshCw size={16} className={isLoadingPlaces ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => navigate("/add")}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title="장소 추가"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {placesError && (
            <div className="text-sm text-red-500 py-2">{placesError}</div>
          )}

          {isLoadingPlaces ? (
            <div className="space-y-3 pb-6 animate-fade-in">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 animate-pulse"
                >
                  <div className="flex flex-col space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-28 h-4 bg-gray-200 rounded" />
                      <div className="w-12 h-3.5 bg-gray-100 rounded" />
                    </div>
                    <div className="w-48 h-3 bg-gray-100 rounded" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-100 rounded" />
                    <div className="w-6 h-6 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : myPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <p className="text-sm">등록된 장소가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {myPlaces.map((place) => {
                const placeId = place.placeId || place.id;
                const isDeletingThis = deletingPlaceId === placeId;

                return (
                  <div
                    key={placeId}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-[#111]">
                          {place.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {place.isShareable ? "전체공개" : "나만보기"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{place.address}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(place)}
                        className="p-1.5 text-gray-300 hover:text-gray-600 cursor-pointer"
                        title="장소 수정"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place)}
                        disabled={isDeletingThis}
                        className="p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-50 cursor-pointer"
                        title="장소 삭제"
                      >
                        {isDeletingThis ? (
                          <Loader2 size={16} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 내 리스트 */}
      {activeTab === "lists" && (
        <div className="flex flex-col flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-[#111]">총 {userLists.length}개</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadUserLists(true)}
                disabled={isLoadingLists}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title="새로고침"
              >
                <RefreshCw size={16} className={isLoadingLists ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => {
                  setNewListName("");
                  setCreateListError(null);
                  setShowCreateListModal(true);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title="새 리스트 만들기"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>


          {listsError && (
            <div className="text-sm text-red-500 py-2">{listsError}</div>
          )}

          {isLoadingLists ? (
            <div className="space-y-3 pb-6 animate-fade-in">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 animate-pulse"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                    <div className="flex flex-col space-y-2 flex-1">
                      <div className="w-32 h-4 bg-gray-200 rounded" />
                      <div className="w-20 h-3 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-gray-100 rounded-md" />
                </div>
              ))}
            </div>
          ) : userLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <p className="text-sm">생성된 리스트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {userLists.map((list) => {
                const listId = list.listId || list.id;
                const isDeleting = deletingListId === listId;
                const isSharing = sharingListId === listId;

                return (

                  <div
                    key={listId}
                    onClick={() => handleOpenListDetail(list)}
                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:border-gray-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* 폴더 아이콘 & 리스트명 & 장소 개수 */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 flex-none group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <Folder size={20} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-[#111] truncate group-hover:text-indigo-600 transition-colors">
                            {list.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            장소 {list.itemCount ?? 0}개
                            {list.createdAt && ` · ${new Date(list.createdAt).toLocaleDateString("ko-KR")}`}
                          </p>
                        </div>
                      </div>

                      {/* 액션 버튼 그룹 */}
                      <div
                        className="flex items-center space-x-1 flex-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 공유하기 버튼 (연필 왼쪽) */}
                        <button
                          type="button"
                          onClick={(e) => handleShareList(list, e)}
                          disabled={sharingListId === listId}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="리스트 공유 링크 생성 및 복사"
                        >
                          {sharingListId === listId ? (
                            <Loader2 size={15} className="animate-spin text-indigo-600" />
                          ) : (
                            <Share2 size={15} />
                          )}
                        </button>

                        {/* 수정 버튼 */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingList(list);
                            setEditListName(list.name);
                            setUpdateListError(null);
                            setShowEditListModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="리스트 이름 수정"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={() => handleDeleteList(list)}
                          disabled={isDeleting}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="리스트 삭제"
                        >
                          {isDeleting ? (
                            <Loader2 size={15} className="animate-spin text-red-500" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 공유 링크 확장 패널 (아래쪽에 좌라락 펼쳐짐) */}
                    {sharedLinks[listId] && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 pt-3 border-t border-gray-100/90 space-y-2 animate-fade-in cursor-default"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-emerald-600">
                            <CheckCheck size={14} className="flex-none" />
                            <span className="text-xs font-bold">링크 복사 완료!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSharedLinks((prev) => {
                                const next = { ...prev };
                                delete next[listId];
                                return next;
                              });
                            }}
                            className="p-1 text-gray-300 hover:text-gray-600 rounded-md cursor-pointer"
                            title="닫기"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* URL 박스 & 다시 복사 버튼 */}
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-xl p-1.5">
                          <input
                            type="text"
                            readOnly
                            value={sharedLinks[listId].shareUrl}
                            className="bg-transparent text-[11px] text-gray-700 font-mono flex-1 px-1.5 outline-none select-all truncate"
                            onClick={(e) => e.target.select()}
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const textToCopy = sharedLinks[listId].shareText || sharedLinks[listId].shareUrl;
                              await navigator.clipboard.writeText(textToCopy);
                              setToastMessage("링크 복사 완료!");
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer flex-none"
                            title="다시 복사"
                          >
                            <Copy size={12} />
                            <span>복사</span>
                          </button>


                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          )}
        </div>
      )}

      {/* TAB 3: 작성 리뷰 */}
      {activeTab === "reviews" && (

        <div className="flex flex-col flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-[#111]">총 {myReviews.length}개</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadMyReviews(true)}
                disabled={isLoadingReviews}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title="새로고침"
              >
                <RefreshCw size={16} className={isLoadingReviews ? "animate-spin" : ""} />
              </button>

              <button
                onClick={() => navigate("/review")}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {reviewsError && (
            <div className="text-sm text-red-500 py-2">{reviewsError}</div>
          )}

          {isLoadingReviews ? (
            <div className="space-y-3 pb-6 animate-fade-in">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-2xl border border-gray-100 animate-pulse space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-3.5 bg-gray-200 rounded" />
                        <div className="w-12 h-3.5 bg-gray-100 rounded" />
                      </div>
                      <div className="w-36 h-4 bg-gray-200 rounded" />
                      <div className="w-full h-8 bg-gray-100 rounded" />
                    </div>
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex-none" />
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <div className="w-14 h-5 bg-gray-100 rounded-lg" />
                    <div className="w-16 h-5 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : myReviews.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <p className="text-sm">작성한 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {myReviews.map((review) => {
                const reviewId = review.reviewId || review.visitId || review.id;
                const isDeletingThis = deletingReviewId === reviewId;
                const targetPlace = placeMap[review.placeId] || placeMap[review.place?.placeId] || review.place;
                const placeName = review.placeName || review.place?.name || (targetPlace ? targetPlace.name : `장소 #${review.placeId}`);

                // 리뷰에 첨부된 실제 사진 URL (imageUrls 배열의 첫 번째 또는 imageUrl)
                const reviewPhoto = (Array.isArray(review.imageUrls) && review.imageUrls.length > 0)
                  ? review.imageUrls[0]
                  : review.imageUrl || targetPlace?.imageUrl;

                const handleNavigateToPlace = () => {
                  if (targetPlace) {
                    navigate("/explore", { state: { place: targetPlace } });
                  } else {
                    navigate("/explore");
                  }
                };

                const compConfig = companionConfigMap[review.companion];

                return (
                  <div
                    key={reviewId}
                    className="p-4 bg-white rounded-2xl border border-gray-100/90 shadow-2xs hover:border-gray-200 transition-all cursor-pointer"
                    onClick={handleNavigateToPlace}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* 좌측: 장소명, 동행자 뱃지(텍스트+아이콘), 제목, 방문날짜, 내용 미리보기 */}
                      <div className="flex flex-col min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="text-xs font-bold text-gray-700 truncate">
                            {placeName}
                          </span>
                          {compConfig && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs">
                              {compConfig.label}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-[#111] truncate">
                          {review.title || "제목 없음"}
                        </h3>

                        {review.visitedAt && (
                          <p className="text-[11px] text-gray-400">
                            {new Date(review.visitedAt).toLocaleDateString("ko-KR")} 방문
                          </p>
                        )}

                        <p className="text-xs text-gray-600 line-clamp-2 pt-1">
                          {review.content}
                        </p>
                      </div>

                      {/* 우측: 실제 리뷰 사진 썸네일 & 삭제 버튼 */}
                      <div className="flex flex-col items-end space-y-2 flex-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReview(review);
                          }}
                          disabled={isDeletingThis}
                          className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {isDeletingThis ? (
                            <Loader2 size={15} className="animate-spin text-red-500" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>

                        <div className="w-20 h-20 rounded-md bg-gray-50 border border-gray-200 overflow-hidden shadow-2xs flex items-center justify-center">
                          {reviewPhoto ? (
                            <ImageWithSkeleton
                              src={reviewPhoto}
                              alt={placeName}
                              fallback={
                                compConfig ? (
                                  <img
                                    src={compConfig.img}
                                    alt={compConfig.label}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <MapPin size={20} />
                                  </div>
                                )
                              }
                              wrapperClassName="w-full h-full"
                              className="w-full h-full object-cover"
                            />
                          ) : compConfig ? (
                            <ImageWithSkeleton
                              src={compConfig.img}
                              alt={compConfig.label}
                              wrapperClassName="w-full h-full"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <MapPin size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 여러 장의 사진이 첨부된 경우 작은 썸네일 목록 */}
                    {Array.isArray(review.imageUrls) && review.imageUrls.length > 1 && (
                      <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                        {review.imageUrls.map((imgUrl, imgIdx) => (
                          <ImageWithSkeleton
                            key={imgIdx}
                            src={imgUrl}
                            alt={`사진 ${imgIdx + 1}`}
                            wrapperClassName="w-10 h-10 rounded-md overflow-hidden border border-gray-200 flex-none"
                            className="w-full h-full object-cover"
                          />
                        ))}
                      </div>
                    )}


                    {/* 태그 & 키워드 칩 표시 (분위기 태그 tagIds + 커스텀 키워드 keywords) */}
                    {(() => {
                      // 1. tagIds 기반 태그명 추출
                      const resolvedTags = [];
                      if (Array.isArray(review.tagIds)) {
                        review.tagIds.forEach((tId) => {
                          const name = tagMap[tId];
                          if (name && !resolvedTags.includes(name)) {
                            resolvedTags.push(name);
                          }
                        });
                      }
                      // 2. 만약 장소 객체에 tags가 있다면 보강
                      if (resolvedTags.length === 0 && Array.isArray(targetPlace?.tags)) {
                        targetPlace.tags.forEach((t) => {
                          const name = typeof t === "string" ? t : (t.name || t.tagName);
                          if (name && !resolvedTags.includes(name)) {
                            resolvedTags.push(name);
                          }
                        });
                      }

                      // 3. 커스텀 키워드
                      const customKws = Array.isArray(review.keywords) ? review.keywords : [];

                      if (resolvedTags.length === 0 && customKws.length === 0) return null;

                      return (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {/* 분위기 태그 (tagIds) */}
                          {resolvedTags.map((tagText, idx) => (
                            <span
                              key={`tag-${idx}`}
                              className="bg-indigo-50 text-indigo-700 font-medium text-xs rounded-lg px-2 py-0.5"
                            >
                              #{tagText}
                            </span>
                          ))}

                          {/* 커스텀 키워드 (keywords) */}
                          {customKws.map((kw, idx) => (
                            <span
                              key={`kw-${idx}`}
                              className="bg-gray-100 text-gray-600 text-xs rounded-lg px-2 py-0.5"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 장소 수정 모달 */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs space-y-4">
            <h3 className="text-base font-bold text-[#111]">장소 수정</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">장소 이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">주소</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">공개 설정</label>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isShareable: false })}
                    className={`flex-1 py-1.5 rounded-md text-sm transition-all ${
                      !editForm.isShareable ? "bg-white text-[#111] font-semibold shadow-sm" : "text-gray-500"
                    }`}
                  >
                    나만 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isShareable: true })}
                    className={`flex-1 py-1.5 rounded-md text-sm transition-all ${
                      editForm.isShareable ? "bg-white text-[#111] font-semibold shadow-sm" : "text-gray-500"
                    }`}
                  >
                    전체 공개
                  </button>
                </div>
              </div>

              {editError && <p className="text-sm text-red-500">{editError}</p>}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#111] text-white text-sm font-bold flex items-center justify-center"
                >
                  {isSubmittingEdit ? <Loader2 size={16} className="animate-spin" /> : "수정 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 프로필 아이콘 변경 모달 (12종 프리셋 선택) */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm text-left space-y-4 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-none">
              <h3 className="text-base font-bold text-[#111]">프로필 아이콘 설정</h3>
              <button
                onClick={() => setShowIconModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold p-1 cursor-pointer"
              >
                닫기
              </button>
            </div>

            {/* 12종 아이콘 그리드 (3열 x 4행) */}
            {/* 12종 아이콘 그리드 (3열 x 4행) - 각진 박스 & 내부 이중 박스 없이 아이콘 바로 표시 */}
            <div className="grid grid-cols-3 gap-2 overflow-y-auto p-1 flex-1 no-scrollbar">
              {PROFILE_ICONS.map((item) => {
                const isSelected = currentIconId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectIcon(item.id)}
                    disabled={isSavingIcon}
                    className={`flex items-center justify-center p-2 rounded-lg border transition-all cursor-pointer relative aspect-square overflow-hidden ${
                      isSelected
                        ? "border-[#111] bg-gray-50 ring-2 ring-[#111] shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/50"
                    }`}
                  >
                    {/* 별도 내부 박스 없이 아이콘/이미지 바로 가득 채워 표시 */}
                    {item.type === "image" ? (
                      <img
                        src={item.src}
                        alt="profile icon"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100/70 rounded-md">
                        <User size={30} className={item.color || "text-gray-500"} />
                      </div>
                    )}

                    {/* 선택됨 뱃지: 오른쪽 아래 초록색 원 안의 흰색 체크마크 */}
                    {isSelected && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-1.5 ring-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {iconError && <p className="text-xs text-red-500 text-center">{iconError}</p>}

            {isSavingIcon && (
              <div className="flex items-center justify-center py-1 text-xs text-gray-500 space-x-1.5">
                <Loader2 size={14} className="animate-spin text-[#111]" />
                <span>아이콘 변경 중...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 로그아웃 모달 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#111]">로그아웃 하시겠습니까?</h3>
              <p className="text-sm text-gray-500 mt-2">
                메인 페이지로 돌아갑니다.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold"
              >
                취소
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-[#111] text-white text-sm font-bold"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCA 이용방법 안내 바텀시트 모달 (온보딩 페이지와 100% 동일한 디자인 & 오디 캐릭터 적용) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setShowGuideModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 pt-7 shadow-2xl space-y-5 animate-slide-up max-h-[85vh] overflow-visible">
            {/* 바텀시트 상단 모서리에 쏙 걸쳐 튀어나온 오디 & 말풍선 (Absolute Top Overflow) */}
            <div className="absolute -top-14 left-5 right-5 flex items-end space-x-2.5 pointer-events-none z-20">
              {/* 바텀시트 위로 빼꼼 튀어나온 오디 */}
              <img
                src="/imgs/odi-character.png"
                alt="Odi Mascot"
                className="w-18 h-18 object-contain drop-shadow-md flex-none animate-bounce-subtle pointer-events-auto"
                onError={(e) => {
                  e.target.src = "/imgs/odi-character.png";
                }}
              />


              {/* 오디의 귀여운 말풍선 버블 */}
              <div className="relative bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-indigo-100/80 text-left mb-2 pointer-events-auto">
                {/* 말풍선 꼬리 (좌하단) */}
                <div className="absolute -left-1.5 bottom-3 w-3 h-3 bg-white border-l border-b border-indigo-100/80 rotate-45" />
                <p className="text-xs font-bold text-zinc-900 leading-snug">
                  안녕 난{" "}
                  <span className="text-indigo-600 font-extrabold">오디</span>
                  야! 📍
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5 whitespace-nowrap">
                  LOCA 서비스 사용법을 알려줄게!
                </p>
              </div>
            </div>

            {/* Header & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Compass size={18} className="text-zinc-800" />
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  LOCA 이용방법
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>

            {/* Guide Step Items (클릭 시 GIF 시연 화면 및 상세 설명 아코디언 토글) */}
            <div className="space-y-3 text-left max-h-[58vh] overflow-y-auto pr-1 no-scrollbar">
              {GUIDE_STEPS.map((step) => {
                const IconComponent = step.icon;
                const isExpanded = expandedGuideStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? "bg-white border-zinc-300 shadow-sm"
                        : "bg-zinc-50/80 hover:bg-zinc-100/80 border-zinc-100 cursor-pointer"
                    }`}
                  >
                    {/* 상단 헤더 박스 (클릭하여 열기/닫기) */}
                    <div
                      onClick={() =>
                        setExpandedGuideStep((prev) =>
                          prev === step.id ? null : step.id
                        )
                      }
                      className="flex items-start justify-between p-3.5 cursor-pointer gap-2.5"
                    >
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div
                          className={`flex-none p-2 rounded-xl bg-white shadow-2xs border border-zinc-200/60 ${step.iconColor}`}
                        >
                          <IconComponent size={18} />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                            <span>{step.title}</span>
                          </h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {step.summary}
                          </p>
                        </div>
                      </div>

                      {/* 아코디언 확장 화살표 */}
                      <button
                        type="button"
                        className={`text-zinc-400 p-1 transition-transform duration-200 flex-none ${
                          isExpanded ? "rotate-180 text-zinc-800" : ""
                        }`}
                        aria-label="시연 화면 보기"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    {/* 아코디언 펼침 영역: 순수 시연 GIF 전체화면 (잘림 없이 원본 비율 온전히 노출) */}
                    {isExpanded && (
                      <div className="p-3 pt-0 animate-fade-in">
                        <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-200/80 bg-zinc-100 flex items-center justify-center shadow-xs">
                          <img
                            src={step.gif}
                            alt={`${step.title} 시연 GIF`}
                            className="w-full h-auto object-contain block"
                            onError={(e) => {
                              e.target.src = step.fallbackImg;
                            }}
                          />
                        </div>
                      </div>
                    )}


                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-3.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-xs font-bold active:scale-98 transition-transform cursor-pointer shadow-xs"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 리스트 생성 모달 (POST /api/users/me/lists) */}
      {showCreateListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-base font-bold text-[#111]">새 리스트 만들기</h3>
              <button
                type="button"
                onClick={() => setShowCreateListModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateListSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">리스트 이름</label>
                <input
                  type="text"
                  placeholder="예: 홍대 감성 카페 모음"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  maxLength={50}
                  autoFocus
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                />
              </div>

              {createListError && <p className="text-xs text-red-500">{createListError}</p>}

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateListModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isCreatingList || !newListName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#111] text-white text-xs font-bold flex items-center justify-center disabled:opacity-40 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {isCreatingList ? <Loader2 size={14} className="animate-spin" /> : "만들기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 리스트 이름 수정 모달 (PUT /api/users/me/lists/{listId}) */}
      {showEditListModal && editingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-base font-bold text-[#111]">리스트 이름 수정</h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditListModal(false);
                  setEditingList(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateListSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">리스트 이름</label>
                <input
                  type="text"
                  value={editListName}
                  onChange={(e) => setEditListName(e.target.value)}
                  maxLength={50}
                  autoFocus
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                />
              </div>

              {updateListError && <p className="text-xs text-red-500">{updateListError}</p>}

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditListModal(false);
                    setEditingList(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingList || !editListName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#111] text-white text-xs font-bold flex items-center justify-center disabled:opacity-40 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {isUpdatingList ? <Loader2 size={14} className="animate-spin" /> : "수정 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 리스트 상세 & 포함 장소 목록 모달 (GET /api/users/me/lists/{listId}) */}
      {selectedListDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-none">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Folder size={20} className="text-indigo-600 flex-none" />
                <h3 className="text-base font-bold text-[#111] truncate">
                  {selectedListDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListDetail(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer flex-none ml-2"
              >
                <X size={20} />
              </button>
            </div>

            {listDetailError && (
              <p className="text-xs text-red-500 py-1 flex-none">{listDetailError}</p>
            )}


            {/* 포함된 장소 목록 헤더 & 장소 추가 버튼 */}
            <div className="flex items-center justify-between flex-none pt-1">
              <span className="text-xs font-bold text-gray-700">
                담긴 장소 ({(selectedListDetail.items || []).length}개)
              </span>
              <button
                type="button"
                onClick={() => {
                  setAddPlaceError(null);
                  setAddPlaceTab("private");
                  setAddPlaceSearch("");
                  loadPublicPlacesForAddModal();
                  setShowAddPlaceModal(true);
                }}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#111] text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>장소 담기</span>
              </button>

            </div>

            {/* 장소 목록 스크롤 뷰 */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar min-h-[140px]">
              {isLoadingListDetail ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
                  <Loader2 size={20} className="animate-spin text-[#111]" />
                  <span className="text-xs">장소 목록 불러오는 중...</span>
                </div>
              ) : (selectedListDetail.items || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2 text-center">
                  <p className="text-xs">이 리스트에 담긴 장소가 없습니다.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAddPlaceError(null);
                      setShowAddPlaceModal(true);
                    }}
                    className="text-xs text-indigo-600 font-bold underline cursor-pointer"
                  >
                    지금 장소 추가하기
                  </button>
                </div>
              ) : (
                (selectedListDetail.items || []).map((item) => {
                  const placeId = item.placeId || item.id;
                  const isDeletingItem = deletingListItemId === placeId;

                  return (
                    <div
                      key={placeId}
                      className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between gap-2 hover:bg-gray-100/70 transition-colors"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#111] truncate">
                          {item.name || "장소"}
                        </span>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {item.address || "주소 정보 없음"}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 flex-none">
                        {item.kakaoPlaceId && (
                          <a
                            href={`https://place.map.kakao.com/${item.kakaoPlaceId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                            title="카카오맵에서 보기"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemovePlaceFromList(
                              selectedListDetail.listId || selectedListDetail.id,
                              placeId
                            )
                          }
                          disabled={isDeletingItem}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="리스트에서 제외"
                        >
                          {isDeletingItem ? (
                            <Loader2 size={14} className="animate-spin text-red-500" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 하단 닫기 버튼 */}
            <div className="pt-2 border-t border-gray-100 flex-none">
              <button
                type="button"
                onClick={() => setSelectedListDetail(null)}
                className="w-full py-2.5 rounded-xl bg-[#111] text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 리스트에 장소 추가 선택 모달 (개인 장소 & 공용 장소 분리) */}
      {showAddPlaceModal && selectedListDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl space-y-3.5">
            {/* 모달 상단 헤더 */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 flex-none">
              <div>
                <h3 className="text-base font-bold text-[#111]">리스트에 장소 담기</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  [{selectedListDetail.name}]에 추가할 장소를 선택하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPlaceModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* 탭 스위처: [개인 장소] | [공용 장소] */}
            <div className="flex bg-gray-100 p-1 rounded-xl flex-none">
              <button
                type="button"
                onClick={() => setAddPlaceTab("private")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  addPlaceTab === "private"
                    ? "bg-white text-[#111] shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                개인 장소 ({myPlaces.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddPlaceTab("public");
                  loadPublicPlacesForAddModal();
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  addPlaceTab === "public"
                    ? "bg-white text-[#111] shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                공용 장소 ({publicPlaces.length})
              </button>
            </div>

            {/* 검색 인풋 */}
            <div className="relative flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={addPlaceSearch}
                onChange={(e) => setAddPlaceSearch(e.target.value)}
                placeholder={
                  addPlaceTab === "private"
                    ? "내 장소 이름/주소 검색..."
                    : "공용 장소 이름/주소 검색..."
                }
                className="w-full bg-gray-50 border border-gray-200/80 rounded-xl pl-8.5 pr-3 py-2 text-xs focus:outline-none focus:border-gray-400 placeholder:text-gray-400"
              />
            </div>

            {addPlaceError && <p className="text-xs text-red-500 flex-none">{addPlaceError}</p>}

            {/* 장소 목록 뷰 */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-[160px]">
              {isLoadingPublicPlaces && addPlaceTab === "public" && publicPlaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
                  <Loader2 size={20} className="animate-spin text-[#111]" />
                  <span className="text-xs">공용 장소 목록 불러오는 중...</span>
                </div>
              ) : (() => {
                const currentList = addPlaceTab === "private" ? myPlaces : publicPlaces;
                const filtered = currentList.filter((p) => {
                  if (!addPlaceSearch.trim()) return true;
                  const q = addPlaceSearch.trim().toLowerCase();
                  return (
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (p.address && p.address.toLowerCase().includes(q))
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2 text-center">
                      <p className="text-xs">
                        {addPlaceSearch.trim()
                          ? "검색 결과가 없습니다."
                          : addPlaceTab === "private"
                          ? "등록된 개인 장소가 없습니다."
                          : "등록된 공용 장소가 없습니다."}
                      </p>
                      {addPlaceTab === "private" && !addPlaceSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddPlaceModal(false);
                            setSelectedListDetail(null);
                            navigate("/add");
                          }}
                          className="text-xs text-indigo-600 font-bold underline cursor-pointer"
                        >
                          새 장소 등록하러 가기
                        </button>
                      )}
                    </div>
                  );
                }

                return filtered.map((p) => {
                  const placeId = p.placeId || p.id;
                  const isAddingThis = addingPlaceId === placeId;
                  const alreadyInList = (selectedListDetail.items || []).some(
                    (item) => (item.placeId || item.id) === placeId
                  );

                  return (
                    <div
                      key={placeId}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        alreadyInList
                          ? "bg-gray-50 border-gray-100 opacity-60"
                          : "bg-white border-gray-200 hover:border-indigo-400"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-[#111] truncate">{p.name}</span>
                          {p.placeType && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 text-gray-500 flex-none">
                              {p.placeType}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{p.address}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddPlaceToListSubmit(placeId)}
                        disabled={alreadyInList || isAddingThis}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex-none ${
                          alreadyInList
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-1"
                            : "bg-[#111] text-white hover:bg-gray-800"
                        }`}
                      >
                        {alreadyInList ? (
                          <>
                            <Check size={12} className="text-gray-400" />
                            <span>담김</span>
                          </>
                        ) : isAddingThis ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "+ 추가"
                        )}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pt-1 border-t border-gray-100 flex-none">
              <button
                type="button"
                onClick={() => setShowAddPlaceModal(false)}
                className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 토스트 알림 (복사되었습니다!) */}
      {toastMessage && (

        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#111]/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold">
            <CheckCheck size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}




