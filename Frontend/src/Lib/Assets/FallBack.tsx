import React from "react";

type Props = {
  title: string;
  content: string;
};

function FallBack({ title, content }: Props) {
  return (
    <div className="flex flex-col h-90">
      <p className="mx-auto mt-10 text-3xl w-60 font-bold">{title}</p>
      <p className="mx-auto mt-2 text-md w-60 text-gray-500">{content}</p>
    </div>
  );
}

export default FallBack;
