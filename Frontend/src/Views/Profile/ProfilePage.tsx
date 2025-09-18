import { Suspense, useContext, useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router";
import axios from "axios";
import type { Auth, Post, UserProfile } from "../../Lib/types";
import { formatJoinedMonthYear } from "../../Lib/functions";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import { useParams } from "react-router";
import { MdOutlineEmail } from "react-icons/md";
import PostCard from "../../Lib/Assets/PostCard";
import { AuthContext } from "../../Lib/Contexts/AuthContext";
import { BsPersonFill } from "react-icons/bs";

type Props = {};

function ProfilePage({}: Props) {
  const navigate = useNavigate();
  let { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [activeUserId, setActiveUserId] = useState<string>();
  const { followers, setFollowers, followed, setFollowed, setFollowState } =
    useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const { data: profileData } = await axios.get<UserProfile[]>(
          `http://localhost:3000/user/profile/${userId}`
        );
        const { data: sessionResponse } = await axios.get<{
          user: { data: Auth; exp: number; iat: number };
        }>("http://localhost:3000/session");
        setActiveUserId(sessionResponse.user.data.user.id);
        setFollowed(profileData[0].followed);
        setFollowers(profileData[0].followers);
        console.log(profileData);
        setProfileData(profileData[0]);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  async function handleFollow() {
    const previousfollowers = followers;
    try {
      setFollowers((follower) => follower + 1);
      setFollowed(true);
      setFollowState((state) => !state);
      const { data: followResponse } = await axios.post<string>(
        "http://localhost:3000/user/follow",
        { userId }
      );
      console.log(followResponse);
    } catch (e) {
      setFollowers(previousfollowers);
      setFollowed(false);
      console.log(e);
    }
  }

  async function handleUnfollow() {
    const previousfollowers = followers;
    try {
      setFollowers((follower) => follower - 1);
      setFollowed(false);
      setFollowState((state) => !state);
      const { data: unfollowResponse } = await axios.delete<string>(
        `http://localhost:3000/user/unfollow/${userId}`
      );
    } catch (e) {
      setFollowers(previousfollowers);
      setFollowed(true);
      console.log(e);
    }
  }

  return (
    <div className="grid grid-cols-[1fr_clamp(0px,35vw,900px)] max-[1000px]:grid-cols-[1fr]">
      <div className="h-screen border-x border-gray-200">
        <div className="flex gap-x-8 border-b border-gray-200 pl-3 ">
          <IoIosArrowRoundBack
            size={30}
            className="my-auto"
            onClick={() => {
              navigate(-1);
            }}
          />
          <div className="w-full h-15 items-center place-content-center gap-x-40">
            <p className="font-bold text-xl">{profileData?.name}</p>
            <p className="text-gray-600">{profileData?.posts} posts</p>
          </div>
        </div>
        <div className="w-full border-b border-gray-200">
          <div className="w-full h-50 bg-gray-300"></div>
          {profileData?.avatar ? (
            <img
              src={profileData?.avatar}
              className="w-35 h-35 rounded-full border border-white border-5 mt-[-70px] ml-4 object-cover "
            />
          ) : (
            <div className="w-35 h-35 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden border border-white border-5 mt-[-70px] ml-4">
              <BsPersonFill size={50} />
            </div>
          )}
          {loading ? (
            ""
          ) : activeUserId === userId ? (
            <div className="w-full flex justify-end">
              <button className="border border-gray-300 rounded-3xl w-30 text-md font-semibold h-10 mr-3 mt-[-60px]">
                Edit profile
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end gap-x-3">
              <button className="h-10 w-10 border border-gray-300 rounded-full mt-[-60px]">
                <MdOutlineEmail className="m-auto" size={22} />
              </button>
              <button
                onClick={followed ? handleUnfollow : handleFollow}
                className={` rounded-3xl w-25 text-md font-bold h-10 mr-3 mt-[-60px] ${
                  followed
                    ? "bg-white text-black border border-gray-300"
                    : "bg-black text-white"
                }`}
              >
                {followed ? "Following" : "Follow"}
              </button>
            </div>
          )}

          <div className="flex flex-col px-5 mt-2">
            <p className="font-bold text-2xl">{profileData?.name}</p>
            <p className="text-gray-600">{profileData?.t_identifier}</p>
            <div className="flex gap-x-1 mt-2">
              <FaRegCalendarAlt className="my-auto text-gray-500" />
              <p className="text-gray-600">
                Joined{" "}
                {profileData
                  ? formatJoinedMonthYear(profileData?.created_at)
                  : ""}
              </p>
            </div>
            <div className="flex gap-x-4 mt-2">
              <p className="text-gray-600">
                {profileData?.following} following
              </p>
              <p className="text-gray-600">{followers} followers</p>
            </div>

            <div className="w-full flex justify-evenly mt-8 mb-2">
              <Link to={`/${userId}`} className="font-semibold text-gray-500">
                Posts
              </Link>
              <Link
                to={`/${userId}/with_replies`}
                className="font-semibold text-gray-500"
              >
                Replies
              </Link>
              <Link
                to={`/${userId}/media`}
                className="font-semibold text-gray-500"
              >
                Media
              </Link>
              <Link
                to={`/${userId}/likes`}
                className={`font-semibold text-gray-500 ${
                  activeUserId === userId ? "" : "hidden"
                }`}
              >
                Likes
              </Link>
            </div>
          </div>
          {loading && (
            <LoadingSpinner
              style={
                "w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-[-130px] mb-40"
              }
            />
          )}
        </div>

        <Outlet />
      </div>
      <div className="h-screen px-10">
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

export default ProfilePage;
