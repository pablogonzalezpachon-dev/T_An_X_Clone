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
import React, { useContext, useEffect, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { RiUserFollowLine } from "react-icons/ri";
import { AuthContext } from "../Contexts/AuthContext";
import axios from "axios";

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
  const {
    followed: isFollowing,
    setFollowed: setIsFollowing,
    followers,
    setFollowers,
    followState,
  } = useContext(AuthContext);
  console.log(followed);

  const [userFollow, setUserFollow] = useState(followed);
  async function handleFollow() {
    console.log(user_id);
    const previousfollowers = followers;
    try {
      setUserFollow(true);
      setFollowers((follower) => follower + 1);
      setIsFollowing(true);
      const { data: followResponse } = await axios.post<string>(
        "http://localhost:3000/user/follow",
        { userId: user_id }
      );
      console.log(followResponse);
    } catch (e) {
      setFollowers(previousfollowers);
      setUserFollow(false);
      setIsFollowing(false);
      console.log(e);
    }
  }

  async function handleUnfollow() {
    const previousfollowers = followers;
    try {
      setUserFollow(false);
      setIsFollowing(false);
      setFollowers((follower) => follower - 1);
      const { data: unfollowResponse } = await axios.delete<string>(
        `http://localhost:3000/user/unfollow/${user_id}`
      );
      console.log(unfollowResponse);
    } catch (e) {
      setFollowers(previousfollowers);
      setUserFollow(true);
      setIsFollowing(true);
      console.log(e);
    }
  }

  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true; // skip the first run
      return;
    }
    setUserFollow(isFollowing);
  }, [followState]);

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
                    userFollow ? handleUnfollow() : handleFollow();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-md font-bold rounded-xl hover:bg-gray-100"
                >
                  <RiUserFollowLine />
                  <p className="truncate">
                    {userFollow ? "Unfollow" : "Follow"} {t_identifier}
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
