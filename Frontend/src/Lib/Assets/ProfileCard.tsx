import React from "react";

type Props = {
  name: string;
  avatar: string;
  t_identifier: string;
};

function ProfileCard({ name, avatar, t_identifier }: Props) {
  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-gray-500">{t_identifier}</p>
      </div>
    </div>
  );
}

export default ProfileCard;
