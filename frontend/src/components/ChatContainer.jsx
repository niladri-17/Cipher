import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ImageGrid from "./ImageGrid";
import { Images } from "lucide-react";
import ReadMore from "./ReadMore";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedChat,
    subscribeToMessages,
    unsubscribeFromMessages,
    openChat,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    const cleanup = openChat(selectedChat._id);

    return cleanup;
  }, [openChat, selectedChat]);

  useEffect(() => {
    getMessages(selectedChat._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedChat._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // console.log(selectedChat);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // console.log("hi");
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const images = message.media;
          console.log(message)
          return (
            <div
              key={message._id}
              className={`chat ${
                message.sender._id === authUser._id ? "chat-end" : "chat-start"
              }`}
              ref={messageEndRef}
            >
              <div className=" chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.sender._id === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : message.sender.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {images && (
                  // <img
                  //   src={images[0]}
                  //   alt="Attachment"
                  //   className="sm:max-w-[200px] rounded-md mb-2"
                  // />
                  <ImageGrid images={images} />
                )}
                {message.text && (
                  <p>
                    <ReadMore text={message.text} maxWords={30} />
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
