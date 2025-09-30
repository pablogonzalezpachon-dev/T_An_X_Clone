import { BsPersonFill } from "react-icons/bs";
import { IoSearchOutline } from "react-icons/io5";
import ProfileCard from "../../Lib/Assets/ProfileCard";
import { useEffect, useRef, useState } from "react";
import { type Post, type UserProfile } from "../../Lib/types";
import axios from "axios";
import PostCard from "../../Lib/Assets/PostCard";
import debounce from "debounce";
import { useNavigate, useSearchParams } from "react-router";
import useStore from "../../Lib/zustandStore";
import { uniqueById } from "../../Lib/functions";

type Props = {};

function ExplorePage({}: Props) {
  const queryParams = useSearchParams();
  console.log(queryParams[0].get("query"));
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchedProfiles, setSearchedProfiles] = useState<UserProfile[]>();
  const recommendedProfiles = useStore((state) => state.recommendedProfiles);

  const stateUsers = useStore((state) => state.users);
  const setUsers = useStore((state) => state.setUsers);
  console.log(stateUsers, "heeeeloooo");
  useEffect(() => {
    async function fetchDefaultPosts() {
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
    const fetchDefaultProfiles = async () => {
      try {
        const { data: profiles } = await axios.get<UserProfile[]>(
          "http://localhost:3000/user/profiles"
        );
        setProfiles(profiles);
      } catch (e) {
        console.log(e);
      }
    };

    async function fetchDefaultUsers() {
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

    const fetchData = async () => {
      if (!queryParams[0].get("query")) {
        await Promise.all([
          fetchDefaultProfiles(),
          fetchDefaultPosts(),
          fetchDefaultUsers(),
        ]);
        return;
      } else {
        await Promise.all([
          fetchProfiles(queryParams[0].get("query") || ""),
          fetchPosts(queryParams[0].get("query") || ""),
          fetchUsersFromProfiles(queryParams[0].get("query") || ""),
        ]);
      }
    };
    fetchData();

    function onDocMouseDown(e: MouseEvent) {
      const el = searchContainerRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setDialogOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);

    if (queryParams[0].get("query") && searchInputRef.current) {
      searchInputRef.current.value = queryParams[0].get("query") || "";
    }
  }, [queryParams[0].get("query")]);

  async function fetchProfiles(query: string) {
    try {
      const { data: profiles } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/search/profiles?q=${query}`
      );
      setProfiles(profiles);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchPosts(query: string) {
    try {
      const { data: posts } = await axios.get<Post[]>(
        `http://localhost:3000/user/search/posts?q=${query}`
      );
      setPosts(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  async function fetchUsersFromProfiles(query: string) {
    try {
      const { data: users } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/search/profiles/users?q=${query}`
      );
      console.log(users, "hhhhhhhwd9999");
      console.log(
        uniqueById([...users, ...(recommendedProfiles || [])]),
        "Users from"
      );
      setUsers(uniqueById([...users, ...(recommendedProfiles || [])]));
    } catch (error) {
      console.error("Error fetching users from profiles:", error);
    }
  }

  const search = debounce(async (query: string) => {
    try {
      setSearchQuery(query);
      const { data: profiles } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/search/profiles?q=${query}`
      );
      setSearchedProfiles(profiles);
    } catch (e) {
      console.log(e);
    }
  }, 300);

  return (
    <div className="h-screen">
      <div className="w-full h-15 border-b border-x border-gray-200 flex items-center place-content-center gap-x-40 sticky">
        <div
          className="w-full mx-10 flex justify-center"
          ref={searchContainerRef}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInputRef.current?.value.trim() === "") {
                return;
              } else {
                navigate(`/explore?query=${searchInputRef.current?.value}`);
                setDialogOpen(false);
              }
            }}
            className="w-full relative mt-2 mx-auto  mb-2"
          >
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
              <IoSearchOutline color={"gray"} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              id="input-group-1"
              className="h-11 border border-gray-300 text-gray-900 text-sm rounded-3xl block w-full ps-10 focus:outline-none focus:border-blue-500
                       focus:ring-1 focus:ring-blue-500"
              placeholder="Search"
              autoComplete="off"
              onChange={(e) => {
                if (e.target.value.trim() === "") {
                  setSearchedProfiles(undefined);
                  return;
                } else {
                  search(e.target.value);
                }
              }}
              onFocus={() => {
                setDialogOpen(true);
              }}
            />
          </form>
          <div
            className={`absolute ${
              dialogOpen ? "block" : "hidden"
            } bg-white w-[90%] text-center min-h-30 shadow-2xl rounded-2xl top-14 pt-3 text-gray-500 z-10`}
          >
            {searchedProfiles && (
              <div
                className="flex flex items-center gap-x-2 px-4 h-15 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  navigate(`/explore?query=${searchQuery}`);
                  setDialogOpen(false);
                }}
              >
                <IoSearchOutline size={20} className="inline text-bold " />
                <div className="text-left ">{searchQuery}</div>
              </div>
            )}
            {searchedProfiles
              ? searchedProfiles.map((profile) => (
                  <div
                    onClick={() => {
                      navigate(`/${profile.id}`);
                      searchInputRef.current!.value = "";
                      setProfiles(undefined);
                      setDialogOpen(false);
                    }}
                    key={profile.id}
                    className="flex items-center place-content-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-12 h-12 rounded-full mr-4 object-cover hover:brightness-75"
                        />
                      ) : (
                        <div className="w-12 h-12 flex justify-center items-center mr-4 bg-gray-100 rounded-full overflow-hidden">
                          <BsPersonFill />
                        </div>
                      )}

                      <div className="text-left">
                        <p className="font-bold text-sm hover:underline text-black">
                          {profile.name}
                        </p>
                        <p className="text-gray-400 text-sm font-semibold">
                          {profile.t_identifier}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              : `Try searching for people, lists, or keywords`}
          </div>
        </div>
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
