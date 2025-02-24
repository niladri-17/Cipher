import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedChat, setSelectedChat } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  // console.log("selectedChat", selectedChat);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedChat.profilePic || "/avatar.png"}
                alt={selectedChat.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">
              {selectedChat.isGroup
                ? selectedChat.groupName
                : selectedChat.members.find(
                    (member) => member._id !== authUser._id
                  ).fullName}
            </h3>
            <p className="text-sm text-base-content/70 min-h-5">
              {!selectedChat.isGroup && (
                <>
                  {onlineUsers.includes(
                    selectedChat.members.find(
                      (member) => member._id !== authUser._id
                    )
                  )
                    ? "Online"
                    : "Offline"}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex">
          {/* Search */}
          <button className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <div className="flex-none rotate-90">
            <button className="btn btn-circle btn-ghost ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                ></path>
              </svg>
            </button>
          </div>

          {/* Close button */}
          <button onClick={() => setSelectedChat(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
