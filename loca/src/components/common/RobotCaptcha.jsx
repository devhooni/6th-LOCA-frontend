import { useState, useEffect } from "react";
import { ShieldCheck, Check, Loader2, RotateCw, AlertCircle } from "lucide-react";

export default function RobotCaptcha({ onVerify, resetKey = 0 }) {
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "challenge" | "verified"
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // 문제 생성 함수 (1~9 사이의 두 수)
  const generateProblem = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer("");
    setCaptchaError("");
  };

  // resetKey 변경 시 상태 초기화
  useEffect(() => {
    setStatus("idle");
    setUserAnswer("");
    setCaptchaError("");
    if (onVerify) onVerify(false);
  }, [resetKey]);

  // 체크박스 클릭 핸들러
  const handleCheckboxClick = () => {
    if (status === "verified" || status === "loading") return;

    setStatus("loading");
    setCaptchaError("");

    // 0.35초 로딩 후 챌린지 퀴즈 펼침
    setTimeout(() => {
      generateProblem();
      setStatus("challenge");
    }, 350);
  };

  // 정답 검증 핸들러
  const handleVerifySubmit = (e) => {
    if (e) e.preventDefault();
    const parsed = parseInt(userAnswer.trim(), 10);
    if (isNaN(parsed)) {
      setCaptchaError("정답 숫자를 입력해주세요.");
      return;
    }

    if (parsed === num1 + num2) {
      // 정답 인증 성공
      setStatus("verified");
      setCaptchaError("");
      if (onVerify) onVerify(true);
    } else {
      // 오답: 새 문제 출제
      setCaptchaError("정답이 일치하지 않습니다. 다시 시도해주세요.");
      generateProblem();
      if (onVerify) onVerify(false);
    }
  };

  return (
    <div className="bg-gray-50/90 border border-gray-200/90 rounded-2xl p-3.5 space-y-2.5 transition-all select-none shadow-2xs">
      {/* 상단 체크박스 및 인증 상태 헤더 */}
      <div className="flex items-center justify-between">
        <div
          onClick={handleCheckboxClick}
          className={`flex items-center space-x-3 cursor-pointer group ${
            status === "verified" ? "cursor-default" : ""
          }`}
        >
          {/* 체크박스 아이콘 */}
          <div
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
              status === "verified"
                ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                : status === "loading"
                ? "border-indigo-400 bg-white"
                : "border-gray-300 bg-white group-hover:border-gray-400 shadow-2xs"
            }`}
          >
            {status === "verified" ? (
              <Check size={14} className="stroke-[3]" />
            ) : status === "loading" ? (
              <Loader2 size={13} className="animate-spin text-indigo-600" />
            ) : null}
          </div>

          <span
            className={`text-xs font-bold transition-colors ${
              status === "verified"
                ? "text-emerald-700"
                : "text-gray-700 group-hover:text-gray-900"
            }`}
          >
            {status === "verified" ? "인증 완료 (로봇이 아닙니다)" : "로봇이 아닙니다"}
          </span>
        </div>

        {/* 보안 인증 뱃지 */}
        <div className="flex flex-col items-end text-[10px] text-gray-400 font-medium">
          <div className="flex items-center space-x-1 text-gray-500">
            <ShieldCheck size={13} className="text-indigo-600" />
            <span className="font-bold text-[11px]">LOCA Security</span>
          </div>
          <span className="text-[9px] text-gray-400">자동 가입/공격 방지</span>
        </div>
      </div>

      {/* 보안 챌린지 퀴즈 (체크박스 클릭 시 펼쳐짐) */}
      {status === "challenge" && (
        <div className="pt-2 border-t border-gray-200/80 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-semibold text-gray-700">
              보안 확인: <strong className="text-indigo-600 font-bold">{num1} + {num2} = ?</strong>
            </span>
            <button
              type="button"
              onClick={generateProblem}
              className="flex items-center space-x-1 text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
              title="다른 문제 풀기"
            >
              <RotateCw size={11} />
              <span>새로고침</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleVerifySubmit();
                }
              }}
              placeholder="정답 숫자 입력"
              autoFocus
              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleVerifySubmit}
              className="px-3 py-1.5 bg-[#111] hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex-none shadow-2xs"
            >
              확인
            </button>
          </div>

          {captchaError && (
            <p className="text-[11px] text-red-500 flex items-center space-x-1 pt-0.5">
              <AlertCircle size={11} className="flex-none" />
              <span>{captchaError}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
