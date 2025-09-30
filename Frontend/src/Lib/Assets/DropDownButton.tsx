import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { BsThreeDots } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { RiUserFollowLine } from "react-icons/ri";
import useStore from "../zustandStore";
import { handleFollow, handleUnfollow } from "../stateFunctions";

type Props = {
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
  active_user_creator: boolean;
  onDelete: () => void;
  t_identifier: string;
  followed: boolean;
  user_id: string;
};

function DropDownButton({
  dialogOpen,
  setDialogOpen,
  active_user_creator,
  onDelete,
  t_identifier,
  followed,
  user_id,
}: Props) {
  const user = useStore((state) => state.users).find(
    (user) => user.id === user_id
  );

  return (
    <>
      <Menu
        as="div"
        className="relative inline-block text-center p-1 mt-[-3px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <MenuButton
            className="p-1 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Post actions"
          >
            <BsThreeDots size={20} className="m-auto" />
          </MenuButton>
        </div>
        <Dialog open={dialogOpen} onClose={() => {}} className="relative z-10">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className=" flex min-h-full  justify-center p-4 text-center items-center">
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-80 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
              >
                <div className="bg-white px-5 pt-2">
                  <div className=" text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle
                      as="h1"
                      className="font-bold text-gray-900 text-xl mt-1 text-left"
                    >
                      Delete post?
                    </DialogTitle>
                    <p className="mt-3 text-gray-500">
                      This can't be undone and it will be removed from your
                      profile, the timeline of any accounts that follow you, and
                      from search results.{" "}
                    </p>
                  </div>
                  <div className="flex flex-col mt-5 gap-y-4 mb-8 items-center px-3">
                    <button
                      onClick={() => {
                        onDelete();
                        setDialogOpen(false);
                      }}
                      className="bg-red-500 text-white h-10 font-bold rounded-3xl w-full"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setDialogOpen(false);
                      }}
                      className="border border-gray-300 h-10 font-bold rounded-3xl w-full"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            static
            className="absolute right-0 z-20 mt-2 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem>
              {active_user_creator ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDialogOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-md font-bold text-red-600 rounded-xl hover:bg-red-100"
                  type="button"
                >
                  <FiTrash2 />
                  Delete
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    user?.followed
                      ? handleUnfollow(user_id)
                      : handleFollow(user_id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-md font-bold rounded-xl hover:bg-gray-100"
                >
                  <RiUserFollowLine />
                  <p className="truncate">
                    {user?.followed ? "Unfollow" : "Follow"} {t_identifier}
                  </p>
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    </>
  );
}

export default DropDownButton;
