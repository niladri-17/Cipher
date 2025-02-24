// useAuthStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios.js";

// const BASE_URL =
//   import.meta.env.MODE === "development"
//      ? "http://localhost:5001"
//     : "https://cipher-mern-chat-app.vercel.app";

const BASE_URL =
  import.meta.env.MODE === "development"
     ? "http://localhost:5001"
    : "/";

// Create a slice for persisted state
const createPersistedSlice = (set, get) => ({
  authUser: null,
});

// Create a slice for non-persisted state
const createNonPersistedSlice = (set, get) => ({
  socket: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  // isCheckingAuth: false,
  onlineUsers: [],
  searchedUsers: [],
  isUsersSearching: false,
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...createPersistedSlice(set, get),
      ...createNonPersistedSlice(set, get),

      // checkAuth: async () => {
      //   try {
      //     const res = await axiosInstance.get("/auth/check");
      //     set({
      //       authUser: res.data,
      //       isCheckingAuth: false,
      //     });
      // get().connectSocket();
      //   } catch (error) {
      //     console.log("Error in checkAuth:", error);
      //     set({
      //       authUser: null,
      //       isCheckingAuth: false,
      //     });
      //   }
      // },

      setAuthUser: (user) => set({ authUser: user }),
      setOnlineUsers: (users) => set({ onlineUsers: users }),

      signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          set({ authUser: res.data.data.user });
          toast.success("Account created successfully");
          get().connectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data.data.user });
          toast.success("Logged in successfully");
          get().connectSocket();
        } catch (error) {
          // if (error.response.status !== 401)
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          const res = await axiosInstance.post("/auth/logout");

          toast.success(res.data.message);

          get().disconnectSocket();
        } catch (error) {
          console.log("Error in logout:", error);
          // toast.error(error.response.data.message);
        } finally {
          set({ authUser: null, onlineUsers: [] });
        }
      },

      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.patch("/auth/update-avatar", data);
          set({ authUser: res.data.data });
          toast.success("Avatar updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          if (error.response.status !== 401)
            toast.error(error?.response?.data?.message);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

      getUsers: async (search) => {
        set({ isUsersSearching: true });
        try {
          const res = await axiosInstance.get(`/user/search?query=${search}`);
          set({ searchedUsers: res.data.data });
        } catch (error) {
          if (error.response.status !== 401)
            toast.error(error.response.data.message);
        } finally {
          set({ isUsersSearching: false });
        }
      },

      setIsOpenGroupModal: (value) => set({ isOpenGroupModal: value }),

      setSearchedUsers: (searchedUsers) =>
        set({ searchedUsers: searchedUsers }),

      connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
        });

        // const socket = io(BASE_URL, {
        //   query: {
        //     userId: authUser._id,
        //   },
        //   withCredentials: true,
        //   reconnectionAttempts: 5,
        //   reconnectionDelay: 1000,
        //   autoConnect: true,
        // });

        // Add error handling
        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

        socket.connect();
        set({ socket });

        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },

      disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
          socket.disconnect();
          set({ socket: null });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        authUser: state.authUser,
        // socket: state.socket,
      }),
    }
  )
);
