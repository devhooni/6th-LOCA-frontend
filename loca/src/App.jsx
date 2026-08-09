import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import HomePage from "./pages/Home";
import ExplorePage from "./pages/Explore";
import ContributorsPage from "./pages/Contributors";
import MapPage from "./pages/Map";
import MyPage from "./pages/My";
import { ReviewWriteForm as ReviewWritePage } from "./pages/ReviewWriteForm";
import { PlaceNewClient as PlaceNewPage } from "./pages/PlaceNewClient";
import PlaceDetailPage from "./pages/PlaceDetail";
import AdminPage from "./pages/AdminDashboard";
import AdminPlacesPage from "./pages/AdminPlaces";
import AdminTagsPage from "./pages/AdminTags";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/contributors" element={<ContributorsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/review/write" element={<ReviewWritePage />} />
        <Route path="/place/new" element={<PlaceNewPage />} />
        <Route path="/place/:id" element={<PlaceDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/places" element={<AdminPlacesPage />} />
        <Route path="/admin/tags" element={<AdminTagsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
