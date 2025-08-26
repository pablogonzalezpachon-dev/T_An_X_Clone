import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import axios from "axios";
import debounce from "debounce";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function validateEmail(email: string) {
  const re =
    /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
  return re.test(email);
}

function isValidDate(year: number, month: number, day: number): boolean {
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }

  return age >= 15;
}

export default function SignUpFlow() {
  const [open, setOpen] = useState(false);
  const [nameState, setNameState] = useState(false);
  const [nameError, setNameError] = useState<undefined | string>();
  const [emailState, setEmailState] = useState(false);
  const [emailError, setEmailError] = useState<undefined | string>();

  const [month, setMonth] = useState<number>();
  const [day, setDay] = useState<number>();
  const [year, setYear] = useState<number>();

  const [dateError, setDateError] = useState<string>();

  const checkEmail = debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.trim()) {
        if (validateEmail(e.target.value.trim())) {
          setEmailError(undefined);
          setEmailState(true);
        } else {
          setEmailError("Email is invalid");
          setEmailState(false);
        }
      } else {
        setEmailState(false);
        setEmailError("Email is required");
      }
      try {
        const { data } = await axios.post("http://localhost:3000/auth/email", {
          email: e.target.value.trim(),
        });
        if (data.length) {
          setEmailError("Email is already in use");
          setEmailState(false);
        }
      } catch (e) {
        setEmailError("Error checking email");
        setEmailState(false);
      }
    },
    1000
  );

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="bg-black rounded-3xl text-lg w-80 text-white font-bold h-10 mb-10"
      >
        Create an account
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className=" flex min-h-full  justify-center p-4 text-center items-center">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-150 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-15 pt-2">
                <div className=" text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <svg
                    className="h-14  mx-auto"
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
                    className="font-bold text-gray-900 text-3xl mt-1"
                  >
                    Create your account
                  </DialogTitle>
                  <form className="mt-10 flex flex-col gap-y-8">
                    <input
                      className={`border w-full border-gray-300 h-15 text-lg pl-2 rounded-lg focus:border-red-500
                      `}
                      placeholder="Name"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          setNameState(true);
                          setNameError(undefined);
                        } else {
                          setNameState(false);
                          setNameError("Name is required");
                        }
                      }}
                    ></input>
                    <span className="text-red-500 text-sm mt-[-30px] ml-2 ">
                      {nameError}
                    </span>
                    <input
                      className="border w-full border-gray-300 h-15 text-lg pl-2 rounded-lg"
                      placeholder="Email"
                      onChange={(e) => checkEmail(e)}
                    ></input>
                    <span className="text-red-500 text-sm mt-[-30px] ml-2 ">
                      {emailError}
                    </span>

                    <h2 className="font-bold text-lg">Date of birth</h2>
                    <p className="text-gray-500 text-sm mt-[-25px]">
                      This information will not be public. Please confirm your
                      own age, even if your account is for a company, a pet, or
                      something else.
                    </p>
                    <div className="flex gap-x-3">
                      <select
                        className="border border-gray-300 w-[45%] h-15 text-lg pl-2 rounded-lg text-gray-500"
                        onChange={(e) => {
                          setMonth(parseInt(e.target.value));
                        }}
                      >
                        <option value="" disabled selected>
                          Month
                        </option>
                        {months.map((month, index) => (
                          <option key={index} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        className="border border-gray-300 w-[20%] h-15 text-lg pl-2 rounded-lg text-gray-500"
                        onChange={(e) => {
                          setDay(parseInt(e.target.value));
                        }}
                      >
                        <option value="" disabled selected>
                          Day
                        </option>
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <select
                        className="border border-gray-300 w-[35%] h-15 text-lg pl-2 rounded-lg text-gray-500"
                        onChange={(e) => {
                          setYear(parseInt(e.target.value));
                        }}
                      >
                        <option value="" disabled selected>
                          Year
                        </option>
                        {Array.from({ length: 101 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <span className="text-red-500 text-sm mt-[-20px] ml-2 ">
                      {dateError}
                    </span>
                    <button
                      disabled={
                        !nameState || !emailState || !month || !day || !year
                      }
                      type="button"
                      onClick={() => {
                        if (year && month && day) {
                          if (isValidDate(year, month, day)) {
                            setDateError(undefined);
                            console.log("correct");
                          } else {
                            setDateError(
                              "Invalid date: User must be 15 years old or older"
                            );
                          }
                        }
                      }}
                      className="disabled:opacity-50 mt-10 mb-5 h-13 w-full justify-center rounded-3xl bg-black px-3 py-2 text-lg font-bold text-white"
                    >
                      Siguiente
                    </button>
                  </form>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
