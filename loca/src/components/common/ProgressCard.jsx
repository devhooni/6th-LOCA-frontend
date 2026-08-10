export function ProgressCard({ current, target }) {
  const safeTarget = target > 0 ? target : 1;
  const percent = Math.min(100, Math.round((current / safeTarget) * 100));

  return (
    <section className="card-shadow rounded-2xl bg-white p-5">
      <p className="text-sm font-semibold text-[var(--brand)]">
        ForYou 준비 중
      </p>
      <h2 className="mt-2 text-2xl font-extrabold leading-tight text-[var(--text)]">
        기록을 10개 남기면
        <br />
        ForYou가 열려요
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        지금까지 {current}개의 취향 기록을 남겼어요. 기록이 충분히 쌓이면 개인 맞춤 장소를 보여드릴게요.
      </p>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold text-zinc-500">
        <span>{current}개 기록</span>
        <span>{target}개 목표</span>
      </div>
    </section>
  );
}
