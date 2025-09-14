import { SlUserFollow } from "react-icons/sl";
import { timeAgo } from "../functions";
import { FiMessageSquare } from "react-icons/fi";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa";
import axios from "axios";
import { useContext, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router";
import { FiTrash2 } from "react-icons/fi";
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
import DropDownButton from "./DropDownButton";
import { AuthContext } from "../Contexts/AuthContext";

type Props = {
  id: number;
  content: string;
  date_of_creation: string;
  name: string;
  t_identifier: string;
  likes: number;
  active_user_liked: boolean;
  active_user_creator: boolean;
  onDelete: (postId: number) => Promise<void>;
  user_id: string;
  replies: number;
  followed: boolean;
};

function PostCard({
  id,
  content,
  date_of_creation,
  name,
  t_identifier,
  likes,
  active_user_liked,
  active_user_creator,
  onDelete,
  user_id,
  replies,
  followed,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [liked, setLiked] = useState(active_user_liked);
  const [numlikes, setnumLikes] = useState(likes);

  async function handleLike() {
    const originalNumLikes = numlikes;
    setLiked(true);
    setnumLikes((numLikes) => numLikes + 1);
    try {
      const response = await axios.post(
        "http://localhost:3000/user/post/like",
        {
          postId: id,
        }
      );
      console.log(response);
    } catch (error) {
      setLiked(false);
      setnumLikes(originalNumLikes);
      console.error("Error liking post:", error);
    }
  }

  async function handleUnlike() {
    const originalNumLikes = numlikes;
    setLiked(false);
    setnumLikes((numLikes) => numLikes - 1);
    try {
      const response = await axios.post(
        "http://localhost:3000/user/post/unlike",
        {
          postId: id,
        }
      );
      console.log(response);
    } catch (error) {
      setLiked(true);
      setnumLikes(originalNumLikes);
      console.error("Error unliking post:", error);
    }
  }

  async function handleFollow() {
    try {
      const { data: followResponse } = await axios.post<string>(
        "http://localhost:3000/user/follow",
        { user_id }
      );
      console.log(followResponse);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div
      className="w-full border-b border-x border-gray-200 p-4 cursor-pointer"
      onClick={() => {
        if (dialogOpen) return;
        navigate("/" + user_id + "/status/" + id);
      }}
    >
      <div className="w-full flex h-15 justify-between">
        <div className="flex gap-x-2">
          <div className="w-11 h-11 rounded-full bg-black"></div>
          <p
            className="font-semibold truncate hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              if (location.pathname !== `/${user_id}`) {
                navigate(`/${user_id}`);
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            {name}
          </p>
          <p className="text-gray-500">
            {t_identifier} ·{" "}
            {timeAgo(date_of_creation, {
              locale: "en-US",
              timeZone: "America/Guayaquil",
            })}
          </p>
        </div>
        <div>
          <DropDownButton
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            active_user_creator={active_user_creator}
            onDelete={() => {
              onDelete(id);
            }}
            t_identifier={t_identifier}
            followed={followed}
            user_id={user_id}
          />
        </div>
      </div>
      <div className="px-13 mt-[-30px]">
        <p className="whitespace-pre-wrap break-all">{content}</p>
      </div>
      <div className="h-5 w-full mt-5 flex justify-evenly">
        <div className="flex items-center gap-x-1 ">
          <FiMessageSquare color="gray" size={20} className="" />
          <p className="text-gray-500">{replies}</p>
        </div>

        <div className="flex items-center gap-x-1 ">
          <BiRepost color="gray" size={25} className="" />
          <p className="text-gray-500">0</p>
        </div>

        <div className="flex items-center gap-x-2 ">
          <FaRegHeart
            onClick={(e) => {
              e.stopPropagation();
              liked ? handleUnlike() : handleLike();
            }}
            color={liked ? "red" : "gray"}
            size={18}
            className=""
          />
          <p className={`text-${liked ? "red" : "gray"}-500`}>{numlikes}</p>
        </div>

        <div className="flex items-center gap-x-1 ">
          <FaEye color="gray" size={20} className="" />
          <p className="text-gray-500">0</p>
        </div>

        <div className="flex items-center gap-x-1 ">
          <FaRegBookmark color="gray" size={20} className="" />
        </div>
      </div>
    </div>
  );
}

export default PostCard;
