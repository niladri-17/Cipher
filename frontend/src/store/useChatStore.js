import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import whatsappNotification from "../assets/whatsappNotification.mp3";

export const useChatStore = create((set, get) => ({
  messages: [],
  chats: [],
  selectedChat: null,
  isChatsLoading: false,
  isMessagesLoading: false,
  searchedResults: {},

  startPrivateChat: async (data) => {
    try {
      const res = await axiosInstance.post("/chat/private", data);
      return res.data.data;
      // toast.success("Group created successfully");
    } catch (error) {
      if (error.response.status !== 401) toast.error("Failed to start chat");
    }
  },

  activatePrivateChat: async (chatId) => {
    try {
      await axiosInstance.patch(`/chat/${chatId}/activate`);
    } catch (error) {
      console.log(error);
    }
  },

  startGroupChat: async (data) => {
    try {
      const res = await axiosInstance.post("/chat/group", data);
      toast.success("Group created successfully");
    } catch (error) {
      if (error.response.status !== 401) toast.error("Failed to create group");
    }
  },

  getChats: async () => {
    set({ isChatsLoading: true });
    try {
      const res = await axiosInstance.get("/chat/all");
      // const res = await axiosInstance.get("/messages/users", {
      //   skipErrorToast: true
      // });
      set({ chats: res.data.data });
    } catch (error) {
      if (error.response.status !== 401)
        toast.error(error.response.data.message);
    } finally {
      set({ isChatsLoading: false });
    }
  },

  searchAllChats: async (query) => {
    // set({ isChatsLoading: true });
    try {
      const res = await axiosInstance.get(`/chat/all/search?query=${query}`);
      // const res = await axiosInstance.get("/messages/users", {
      //   skipErrorToast: true
      // });
      set({ searchedResults: res.data.data });
    } catch (error) {
      if (error.response.status !== 401)
        toast.error(error.response.data.message);
    } finally {
      // set({ isChatsLoading: false });
    }
  },

  getMessages: async (chatId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${chatId}`);
      set({ messages: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedChat, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/message/${selectedChat._id}`,
        messageData
      );
      set({ messages: [...messages, res.data.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToChats: () => {
    const { chats } = get();
    if (!chats) return;

    // Create audio object once
    const notificationSound = new Audio(whatsappNotification);
    notificationSound.load(); // Pre-load the audio

    const socket = useAuthStore.getState().socket;
    socket.on("newChat", (newChat) => {
      set((state) => {
        // Check if this chat already exists in our list
        const existingChatIndex = state.chats.findIndex(
          (chat) => chat._id === newChat._id
        );

        console.log("New chat received:", newChat);

        const authUserId = useAuthStore.getState().authUser._id;
        let shouldPlaySound = false;

        if (existingChatIndex !== -1) {
          // Existing chat - only play sound if it's not the selected chat
          shouldPlaySound = state.selectedChat?._id !== newChat._id;

          // Update chat - move it to the beginning and replace with updated version
          state.chats.splice(existingChatIndex, 1);
        } else {
          // New chat - play sound if current user didn't create it
          shouldPlaySound = newChat.createdBy !== authUserId;
        }

        // Try to play sound if needed
        if (shouldPlaySound) {
          notificationSound.play().catch((err) => {
            console.log("Could not play notification:", err);
          });
        }

        return {
          chats: [newChat, ...state.chats],
        };
      });
    });
  },

  unsubscribeFromChats: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newChat");
  },

  subscribeToMessages: () => {
    const { selectedChat } = get();
    if (!selectedChat) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedChat =
        newMessage?.chatId === selectedChat._id;
      if (!isMessageSentFromSelectedChat) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  openChat: (chatId) => {
    const userId = useAuthStore.getState().authUser._id;

    const socket = useAuthStore.getState().socket;

    // Notify server that user joined this chat
    socket.emit("joinChat", { chatId, userId });

    // Cleanup function when component unmounts or chat changes
    return () => {
      socket.emit("leaveChat", { chatId, userId });
    };
  },

  setSelectedChat: (selectedChat) => {
    set({ selectedChat });

    set((state) => ({
      chats: state.chats.map((chat) =>
        chat._id === selectedChat._id ? { ...chat, unseenCount: 0 } : chat
      ),
    }));
  },
  clearChat: async (chatId, data) => {
    try {
      const res = await axiosInstance.patch(`chat/${chatId}/clear`, data);
    } catch (error) {
      if (error.response.status !== 401) toast.error("Failed to clear the chat");
    }
  },
  deleteChat: async (chatId, data) => {
    try {
      const res = await axiosInstance.patch(`chat/${chatId}/clear`, data);
    } catch (error) {
      if (error.response.status !== 401) toast.error("Failed to clear the chat");
    }
  },
  exitGroup: async (chatId, data) => {
    try {
      const res = await axiosInstance.patch(`chat/${chatId}/clear`, data);
    } catch (error) {
      if (error.response.status !== 401) toast.error("Failed to clear the chat");
    }
  },
}));
