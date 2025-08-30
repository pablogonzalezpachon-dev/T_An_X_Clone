import React from "react";
import { SlUserFollow } from "react-icons/sl";

type Props = {
  content: string;
  date_of_creation: string;
  name: string;
  t_identifier: string;
};

function PostCard({ content, date_of_creation, name, t_identifier }: Props) {
  return (
    <div className="w-full border-b border-gray-200 p-4">
      <div className=" flex h-15 w-full justify-between">
        <div className="flex gap-x-2">
          <div className="w-11 h-11 rounded-full bg-black"></div>
          <p className="font-semibold">{name}</p>
          <p className="text-gray-500">
            {t_identifier} · {date_of_creation}
          </p>
        </div>
        <div>
          <SlUserFollow size={20} className="mt-1" />
        </div>
      </div>
      <div className="px-13 mt-[-30px]">
        <p>{content}</p>
      </div>
    </div>
  );
}

export default PostCard;
