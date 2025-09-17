import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { RiUserFollowLine } from "react-icons/ri";
import { AuthContext } from "../Contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router";

type Props = {
  name: string;
  t_identifier: string;
  avatar: string;
};

function SignOutButton({ name, t_identifier, avatar }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  async function handleLogOut() {
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
  }

  return (
    <>
      <Menu
        as="div"
        className="relative inline-block text-center p-1 mt-[-3px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <MenuButton
            className="flex rounded-full w-60 max-[1300px]:w-20 h-18 mt-6 items-center min-[1300px]:ml-20 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Post actions"
          >
            <img
              fetchPriority="high"
              className="ml-3 h-12 w-12 rounded-full max-[1300px]:mx-auto object-cover"
              src={avatar}
            />
            <div className="flex flex-col max-[1300px]:hidden text-left ml-3">
              <p className="font-bold">{name}</p>
              <p className="text-gray-600">{t_identifier}</p>
            </div>

            <BsThreeDots className="ml-4 max-[1300px]:hidden" />
          </MenuButton>
        </div>

        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            static
            className="absolute right-0 z-20 mt-2 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDialogOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-md font-bold 600 rounded-xl hover:bg-gray-100"
                type="button"
              >
                Logout {t_identifier}
              </button>
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className=" flex min-h-full  justify-center p-4 text-center items-center">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-80 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-5 pt-2">
                <div className=" text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <svg
                    className="h-15 mx-auto"
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

                  <DialogTitle
                    as="h1"
                    className="font-bold text-gray-900 text-xl mt-1 text-left"
                  >
                    Logout of T?
                  </DialogTitle>
                  <p className="mt-3 text-gray-500">
                    You can always log back in at any time. If you just want to
                    switch accounts, you can do that by adding an existing
                    account.
                  </p>
                </div>
                <div className="flex flex-col mt-5 gap-y-4 mb-8 items-center px-3">
                  <button
                    onClick={handleLogOut}
                    className="bg-black text-white h-10 font-bold rounded-3xl w-full"
                  >
                    Log out
                  </button>
                  <button
                    onClick={() => {
                      setDialogOpen(false);
                    }}
                    className="border border-gray-300 h-10 font-bold rounded-3xl w-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default SignOutButton;
