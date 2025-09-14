import React, { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router";
import type { Post } from "../../Lib/types";
import axios from "axios";
import PostCard from "../../Lib/Assets/PostCard";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import FallBack from "../../Lib/Assets/FallBack";

type Props = {};

function ProfilePostsPage({}: Props) {
  let { userId } = useParams();
  const [profilePosts, setProfilePosts] = useState<Post[]>();
  const [loading, setLoading] = useState(false);
  const [fallBack, setFallBack] = useState<ReactNode>();

  const handleDelete = async (postId: number) => {
    const originalPosts = profilePosts;
    try {
      setProfilePosts((prevPosts) =>
        prevPosts?.filter((post) => post.id !== postId)
      );
      const response = await axios.delete(
        `http://localhost:3000/user/post/${postId}`
      );
      console.log(response);
    } catch (error) {
      setProfilePosts(originalPosts);
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const { data: profilePosts } = await axios.get<Post[]>(
          `http://localhost:3000/user/profile/${userId}/posts`
        );
        setProfilePosts(profilePosts);
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
            id={post.id}
            content={post.content}
            date_of_creation={post.date_of_creation}
            name={post.name}
            t_identifier={post.t_identifier}
            likes={post.likes}
            active_user_liked={post.active_user_liked}
            active_user_creator={post.active_user_creator}
            onDelete={handleDelete}
            user_id={post.user_id}
            replies={post.replies}
            followed={post.followed}
          />
        ))
      )}
      {fallBack}
    </>
  );
}

export default ProfilePostsPage;
