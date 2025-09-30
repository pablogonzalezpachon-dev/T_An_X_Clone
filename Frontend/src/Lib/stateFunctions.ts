import axios from "axios";
import useStore from "./zustandStore";

export const handleDelete = async (postId: number) => {
  const { posts } = useStore.getState();
  const originalPosts = posts;
  try {
    useStore.setState({
      posts: posts.filter((p) => p.id !== postId),
    });

    const response = await axios.delete(
      `http://localhost:3000/user/post/${postId}`
    );
    console.log(response);
  } catch (error) {
    useStore.setState({
      posts: originalPosts,
    });
    console.error("Error deleting post:", error);
  }
};

export async function handleFollow(id: string) {
  const { users } = useStore.getState();
  const { activeUser } = useStore.getState();

  try {
    useStore.setState({
      users: users.map((user) => {
        if (user.id === id) {
          return { ...user, followed: true, followers: user.followers + 1 };
        }
        return user;
      }),
    });

    activeUser &&
      useStore.setState({
        activeUser: {
          ...activeUser,
          following: activeUser.following + 1,
        },
      });

    const { data: followResponse } = await axios.post<string>(
      "http://localhost:3000/user/follow",
      { userId: id }
    );
    console.log(followResponse);
  } catch (e) {
    useStore.setState({
      users: users.map((user) => {
        if (user.id === id) {
          return { ...user, followed: false, followers: user.followers - 1 };
        }
        return user;
      }),
    });

    activeUser &&
      useStore.setState({
        activeUser: {
          ...activeUser,
          following: activeUser.following - 1,
        },
      });

    console.log(e);
  }
}

export async function handleUnfollow(id: string) {
  const { activeUser } = useStore.getState();
  const { users } = useStore.getState();
  try {
    useStore.setState({
      users: users.map((user) => {
        if (user.id === id) {
          return { ...user, followed: false, followers: user.followers - 1 };
        }
        return user;
      }),
    });

    activeUser &&
      useStore.setState({
        activeUser: {
          ...activeUser,
          following: activeUser.following - 1,
        },
      });

    const { data: unfollowResponse } = await axios.delete<string>(
      `http://localhost:3000/user/unfollow/${id}`
    );
    console.log(unfollowResponse);
  } catch (e) {
    useStore.setState({
      users: users.map((user) => {
        if (user.id === id) {
          return { ...user, followed: true, followers: user.followers + 1 };
        }
        return user;
      }),
    });

    activeUser &&
      useStore.setState({
        activeUser: {
          ...activeUser,
          following: activeUser.following + 1,
        },
      });

    console.log(e);
  }
}
