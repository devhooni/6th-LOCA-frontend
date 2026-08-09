import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TagChip } from '@/src/components/common/TagChip';
import { AppShell } from '@/src/components/layout/AppShell';
import { getPublicPlaceById, getPlaceReviews } from '@/src/services/placeService';

const TABS = ['정보', '기록', '주변'];

export default function PlaceDetailPage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('정보');

  useEffect(() => {
    setLoading(true);
    Promise.all([getPublicPlaceById(id), getPlaceReviews(id)])
      .then(([placeData, reviewsData]) => {
        setPlace(placeData);
        setReviews(reviewsData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AppShell><p>로딩 중...</p></AppShell>;
  if (!place) return <AppShell><p>장소를 찾을 수 없어요. <Link to='/explore'>돌아가기</Link></p></AppShell>;

  return (
    <AppShell>
      <Link to='/explore'>← 탐색으로 돌아가기</Link>
      <img src={place.imageUrl} alt={place.name} style={{ width: '100%', height: 200, objectFit: 'cover', marginTop: 8 }} />
      <h1>{place.name}</h1>
      <p>{place.categoryLabel} · {place.address}</p>
      {place.rating && <p>별점 {place.rating} · 기록 {reviews.length}개</p>}
      <div>
        {TABS.map((tab) => (
          <button key={tab} type='button' onClick={() => setActiveTab(tab)}
            style={{ fontWeight: activeTab === tab ? 'bold' : 'normal', marginRight: 8 }}>
            {tab}
          </button>
        ))}
      </div>
      <hr />
      {activeTab === '정보' && (
        <div>
          <div>
            <TagChip active>{place.categoryLabel}</TagChip>
            {(place.tags ?? []).slice(0, 4).map((tag) => <TagChip key={tag}>{tag}</TagChip>)}
          </div>
          {place.description && <p>{place.description}</p>}
          {place.address && <p>주소: {place.address}</p>}
          {place.hours && <p>영업시간: {place.hours}</p>}
        </div>
      )}
      {activeTab === '기록' && (
        <div>
          <p>방문자 기록 {reviews.length}개</p>
          {reviews.length === 0
            ? <p>아직 기록이 없어요.</p>
            : reviews.map((review) => (
                <article key={review.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                  <strong>{review.title}</strong>
                  <p>{review.memory || review.review}</p>
                  <small>{review.date}</small>
                </article>
              ))}
        </div>
      )}
      {activeTab === '주변' && <p><Link to='/map'>지도에서 주변 장소 보기</Link></p>}
      <hr />
      <Link to={'/review/write?placeId=' + place.id}>이 장소 기록하기</Link>
    </AppShell>
  );
}
