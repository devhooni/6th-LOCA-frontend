import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { signupUser } from "../services/placeService";
import ImageWithSkeleton from "../components/common/ImageWithSkeleton";

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
        return { score: 4, label: "매우 강력", color: "bg-[#111]", textColor: "text-gray-900" };
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
      setErrorMsg(err.message || "회원가입 처리 중 에러가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col h-full w-full bg-white px-6 py-6 select-none overflow-y-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="self-start text-gray-400 hover:text-gray-600 transition-colors -ml-1 mb-8"
        aria-label="뒤로가기"
      >
        <ArrowLeft size={22} />
      </button>

      {/* Mascot Illustration & Welcome Banner */}
      <div className="flex flex-col items-center mb-6 text-center">
        <ImageWithSkeleton
          src="/imgs/Signup.png"
          alt="Welcome to LOCA Friends"
          wrapperClassName="w-full max-w-[280px] h-36 mb-3 rounded-2xl overflow-hidden flex items-center justify-center"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
        <h1 className="text-xl font-extrabold text-[var(--color-text-primary)] mb-1 tracking-tight">

          만나서 반가워요! 🎉
        </h1>
        <p className="text-xs text-gray-500">
          LOCA와 함께 나만의 특별한 장소를 저장하고 기록해보세요!
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {/* 이메일 */}
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@loca.com"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">비밀번호</label>
              {formData.password && (
                <span className={`text-xs font-semibold ${strengthInfo.textColor}`}>
                  안전도: {strengthInfo.label}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8자 이상 64자 이하"
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.password && (
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      step <= strengthInfo.score ? strengthInfo.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <CheckCircle2 size={18} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 재입력"
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.confirmPassword && (
              <p className={`text-xs ml-0.5 ${formData.password === formData.confirmPassword ? "text-emerald-600 font-medium" : "text-rose-500"}`}>
                {formData.password === formData.confirmPassword ? "✓ 비밀번호가 일치합니다." : "✕ 비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="text-xs text-red-500 ml-0.5">{errorMsg}</p>
          )}

        </div>

        {/* 하단 버튼 */}
        <div className="space-y-4 pb-4 mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#111] text-white text-sm font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-2xs"
          >

            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <span>가입하기</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
            <span>이미 계정이 있으신가요?</span>
            <Link to="/login" className="font-semibold text-[#111] underline">
              로그인
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
