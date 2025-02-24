import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { setNavigate } from "./lib/navigation.js";
import { useChatStore } from "./store/useChatStore.js";

const App = () => {
  const { authUser, onlineUsers, connectSocket, disconnectSocket } =
    useAuthStore();
  const { subscribeToChats, unsubscribeFromChats } = useChatStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  // useEffect(() => {
  //   checkAuth();
  // }, [checkAuth]);

  useEffect(() => {
    setNavigate(navigate); // Store global navigate
  }, [navigate]);

  useEffect(() => {
    const initializeSocket = async () => {
      await connectSocket();
      await subscribeToChats();
    };

    initializeSocket();

    return () => {
      disconnectSocket();
      unsubscribeFromChats();
    };
  }, [connectSocket, disconnectSocket, subscribeToChats, unsubscribeFromChats]);

  console.log({ onlineUsers });

  // if (!authUser)
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Loader className="size-10 animate-spin" />
  //     </div>
  //   );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
