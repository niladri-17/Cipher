import { Users } from "lucide-react";
import GroupModal from "../GroupModal";
import { MessageSquarePlus } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="flex h-full w-full md:w-72 border-r border-base-300 flex-col transition-all duration-200">
      {/* Header */}
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
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-12 rounded-full" />
            </div>

            {/* User info skeleton - only visible on larger screens */}
            <div className="text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
