import React, { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router";
import type { Post } from "../../Lib/types";
import axios from "axios";
import PostCard from "../../Lib/Assets/PostCard";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";
import FallBack from "../../Lib/Assets/FallBack";

type Props = {};

function RepliesPage({}: Props) {
  let { userId } = useParams();
  const [profileReplies, setProfileReplies] = useState<Post[]>();
  const [loading, setLoading] = useState(false);
  const [fallBack, setFallBack] = useState<ReactNode>();

  const handleDelete = async (postId: number) => {
    const originalReplies = profileReplies;
    try {
      setProfileReplies((prevReplies) =>
        prevReplies?.filter((reply) => reply.id !== postId)
      );
      const response = await axios.delete(
        `http://localhost:3000/user/post/${postId}`
      );
      console.log(response);
    } catch (error) {
      setProfileReplies(originalReplies);
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const { data: profileReplies } = await axios.get<Post[]>(
          `http://localhost:3000/user/profile/${userId}/replies`
        );
        setProfileReplies(profileReplies);
        setLoading(false);
        if (!profileReplies.length) {
          setFallBack(
            <FallBack title="Looks that there is nothing here..." content="" />
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
        profileReplies?.map((reply) => (
          <PostCard
            id={reply.id}
            content={reply.content}
            date_of_creation={reply.date_of_creation}
            name={reply.name}
            t_identifier={reply.t_identifier}
            likes={reply.likes}
            active_user_liked={reply.active_user_liked}
            active_user_creator={reply.active_user_creator}
            onDelete={handleDelete}
            user_id={reply.user_id}
            replies={reply.replies}
            followed={reply.followed}
            avatar={reply.avatar}
          />
        ))
      )}
      {fallBack}
    </>
  );
}

export default RepliesPage;
