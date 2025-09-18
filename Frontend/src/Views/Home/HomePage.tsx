import axios from "axios";
import { use, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import type { Post, UserProfile } from "../../Lib/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostCard from "../../Lib/Assets/PostCard";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import ProgressBar from "../../Lib/Assets/ProgressBar";
import { useNavigate } from "react-router";
import { autoGrow } from "../../Lib/functions";
import supabase from "../../Lib/database";
import { AuthContext } from "../../Lib/Contexts/AuthContext";
import { BsPersonFill } from "react-icons/bs";
import { MdOutlinePermMedia } from "react-icons/md";

function getPublicUrls(paths: string[]) {
  return paths.map((path) => {
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl; // string
  });
}

type Inputs = {
  content: string;
};

type Props = {};

function HomePage({}: Props) {
  let navigate = useNavigate();
  const { activeUserAvatar } = useContext(AuthContext);

  const [posts, setPosts] = useState<Post[]>([]);
  const [contentState, setContentState] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPostLoading, setNewPostLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<Inputs>({});

  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openFileDialog = () => inputRef.current?.click();

  const textarea = document.getElementById(
    "post-textarea"
  ) as HTMLTextAreaElement;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const originalPosts = posts;
    try {
      setContentState(false);
      setNewPostLoading(true);
      const { data: profileData } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/profile`
      );
      const { data: postId } = await axios.post<number>(
        "http://localhost:3000/user/post",
        {
          ...data,
          replyTo: null,
        }
      );
      setPosts([
        {
          ...data,
          id: postId,
          date_of_creation: new Date().toISOString(),
          name: profileData[0].name,
          t_identifier: profileData[0].t_identifier,
          likes: 0,
          active_user_liked: false,
          active_user_creator: true,
          user_id: profileData[0].id,
          reply_to: null,
          replies: 0,
          followed: false,
          avatar: activeUserAvatar,
        },
        ...originalPosts,
      ]);
      reset();
      autoGrow(textarea);
      setNewPostLoading(false);
    } catch (e) {
      setPosts(originalPosts);
      console.error("Error creating post:", e);
      setContentState(true);
      setNewPostLoading(false);
    }
  };

  useEffect(() => {
    setPostsLoading(true);
    async function fetchPosts() {
      try {
        const { data: posts } = await axios.get<Post[]>(
          "http://localhost:3000/user/posts"
        );
        console.log(posts);
        const avatars = posts.map((post) => {
          return post.avatar ? post.avatar : "";
        });
        const urls = getPublicUrls(avatars);
        console.log(urls);

        console.log(avatars);
        setPosts(posts);
        setPostsLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPostsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handleDelete = async (postId: number) => {
    const originalPosts = posts;
    try {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      const response = await axios.delete(
        `http://localhost:3000/user/post/${postId}`
      );
      console.log(response);
    } catch (error) {
      setPosts(originalPosts);
      console.error("Error deleting post:", error);
    }
  };

  function handlePhoto(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("The file must be an image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(`The image must be less than ${5} MB.`);
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  return (
    <div className="grid grid-cols-[1fr_clamp(0px,35vw,900px)] max-[1000px]:grid-cols-[1fr]">
      <div className="h-screen ">
        <div className="w-full h-15 border-b border-x border-gray-200 flex items-center place-content-center gap-x-40">
          <p className="text-gray-600 font-semibold">For you</p>
          <p className="text-gray-600 font-semibold">Following</p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full border-b border-gray-200 p-4 border-x"
        >
          <div className="flex flex-col">
            <div className="flex gap-x-2  ">
              {activeUserAvatar ? (
                <img
                  src={activeUserAvatar}
                  className="w-11 h-11 rounded-4xl object-cover"
                />
              ) : (
                <div className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden">
                  <BsPersonFill />
                </div>
              )}
              <textarea
                onClick={(e) => {
                  console.log(e.currentTarget.style.height);
                }}
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
                className="post-textarea focus:outline-none overflow-visible resize-none w-full text-xl mt-1 ml-1"
                id={"post-textarea"}
                placeholder="What's happening?"
              ></textarea>
            </div>
            <img className="h-auto w-full mx-auto" src={previewUrl} />
          </div>
          <hr className="border-t border-gray-200 mt-5 ml-10 mr-2" />
          <div className="flex place-content-end justify-between">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                handlePhoto(e.target.files?.[0]);
              }}
            />
            <MdOutlinePermMedia
              className="ml-15 mt-5 my-auto text-blue-400"
              size={25}
              onClick={openFileDialog}
            />

            <button
              type="submit"
              disabled={!contentState}
              className="disabled:opacity-50 bg-black rounded-3xl text-md w-18 text-white font-bold h-10 mt-3  "
            >
              Post
            </button>
          </div>
          {newPostLoading && <ProgressBar style={"w-full mt-5"} />}
        </form>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            content={post.content}
            date_of_creation={post.date_of_creation}
            name={post.name}
            id={post.id}
            t_identifier={post.t_identifier}
            likes={post.likes}
            active_user_liked={post.active_user_liked}
            active_user_creator={post.active_user_creator}
            onDelete={handleDelete}
            user_id={post.user_id}
            replies={post.replies}
            followed={post.followed}
            avatar={post.avatar}
          />
        ))}
        {postsLoading && (
          <LoadingSpinner
            style={
              "w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-[130px]"
            }
          />
        )}
      </div>
      <div className="h-screen px-10 max-[1000px]:hidden">
        <form>
          <div className="relative mt-2 w-90 mx-auto">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <IoSearchOutline color={"gray"} />
            </div>
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

export default HomePage;
