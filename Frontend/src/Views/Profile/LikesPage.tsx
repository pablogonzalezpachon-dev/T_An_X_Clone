import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Post } from "../../Lib/types";
import axios from "axios";
import PostCard from "../../Lib/Assets/PostCard";
import LoadingSpinner from "../../Lib/Assets/LoadingSpinner";

type Props = {};

function LikesPage({}: Props) {
  const [profileLikedPosts, setProfileLikedPosts] = useState<Post[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const { data: likedPosts } = await axios.get<Post[]>(
          `http://localhost:3000/user/profile/posts/likes`
        );
        setLoading(false);
        setProfileLikedPosts(likedPosts);
        console.log(likedPosts);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <LoadingSpinner style="w-7 h-7 text-gray-200 animate-spin fill-blue-400 mx-auto mt-20" />
      ) : (
        profileLikedPosts?.map((post) => (
          <PostCard
            id={post.id}
            content={post.content}
            date_of_creation={post.date_of_creation}
            name={post.name}
            t_identifier={post.t_identifier}
            likes={post.likes}
            active_user_liked={post.active_user_liked}
            active_user_creator={post.active_user_creator}
            onDelete={function (postId: number): Promise<void> {
              throw new Error("Function not implemented.");
            }}
            user_id={post.user_id}
            replies={post.replies}
          />
        ))
      )}
    </>
  );
}

export default LikesPage;
