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
    socket.off("newMessage");
  },

  setSelectedChat: (selectedChat) => set({ selectedChat }),
}));
