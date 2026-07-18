import { Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";
import { Icon } from "@/src/components/common/Icon";

const contributors = [
  { name: "조현", github: "alexhyun7777-code", role: "Frontend Developer" },
  { name: "devhooni", github: "devhooni", role: "Frontend Developer" },
  { name: "권동현", github: "Marlozing", role: "Backend Developer" },
  { name: "정지윤", github: "jiyun0516", role: "Backend Developer" },
];

export default function ContributorsPage() {
  return (
    <AppShell>
      <div className="w-full p-5 sm:p-8">
        <header className="mb-6 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Link
              aria-label="홈으로 이동"
              className="-ml-2 flex items-center justify-center rounded-full p-1.5 text-zinc-600 active:bg-zinc-100"
              to="/"
            >
              <Icon className="h-5 w-5 rotate-180" name="chevron" />
            </Link>
            <div className="flex items-center gap-1.5">
              <img src="/LOCA-icon.svg" alt="LOCA 로고" className="h-5 w-5 object-contain" />
              <h1 className="text-xl font-extrabold tracking-tight text-[var(--brand)]">Contributors</h1>
            </div>
          </div>
          <a
            aria-label="GitHub 저장소로 이동"
            className="flex items-center justify-center rounded-full p-2 text-zinc-600 active:bg-zinc-100"
            href="https://github.com/gdg-hongik-univ-program/6th-LOCA-frontend"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>Repository</span>
          </a>
        </header>

        <header className="mb-12 hidden md:flex md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link
                aria-label="홈으로 이동"
                className="-ml-2 flex items-center justify-center rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
                to="/"
              >
                <Icon className="h-6 w-6 rotate-180" name="chevron" />
              </Link>
              <div className="flex items-center gap-2">
                <img src="/LOCA-icon.svg" alt="LOCA 로고" className="h-8 w-8 object-contain" />
                <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand)] sm:text-4xl">
                  LOCA Contributors
                </h1>
              </div>
            </div>
            <p className="mt-2 pl-11 text-zinc-500">
              로컬 취향 탐험 플랫폼 LOCA를 함께 만드는 팀원입니다.
            </p>
          </div>
          <a
            className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold !text-white transition hover:bg-zinc-700"
            href="https://github.com/gdg-hongik-univ-program/6th-LOCA-frontend"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>Repository</span>
          </a>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {contributors.map((member) => (
            <div className="group h-[120px] [perspective:1000px] md:h-[280px]" key={member.github}>
              <a
                className="relative flex h-full w-full rounded-2xl duration-500 [transform-style:preserve-3d] md:block md:group-hover:[transform:rotateY(180deg)]"
                href={`https://github.com/${member.github}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="absolute inset-0 flex h-full w-full flex-row items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm [backface-visibility:hidden] md:flex-col md:gap-0 md:p-6 md:text-center">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-zinc-100 md:mb-4 md:h-24 md:w-24">
                    <img
                      alt={`${member.name} profile`}
                      className="h-full w-full object-cover"
                      src={`https://github.com/${member.github}.png`}
                    />
                  </div>

                  <div className="flex flex-col md:items-center">
                    <h2 className="text-lg font-bold text-zinc-800 md:text-xl">{member.name}</h2>
                    <p className="text-xs font-semibold text-zinc-500 md:mt-1 md:text-sm">{member.role}</p>
                    <span className="mt-2 text-[11px] text-zinc-400 md:mt-4 md:text-xs">@{member.github}</span>
                  </div>
                </div>

                <div className="absolute inset-0 hidden h-full w-full flex-col items-center justify-center rounded-2xl border border-[var(--brand)] bg-zinc-50 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] md:flex">
                  <Icon className="mb-3 h-10 w-10 text-[var(--brand)]" name="user" />
                  <h3 className="text-base font-bold text-zinc-800">{member.name}</h3>
                  <span className="mb-4 text-xs text-zinc-400">@{member.github}</span>
                  <span className="rounded-lg bg-[var(--brand)] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                    GitHub 방문하기
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
