import { BsPersonFill } from "react-icons/bs";
import { useNavigate } from "react-router";

type Props = {
  name: string;
  avatar: string;
  t_identifier: string;
  user_id: string;
};
function ProfileCard({ name, avatar, t_identifier, user_id }: Props) {
  const navigate = useNavigate();
  const navigateToProfile = () => {
    navigate(`/${user_id}`);
  };
  return (
    <div
      className="flex items-center place-content-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={navigateToProfile}
    >
      <div className="flex items-center">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full mr-4 object-cover hover:brightness-75"
          />
        ) : (
          <div className="w-12 h-12 flex justify-center items-center mr-4 bg-gray-100 rounded-full overflow-hidden">
            <BsPersonFill />
          </div>
        )}

        <div>
          <p className="font-bold text-sm hover:underline">{name}</p>
          <p className="text-gray-400 text-sm font-semibold">{t_identifier}</p>
        </div>
      </div>

      <button className="bg-black text-white text-sm rounded-4xl py-1 px-4">
        Follow
      </button>
    </div>
  );
}

export default ProfileCard;
