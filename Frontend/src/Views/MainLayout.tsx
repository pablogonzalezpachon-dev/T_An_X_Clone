import { NavLink, useLocation, useNavigate } from "react-router";
import { Outlet } from "react-router";
import { MdHomeFilled } from "react-icons/md";
import { IoSearch, IoSearchOutline } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { GiRollingEnergy } from "react-icons/gi";
import { BsPerson, BsPersonFill } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { BiPencil } from "react-icons/bi";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { Auth, UserProfile } from "../Lib/types";
import SignOutButton from "../Lib/Assets/SignOutButton";
import ProfileCard from "../Lib/Assets/ProfileCard";
import debounce from "debounce";
import useStore from "../Lib/zustandStore";
import { fetchRecommendedProfiles } from "../Lib/stateFunctions";

type Props = {};

function MainLayout({}: Props) {
  const activeUserProfile = useStore((state) => state.activeUser);
  const setActiveUserProfile = useStore((state) => state.setActiveUser);
  const location = useLocation();
  const recommendedProfiles = useStore((state) => state.recommendedProfiles);
  const setRecommendedProfiles = useStore(
    (state) => state.setRecommendedProfiles
  );

  const users = useStore((state) => state.users);
  const setUsers = useStore((state) => state.setUsers);

  console.log(location);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchedProfiles, setSearchedProfiles] = useState<UserProfile[]>();
  const [searchQuery, setSearchQuery] = useState<string>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data: sessionResponse } = await axios.get<{
          user: { data: Auth; exp: number; iat: number };
        }>("http://localhost:3000/session");

        const userId = sessionResponse.user.data.user.id;

        const { data: profileData } = await axios.get<UserProfile[]>(
          `http://localhost:3000/user/profile/${userId}`
        );
        setActiveUserProfile(profileData[0]);

        console.log(profileData);
      } catch (e) {
        console.log(e);
        navigate("/");
      }
    };
    verifyAuth();

    const fetchData = async () => {
      await Promise.all([fetchRecommendedProfiles(), verifyAuth()]);
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
  }, []);

  const search = debounce(async (query: string) => {
    try {
      setSearchQuery(query);
      const { data: results } = await axios.get<UserProfile[]>(
        `http://localhost:3000/user/search/profiles/?q=${query}`
      );
      setSearchedProfiles(results);
      // Do something with the search results
    } catch {
      console.log("Search failed");
    }
  }, 500);

  return (
    <div className="grid grid-cols-[clamp(100px,25vw,400px)_1fr_clamp(0px,35vw,500px)] max-[1300px]:grid-cols-[100px_1fr_clamp(0px,35vw,500px)] max-[1000px]:grid-cols-[100px_1fr]">
      <div className="sticky top-0 self-start h-screen flex flex-col items-center">
        <div className="fixed flex flex-col items-center">
          <svg
            className="h-14 ml-[-10px] mb-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            role="img"
          >
            <path
              d="M 101.36,265.35 L 132.85,304.71 L 358.50,304.71 L 620.89,740.28 L 757.34,742.90 L 494.94,309.96 L 741.59,304.71 L 710.10,265.35 Z M 466.08,336.20 L 683.87,695.67 L 683.87,706.17 L 647.13,706.17 L 460.83,399.17 L 447.71,375.56 Z"
              fill="#000000"
              fillRule="evenodd"
            />
          </svg>
          <nav className="flex flex-col gap-y-7 flex">
            <NavLink to="/home">
              <div className="flex gap-x-5">
                <MdHomeFilled
                  size={35}
                  className="my-auto max-[1300px]:mx-auto"
                />
                <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                  Home
                </p>
              </div>
            </NavLink>
            <NavLink to="/explore">
              <div className="flex gap-x-5">
                <IoSearch size={35} className="my-auto max-[1300px]:mx-auto" />
                <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                  Explore
                </p>
              </div>
            </NavLink>

            <div className="flex gap-x-5">
              <MdEmail size={35} className="my-auto max-[1300px]:mx-auto" />
              <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                Messages
              </p>
            </div>

            <div className="flex gap-x-5">
              <GiRollingEnergy
                size={35}
                className="my-auto max-[1300px]:mx-auto"
              />
              <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                Nexus
              </p>
            </div>

            <NavLink to={`/${activeUserProfile?.id}`}>
              <div className="flex gap-x-5">
                <BsPerson size={35} className="my-auto max-[1300px]:mx-auto" />
                <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                  Profile
                </p>
              </div>
            </NavLink>

            <div className="flex gap-x-5">
              <IoSettingsOutline
                size={35}
                className="my-auto max-[1300px]:mx-auto"
              />
              <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                Settings
              </p>
            </div>
          </nav>
          <button className="bg-black rounded-3xl text-lg w-60 max-[1300px]:w-20 text-white font-bold h-13 mt-6 items-end min-[1300px]:ml-20 ">
            <p className="max-[1300px]:hidden">Post</p>

            <BiPencil
              size={30}
              className="hidden max-[1300px]:block max-[1300px]:mx-auto"
            />
          </button>

          {activeUserProfile && (
            <SignOutButton
              name={activeUserProfile.name}
              t_identifier={activeUserProfile.t_identifier}
              avatar={activeUserProfile.avatar}
            />
          )}
        </div>
      </div>

      <div>
        <Outlet />
      </div>
      <div className="h-screen px-10 max-[1000px]:hidden sticky flex flex-col">
        <div className="fixed flex flex-col mx-auto" ref={searchContainerRef}>
          {location.pathname !== "/explore" ? (
            <form
              className=""
              onSubmit={(e) => {
                e.preventDefault();
                if (searchInputRef.current?.value.trim() === "") {
                  return;
                } else {
                  navigate(`/explore?query=${searchInputRef.current?.value}`);
                }
              }}
            >
              <div className="relative mt-2 w-90 mx-auto">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <IoSearchOutline color={"gray"} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  id="input-group-1"
                  className="h-13 border border-gray-300 text-gray-900 text-sm rounded-3xl block w-full ps-10 p-2.5 focus:outline-none focus:border-blue-500
             focus:ring-1 focus:ring-blue-500"
                  placeholder="Search"
                  autoComplete="off"
                  onFocus={() => {
                    setDialogOpen(true);
                  }}
                  onChange={(e) => {
                    if (e.target.value.trim() === "") {
                      setSearchedProfiles(undefined);
                      return;
                    } else {
                      search(e.target.value);
                    }
                  }}
                />

                <div
                  className={`absolute ${
                    dialogOpen ? "block" : "hidden"
                  } bg-white w-full text-center min-h-30 shadow-2xl rounded-2xl top-14 pt-3 text-gray-500
                  `}
                >
                  {searchedProfiles && (
                    <div
                      className="flex flex items-center gap-x-2 px-4 h-15 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate(`/explore?query=${searchQuery}`);
                      }}
                    >
                      <IoSearchOutline
                        size={20}
                        className="inline text-bold "
                      />
                      <div className="text-left ">{searchQuery}</div>
                    </div>
                  )}
                  {searchedProfiles
                    ? searchedProfiles.map((profile) => (
                        <div
                          onClick={() => {
                            navigate(`/${profile.id}`);
                            searchInputRef.current!.value = "";
                            setSearchedProfiles(undefined);
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
            </form>
          ) : (
            <div className="w-full mt-2 h-1 bg-gray-200 rounded-full"></div>
          )}

          <div className="">
            <div className="w-90 mx-auto border border-gray-300 text-xl font-bold mt-5 py-2 rounded-2xl">
              {<p className="ml-2 ml-5 mb-4">Who to follow</p>}

              {recommendedProfiles?.map((profile) => (
                <ProfileCard
                  user_id={profile.id}
                  key={profile.id}
                  name={profile.name}
                  avatar={profile.avatar}
                  t_identifier={profile.t_identifier}
                />
              ))}
              {recommendedProfiles?.length === 0 && (
                <p className="text-gray-400 text-center text-md">
                  Looks like there's no one to follow...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
