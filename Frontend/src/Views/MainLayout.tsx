import { NavLink, useNavigate } from "react-router";
import { Outlet } from "react-router";
import { MdHomeFilled } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { GiRollingEnergy } from "react-icons/gi";
import { BsPerson } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { BiPencil } from "react-icons/bi";
import axios from "axios";
import { useEffect } from "react";
import type { sessionResponse } from "../Lib/types";

type Props = {};

function MainLayout({}: Props) {
  const navigate = useNavigate();
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data: response } = await axios.get<sessionResponse>(
          "http://localhost:3000/session"
        );
        console.log(response.user.data.user.email);
        return response.user.data.user.email;
      } catch (e) {
        console.log(e);
        navigate("/");
      }
    };
    verifyAuth();
  }, []);

  return (
    <div className="grid grid-cols-[clamp(100px,25vw,400px)_1fr] max-[1300px]:grid-cols-[100px_1fr]">
      <div className="h-screen sticky top-0 flex flex-col items-center">
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
          <NavLink to="/messages">
            <div className="flex gap-x-5">
              <MdEmail size={35} className="my-auto max-[1300px]:mx-auto" />
              <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                Messages
              </p>
            </div>
          </NavLink>
          <NavLink to="/nexus">
            <div className="flex gap-x-5">
              <GiRollingEnergy
                size={35}
                className="my-auto max-[1300px]:mx-auto"
              />
              <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                Nexus
              </p>
            </div>
          </NavLink>
          <NavLink to="/profile">
            <div className="flex gap-x-5">
              <BsPerson size={35} className="my-auto max-[1300px]:mx-auto" />
              <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                Profile
              </p>
            </div>
          </NavLink>
          <NavLink to="/settings">
            <div className="flex gap-x-5">
              <IoSettingsOutline
                size={35}
                className="my-auto max-[1300px]:mx-auto"
              />
              <p className="text-2xl font-semibold my-auto block max-[1300px]:hidden">
                Settings
              </p>
            </div>
          </NavLink>
        </nav>
        <button className="bg-black rounded-3xl text-lg w-60 max-[1300px]:w-20 text-white font-bold h-13 mt-6 items-end min-[1300px]:ml-20 ">
          <p className="max-[1300px]:hidden">Post</p>

          <BiPencil
            size={30}
            className="hidden max-[1300px]:block max-[1300px]:mx-auto"
          />
        </button>
        <button
          onClick={async () => {
            try {
              const response = await axios.post(
                "http://localhost:3000/auth/logout",
                {},
                { withCredentials: true }
              );
              console.log(response);
              navigate("/");
            } catch (e) {
              console.log(e);
            }
          }}
        >
          Logout
        </button>
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
