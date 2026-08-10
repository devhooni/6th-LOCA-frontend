import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/common/Button";
import { KakaoMap } from "@/src/components/map/KakaoMap";
import { createPlace } from "@/src/services/placeService";

const DEFAULT_LOCATION = {
  lat: "37.5563",
  lng: "126.9236",
};

const PLACE_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80";

export function PlaceNewClient() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(DEFAULT_LOCATION.lat);
  const [lng, setLng] = useState(DEFAULT_LOCATION.lng);
  const [visibility, setVisibility] = useState("public");
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  const previewPlace = {
    id: "preview",
    name: name || "선택한 위치",
    lat: Number(lat),
    lng: Number(lng),
  };

  const handleMapClick = ({ lat: clickedLat, lng: clickedLng }) => {
    setLat(String(clickedLat));
    setLng(String(clickedLng));
  };

  const handlePrivateClick = () => {
    setVisibility("private");
    window.alert("Private 장소 등록은 추후 기능으로 연결할 예정입니다.");
  };

  const save = async () => {
    if (isSavingRef.current) return;

    if (!name.trim()) {
      window.alert("장소 이름을 입력해주세요.");
      return;
    }

    if (visibility === "private") {
      window.alert("Private 장소 등록은 추후 기능으로 연결할 예정입니다.");
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const created = await createPlace({
        name,
        category: "cafe",
        categoryLabel: "추천 장소",
        address: address || "지도에서 선택한 위치",
        lat: Number(lat),
        lng: Number(lng),
        description: "등록한 장소입니다.",
        imageUrl: PLACE_PREVIEW_IMAGE,
        tagIds: ["추천"],
        tags: ["추천"],
        visibility,
        source: "kakao",
        registrationMethod: "mapSelect",
      });

      navigate(`/place/${created.id}`);
    } catch {
      window.alert("장소 저장 중 문제가 발생했습니다.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black">장소 추가</h1>
          <p className="mt-3 text-base font-semibold text-zinc-500">
            지도에서 위치를 선택하거나 정보를 직접 입력해 새로운 장소를 등록하세요.
          </p>
        </div>
        <button
          className="h-11 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-bold text-zinc-700 interactive"
          type="button"
        >
          임시저장
        </button>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="wire-panel overflow-hidden bg-zinc-50 p-2">
          <div className="mb-2 flex flex-col gap-1 px-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-black text-zinc-500">지도 클릭으로 위도/경도 자동 선택</span>
            <span className="text-xs font-bold text-zinc-400">
              위도: {lat} | 경도: {lng}
            </span>
          </div>
          <div className="h-[480px] w-full">
            <KakaoMap
              fallbackHint="지도를 클릭하면 위도와 경도가 자동으로 입력됩니다."
              onMapClick={handleMapClick}
              places={[previewPlace]}
              selectedPlace={previewPlace}
            />
          </div>
        </section>

        <section className="wire-panel p-6 lg:p-8">
          <h2 className="text-xl font-black">장소 정보</h2>

          <label className="mt-6 block text-sm font-bold" htmlFor="place-name">
            장소 이름
            <input
              className="mt-2 h-12 w-full rounded-lg border border-[var(--border)] bg-white px-4 outline-none focus:border-zinc-500"
              id="place-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 경의선숲길 조용한 벤치"
              value={name}
            />
          </label>

          <label className="mt-5 block text-sm font-bold" htmlFor="place-address">
            주소 또는 위치 설명
            <input
              className="mt-2 h-12 w-full rounded-lg border border-[var(--border)] bg-white px-4 outline-none focus:border-zinc-500"
              id="place-address"
              onChange={(event) => setAddress(event.target.value)}
              placeholder="예: 서울 마포구 연남동 경의선숲길 근처"
              value={address}
            />
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold" htmlFor="place-lat">
              위도
              <input
                className="mt-2 h-12 w-full rounded-lg border border-[var(--border)] bg-white px-4 outline-none focus:border-zinc-500"
                id="place-lat"
                onChange={(event) => setLat(event.target.value)}
                placeholder="37.5563"
                value={lat}
              />
            </label>
            <label className="block text-sm font-bold" htmlFor="place-lng">
              경도
              <input
                className="mt-2 h-12 w-full rounded-lg border border-[var(--border)] bg-white px-4 outline-none focus:border-zinc-500"
                id="place-lng"
                onChange={(event) => setLng(event.target.value)}
                placeholder="126.9236"
                value={lng}
              />
            </label>
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold">공개 설정</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                  visibility === "public"
                    ? "border-zinc-950 bg-zinc-950 text-white ring-2 ring-zinc-950"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
                onClick={() => setVisibility("public")}
                type="button"
              >
                <span className="text-sm font-black">공유 가능</span>
                <span className={`text-xs font-semibold ${visibility === "public" ? "text-zinc-300" : "text-zinc-500"}`}>
                  다른 사용자가 볼 수 있는 장소로 등록합니다.
                </span>
              </button>

              <button
                className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                  visibility === "private"
                    ? "border-zinc-950 bg-zinc-950 text-white ring-2 ring-zinc-950"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
                onClick={handlePrivateClick}
                type="button"
              >
                <span className="text-sm font-black">나만 보기</span>
                <span className={`text-xs font-semibold ${visibility === "private" ? "text-zinc-300" : "text-zinc-500"}`}>
                  개인 장소로 저장하는 흐름입니다.
                </span>
              </button>
            </div>
          </div>

          <Button className="mt-8 w-full" disabled={isSaving} onClick={save}>
            {isSaving ? "저장 중" : "장소 저장"}
          </Button>
        </section>
      </div>
    </div>
  );
}
