import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";
import { getPlaces, getPrivatePlaces } from "@/src/services/placeService";
import { getReviewsMe } from "@/src/services/reviewService";

const TABS = ["기록","장소들"];

export default function MyPage() {
  const [reviews, setReviews] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [userPlaces, setUserPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState("기록");

  useEffect(() => {
    Promise.all([getReviewsMe(), getPlaces(), getPrivatePlaces()]).then(([rd, pd, priv]) => {
      if (rd) setReviews(rd);
      if (pd) setAllPlaces(pd);
      if (priv) setUserPlaces(priv);
    });
  }, []);

  const cards = reviews.slice(0, 6).map((review) => ({
    review, place: allPlaces.find((p) => String(p.id) === String(review.placeId)) ?? allPlaces[0]
  }));
  const placeCards = userPlaces.length ? userPlaces
    : allPlaces.filter((p) => p.createdByUser || p.visibility === "private" || p.source === "user");

  return (
    <AppShell>
      {/* 헤더 */}
      <div className="page-header" style={{ padding: "16px 0" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>마이페이지</h1>
        <button type="button" style={{ fontSize: 13 }}>설정</button>
      </div>

      {/* 프로필 */}
      <div className="section" style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 16 }}>
        <div style={{ width: 56, height: 56, border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
          진
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 800 }}>사용자</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#666" }}>@user</p>
        </div>
        <button type="button" style={{ marginLeft: "auto", fontSize: 13 }}>편집</button>
      </div>

      {/* 탭 */}
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button key={tab} type="button" className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      <div style={{ paddingTop: 16 }}>
        {activeTab === "기록" && (
          <div>
            {cards.length === 0
              ? <p>아직 기록이 없어요. <Link to="/explore">장소 찾아보기</Link></p>
              : cards.map(({ review, place }) => (
                <div key={review.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                  <img src={review.images?.[0] ?? place?.imageUrl} alt="" style={{ width: 48, height: 48, objectFit: "cover" }} />
                  <div>
                    <Link to={"/place/" + place?.id}><strong style={{ fontSize: 14 }}>{review.title}</strong></Link>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>{place?.name}</p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === "장소들" && (
          <div>
            <Link to="/place/new" style={{ display: "block", padding: "12px 0", fontSize: 14 }}>+ 장소 추가</Link>
            {placeCards.map((place) => (
              <div key={place.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                <img src={place.imageUrl} alt={place.name} style={{ width: 48, height: 48, objectFit: "cover" }} />
                <div>
                  <Link to={"/place/" + place.id}><strong style={{ fontSize: 14 }}>{place.name}</strong></Link>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>{place.categoryLabel}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "임시저장" && (
          <p style={{ color: "#666" }}>작성 중인 기록 {mockUser.draftCount}개 (기능 연동 예정)</p>
        )}
      </div>
    </AppShell>
  );
}
