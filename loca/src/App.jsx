import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import OnboardingPage from "./pages/Onboarding";
import HomePage from "./pages/Home";
import ExplorePage from "./pages/Explore";
import ForYouPage from "./pages/ForYou";
import ContributorsPage from "./pages/Contributors";
import MapPage from "./pages/Map";
import MyPage from "./pages/My";
import ReviewWritePage from "./pages/ReviewWrite";
import PlaceNewPage from "./pages/PlaceNew";
import PlaceDetailPage from "./pages/PlaceDetail";
import CollectionsPage from "./pages/Collections";
import CollectionDetailPage from "./pages/CollectionDetail";
import AdminPage from "./pages/AdminDashboard";
import AdminPlacesPage from "./pages/AdminPlaces";
import AdminTagsPage from "./pages/AdminTags";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/for-you" element={<ForYouPage />} />
        <Route path="/contributors" element={<ContributorsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/review/write" element={<ReviewWritePage />} />
        <Route path="/place/new" element={<PlaceNewPage />} />
        <Route path="/place/:id" element={<PlaceDetailPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/places" element={<AdminPlacesPage />} />
        <Route path="/admin/tags" element={<AdminTagsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
