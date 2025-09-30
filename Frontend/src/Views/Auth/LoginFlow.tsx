import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";

const schema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type Inputs = {
  email: string;
  password: string;
};

type Props = {};

export default function LoginFlow({}: Props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    setFormError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        data
      );
      navigate("/home");

      console.log(response);
      setLoading(false);
    } catch (e) {
      let invalidCredentialsError = (e as AxiosError<{ message?: string }>)
        ?.response?.data.message;
      if (invalidCredentialsError) {
        setFormError(invalidCredentialsError);
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="border-1 border-gray-500 rounded-3xl text-lg w-80 font-bold h-10"
        type="button"
      >
        Login
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
                className={`absolute top-3 left-3`}
                onClick={() => {
                  setOpen(false);
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
                    className="font-bold text-gray-900 text-3xl mt-1 text-center"
                  >
                    Login with your account
                  </DialogTitle>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={`mt-10 flex flex-col gap-y-8`}>
                      <input
                        {...register("email", {
                          required: "Email Address is required",
                        })}
                        className="border w-full border-gray-300 h-15 text-lg pl-2 rounded-lg"
                        placeholder="Email"
                      ></input>

                      {errors.email && (
                        <span className="text-red-500 mt-[-25px]">
                          {errors.email.message}
                        </span>
                      )}

                      <input
                        {...register("password")}
                        autoComplete="new-password"
                        type="password"
                        className="border w-full border-gray-300 h-15 text-lg pl-2 rounded-lg"
                        placeholder="Password"
                      ></input>

                      {errors.password && (
                        <span className="text-red-500 mt-[-25px]">
                          {errors.password.message}
                        </span>
                      )}

                      <div className="flex gap-x-3"></div>

                      <button
                        id="login-button"
                        type="submit"
                        className="disabled:opacity-50 h-13 w-full justify-center rounded-3xl bg-black px-3 py-2 text-lg font-bold text-white"
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        className=" h-13 w-full border-1 border-gray-500 rounded-3xl text-lg w-80 font-bold h-10"
                      >
                        Forgot your password?
                      </button>

                      <p className="text-center text-gray-500 mt-4 mb-20 ">
                        Don't have an account?{" "}
                        <span className="text-blue-500 cursor-pointer">
                          Sign up
                        </span>
                      </p>
                    </div>
                    {loading ? (
                      <LoadingSpinner style="w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-[-40px] mb-5" />
                    ) : (
                      ""
                    )}
                    {formError && (
                      <span className="block text-red-500 text-lg font-semibold mt-[-40px] mb-5">
                        {formError}
                      </span>
                    )}
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
