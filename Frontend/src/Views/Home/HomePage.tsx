import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { Post, UserProfile } from "../../Lib/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostCard from "../../Lib/Assets/PostCard";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import ProgressBar from "../../Lib/Assets/ProgressBar";
import { autoGrow, toPublicUrl, uniqueById } from "../../Lib/functions";
import supabase from "../../Lib/database";
import { BsPersonFill } from "react-icons/bs";
import { MdOutlinePermMedia } from "react-icons/md";
import TemporaryFileGrid from "../../Lib/Assets/TemporaryFileGrid";
import useStore from "../../Lib/zustandStore";
import { handleDelete } from "../../Lib/stateFunctions";

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
  const activeUserProfile = useStore((state) => state.activeUser);

  const setPosts = useStore((state) => state.setPosts);
  const posts = useStore((state) => state.posts);

  const [contentState, setContentState] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPostLoading, setNewPostLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<Inputs>({});

  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openFileDialog = () => inputRef.current?.click();
  const [files, setFiles] = useState<File[]>([]);

  const recommendedProfiles = useStore((state) => state.recommendedProfiles);

  const textarea = document.getElementById(
    "post-textarea"
  ) as HTMLTextAreaElement;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const originalPosts = posts;
    try {
      setContentState(false);
      setNewPostLoading(true);

      const form = new FormData();
      form.append("content", data.content ?? "");
      form.append("replyTo", ""); // or omit if null
      for (const file of files.slice(0, 4)) {
        form.append("media", file); // name doesn't matter; busboy reads all files
      }

      const {
        data: { postId, storedPaths },
      } = await axios.post<{
        postId: number;
        storedPaths: string[];
      }>("http://localhost:3000/user/post", form);

      activeUserProfile &&
        setPosts([
          {
            ...data,
            id: postId,
            date_of_creation: new Date().toISOString(),
            name: activeUserProfile.name,
            t_identifier: activeUserProfile.t_identifier,
            likes: 0,
            active_user_liked: false,
            active_user_creator: true,
            user_id: activeUserProfile.id,
            reply_to: null,
            replies: 0,
            followed: false,
            avatar: activeUserProfile.avatar,
            file_1: toPublicUrl(storedPaths[0], "post_media"),
            file_2: toPublicUrl(storedPaths[1], "post_media"),
            file_3: toPublicUrl(storedPaths[2], "post_media"),
            file_4: toPublicUrl(storedPaths[3], "post_media"),
          },
          ...originalPosts,
        ]);
      reset();
      setFiles([]);
      autoGrow(textarea);
      setNewPostLoading(false);
    } catch (e) {
      setPosts(originalPosts);
      console.error("Error creating post:", e);
      setContentState(true);
      setNewPostLoading(false);
    }
  };

  const setUsers = useStore((state) => state.setUsers);

  useEffect(() => {
    setPosts([]);
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

    async function fetchUsers() {
      try {
        const { data: users } = await axios.get<UserProfile[]>(
          "http://localhost:3000/user/posts/users"
        );
        console.log(uniqueById(users));
        setUsers(uniqueById([...users, ...(recommendedProfiles || [])]));
      } catch (e) {
        console.error("Error fetching users:", e);
      }
    }

    async function fetchData() {
      await Promise.all([fetchPosts(), fetchUsers()]);
    }

    fetchData();
  }, []);

  function handlePhoto(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("The file must be an image or a video");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(`The file must be less than ${50} MB.`);
      return;
    }

    setError(null);
    setFiles([...files, file]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="grid grid-cols-1">
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
              {activeUserProfile?.avatar ? (
                <img
                  src={activeUserProfile.avatar}
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
            <TemporaryFileGrid
              files={files}
              setFiles={setFiles}
              error={error}
              setError={setError}
            />
          </div>
          <hr className="border-t border-gray-200 mt-5 ml-10 mr-2" />
          {/* Maybe reuse */}
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
            onDelete={() => handleDelete(post.id)}
            user_id={post.user_id}
            replies={post.replies}
            followed={post.followed}
            avatar={post.avatar}
            file_1={post.file_1}
            file_2={post.file_2}
            file_3={post.file_3}
            file_4={post.file_4}
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
    </div>
  );
}

export default HomePage;
