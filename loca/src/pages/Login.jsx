import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";

const LocaPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AppShell showNav={false}>
      {/* Full-screen hero container */}
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>

        {/* Top brand section */}
        <div
          style={{
            flex: "0 0 auto",
            background: "var(--brand-black)",
            padding: "56px 28px 44px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative blobs */}
          <div style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />
          <div style={{
            position: "absolute",
            bottom: -30,
            left: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }} />

          {/* Brand logo */}
          <div
            className="anim-fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 36,
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}>
              <LocaPin />
            </div>
            <span style={{
              color: "#fff",
              fontSize: "1.125rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}>
              LOCA
            </span>
          </div>

          {/* Headline */}
          <h1
            className="anim-fade-up anim-delay-1"
            style={{
              color: "#fff",
              fontSize: "clamp(1.875rem, 7vw, 2.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            당신의 장소를<br />
            발견하고<br />
            기록하는<br />
            새로운 방법
          </h1>

          <p
            className="anim-fade-up anim-delay-2"
            style={{
              marginTop: 16,
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            PUBLIC PLACE · PRIVATE PLACE
          </p>
        </div>

        {/* Bottom form section */}
        <div
          style={{
            flex: "1",
            background: "var(--bg)",
            padding: "36px 28px 40px",
          }}
          className="anim-scale-in anim-delay-2"
        >
          <h2 style={{
            fontSize: "1.375rem",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}>
            다시 만나 반가워요 👋
          </h2>
          <p style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-3)",
            marginBottom: 28,
          }}>
            LOCA 계정으로 로그인하고 기록을 이어가세요.
          </p>

          <form style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label
                htmlFor="login-email"
                style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: 8 }}
              >
                이메일
              </label>
              <input
                id="login-email"
                className="input"
                type="email"
                placeholder="loca@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: 8 }}
              >
                비밀번호
              </label>
              <input
                id="login-password"
                className="input"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Login CTA */}
            <Link
              to="/onboarding"
              className="btn btn-primary btn-full"
              style={{ marginTop: 8, borderRadius: "var(--radius-md)" }}
            >
              로그인
            </Link>
          </form>

          {/* Sub links */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginTop: 16,
          }}>
            <button
              type="button"
              style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-3)" }}
              className="tap-target"
            >
              비밀번호 찾기
            </button>
            <span style={{ color: "var(--border-2)" }}>·</span>
            <button
              type="button"
              style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-3)" }}
              className="tap-target"
            >
              회원가입
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "24px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-4)" }}>
              또는
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Social login */}
          <button
            type="button"
            className="btn btn-secondary btn-full"
            style={{ gap: 10 }}
          >
            <span style={{ fontSize: "1rem" }}>🇰</span>
            카카오로 계속하기
          </button>
        </div>
      </div>
    </AppShell>
  );
}
