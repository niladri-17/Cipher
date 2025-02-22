import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  createGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/chat/group", data);
      toast.success("Group created successfully");
      set.groupName("");
    } catch (error) {
      if (error.response.status !== 401) toast.error("Failed to create group");
    }
  },
}));
