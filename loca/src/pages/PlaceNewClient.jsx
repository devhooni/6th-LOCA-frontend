import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/common/Button";
import { Icon } from "@/src/components/common/Icon";
import { createPlace } from "@/src/services/placeService";

const defaultLocation = {
  lat: "37.5563",
  lng: "126.9236",
};

export function PlaceNewClient() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(defaultLocation.lat);
  const [lng, setLng] = useState(defaultLocation.lng);
  const [visibility, setVisibility] = useState("private");

  const save = async () => {
    if (!name.trim()) {
      window.alert("장소 이름을 입력해주세요.");
      return;
    }

    const created = await createPlace({
      name,
      category: "private",
      categoryLabel: "개인 장소",
      address: address || "지도에서 선택한 위치",
      lat: Number(lat),
      lng: Number(lng),
      description: "진우님이 직접 추가한 개인 장소입니다.",
      imageUrl:
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80",
      tagIds: ["개인 장소"],
      tags: ["개인 장소"],
      visibility,
      source: "user",
      registrationMethod: "mapSelect",
    });

    navigate(`/place/${created.id}`);
  };

  return (
    <div className="w-full">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black">장소 추가</h1>
          <p className="mt-3 text-base font-semibold text-zinc-500">
            리뷰와 별개로, 지도에 표시할 개인 장소 정보를 먼저 등록합니다.
          </p>
        </div>
        <button
          className="h-11 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-bold text-zinc-700 interactive"
          type="button"
        >
          임시저장
        </button>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="wire-panel overflow-hidden bg-zinc-50">
          <div className="flex h-[520px] flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <Icon className="h-7 w-7 text-zinc-500" name="mapPin" />
            </div>
            <h2 className="mt-5 text-xl font-black">지도 위치 선택 영역</h2>
            <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-zinc-500">
              추후 Kakao Map에서 지점을 클릭하면 주소와 위도/경도가 자동 입력되는 구조로 연결합니다.
            </p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-lg bg-white p-4">
                <p className="text-xs font-black text-zinc-400">위도</p>
                <p className="mt-1 text-sm font-bold">{lat}</p>
              </div>
              <div className="rounded-lg bg-white p-4">
                <p className="text-xs font-black text-zinc-400">경도</p>
                <p className="mt-1 text-sm font-bold">{lng}</p>
              </div>
            </div>
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
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                ["private", "나만 보기"],
                ["public", "공유 가능"],
              ].map(([value, label]) => (
                <button
                  className={`h-11 rounded-lg border text-sm font-bold interactive ${
                    visibility === value ? "ui-dark" : "border-[var(--border)] bg-white text-zinc-600"
                  }`}
                  key={value}
                  onClick={() => setVisibility(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button className="mt-8 w-full" onClick={save}>
            장소 저장
          </Button>
        </section>
      </div>
    </div>
  );
}
