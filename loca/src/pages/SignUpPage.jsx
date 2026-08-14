import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { signupUser } from "../services/placeService";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 비밀번호 안전도 4단계 계산
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "bg-gray-200", textColor: "text-gray-400" };

    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "약함", color: "bg-rose-500", textColor: "text-rose-500" };
      case 2:
        return { score: 2, label: "보통", color: "bg-amber-500", textColor: "text-amber-500" };
      case 3:
        return { score: 3, label: "안전", color: "bg-emerald-500", textColor: "text-emerald-600" };
      case 4:
        return { score: 4, label: "매우 강력", color: "bg-indigo-600", textColor: "text-indigo-600" };
      default:
        return { score: 1, label: "약함", color: "bg-rose-500", textColor: "text-rose-500" };
    }
  };

  const strengthInfo = getPasswordStrength(formData.password);

  // POST /api/auth/signup 실서버 회원가입 API 호출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.email.trim()) {
      setErrorMsg("이메일을 입력해주세요.");
      return;
    }
    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      setErrorMsg("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    if (!formData.password) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 64) {
      setErrorMsg("비밀번호는 8자 이상 64자 이하이어야 합니다.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signupUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("SignUp API Error:", err);
      // 백엔드실제 에러 메시지 표출
      setErrorMsg(err.message || "회원가입 처리 중 에러가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-6 select-none">
      {/* Header Back Button */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Main Title Section */}
      <div className="mt-2 mb-6 text-left space-y-1">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          회원가입
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          이메일과 비밀번호로 LOCA 계정을 생성해보세요.
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          {/* 1. 이메일 입력 */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] ml-1">
              이메일 (Email)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@loca.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--color-neutral-border)] bg-gray-50/50 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* 2. 비밀번호 입력 및 4단계 안전도 표시 */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">
                비밀번호 (Password)
              </label>
              {formData.password && (
                <span className={`text-xs font-bold ${strengthInfo.textColor} flex items-center space-x-1`}>
                  <span>안전도: {strengthInfo.label}</span>
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8자 이상 64자 이하 비밀번호"
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-[var(--color-neutral-border)] bg-gray-50/50 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* 비밀번호 안전도 4단계 바 (Password Strength Bar Indicator) */}
            {formData.password && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        step <= strengthInfo.score ? strengthInfo.color : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] ml-0.5">
                  영문, 숫자, 특수문자 조합 10자 이상 시 매우 강력
                </p>
              </div>
            )}
          </div>

          {/* 3. 비밀번호 확인 입력 */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] ml-1">
              비밀번호 확인
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <CheckCircle2 size={18} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 재입력"
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-[var(--color-neutral-border)] bg-gray-50/50 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* 비밀번호 일치 상태 실시간 가이드 */}
            {formData.confirmPassword && (
              <div className="ml-1 pt-0.5">
                {formData.password === formData.confirmPassword ? (
                  <p className="text-[11px] font-medium text-emerald-600 flex items-center space-x-1">
                    <span>✓ 비밀번호가 일치합니다</span>
                  </p>
                ) : (
                  <p className="text-[11px] font-medium text-rose-500">
                    ✕ 비밀번호가 일치하지 않습니다
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 에러 메시지 렌더링 */}
          {errorMsg && (
            <p className="text-xs font-medium text-rose-500 ml-1 text-left animate-shake">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Action Button & Login Link */}
        <div className="space-y-4 pb-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl text-white text-sm font-bold shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>회원가입 처리 중...</span>
              </>
            ) : (
              <span>가입하기</span>
            )}
          </button>

          <div className="flex items-center justify-center space-x-2 text-xs text-[var(--color-text-secondary)]">
            <span>이미 계정이 있으신가요?</span>
            <Link
              to="/login"
              className="font-bold text-[var(--color-brand-primary)] underline hover:opacity-80 transition-opacity"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
