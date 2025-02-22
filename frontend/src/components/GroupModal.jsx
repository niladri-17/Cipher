import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import toast from "react-hot-toast";

const GroupModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isUsersSearching, searchedUsers, setSearchedUsers, getUsers } =
    useAuthStore();
  const { createGroup } = useGroupStore();
  const modalRef = useRef(null);
  const [query, setQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [groupName, setGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const clearModalState = useCallback(() => {
  //   setSelectedUsers([]);
  //   setQuery("");
  //   setGroupName("");
  //   setSearchedUsers([]);
  // }, [setSearchedUsers]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    try {
      setIsSubmitting(true);

      const userIds = selectedUsers.map((user) => user._id);
      createGroup({
        userIds,
        groupName: groupName.trim(),
      });
      closeModal();

      // You might want to trigger some callback here to refresh the chat list
      // if (onGroupCreated) onGroupCreated(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync the React state with the dialog DOM element
  useEffect(() => {
    const modal = modalRef.current;
    if (isOpen) {
      setGroupName("");
      setQuery("");
      setSearchedUsers([]);
      setSelectedUsers([]);
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen, setSearchedUsers, setSelectedUsers]);

  // Handle the dialog's built-in close events
  useEffect(() => {
    const modal = modalRef.current;

    const handleClose = () => {
      setIsOpen(false);
    };

    modal.addEventListener("close", handleClose);

    return () => {
      modal.removeEventListener("close", handleClose);
    };
  }, []);

  // User search
  useEffect(() => {
    if (!query) {
      setSearchedUsers([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      getUsers(query);
      console.log(query);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [query, getUsers, setSearchedUsers]);

  return (
    <>
      <span onClick={openModal} className="cursor-pointer">
        {children}
      </span>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeModal}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-5">Create Group</h3>
          <form className="flex flex-col gap-5">
            <label className="input input-bordered flex items-center gap-2">
              <input
                value={groupName}
                type="text"
                className="grow"
                placeholder="Group name"
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </label>
            {selectedUsers &&
              Array.isArray(selectedUsers) &&
              selectedUsers.length > 0 && (
                <ul className="flex gap-2 items-center flex-wrap">
                  {selectedUsers.map((user) => (
                    <li key={user._id}>
                      <span>{user.fullName}</span>
                      <span
                        onClick={() =>
                          setSelectedUsers(
                            selectedUsers.filter((u) => u._id !== user._id)
                          )
                        }
                        className="btn btn-sm btn-circle btn-ghost"
                      >
                        x
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="grow"
                placeholder="Search members"
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
            {isUsersSearching ? (
              <span className="loading loading-spinner self-center loading-md"></span>
            ) : (
              searchedUsers &&
              Array.isArray(searchedUsers) &&
              searchedUsers.length > 0 && (
                <ul className="dropdown-content bg-base-100 p-2 shadow max-h-44 overflow-y-auto">
                  {searchedUsers.map((user) => (
                    <li
                      key={user._id}
                      className="cursor-pointer p-2"
                      onClick={() => {
                        // Only add the user if they're not already in the selectedUsers array
                        if (
                          !selectedUsers.some(
                            (selectedUser) => selectedUser._id === user._id
                          )
                        ) {
                          setSelectedUsers([...selectedUsers, user]);
                        }
                      }}
                    >
                      {user.fullName}
                    </li>
                  ))}
                </ul>
              )
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={
                isSubmitting || !groupName.trim() || selectedUsers.length === 0
              }
            >
              {isSubmitting ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Create Group"
              )}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default GroupModal;
