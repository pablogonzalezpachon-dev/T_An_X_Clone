import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { BiRepost } from "react-icons/bi";
import { BsPersonFill, BsThreeDots } from "react-icons/bs";
import { FaEye, FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi";
import { useNavigate, useParams } from "react-router";
import type { Post, UserProfile } from "../../Lib/types";
import { autoGrow, formatTimeDotDate, toPublicUrl } from "../../Lib/functions";
import { IoIosArrowRoundBack } from "react-icons/io";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostCard from "../../Lib/Assets/PostCard";
import ProgressBar from "../../Lib/Assets/ProgressBar";
import { AuthContext } from "../../Lib/Contexts/AuthContext";
import FileGrid from "../../Lib/Assets/FileGrid";
import TemporaryFileGrid from "../../Lib/Assets/TemporaryFileGrid";
import { MdOutlinePermMedia } from "react-icons/md";

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
  const postIdNum = postId && parseInt(postId);
  const [contentState, setContentState] = useState(false);
  const [postData, setPostData] = useState<Post>();
  const [liked, setLiked] = useState<boolean>();
  const [numLikes, setnumLikes] = useState<number>(0);
  const [replies, setReplies] = useState<Post[]>([]);

  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [repliesLoading, setRepliesLoading] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<Inputs>({});
  const [newReplyLoading, setNewReplyLoading] = useState(false);
  const { activeUserAvatar } = useContext(AuthContext);
  const [media, setMedia] = useState<(string | null)[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openFileDialog = () => inputRef.current?.click();

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
      setLiked(false);
      setnumLikes(originalNumLikes);
      console.error("Error liking post:", error);
    }
  }

  async function handleUnlike() {
    const originalNumLikes = numLikes;
    setLiked(false);
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
  function handlePhoto(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setFilesError("The file must be an image or a video");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setFilesError(`The file must be less than ${50} MB.`);
      return;
    }
    setFilesError(null);
    setFiles([...files, file]);
    if (inputRef.current) inputRef.current.value = "";
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const originalReplies = replies;
    try {
      setContentState(false);
      setNewReplyLoading(true);
      const textarea = document.getElementById(
        "reply-textarea"
      ) as HTMLTextAreaElement;
      console.log(textarea);
      const { data: profileData } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/profile`
      );
      const form = new FormData();
      form.append("content", data.content ?? "");
      form.append("replyTo", `${postId}`); // or omit if null
      for (const file of files.slice(0, 4)) {
        form.append("media", file); // name doesn't matter; busboy reads all files
      }

      const {
        data: { postId: createdPostId, storedPaths },
      } = await axios.post<{
        postId: number;
        storedPaths: string[];
      }>("http://localhost:3000/post/media", form);

      postId &&
        setReplies([
          {
            ...data,
            id: createdPostId,
            date_of_creation: new Date().toISOString(),
            name: profileData[0].name,
            t_identifier: profileData[0].t_identifier,
            likes: 0,
            active_user_liked: false,
            active_user_creator: true,
            user_id: profileData[0].id,
            reply_to: parseInt(postId),
            replies: 0,
            followed: false,
            avatar: activeUserAvatar,
            file_1: toPublicUrl(storedPaths[0], "post_media"),
            file_2: toPublicUrl(storedPaths[1], "post_media"),
            file_3: toPublicUrl(storedPaths[2], "post_media"),
            file_4: toPublicUrl(storedPaths[3], "post_media"),
          },
          ...replies,
        ]);
      reset();
      autoGrow(textarea);
      setNewReplyLoading(false);
      setFiles([]);
    } catch (e) {
      setContentState(true);
      setReplies(originalReplies);
      console.error("Error creating post:", e);
      setNewReplyLoading(false);
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
        setnumLikes(postData.likes);
        setLiked(postData.active_user_liked);
        setMedia([
          postData.file_1,
          postData.file_2,
          postData.file_3,
          postData.file_4,
        ]);

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
    <div className="grid grid-cols-1">
      <div className="h-250 border-x border-gray-200">
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
          </div>
        </div>
        <div className="w-full border-b border-gray-200 p-4">
          <div
            className="w-full flex h-15 justify-between cursor-pointer"
            onClick={() => {}}
          >
            <div className="flex gap-x-2">
              {postData?.avatar ? (
                <img
                  src={postData?.avatar}
                  className="w-11 h-11 rounded-full bg-black object-cover"
                />
              ) : (
                <div className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden border border-white border-5">
                  <BsPersonFill />
                </div>
              )}
              <div className="flex flex-col">
                <p
                  className="font-semibold truncate hover:underline"
                  onClick={() => {
                    navigate(`/${postData?.user_id}`);
                  }}
                >
                  {postData?.name}
                </p>
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

          <div className="flex mx-auto">
            <FileGrid
              files={media.filter(
                (file) => file !== null && file !== undefined
              )}
            />
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
              <p className="text-gray-500">{postData?.replies}</p>
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
          className="w-full border-b border-x border-gray-200 p-4"
        >
          <div className="flex gap-x-2 ">
            {activeUserAvatar ? (
              <img
                src={activeUserAvatar}
                className="w-11 h-11 rounded-full border object-cover"
              />
            ) : (
              <div className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden">
                <BsPersonFill />
              </div>
            )}
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
              id="reply-textarea"
              className="focus:outline-none overflow-visible resize-none w-full text-xl mt-1 ml-1"
              placeholder="Post your reply"
            ></textarea>
          </div>
          <TemporaryFileGrid
            files={files}
            setFiles={setFiles}
            error={filesError}
            setError={setFilesError}
          />

          <div className="sticky bottom-0 bg-white flex place-content-end justify-between">
            <input
              ref={inputRef}
              type="file"
              accept="image/* video/*"
              className="sr-only"
              onChange={(e) => {
                handlePhoto(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              disabled={files.length >= 4}
              className="text-blue-400 disabled:text-gray-200"
              onClick={openFileDialog}
            >
              <MdOutlinePermMedia className="ml-15 mt-5 my-auto" size={25} />
            </button>

            <button
              type="submit"
              disabled={!contentState && files.length === 0}
              className="disabled:opacity-50 bg-black rounded-3xl text-md w-18 text-white font-bold h-10 mt-3  "
            >
              Reply
            </button>
          </div>
          {newReplyLoading && <ProgressBar style={"w-full mt-5"} />}
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
            replies={reply.replies}
            followed={reply.followed}
            avatar={reply.avatar}
            file_1={reply.file_1}
            file_2={reply.file_2}
            file_3={reply.file_3}
            file_4={reply.file_4}
          />
        ))}
        {repliesLoading && (
          <LoadingSpinner style="w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-20" />
        )}
      </div>
    </div>
  );
}

export default PostPage;
