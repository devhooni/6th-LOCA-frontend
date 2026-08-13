import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import ReviewPage from "./pages/ReviewPage";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-3xl font-black text-[var(--color-brand-primary)] tracking-tight">LOCA</h1>
      <p className="mt-4 text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
        SAVE YOUR STORY · SHARE YOUR SPOTS
      </p>
      
      {/* Placeholder Content to demonstrate scrolling */}
      <div className="mt-12 w-full max-w-sm space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-full h-32 rounded-2xl bg-[var(--color-neutral-surface)] border border-[var(--color-neutral-border)] shadow-sm p-5 flex items-center justify-center">
            <span className="text-[var(--color-text-muted)] font-semibold">Feed Item {i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-lg font-bold text-[var(--color-text-secondary)]">Coming Soon</p>
          </div>
        } />
      </Routes>
    </AppShell>
  );
}
