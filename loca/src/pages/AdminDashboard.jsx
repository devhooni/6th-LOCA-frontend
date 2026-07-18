import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";
import { getPlaces } from "@/src/services/placeService";
import { getTags } from "@/src/services/tagService";

const copy = {
  title: "Admin Dashboard",
  places: "장소 관리",
  tags: "태그 관리",
  placeCount: "등록된 장소",
  tagCount: "등록된 태그",
};

export default function AdminPage() {
  const [places, setPlaces] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlaces(), getTags()]).then(([placesData, tagsData]) => {
      setPlaces(placesData);
      setTags(tagsData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="w-full md:pl-8 py-10 text-zinc-500">불러오는 중...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full md:pl-8">
        <h1 className="text-2xl font-extrabold md:text-3xl">{copy.title}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            className="rounded-2xl bg-white p-6 shadow-[0_10px_28px_rgba(24,24,27,0.08)]"
            to="/admin/places"
          >
            <p className="text-lg font-extrabold">{copy.places}</p>
            <p className="mt-4 text-sm font-semibold text-zinc-500">
              {copy.placeCount}
            </p>
            <p className="mt-2 text-3xl font-extrabold">{places.length}</p>
          </Link>
          <Link
            className="rounded-2xl bg-white p-6 shadow-[0_10px_28px_rgba(24,24,27,0.08)]"
            to="/admin/tags"
          >
            <p className="text-lg font-extrabold">{copy.tags}</p>
            <p className="mt-4 text-sm font-semibold text-zinc-500">
              {copy.tagCount}
            </p>
            <p className="mt-2 text-3xl font-extrabold">{tags.length}</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

