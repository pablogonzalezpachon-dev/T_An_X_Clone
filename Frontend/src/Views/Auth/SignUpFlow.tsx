import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import axios from "axios";
import debounce from "debounce";
import { IoMdClose } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  isValidDate,
  validateEmail,
  validatePassword,
} from "../../Lib/functions";
import { useNavigate } from "react-router";

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

type Inputs = {
  name: string;
  email: string;
  monthOfBirth: number;
  dayOfBirth: number;
  yearOfBirth: number;
  password: string;
};

export default function SignUpFlow() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [nameState, setNameState] = useState(false);
  const [nameError, setNameError] = useState<undefined | string>();
  const [emailState, setEmailState] = useState(false);
  const [emailError, setEmailError] = useState<undefined | string>();

  const [month, setMonth] = useState<number>();
  const [day, setDay] = useState<number>();
  const [year, setYear] = useState<number>();

  const [dateError, setDateError] = useState<string>();

  const [page, setPage] = useState(1);

  const [passwordState, setPasswordState] = useState(false);
  const [passwordError, setPasswordError] = useState<undefined | string>();

  const [file, setFile] = useState<File | null>(null);

  const [formError, setFormError] = useState<undefined | string>();

  const checkEmail = debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.trim()) {
        if (validateEmail(e.target.value.trim())) {
          try {
            const { data } = await axios.post(
              "http://localhost:3000/auth/email",
              {
                email: e.target.value.trim(),
              }
            );
            if (data.length) {
              setEmailError("Email is already in use");
              setEmailState(false);
            } else {
              setEmailError(undefined);
              setEmailState(true);
            }
          } catch (e) {
            setEmailError("Error checking email");
            setEmailState(false);
          }
        } else {
          setEmailError("Email is invalid");
          setEmailState(false);
        }
      } else {
        setEmailState(false);
        setEmailError("Email is required");
      }
    },
    1000
  );

  function clear() {
    setNameState(false);
    setNameError(undefined);
    setEmailState(false);
    setEmailError(undefined);
    setMonth(undefined);
    setDateError(undefined);
    setDay(undefined);
    setYear(undefined);
    setPasswordState(false);
    setPasswordError(undefined);
    setFile(null);
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);

    try {
      const signUpResponse = await axios.post(
        "http://localhost:3000/auth/signup",
        data
      );
      console.log(signUpResponse);

      const loginResponse = await axios.post(
        "http://localhost:3000/auth/login",
        { email: data.email, password: data.password }
      );

      console.log("loginRespose:", loginResponse);
      navigate("/home");
    } catch (e) {
      setFormError("Error signing up, please try again");
      console.log(e);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          setOpen(true);
          setPage(1);
          clear();
          reset();
        }}
        className="bg-black rounded-3xl text-lg w-80 text-white font-bold h-10 mb-10"
      >
        Create an account
      </button>
      <Dialog open={open} onClose={() => {}} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className=" flex min-h-full  justify-center p-4 text-center items-center">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg  bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-150 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <IoMdClose
                size={23}
                className={`absolute top-3 left-3 ${
                  page !== 1 ? "hidden" : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  clear();
                }}
              />

              <IoIosArrowRoundBack
                size={33}
                className={`absolute top-3 left-3 ${
                  page === 1 ? "hidden" : ""
                }`}
                onClick={() => {
                  setDateError(undefined);
                  setPage((page) => page - 1);
                }}
              />

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
                    {page === 1 ? "Create your account" : ""}
                    {page === 2 ? "You will need a password" : ""}
                    {page === 3 ? "Choose a profile image" : ""}
                  </DialogTitle>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div
                      className={`mt-10 flex flex-col gap-y-8 ${
                        page !== 1 ? "hidden" : ""
                      }`}
                    >
                      <input
                        {...register("name")}
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
                        {...register("email")}
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
                        own age, even if your account is for a company, a pet,
                        or something else.
                      </p>
                      <div className="flex gap-x-3">
                        <select
                          {...register("monthOfBirth")}
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
                          {...register("dayOfBirth")}
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
                          {...register("yearOfBirth")}
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
                              setPage(2);
                              setPasswordState(false);
                              setPasswordError(undefined);
                            } else {
                              setDateError(
                                "Invalid date: User must be 15 years old or older"
                              );
                            }
                          }
                        }}
                        className="disabled:opacity-50 mt-10 mb-5 h-13 w-full justify-center rounded-3xl bg-black px-3 py-2 text-lg font-bold text-white"
                      >
                        Continue
                      </button>
                    </div>

                    <div
                      className={`mt-10 flex flex-col gap-y-8 ${
                        page !== 2 ? "hidden" : ""
                      }`}
                    >
                      <p className={`text-gray-500 text-sm mt-[-25px]`}>
                        Make sure it has 8 characters or more.
                      </p>

                      <input
                        {...register("password")}
                        className={`border w-full border-gray-300 h-15 text-lg pl-2 rounded-lg focus:border-red-500
                      `}
                        autoComplete="new-password"
                        type="password"
                        placeholder="Password"
                        onChange={debounce((e) => {
                          const { valid, errors } = validatePassword(
                            e.target.value
                          );

                          setPasswordState(valid);
                          setPasswordError(
                            valid
                              ? undefined
                              : `Password is weak: ${errors.join(" ")}`
                          );
                        }, 1000)}
                      ></input>
                      <span className="text-red-500 text-sm mt-[-20px] ml-2 ">
                        {passwordError}
                      </span>

                      <button
                        disabled={!passwordState}
                        type="submit"
                        className="disabled:opacity-50 mt-80 mb-5 h-13 w-full justify-center rounded-3xl bg-black px-3 py-2 text-lg font-bold text-white"
                      >
                        Create account
                      </button>
                      <span className="text-red-500 text-sm mt-[-20px] ml-2 ">
                        {formError}
                      </span>
                    </div>

                    {/* <div
                      className={`mt-10 flex flex-col gap-y-8 ${
                        page !== 3 ? "hidden" : ""
                      }`}
                    >
                      <p className={`text-gray-500 text-sm mt-[-25px]`}>
                        Got a favorite selfie? Upload it now.
                      </p>
                      <AvatarUploader onChange={setFile} />

                      <button
                        disabled={!passwordState}
                        type="button"
                        onClick={() => {
                          setPage(3);
                        }}
                        className="disabled:opacity-50 mt-80 mb-5 h-13 w-full justify-center rounded-3xl bg-black px-3 py-2 text-lg font-bold text-white"
                      >
                        Continue
                      </button>
                    </div> */}
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
