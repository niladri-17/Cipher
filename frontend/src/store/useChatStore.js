import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

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

    const socket = useAuthStore.getState().socket;
    socket.on("newChat", (newChat) => {
      set((state) => {
        // Check if this chat already exists in our list
        const existingChatIndex = state.chats.findIndex(
          (chat) => chat._id === newChat._id
        );

        if (existingChatIndex !== -1) {
          // Chat exists - replace it with updated version
          const updatedChats = [...state.chats];
          updatedChats[existingChatIndex] = newChat;
          return { chats: updatedChats };
        } else {
          // New chat - add it to the beginning of the array
          return { chats: [newChat, ...state.chats] };
        }
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

    // Mark this chat as the active one
    // setActiveChat(chatId);

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
}));
