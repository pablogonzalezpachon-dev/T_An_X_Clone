import { useEffect, useState } from "react";
import type { Post, UserProfile } from "../../Lib/types";
import axios from "axios";
import PostCard from "../../Lib/Assets/PostCard";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import useStore from "../../Lib/zustandStore";
import { handleDelete } from "../../Lib/stateFunctions";

type Props = {};

function LikesPage({}: Props) {
  const [loading, setLoading] = useState(false);
  const likedPosts = useStore((state) => state.posts);
  const setLikedPosts = useStore((state) => state.setPosts);

  const setUsers = useStore((state) => state.setUsers);
  const recommendedProfiles = useStore((state) => state.recommendedProfiles);
  const users = useStore((state) => state.users);

  useEffect(() => {
    setLoading(true);
    async function fetchLikedPosts() {
      try {
        const { data: users } = await axios.get<UserProfile[]>(
          "http://localhost:3000/user/profile/posts/likes/users"
        );
        const { data: likedPosts } = await axios.get<Post[]>(
          `http://localhost:3000/user/profile/posts/likes`
        );
        setUsers([...users, ...(recommendedProfiles || [])]);
        setLoading(false);
        setLikedPosts(likedPosts);
        console.log(likedPosts);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    }

    async function fetchUsers() {
      try {
        const { data: users } = await axios.get<UserProfile[]>(
          "http://localhost:3000/user/profile/posts/likes/users"
        );
        setUsers([...users, ...(recommendedProfiles || [])]);
      } catch (e) {
        console.log(e);
      }
    }

    async function fetchData() {
      await Promise.all([fetchLikedPosts(), fetchUsers()]);
    }

    fetchData();
  }, []);
  console.log(users, "hellooooo");

  return (
    <>
      {loading ? (
        <LoadingSpinner style="w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-20" />
      ) : (
        likedPosts?.map((post) => (
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
    </>
  );
}

export default LikesPage;
