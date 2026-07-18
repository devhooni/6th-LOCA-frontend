import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/common/Button";
import { createPlace } from "@/src/services/placeService";

const copy = {
  title: "\uac1c\uc778 \uc7a5\uc18c \ub4f1\ub85d",
  description:
    "\uce74\uce74\uc624\ub9f5\uc5d0 \uc5c6\ub294 \ub098\ub9cc\uc758 \uc7a5\uc18c\ub97c \uae30\ub85d\ud574\ubcf4\uc138\uc694.",
  photo: "\uc0ac\uc9c4 GPS\ub85c \ub4f1\ub85d",
  current: "\ud604\uc7ac \uc704\uce58\ub85c \ub4f1\ub85d",
  map: "\uc9c0\ub3c4\uc5d0\uc11c \uc120\ud0dd",
  manual: "\uc9c1\uc811 \uc785\ub825",
  save: "\uac1c\uc778 \uc7a5\uc18c \uc800\uc7a5",
};

const methods = [
  { key: "photoGps", label: copy.photo },
  { key: "currentLocation", label: copy.current },
  { key: "mapSelect", label: copy.map },
  { key: "manual", label: copy.manual },
];

export function PlaceNewClient() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("manual");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("culture");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("37.5563");
  const [lng, setLng] = useState("126.9236");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");

  const useCurrentLocation = () => {
    setMethod("currentLocation");
    if (!navigator.geolocation) {
      setMessage("현재 위치를 사용할 수 없어 기본 좌표를 유지합니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(String(position.coords.latitude));
        setLng(String(position.coords.longitude));
        setMessage("현재 위치 좌표가 입력되었습니다.");
      },
      () => setMessage("위치 권한이 없어 기본 좌표를 유지합니다."),
    );
  };

  const save = async () => {
    const created = await createPlace({
      name,
      category,
      address,
      lat: Number(lat),
      lng: Number(lng),
      description,
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80",
      tagIds: ["개인 장소"],
      visibility: "private",
      source: "user",
      registrationMethod: method,
    });
    navigate(`/place/${created.id}`);
  };

  return (
    <div className="w-full md:pl-8">
      <h1 className="text-2xl font-extrabold md:text-3xl">{copy.title}</h1>
      <p className="mt-2 text-sm font-semibold text-zinc-500">
        {copy.description}
      </p>
      {message ? (
        <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-600">
          {message}
        </p>
      ) : null}
      <section className="mt-6 grid gap-3 md:grid-cols-4">
        {methods.map((item) => (
          <button
            className={`rounded-2xl px-4 py-5 text-sm font-extrabold ${method === item.key ? "bg-[var(--brand)] text-white" : "bg-white text-zinc-600 shadow-[0_10px_28px_rgba(24,24,27,0.08)]"}`}
            key={item.key}
            onClick={
              item.key === "currentLocation"
                ? useCurrentLocation
                : () => setMethod(item.key)
            }
            type="button"
          >
            {item.label}
          </button>
        ))}
      </section>
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(24,24,27,0.08)]">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="h-12 rounded-xl border border-[var(--border)] px-4 text-sm"
            placeholder="장소명"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <select
            className="h-12 rounded-xl border border-[var(--border)] px-4 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="culture">문화/스팟</option>
            <option value="cafe">카페</option>
            <option value="food">맛집</option>
            <option value="bar">술집</option>
            <option value="workshop">공방</option>
          </select>
          <input
            className="h-12 rounded-xl border border-[var(--border)] px-4 text-sm md:col-span-2"
            placeholder="주소 또는 위치 설명"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <input
            className="h-12 rounded-xl border border-[var(--border)] px-4 text-sm"
            placeholder="lat"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
          />
          <input
            className="h-12 rounded-xl border border-[var(--border)] px-4 text-sm"
            placeholder="lng"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
          />
          <input
            className="h-12 rounded-xl border border-[var(--border)] px-4 text-sm md:col-span-2"
            placeholder="사진 URL 또는 업로드 결과 URL"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <textarea
            className="h-28 rounded-xl border border-[var(--border)] p-4 text-sm md:col-span-2"
            placeholder="이 장소를 기억하고 싶은 이유"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <Button className="mt-5 w-full md:w-auto" onClick={save}>
          {copy.save}
        </Button>
      </section>
    </div>
  );
}
