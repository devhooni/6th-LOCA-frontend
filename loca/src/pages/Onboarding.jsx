import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";
import { TagChip } from "@/src/components/common/TagChip";

const STEPS = [
  {
    emoji: "📍",
    title: "취향에 맞는 장소를\n발견해 보세요",
    body: "LOCA는 카페, 맛집, 산책 코스처럼 다양한 장소를 당신의 취향과 기록 흐름에 맞춰 보여줍니다.",
    visual: "discover",
  },
  {
    emoji: "🗺️",
    title: "지도에서 바로\n확인해 보세요",
    body: "주변 장소를 지도 위에서 보고, 마음에 드는 장소를 선택해 상세 정보로 이동할 수 있습니다.",
    visual: "map",
  },
  {
    emoji: "✍️",
    title: "방문 경험을 나만의\n기록으로 남기세요",
    body: "사진, 감상, 함께한 사람을 간단히 저장하고 이후 추천과 컬렉션의 기반으로 활용합니다.",
    visual: "archive",
  },
];

const TASTE_TAGS = [
  "☕ 카페", "🍜 맛집", "🌿 자연", "🎨 문화",
  "🌙 심야영업", "🔇 조용한", "🐾 반려동물", "🧘 힐링",
  "📸 포토스팟", "🍺 술집", "🎵 라이브", "🛍 쇼핑",
];

const DiscoverVisual = () => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    padding: "4px 0",
  }}>
    {["🫙 성수 카페", "🌿 망원 공원", "🎭 홍대 갤러리", "🍜 연남 맛집"].map((item, i) => (
      <div
        key={item}
        className="anim-scale-in"
        style={{
          animationDelay: `${i * 80}ms`,
          background: i === 0 ? "var(--brand-black)" : "var(--surface)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "16px 14px",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: i === 0 ? "#fff" : "var(--text)",
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

const MapVisual = () => (
  <div style={{
    background: "#e8ede8",
    borderRadius: "var(--radius-lg)",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  }}>
    {/* Grid lines simulating map */}
    {[0.25, 0.5, 0.75].map((v) => (
      <div key={v}>
        <div style={{ position: "absolute", top: `${v * 100}%`, left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.08)" }} />
        <div style={{ position: "absolute", left: `${v * 100}%`, top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,0.08)" }} />
      </div>
    ))}
    {/* Map pins */}
    {[
      { top: "25%", left: "30%", label: "카페" },
      { top: "55%", left: "60%", label: "맛집", active: true },
      { top: "40%", left: "70%", label: "문화" },
    ].map(({ top, left, label, active }) => (
      <div
        key={label}
        style={{
          position: "absolute",
          top,
          left,
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div style={{
          width: active ? 36 : 28,
          height: active ? 36 : 28,
          borderRadius: "50%",
          background: active ? "var(--brand-black)" : "var(--surface)",
          border: `2px solid ${active ? "var(--brand-black)" : "var(--border-2)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: active ? "1rem" : "0.75rem",
          boxShadow: active ? "var(--shadow-md)" : "var(--shadow-sm)",
        }}>
          📍
        </div>
        {active && (
          <div style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "3px 8px",
            fontSize: "0.6875rem",
            fontWeight: 800,
            boxShadow: "var(--shadow-sm)",
          }}>
            {label}
          </div>
        )}
      </div>
    ))}
  </div>
);

const ArchiveVisual = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {[
      { title: "조용한 오후의 카페", place: "성수 카페", mood: "☕ 혼자", date: "2일 전" },
      { title: "친구와 함께한 뒷골목", place: "연남 맛집", mood: "🍻 셋이서", date: "5일 전" },
    ].map((item, i) => (
      <div
        key={item.title}
        className="anim-fade-up"
        style={{
          animationDelay: `${i * 100}ms`,
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-sm)",
          background: "var(--surface-2)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
        }}>
          📸
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: "0.875rem", letterSpacing: "-0.01em" }}>{item.title}</p>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-3)", marginTop: 2 }}>
            {item.place} · {item.mood}
          </p>
        </div>
        <span style={{ marginLeft: "auto", fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-4)", whiteSpace: "nowrap" }}>
          {item.date}
        </span>
      </div>
    ))}
  </div>
);

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Step 3.5: Taste selection
  if (step === STEPS.length) {
    return (
      <AppShell showNav={false}>
        <div style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          padding: "56px 24px 40px",
        }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "var(--text-4)",
            textTransform: "uppercase",
            marginBottom: 20,
          }}>
            취향 설정
          </span>
          <h1 className="anim-fade-up" style={{
            fontSize: "clamp(1.625rem, 6vw, 2rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            marginBottom: 12,
          }}>
            어떤 장소를<br />좋아하시나요?
          </h1>
          <p style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-3)",
            marginBottom: 32,
          }}>
            선택하신 취향을 바탕으로 장소를 추천해 드려요.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1 }}>
            {TASTE_TAGS.map((tag) => (
              <TagChip
                key={tag}
                active={selectedTags.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </TagChip>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <Link
              to="/"
              className="btn btn-primary btn-full"
              style={{ borderRadius: "var(--radius-md)" }}
            >
              {selectedTags.length > 0 ? `${selectedTags.length}개 선택 완료 · 시작하기` : "나중에 설정하기"}
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showNav={false}>
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: "56px 24px 40px",
      }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 48 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 3,
                flex: 1,
                borderRadius: 2,
                background: i <= step ? "var(--brand-black)" : "var(--border)",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Emoji */}
        <div
          className="anim-scale-in"
          key={`emoji-${step}`}
          style={{
            fontSize: "2.5rem",
            marginBottom: 24,
          }}
        >
          {current.emoji}
        </div>

        {/* Title */}
        <h1
          className="anim-fade-up"
          key={`title-${step}`}
          style={{
            fontSize: "clamp(1.625rem, 6vw, 2rem)",
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
            whiteSpace: "pre-line",
            marginBottom: 16,
          }}
        >
          {current.title}
        </h1>

        <p
          className="anim-fade-up anim-delay-1"
          key={`body-${step}`}
          style={{
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "var(--text-3)",
            lineHeight: 1.65,
            marginBottom: 36,
          }}
        >
          {current.body}
        </p>

        {/* Visual card */}
        <div
          className="anim-fade-up anim-delay-2"
          key={`visual-${step}`}
          style={{
            flex: 1,
            background: current.visual === "map" ? "transparent" : "var(--surface-2)",
            borderRadius: "var(--radius-xl)",
            padding: current.visual === "map" ? 0 : 20,
            border: current.visual === "map" ? "none" : "1.5px solid var(--border)",
            minHeight: 200,
            overflow: "hidden",
          }}
        >
          {current.visual === "discover" && <DiscoverVisual />}
          {current.visual === "map" && <MapVisual />}
          {current.visual === "archive" && <ArchiveVisual />}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 32 }}>
          {isLast ? (
            <button
              type="button"
              className="btn btn-primary btn-full"
              style={{ borderRadius: "var(--radius-md)" }}
              onClick={() => setStep(STEPS.length)}
            >
              취향 설정하기 →
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-full"
              style={{ borderRadius: "var(--radius-md)" }}
              onClick={() => setStep((s) => s + 1)}
            >
              다음
            </button>
          )}
          {step === 0 && (
            <Link
              to="/"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 16,
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--text-4)",
              }}
              className="tap-target"
            >
              건너뛰기
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
