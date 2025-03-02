import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, MessageSquarePlus, X, ArrowLeft } from "lucide-react";
import GroupModal from "./GroupModal";
import { formatMessageTime } from "../lib/utils";

const Sidebar = () => {
  const {
    getChats,
    chats,
    selectedChat,
    setSelectedChat,
    isChatsLoading,
    searchedResults,
    searchAllChats,
    startPrivateChat,
  } = useChatStore();

  const { onlineUsers, authUser } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchedList, setShowSearchedList] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getChats();
  }, [getChats]);

  useEffect(() => {
    if (!query) {
      return;
    }
    setShowSearchedList(true);
    setIsSearching(true);

    const delayDebounce = setTimeout(async () => {
      await searchAllChats(query);
      setIsSearching(false);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [query, searchAllChats]);

  const { subscribeToChats, unsubscribeFromChats } = useChatStore();

  // console.log(selectedChat)

  // useEffect(() => {
  //   subscribeToChats();

  //   return () => {
  //     unsubscribeFromChats();
  //   };
  // }, [subscribeToChats, unsubscribeFromChats]);

  console.log(chats);

  const filteredChats = showOnlineOnly
    ? chats.filter((chat) => {
        if (chat.isGroup) return false; // Skip group chats

        const otherMember = chat.members.find(
          (member) => member._id !== authUser._id
        );

        return otherMember && onlineUsers.includes(otherMember._id);
      })
    : chats;

  if (isChatsLoading) return <SidebarSkeleton />;

  return (
    <aside
      className={`${
        selectedChat ? "hidden md:flex" : "block"
      } h-full w-full md:w-72 border-r border-base-300 flex flex-col transition-all duration-200`}
    >
      <div className="border-b border-base-300 w-full p-5">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-2">
              <Users className="size-6" />
              <span className="font-medium">Chats</span>
            </div>
            <GroupModal>
              <MessageSquarePlus />
            </GroupModal>
          </div>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 flex items-center gap-2">
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
      <div className="flex justify-evenly items-center  py-3">
        {showSearchedList && (
          <ArrowLeft
            onClick={() => {
              setQuery("");
              setShowSearchedList(false);
            }}
          />
        )}
        <label className="input w-4/5 input-bordered flex items-center gap-2">
          <input
            // onClick={() => setShowSearchedList(true)}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            type="text"
            className="grow"
            placeholder="Search"
          />
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
        {showSearchedList && (
          <X
            onClick={() => {
              setQuery("");
              setShowSearchedList(false);
            }}
          />
        )}
      </div>

      {showSearchedList ? (
        isSearching ? (
          <div className="h-full flex justify-center items-center">
            <span className="loading loading-spinner"></span>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto">
              {searchedResults.chats.length !== 0 && (
                <>
                  <div className="p-5">CHATS</div>
                  <div className="w-full py-3">
                    {searchedResults?.chats?.map((chat) => {
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
                          <div className="relative">
                            <img
                              // src="/avatar.png"
                              src={
                                chat.isGroup
                                  ? chat?.groupAvatar || "/avatar.png"
                                  : chatUser.profilePic || "/avatar.png"
                              }
                              alt={chat.name}
                              className="size-12 object-cover rounded-full"
                            />
                            {!chat.isGroup &&
                              onlineUsers.includes(chatUser._id) && (
                                <span
                                  className="absolute bottom-0 right-0 size-3 bg-green-500
                    rounded-full ring-2 ring-zinc-900"
                                />
                              )}
                          </div>

                          <div className="text-left min-w-0 flex-grow">
                            <div className="flex justify-between">
                              <div className="font-medium truncate pr-2">
                                {chat.isGroup
                                  ? chat.groupName
                                  : chatUser.fullName}
                              </div>
                              <div className="text-[12px] font-medium shrink-0">
                                {chat.lastMessage &&
                                  formatMessageTime(chat.lastMessage.createdAt)}
                              </div>
                            </div>
                            {
                              <div className="flex justify-between">
                                <div className="text-sm text-zinc-400 min-h-5">
                                  {chat.lastMessage &&
                                    (chat.isGroup ? (
                                      <div className="truncate">
                                        {chat.lastMessage.sender.fullName}:{" "}
                                        {chat.lastMessage.text}
                                      </div>
                                    ) : (
                                      <div className="truncate">
                                        {chat.lastMessage.text}
                                      </div>
                                    ))}
                                </div>
                                {chat.unseenCount > 0 && (
                                  <div
                                    className="relative bottom-0 right-0 size-4 bg-green-500 rounded-full
              flex items-center justify-center text-xs text-black"
                                  >
                                    {chat.unseenCount}
                                  </div>
                                )}
                              </div>
                            }
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {searchedResults.contacts.length !== 0 && (
                <>
                  <div className="p-5">CONTACTS</div>
                  <div className="w-full py-3">
                    {searchedResults?.contacts?.map((user) => {
                      return (
                        <button
                          key={user._id}
                          onClick={async () => {
                            const chat = await startPrivateChat({
                              userId: user._id,
                            });
                            setSelectedChat(chat);
                          }}
                          className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${
                  selectedChat?._id === user._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }
              `}
                        >
                          <div className="relative">
                            <img
                              // src="/avatar.png"
                              src={user.profilePic || "/avatar.png"}
                              alt={user.fullName}
                              className="size-12 object-cover rounded-full"
                            />
                            {!user.isGroup &&
                              onlineUsers.includes(user._id) && (
                                <span
                                  className="absolute bottom-0 right-0 size-3 bg-green-500
                    rounded-full ring-2 ring-zinc-900"
                                />
                              )}
                          </div>

                          {/* User info - only visible on larger screens */}
                          <div className="text-left min-w-0">
                            <div className="font-medium truncate">
                              {user.fullName}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            {searchedResults.chats.length === 0 &&
              searchedResults.contacts.length === 0 &&
              searchedResults.messages.length === 0 && (
                <>
                  <div className="h-full w-full content-center p-5">
                    No matches found for chats, contacts or messages
                  </div>
                </>
              )}
          </>
        )
      ) : (
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
                <div className="relative">
                  <img
                    // src="/avatar.png"
                    src={
                      chat.isGroup
                        ? chat?.groupAvatar || "/avatar.png"
                        : chatUser.profilePic || "/avatar.png"
                    }
                    alt={chat.name}
                    className="size-12 object-cover rounded-full"
                  />
                  {!chat.isGroup && onlineUsers.includes(chatUser._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500
                            rounded-full ring-2 ring-zinc-900"
                    />
                  )}
                </div>

                {/* User info - only visible on larger screens */}
                <div className="text-left min-w-0 flex-grow">
                  <div className="flex justify-between">
                    <div className="font-medium truncate pr-2">
                      {chat.isGroup ? chat.groupName : chatUser.fullName}
                    </div>
                    <div className="text-[12px] font-medium shrink-0">
                      {chat.lastMessage &&
                        formatMessageTime(chat.lastMessage.createdAt)}
                    </div>
                  </div>
                  {
                    <div className="flex justify-between">
                      <div className="text-sm text-zinc-400 min-h-5">
                        {chat.lastMessage &&
                          (chat.isGroup ? (
                            <div className="truncate">
                              {chat.lastMessage.sender.fullName}:{" "}
                              {chat.lastMessage.text}
                            </div>
                          ) : (
                            <div className="truncate">
                              {chat.lastMessage.text}
                            </div>
                          ))}
                      </div>
                      {chat.unseenCount > 0 && (
                        <div
                          className="relative bottom-0 right-0 size-4 bg-green-500 rounded-full
              flex items-center justify-center text-xs text-black"
                        >
                          {chat.unseenCount}
                        </div>
                      )}
                    </div>
                  }
                </div>
              </button>
            );
          })}

          {filteredChats.length === 0 && (
            <div className="text-center text-zinc-500 py-4">
              No online users
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
