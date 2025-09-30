import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router";
import type { Post } from "../../Lib/types";
import axios from "axios";
import PostCard from "../../Lib/Assets/PostCard";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import FallBack from "../../Lib/Assets/FallBack";
import useStore from "../../Lib/zustandStore";
import { handleDelete } from "../../Lib/stateFunctions";

type Props = {};

function ProfilePostsPage({}: Props) {
  let { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fallBack, setFallBack] = useState<ReactNode>();

  const profilePosts = useStore((state) => state.posts);
  const setProfilePostsStore = useStore((state) => state.setPosts);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const { data: profilePosts } = await axios.get<Post[]>(
          `http://localhost:3000/user/profile/${userId}/posts`
        );
        console.log(profilePosts);
        setProfilePostsStore(profilePosts);
        setLoading(false);
        if (!profilePosts.length) {
          setFallBack(
            <FallBack title="Still waiting for your first post..." content="" />
          );
        }
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    }

    fetchData();
  }, [userId]);

  return (
    <>
      {loading ? (
        <LoadingSpinner style="w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-20" />
      ) : (
        profilePosts?.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            content={post.content}
            date_of_creation={post.date_of_creation}
            name={post.name}
            t_identifier={post.t_identifier}
            likes={post.likes}
            active_user_liked={post.active_user_liked}
            active_user_creator={post.active_user_creator}
            onDelete={() => handleDelete(post.id)}
            user_id={post.user_id}
            replies={post.replies}
            followed={post.followed}
            avatar={post.avatar}
            file_1={post.file_1}
            file_2={post.file_2}
            file_3={post.file_3}
            file_4={post.file_4}
          />
        ))
      )}
      {fallBack}
    </>
  );
}

export default ProfilePostsPage;
