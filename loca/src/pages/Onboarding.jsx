import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";

const steps = [
  {
    title: "취향에 맞는 장소를 발견해 보세요",
    body: "LOCA는 카페, 맛집, 산책 코스처럼 다양한 장소를 당신의 취향과 기록 흐름에 맞춰 보여줍니다.",
  },
  {
    title: "지도에서 바로 확인해 보세요",
    body: "주변 장소를 지도 위에서 보고, 마음에 드는 장소를 선택해 상세 정보로 이동할 수 있습니다.",
  },
  {
    title: "방문 경험을 나만의 기록으로 남기세요",
    body: "사진, 감상, 함께한 사람을 간단히 저장하고 이후 추천과 컬렉션의 기반으로 활용합니다.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <AppShell>
      <div className="grid min-h-[620px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="text-sm font-black text-zinc-400">{step + 1}/3</p>
          <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight lg:text-6xl">
            {current.title}
          </h1>
          <p className="mt-6 max-w-md text-base font-semibold leading-7 text-zinc-500">
            {current.body}
          </p>
          <div className="mt-10 flex items-center gap-3">
            {steps.map((item, index) => (
              <span
                className={`h-2.5 rounded-full ${index === step ? "w-9 bg-black" : "w-2.5 bg-zinc-300"}`}
                key={item.title}
              />
            ))}
          </div>
          {isLast ? (
            <Link
              className="mt-10 inline-flex h-12 min-w-36 items-center justify-center rounded-lg bg-black px-6 text-sm font-bold text-white"
              to="/">
              시작하기
            </Link>
          ) : (
            <button
              className="mt-10 h-12 min-w-36 rounded-lg bg-black px-6 text-sm font-bold text-white"
              onClick={() => setStep((value) => value + 1)}
              type="button">
              다음
            </button>
          )}
        </section>

        <section className="flex min-h-[440px] items-center justify-center rounded-2xl bg-zinc-100">
          <div className="h-44 w-44 rounded-full bg-zinc-300" />
        </section>
      </div>
    </AppShell>
  );
}
