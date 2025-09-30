import { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router";
import axios from "axios";
import type { UserProfile } from "../../Lib/types";
import { formatJoinedMonthYear } from "../../Lib/functions";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import { useParams } from "react-router";
import { MdOutlineEmail } from "react-icons/md";
import { BsPersonFill } from "react-icons/bs";
import useStore from "../../Lib/zustandStore";
import { handleFollow, handleUnfollow } from "../../Lib/stateFunctions";

type Props = {};

function ProfilePage({}: Props) {
  let { userId } = useParams();
  const users = useStore((state) => state.users);
  const setUsers = useStore((state) => state.setUsers);
  const user = users.find((user) => user.id === userId);
  console.log(user?.followed);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  const activeUser = useStore((state) => state.activeUser);
  const recommendedProfiles = useStore((state) => state.recommendedProfiles);

  useEffect(() => {
    if (userId === activeUser?.id) {
      setProfileData(activeUser);
      return;
    }

    setLoading(true);
    async function fetchData() {
      try {
        const { data: profileData } = await axios.get<UserProfile[]>(
          `http://localhost:3000/user/profile/${userId}`
        );

        console.log(profileData);
        setProfileData(profileData[0]);
        setLoading(false);

        setUsers([profileData[0], ...(recommendedProfiles || [])]);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  return (
    <div className="grid grid-cols-1">
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
          ) : activeUser?.id === userId ? (
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
                onClick={() => {
                  user?.followed
                    ? handleUnfollow(userId || "")
                    : handleFollow(userId || "");
                }}
                className={` rounded-3xl w-25 text-md font-bold h-10 mr-3 mt-[-60px] ${
                  user?.followed
                    ? "bg-white text-black border border-gray-300"
                    : "bg-black text-white"
                }`}
              >
                {user?.followed ? "Following" : "Follow"}
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
                {userId === activeUser?.id
                  ? activeUser?.following
                  : profileData?.following}{" "}
                following
              </p>
              <p className="text-gray-600">{user?.followers} followers</p>
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
                  activeUser?.id === userId ? "" : "hidden"
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
    </div>
  );
}

export default ProfilePage;
