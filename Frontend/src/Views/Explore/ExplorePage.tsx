import { BsPersonFill } from "react-icons/bs";
import { IoSearchOutline } from "react-icons/io5";
import ProfileCard from "../../Lib/Assets/ProfileCard";
import { useEffect, useState } from "react";
import { type Post, type UserProfile } from "../../Lib/types";
import axios from "axios";
import PostCard from "../../Lib/Assets/PostCard";

type Props = {};

function ExplorePage({}: Props) {
  const [profiles, setProfiles] = useState<UserProfile[]>();
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data: posts } = await axios.get<Post[]>(
          "http://localhost:3000/user/posts"
        );
        console.log(posts);
        const avatars = posts.map((post) => {
          return post.avatar ? post.avatar : "";
        });

        console.log(avatars);
        setPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    // Fetch profiles from an API or other source
    const fetchProfiles = async () => {
      try {
        const { data: profiles } = await axios.get<UserProfile[]>(
          "http://localhost:3000/user/profiles"
        );
        setProfiles(profiles);
      } catch (e) {
        console.log(e);
      }
    };
    const fetchData = async () => {
      await Promise.all([fetchProfiles(), fetchPosts()]);
    };
    fetchData();
  }, []);

  async function search(query: string) {
    try {
      const { data: profiles } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/search?query=${query}`
      );
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="h-screen">
      <div className="w-full h-15 border-b border-x border-gray-200 flex items-center place-content-center gap-x-40 sticky">
        <form
          className="w-full relative mt-2 w-90 mx-auto px-10 mb-2"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("hola");
          }}
        >
          <div className="absolute inset-y-0 start-0 flex items-center ps-13.5 pointer-events-none">
            <IoSearchOutline color={"gray"} />
          </div>
          <input
            type="text"
            id="input-group-1"
            className="h-11 border border-gray-300 text-gray-900 text-sm rounded-3xl block w-full ps-10 focus:outline-none focus:border-blue-500
                       focus:ring-1 focus:ring-blue-500"
            placeholder="Search"
            autoComplete="off"
            onChange={(e) => {
              if (e.target.value.trim() === "") {
                return;
              } else {
                search(e.target.value);
              }
            }}
          />
        </form>
      </div>

      <div className="w-full border-b border-x border-gray-200 text-xl font-bold">
        <p className="ml-2 ml-5 mb-4 text-xl font-bold pt-2">People</p>
        {profiles?.map((profile) => (
          <ProfileCard
            user_id={profile.id}
            key={profile.id}
            name={profile.name}
            avatar={profile.avatar}
            t_identifier={profile.t_identifier}
          />
        ))}
      </div>
      {posts?.map((post) => (
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
          onDelete={(postId: number) => Promise.resolve()}
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
    </div>
  );
}

export default ExplorePage;
function getPublicUrls(avatars: string[]) {
  throw new Error("Function not implemented.");
}
