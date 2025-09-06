import axios from "axios";
import { useEffect, useState } from "react";
import { BiRepost } from "react-icons/bi";
import { BsThreeDots } from "react-icons/bs";
import { FaEye, FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi";
import { useNavigate, useParams } from "react-router";
import type { Post, UserProfile } from "../../Lib/types";
import { autoGrow, formatTimeDotDate } from "../../Lib/functions";
import { IoIosArrowRoundBack } from "react-icons/io";
import { VscSettings } from "react-icons/vsc";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostCard from "../../Lib/Assets/PostCard";

type Props = {};

console.log(
  formatTimeDotDate("2025-09-03T23:51:04.977Z", {
    locale: "en-US",
    timeZone: "America/Guayaquil",
  })
);

type Inputs = {
  content: string;
};

function PostPage({}: Props) {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [contentState, setContentState] = useState(false);
  const [postData, setPostData] = useState<Post | undefined>();
  const [liked, setLiked] = useState<boolean | null>();
  const initialLikes = parseInt(postData?.likes as string) || 0;
  const [numLikes, setnumLikes] = useState<number>(initialLikes);
  const [replies, setReplies] = useState<Post[]>([]);

  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [repliesLoading, setRepliesLoading] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<Inputs>({});

  async function handleLike() {
    const originalNumLikes = numLikes;
    setLiked(true);
    setnumLikes((numLikes) => numLikes + 1);
    try {
      const response = await axios.post(
        "http://localhost:3000/user/post/like",
        {
          postId: postId,
        }
      );
      console.log(response);
    } catch (error) {
      setLiked(null);
      setnumLikes(originalNumLikes);
      console.error("Error liking post:", error);
    }
  }

  async function handleUnlike() {
    const originalNumLikes = numLikes;
    setLiked(null);
    setnumLikes((numLikes) => numLikes - 1);
    try {
      const response = await axios.post(
        "http://localhost:3000/user/post/unlike",
        {
          postId: postId,
        }
      );
      console.log(response);
    } catch (error) {
      setLiked(true);
      setnumLikes(originalNumLikes);
      console.error("Error unliking post:", error);
    }
  }
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const originalReplies = replies;
    setContentState(false);
    reset();
    // optimistic UI

    console.log(data);

    try {
      const { data: profileData } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/profile`
      );

      postId &&
        setReplies([
          {
            ...data,
            id: Math.random(),
            date_of_creation: new Date().toISOString(),
            name: profileData[0].name,
            t_identifier: profileData[0].t_identifier,
            likes: "0",
            active_user_liked: null,
            active_user_creator: true,
            user_id: profileData[0].id,
            reply_to: parseInt(postId),
          },
          ...originalReplies,
        ]);
      const postIdnum = postId && parseInt(postId);

      const { data: replyPostId } = await axios.post<number>(
        "http://localhost:3000/user/post",
        {
          ...data,
          replyTo: postIdnum,
        }
      );
      postId &&
        setReplies([
          {
            ...data,
            id: replyPostId,
            date_of_creation: new Date().toISOString(),
            name: profileData[0].name,
            t_identifier: profileData[0].t_identifier,
            likes: "0",
            active_user_liked: null,
            active_user_creator: true,
            user_id: profileData[0].id,
            reply_to: parseInt(postId),
          },
          ...originalReplies,
        ]);
    } catch (e) {
      setReplies(replies.slice(1));
      console.error("Error creating post:", e);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setReplies([]);
      setRepliesLoading(true);
      setPostLoading(true);
      try {
        const { data: postData } = await axios.get<Post>(
          `http://localhost:3000/user/post/${postId}`
        );
        console.log(postData);
        setPostData(postData);
        setnumLikes(parseInt(postData.likes));
        setLiked(postData.active_user_liked);

        const { data: repliesData } = await axios.get<Post[]>(
          `http://localhost:3000/user/post/replies/${postId}`
        );
        console.log(repliesData);
        setReplies(repliesData);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
      setRepliesLoading(false);
      setPostLoading(false);
    };
    fetchPost();
  }, [postId]);

  const handleDelete = async (postId: number) => {
    const originalReplies = replies;
    try {
      setReplies((prevReplies) =>
        prevReplies.filter((reply) => reply.id !== postId)
      );
      const response = await axios.delete(
        `http://localhost:3000/user/post/${postId}`
      );
      console.log(response);
    } catch (error) {
      setReplies(originalReplies);
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="grid grid-cols-[1fr_clamp(0px,35vw,900px)] max-[1000px]:grid-cols-[1fr]">
      <div className="h-screen border-x border-gray-200">
        <div className="w-full h-15 border-b border-gray-200 flex items-center place-content-between gap-x-40 px-4">
          <div className="flex items-center gap-x-7">
            <IoIosArrowRoundBack
              size={30}
              className="my-auto"
              onClick={() => {
                navigate(-1);
              }}
            />
            <p className="font-bold text-lg">Post</p>
          </div>
          <div className="flex items-center gap-x-2">
            <button className="border-1 border-gray-500 rounded-3xl text-md w-23 font-bold h-8">
              Reply
            </button>
            <VscSettings size={30} />
          </div>
        </div>
        <div className="w-full border-b border-gray-200 p-4">
          <div
            className="w-full flex h-15 justify-between cursor-pointer"
            onClick={() => {}}
          >
            <div className="flex gap-x-2">
              <div className="w-11 h-11 rounded-full bg-black"></div>
              <div className="flex flex-col">
                <p className="font-semibold truncate ">{postData?.name}</p>
                <p className="text-gray-500 mt-[-5px]">
                  {postData?.t_identifier}
                </p>
              </div>
            </div>
            <div>
              <BsThreeDots onClick={() => {}} size={20} className="mt-1" />
            </div>
          </div>
          <div className="mt-[-5px]">
            <p className="whitespace-pre-wrap break-all">{postData?.content}</p>
          </div>
          {postLoading && (
            <LoadingSpinner style="w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-[-40px] mb-5" />
          )}

          <div className="mt-5">
            <p className="text-gray-500">
              {postData && formatTimeDotDate(postData?.date_of_creation)} · 0
              Views
            </p>
          </div>
          <div className="h-5 w-full mt-5 flex justify-evenly border-y py-5 border-gray-200">
            <div className="flex items-center gap-x-1 ">
              <FiMessageSquare color="gray" size={20} className="" />
              <p className="text-gray-500">0</p>
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
              <p className={`text-${liked ? "red" : "gray"}-500`}>{numLikes}</p>
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full border-b border-gray-200 p-4"
        >
          <div className="flex gap-x-2 ">
            <div className="w-12 h-11 rounded-4xl  border "></div>
            <textarea
              {...register("content")}
              rows={1}
              onChange={(e) => {
                autoGrow(e.currentTarget);

                if (e.target.value.trim()) {
                  setContentState(true);
                } else {
                  setContentState(false);
                }
              }}
              className="focus:outline-none overflow-visible resize-none w-full text-xl mt-1 ml-1"
              placeholder="Post your reply"
            ></textarea>
          </div>

          <div className="flex place-content-end">
            <button
              type="submit"
              disabled={!contentState}
              className="disabled:opacity-50 bg-black rounded-3xl text-md w-18 text-white font-bold h-10 mt-3  "
            >
              Reply
            </button>
          </div>
        </form>
        {replies.map((reply) => (
          <PostCard
            key={reply.id}
            content={reply.content}
            date_of_creation={reply.date_of_creation}
            name={reply.name}
            id={reply.id}
            t_identifier={reply.t_identifier}
            likes={reply.likes}
            active_user_liked={reply.active_user_liked}
            active_user_creator={reply.active_user_creator}
            onDelete={handleDelete}
            user_id={reply.user_id}
          />
        ))}
        {repliesLoading && (
          <LoadingSpinner style="w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-20" />
        )}
      </div>
      <div className="h-screen px-10 max-[1000px]:hidden">
        <form>
          <div className="relative mt-2 w-90 mx-auto">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none"></div>
            <input
              type="text"
              id="input-group-1"
              className=" h-13 border border-gray-300 text-gray-900 text-sm rounded-3xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
              placeholder="name@flowbite.com"
            />
          </div>
        </form>
        <div className="w-90 mx-auto border border-gray-300 text-xl font-bold mt-5 p-2 rounded-3xl h-20 ">
          <p>Who to follow</p>
        </div>
      </div>
    </div>
  );
}

export default PostPage;
