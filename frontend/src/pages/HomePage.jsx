import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupModal from "../components/GroupModal";
import { useEffect } from "react";

const HomePage = () => {
  const { selectedChat } = useChatStore();
  // const { subscribeToChats, unsubscribeFromChats } = useChatStore();

  // // // console.log(selectedChat)

  // useEffect(() => {
  //   const initializeSocket = async () => {
  //     await subscribeToChats();
  //   };

  //   initializeSocket();

  //   return () => {
  //     unsubscribeFromChats();
  //   };
  // }, [subscribeToChats, unsubscribeFromChats]);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedChat ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
