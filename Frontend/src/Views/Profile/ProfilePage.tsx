import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Link, Outlet } from "react-router";
import axios from "axios";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "../../Lib/types";

type Props = {};

function ProfilePage({}: Props) {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get<{ session: Session }>(
          "http://localhost:3000/user/session"
        );
        const userId = data.session.user.id;
        if (userId) {
          const { data } = await axios.post<UserProfile[]>(
            `http://localhost:3000/user/profile`,
            {
              id: userId,
            }
          );
          console.log(data);
          setProfileData(data[0]);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-[1fr_clamp(0px,35vw,900px)] max-[1000px]:grid-cols-[1fr]">
      <div className="h-screen border-x border-gray-200">
        <div className="flex gap-x-8 border-b border-gray-200 pl-3 ">
          <IoIosArrowRoundBack size={30} className="my-auto" />
          <div className="w-full h-15 items-center place-content-center gap-x-40">
            <p className="font-bold text-xl">{profileData?.name}</p>
            <p className="text-gray-600">0 posts</p>
          </div>
        </div>
        <div className="w-full border-b border-gray-200">
          <div className="w-full h-50 bg-gray-300"></div>
          <div className="w-35 h-35 bg-gray-500 rounded-full border border-white border-5 mt-[-70px] ml-4 "></div>
          <div className="w-full flex justify-end">
            <button className="border border-gray-300 rounded-3xl w-30 text-md font-semibold h-10 mr-3 mt-[-60px]">
              Edit profile
            </button>
          </div>
          <div className="flex flex-col px-5 mt-2">
            <p className="font-bold text-2xl">{profileData?.name}</p>
            <p className="text-gray-600">{profileData?.t_identifier}</p>
            <div className="flex gap-x-1 mt-2">
              <FaRegCalendarAlt className="my-auto text-gray-500" />
              <p className="text-gray-600">
                Joined {profileData?.month_birth} {profileData?.year_birth}
              </p>
            </div>
            <div className="flex gap-x-4 mt-2">
              <p className="text-gray-600">0 following</p>
              <p className="text-gray-600">0 followers</p>
            </div>

            <div className="w-full flex justify-evenly mt-8 mb-2">
              <Link to="/profile" className="font-semibold text-gray-500">
                Posts
              </Link>
              <Link
                to="/profile/replies"
                className="font-semibold text-gray-500"
              >
                Replies
              </Link>
              <Link to="/profile/likes" className="font-semibold text-gray-500">
                Likes
              </Link>
            </div>
          </div>
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
