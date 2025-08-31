import React from "react";

type Props = {
  style: string;
};

const ProgressBar = ({ style }: Props) => {
  return (
    <div className={style}>
      <div
        className="h-3 w-full rounded-full bg-gray-200 overflow-hidden"
        role="progressbar"
      >
        <div
          id="bar"
          className="h-full w-0 bg-gradient-to-r from-blue-300 to-indigo-300 animate-[grow_0.2s_linear_forwards]"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
