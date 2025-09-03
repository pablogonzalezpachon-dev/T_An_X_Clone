import axios from "axios";
import { use, useContext, useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import type { Post, UserProfile } from "../../Lib/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostCard from "../../Lib/Assets/PostCard";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import ProgressBar from "../../Lib/Assets/ProgressBar";

type Inputs = {
  content: string;
};

type Props = {};

function HomePage({}: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [contentState, setContentState] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPostLoading, setNewPostLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<Inputs>({});

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setContentState(false);
    setNewPostLoading(true);
    reset();
    // optimistic UI

    console.log(data);

    try {
      const { data: profileData } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/profile`
      );
      setPosts([
        {
          ...data,
          id: Math.random(),
          date_of_creation: new Date().toISOString(),
          name: profileData[0].name,
          t_identifier: profileData[0].t_identifier,
          likes: "0",
          active_user_liked: null,
          active_user_creator: true,
        },
        ...posts,
      ]);

      const response = await axios.post("http://localhost:3000/user/post", {
        ...data,
      });
      console.log(response);
      setNewPostLoading(false);
    } catch (e) {
      setPosts(posts.slice(1));
      console.error("Error creating post:", e);
      setNewPostLoading(false);
    }
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "0px"; // reset
    el.style.height = el.scrollHeight + "px"; // fit content
  };

  useEffect(() => {
    setPostsLoading(true);
    async function fetchPosts() {
      try {
        const { data: posts } = await axios.get<Post[]>(
          "http://localhost:3000/user/posts"
        );
        console.log(posts);
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

  return (
    <div className="grid grid-cols-[1fr_clamp(0px,35vw,900px)] max-[1000px]:grid-cols-[1fr]">
      <div className="h-screen border-x border-gray-200">
        <div className="w-full h-15 border-b border-gray-200 flex items-center place-content-center gap-x-40">
          <p className="text-gray-600 font-semibold">For you</p>
          <p className="text-gray-600 font-semibold">Following</p>
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
              placeholder="What's happening?"
            ></textarea>
          </div>
          <hr className="border-t border-gray-200 mt-5 ml-10 mr-2" />
          <div className="flex place-content-end">
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
