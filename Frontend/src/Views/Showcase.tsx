import { useNavigate } from "react-router";
import SignUpFlow from "./Auth/SignUpFlow";
import LoginFlow from "./Auth/LoginFlow";

type Props = {};

function Showcase({}: Props) {
  const navigate = useNavigate();
  return (
    <div className="grid md:grid-cols-[minmax(0,700px)_1fr] ">
      <div className="md:h-screen flex md:max-w-180 h-30 ">
        <svg
          className="md:h-150 md:m-auto"
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
      </div>
      <div className="p-9 md:h-screen flex flex-col justify-center">
        <h1 className="font-[750] text-7xl w-full mb-17">What's happening?</h1>
        <h2 className="font-extrabold text-3xl tracking-widest mb-4">
          Join now
        </h2>
        <SignUpFlow />
        <div className="flex flex-col gap-y-3">
          <p className="text-lg font-semibold">Already have an account?</p>
          <LoginFlow />
        </div>
      </div>
    </div>
  );
}

export default Showcase;
