import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatLastSeen } from "../lib/utils";

const ChatHeader = () => {
  const { selectedChat, setSelectedChat, clearChat, deleteChat, exitGroup } =
    useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  // console.log("selectedChat", selectedChat);

  const count = selectedChat.members.reduce(
    (acc, member) =>
      member._id !== authUser._id && onlineUsers.includes(member._id)
        ? acc + 1
        : acc,
    0
  );

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={
                  !selectedChat.isGroup
                    ? selectedChat.members.find(
                        (member) => member._id !== authUser._id
                      ).profilePic
                    : selectedChat.groupAvatar
                }
                alt={
                  !selectedChat.isGroup
                    ? selectedChat.members.find(
                        (member) => member._id !== authUser._id
                      ).fullName
                    : selectedChat.groupName
                }
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
              {!selectedChat.isGroup ? (
                onlineUsers.includes(
                  selectedChat.members.find(
                    (member) => member._id !== authUser._id
                  )?._id
                ) ? (
                  "Online"
                ) : (
                  "last seen " +
                  formatLastSeen(
                    selectedChat.members.find(
                      (member) => member._id !== authUser._id
                    )?.lastSeen
                  )
                )
              ) : (
                <>{count > 1 ? count + " members" : count + " member"} online</>
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
          {/*
          <details className="dropdown">
            <summary className="btn m-1">open or close</summary>
          </details> */}

          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-circle btn-ghost dropdown-toggle"
            >
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
                  d="M12 5h.01M12 12h.01M12 19h.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                ></path>
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-100 rounded-box z-10 w-52 p-2 shadow"
            >
              <li onClick={() => clearChat(selectedChat._id)}>
                <a>Clear chat</a>
              </li>
              <li onClick={() => deleteChat(selectedChat._id)}>
                <a>Delete Chat</a>
              </li>
              {selectedChat.isGroup && (
                <li onClick={() => exitGroup(selectedChat._id)}>
                  <a>Exit group</a>
                </li>
              )}
            </ul>
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
