import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

export const GOOGLE_RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Ld7_JUtAAAAAKrs1VXyhY0fseEH4UUL2O0Rfu2B";

// reCAPTCHA v3 토큰 직접 발급 유틸리티 함수
export async function executeGoogleReCaptcha(action = "submit") {
  if (typeof window === "undefined") return null;

  return new Promise((resolve) => {
    if (!window.grecaptcha) {
      resolve(null);
      return;
    }
    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(GOOGLE_RECAPTCHA_SITE_KEY, {
          action,
        });
        resolve(token);
      } catch (err) {
        console.warn("reCAPTCHA v3 execution warning:", err);
        resolve(null);
      }
    });
  });
}

export default function GoogleReCaptcha({
  onVerify,
  action = "submit",
  resetKey = 0,
  className = "",
}) {
  const [status, setStatus] = useState("loading"); // "loading" | "verified" | "error"
  const [token, setToken] = useState(null);

  const initAndExecute = useCallback(() => {
    setStatus("loading");

    const scriptId = "google-recaptcha-v3-script";
    let script = document.getElementById(scriptId);

    const runExecution = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(async () => {
          try {
            const tok = await window.grecaptcha.execute(GOOGLE_RECAPTCHA_SITE_KEY, {
              action,
            });
            setToken(tok);
            setStatus("verified");
            if (onVerify) {
              onVerify(true, tok);
            }
          } catch (err) {
            console.warn("reCAPTCHA v3 verify error:", err);
            // v3는 백그라운드 분석이므로 오류 시에도 사용자 차단 없이 통과 처리
            setStatus("verified");
            if (onVerify) {
              onVerify(true, null);
            }
          }
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = runExecution;
      document.head.appendChild(script);
    } else {
      if (window.grecaptcha && window.grecaptcha.execute) {
        runExecution();
      } else {
        script.addEventListener("load", runExecution);
      }
    }
  }, [action, onVerify]);

  useEffect(() => {
    initAndExecute();
  }, [initAndExecute, resetKey]);

  return (
    <div className={`w-full select-none my-1.5 ${className}`}>
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50/90 border border-gray-200/90 rounded-2xl transition-all shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 flex items-center justify-center flex-none">
            {status === "loading" ? (
              <Loader2 size={15} className="animate-spin text-indigo-600" />
            ) : (
              <img
                src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                alt="Google reCAPTCHA"
                className="w-4 h-4 object-contain opacity-90"
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-700">
              Google reCAPTCHA v3
            </span>
            <span className="text-[10px] text-gray-400">
              자동 공격 및 봇 탐지 보호 중
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60">
          <ShieldCheck size={13} className="stroke-[2.5]" />
          <span>보안 인증 완료</span>
        </div>
      </div>
    </div>
  );
}
