import { Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";

export default function LoginPage() {
  return (
    <AppShell showNav={false} flush>
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex min-h-[320px] flex-col justify-between bg-black p-10 text-white lg:min-h-screen lg:p-16">
          <div className="text-4xl font-black tracking-tight">LOCA</div>
          <div>
            <h1 className="text-4xl font-black leading-tight lg:text-6xl">
              당신의 장소를
              <br />
              발견하고 기록하는
              <br />
              새로운 방법
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/70">
              취향에 맞는 로컬 장소를 찾고, 나만의 경험으로 남겨보세요.
            </p>
          </div>
          <p className="text-sm text-white/50">Public Place부터 Private Place까지</p>
        </section>

        <section className="flex items-center justify-center px-6 py-14">
          <div className="w-full max-w-[420px]">
            <h2 className="text-3xl font-black">다시 만나 반가워요</h2>
            <p className="mt-3 text-sm font-semibold text-zinc-500">
              LOCA 계정으로 로그인하고 기록을 이어가세요.
            </p>

            <form className="mt-10 space-y-4">
              <label className="block text-sm font-bold" htmlFor="email">
                이메일
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-[var(--border)] px-4 outline-none focus:border-black"
                  id="email"
                  placeholder="loca@example.com"
                  type="email"
                />
              </label>
              <label className="block text-sm font-bold" htmlFor="password">
                비밀번호
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-[var(--border)] px-4 outline-none focus:border-black"
                  id="password"
                  placeholder="비밀번호를 입력하세요"
                  type="password"
                />
              </label>
              <Link className="flex h-12 items-center justify-center rounded-lg bg-black text-sm font-bold text-white" to="/onboarding">
                로그인
              </Link>
            </form>

            <div className="mt-5 flex items-center justify-center gap-3 text-sm font-semibold text-zinc-500">
              <button type="button">비밀번호 찾기</button>
              <span>·</span>
              <button type="button">회원가입</button>
            </div>

            <button className="mt-8 h-12 w-full rounded-lg border border-[var(--border)] text-sm font-bold hover:bg-zinc-50" type="button">
              소셜 계정으로 계속
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
