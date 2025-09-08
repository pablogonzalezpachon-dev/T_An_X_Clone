import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "/src/Lib/Styles/App.css";

import Showcase from "./Views/Showcase.tsx";
import MainLayout from "./Views/MainLayout.tsx";
import HomePage from "./Views/Home/HomePage.tsx";
import ExplorePage from "./Views/Explore/ExplorePage.tsx";
import MessagesPage from "./Views/Messages/MessagesPage.tsx";
import NexusPage from "./Views/Nexus/NexusPage.tsx";
import ProfilePage from "./Views/Profile/ProfilePage.tsx";
import SettingsPage from "./Views/Settings/SettingsPage.tsx";
import axios from "axios";
import AuthProvider from "./Lib/Contexts/AuthContext.tsx";
import RepliesPage from "./Views/Profile/RepliesPage.tsx";
import LikesPage from "./Views/Profile/LikesPage.tsx";
import PostPage from "./Views/Post/PostPage.tsx";
import MediaPage from "./Views/Profile/MediaPage.tsx";
import ProfilePostsPage from "./Views/Profile/ProfilePostsPage.tsx";

axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Showcase />} />

        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/:userId/status/:postId" element={<PostPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/nexus" element={<NexusPage />} />

          <Route path="/:userId" element={<ProfilePage />}>
            <Route index element={<ProfilePostsPage />} />
            <Route path="with_replies" element={<RepliesPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="likes" element={<LikesPage />} />
          </Route>

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
