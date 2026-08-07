import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlaceCard } from "@/src/components/common/PlaceCard";
import { AppShell } from "@/src/components/layout/AppShell";
import { mockPlaces } from "@/src/mocks/places";
import { mockReviews } from "@/src/mocks/reviews";
import { getPlaces } from "@/src/services/placeService";
import { getReviewsMe } from "@/src/services/reviewService";

const TARGET = 10;

function getInsight(count) {
  if (count < 4) return "아직 취향의 윤곽을 그리고 있어요.";
  if (count < 8) return "조용한 장소와 여유로운 시간을 자주 남기고 있어요.";
  return "나만의 장소 DNA가 형성됐어요 ✨";
}

export default function ForYouPage() {
  const [places, setPlaces] = useState(mockPlaces);
  const [reviews, setReviews] = useState(mockReviews);

  useEffect(() => {
    Promise.all([getPlaces(), getReviewsMe()]).then(([placesData, reviewsData]) => {
      if (placesData?.length) setPlaces(placesData);
      if (reviewsData?.length) setReviews(reviewsData);
    });
  }, []);

  const isUnlocked = reviews.length >= TARGET;
  const progress = Math.min(reviews.length / TARGET, 1);

  return (
    <AppShell>
      {/* ── Header ── */}
      <div style={{ padding: "20px 20px 0" }}>
        <span style={{
          fontSize: "0.75rem",
          fontWeight: 800,
          color: "var(--text-4)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          For You
        </span>
        <h1 style={{
          fontSize: "clamp(1.375rem, 5vw, 1.75rem)",
          fontWeight: 900,
          letterSpacing: "-0.025em",
          marginTop: 6,
          marginBottom: 6,
        }}>
          진우님을 위한 추천
        </h1>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-3)" }}>
          {getInsight(reviews.length)}
        </p>
      </div>

      {/* ── Unlock progress ── */}
      {!isUnlocked && (
        <div
          className="anim-fade-up anim-delay-1"
          style={{
            margin: "20px 20px 0",
            background: "var(--brand-black)",
            borderRadius: "var(--radius-xl)",
            padding: "20px 20px 22px",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                개인화 잠금해제
              </p>
              <p style={{ fontSize: "1rem", fontWeight: 900, marginTop: 4 }}>
                기록 {reviews.length}/{TARGET}개
              </p>
            </div>
            <span style={{
              fontSize: "1.5rem",
              background: "rgba(255,255,255,0.1)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              🔓
            </span>
          </div>

          {/* Progress bar */}
          <div style={{
            height: 6,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 3,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "#fff",
              borderRadius: 3,
              transition: "width 0.8s var(--ease-spring)",
            }} />
          </div>

          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
            {TARGET - reviews.length}개 더 기록하면 맞춤 추천이 열려요
          </p>

          <Link
            to="/explore"
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginTop: 16,
              padding: "8px 16px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8125rem",
              fontWeight: 800,
              color: "#fff",
            }}
            className="tap-target"
          >
            장소 탐색하기 →
          </Link>
        </div>
      )}

      {/* ── Recommended places ── */}
      <div style={{ padding: "24px 20px 0" }}>
        <div className="section-header">
          <h2 className="t-heading">
            {isUnlocked ? "🎯 맞춤 추천" : "둘러보기"}
          </h2>
          <Link to="/explore" className="section-link">더 보기 →</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {places.slice(0, isUnlocked ? 4 : 3).map((place, i) => (
            <div
              key={place.id}
              className="anim-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <PlaceCard place={place} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 24 }} />
    </AppShell>
  );
}
