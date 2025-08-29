import axios from "axios";
import { use, useContext, useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { AuthContext } from "../../Lib/Contexts/AuthContext";
import { Navigate, useNavigate } from "react-router";
import type { sessionResponse } from "../../Lib/types";

type Props = {};

function HomePage({}: Props) {
  const navigate = useNavigate();

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "0px"; // reset
    el.style.height = el.scrollHeight + "px"; // fit content
  };

  return (
    <div className="grid grid-cols-[1fr_clamp(0px,35vw,900px)] max-[1000px]:grid-cols-[1fr]">
      <div className="h-screen border-x border-gray-200">
        <div className="w-full h-15 border-b border-gray-200 flex items-center place-content-center gap-x-40">
          <p className="text-gray-600 font-semibold">For you</p>
          <p className="text-gray-600 font-semibold">Following</p>
        </div>
        <div className="w-full border-b border-gray-200 p-4">
          <div className="flex gap-x-2 ">
            <div className="w-12 h-11 rounded-4xl  border "></div>
            <textarea
              rows={1}
              onChange={(e) => autoGrow(e.currentTarget)}
              className=" focus:outline-none overflow-visible resize-none w-full text-xl mt-1 ml-1"
              placeholder="What's happening?"
            ></textarea>
          </div>
          <hr className="border-t border-gray-200 mt-5 ml-10 mr-2" />
          <div className="flex place-content-end">
            <button className="bg-black rounded-3xl text-md w-18 text-white font-bold h-10 mt-3  ">
              Post
            </button>
          </div>
        </div>
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

export default HomePage;
