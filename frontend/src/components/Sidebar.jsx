import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, MessageSquarePlus } from "lucide-react";
import GroupModal from "./GroupModal";
import { useGroupStore } from "../store/useGroupStore";

const Sidebar = () => {
  const { getChats, chats, selectedChat, setSelectedChat, isChatsLoading } =
    useChatStore();

  const { isOpenGroupModal, setIsOpenGroupModal } = useGroupStore();

  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getChats();
  }, [getChats]);

  console.log(chats);

  const filteredChats = showOnlineOnly
    ? chats.filter((chat) =>
        onlineUsers.includes(
          !chat.isGroup &&
            chat.members.find((member) => member._id !== authUser._id)
        )
      )
    : chats;

  if (isChatsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <Users className="size-6" />
            <GroupModal>
              <MessageSquarePlus />
            </GroupModal>
          </div>
          <span className="font-medium hidden lg:block">Chats</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* {isOpenGroupModal && <GroupModal />} */}

      {/* Search */}
      <label className="input input-bordered flex items-center gap-2 mx-2 mt-2">
        <input type="text" className="grow" placeholder="Search" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 opacity-70"
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg>
      </label>

      <div className="overflow-y-auto w-full py-3">
        {filteredChats.map((chat) => {
          const chatUser = chat.members.find(
            (member) => member._id !== authUser._id
          );

          return (
            <button
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${
                  selectedChat?._id === chat._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src="/avatar.png"
                  // src={
                  //   chat.isGroup
                  //     ? chat?.groupAvatar || "/avatar.png"
                  //     : chatUser.profilePic || "/avatar.png"
                  // }
                  alt={chat.name}
                  className="size-12 object-cover rounded-full"
                />
                {!chat.isGroup && onlineUsers.includes(chat._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">
                  {chat.isGroup ? chat.groupName : chatUser.fullName}
                </div>
                {
                  <div className="text-sm text-zinc-400 min-h-5">
                    {chat.lastMessage &&
                      (chat.isGroup ? (
                        <div className="truncate">
                          {chat.lastMessage.sender.fullName}:{" "}
                          {chat.lastMessage.text}
                        </div>
                      ) : (
                        <div className="truncate">{chat.lastMessage.text}</div>
                      ))}
                  </div>
                }
              </div>
            </button>
          );
        })}

        {filteredChats.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
