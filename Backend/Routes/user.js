import express from "express";
import sql from "../Lib/Utils/db.js";
import { supabase } from "../Lib/Utils/supabaseClients.js";
import { toPublicUrl } from "../Lib/Utils/functions.js";

const userRouter = express.Router();

userRouter.get("/session", async (req, res) => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    res.json({ session: session });
    return session;
  } catch (error) {
    console.error("Session retrieval error:", error);
    return null;
  }
});

userRouter.post("/avatar", async (req, res) => {
  const activeUserId = req.session.userId;
  const path = req.body.path;

  try {
    const avatarUpload = await sql`
    update profiles set avatar = ${toPublicUrl(
      path,
      "avatars"
    )} where id = ${activeUserId}
    `;
    res.status(200).json("Image uploaded correctly");
  } catch (e) {
    console.log("Error uploading the avatar", e);
    res.status(500).json({ message: "Error uploading the avatar" });
  }
});

userRouter.get("/profile/:userId", async (req, res) => {
  const activeUserId = req.session.userId;
  const userId = req.params.userId;
  try {
    const user = await sql`
      SELECT
        p.id,
        p.name,
        p.bio,
        p.location,
        p.month_birth,
        p.day_birth,
        p.year_birth,
        p.t_identifier,
        p.avatar,
        p.main_photo,
        p.created_at,
        COALESCE(BOOL_OR(f.following = ${activeUserId}), false) AS followed,
        (SELECT COUNT(*) FROM follows f WHERE f.followed = p.id) AS followers,
        (SELECT COUNT(*) FROM follows f WHERE f.following = p.id) AS following,
        (SELECT COUNT(*) FROM posts WHERE created_by = p.id) AS posts
      FROM profiles p
      LEFT JOIN follows f
        ON p.id = f.followed
      WHERE p.id = ${userId}
      GROUP BY p.id;`;
    res.json(user);
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ message: "Error retrieving user profile" });
  }
});

userRouter.get("/profile", async (req, res) => {
  const userId = req.session.userId;
  try {
    const user = await sql`SELECT * FROM profiles WHERE id = ${userId};`;
    res.json(user);
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ message: "Error retrieving user profile" });
  }
});

userRouter.get("/posts", async (req, res) => {
  const userId = req.session.userId;
  try {
    const posts = await sql`
      SELECT
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id AS user_id,
        u.avatar,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
        COALESCE(BOOL_OR(l.who_liked = ${userId}), false) AS active_user_liked,
        COALESCE(BOOL_OR(p.created_by = ${userId}), false) AS active_user_creator,
        p.reply_to,
        (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies,
        COALESCE(BOOL_OR(f.following = ${userId}), false) AS followed
      FROM posts p
      LEFT JOIN profiles u ON p.created_by = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN follows f ON p.created_by = f.followed
      WHERE p.reply_to IS NULL
      GROUP BY
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id
      ORDER BY p.date_of_creation DESC;`;
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Error retrieving posts" });
  }
});

userRouter.post("/post/like", async (req, res) => {
  const postId = req.body.postId;
  const userId = req.session.userId;
  try {
    const like =
      await sql`INSERT INTO likes (post_id, who_liked) VALUES (${postId}, ${userId});`;
    res.status(201).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post" });
  }
});

userRouter.post("/post/unlike", async (req, res) => {
  const postId = req.body.postId;
  const userId = req.session.userId;
  try {
    const unlike =
      await sql`DELETE FROM likes WHERE post_id = ${postId} AND who_liked = ${userId};`;
    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ message: "Error unliking post" });
  }
});

userRouter.delete("/post/:id", async (req, res) => {
  const postId = req.params.id;
  const activeUserId = req.session.userId;
  try {
    const prefix = `${activeUserId}/${postId}`; // no trailing slash
    console.log(prefix);

    // list — you need SELECT on storage.objects

    const { data: files, error: listErr } = await supabase.storage
      .from("post_media")
      .list(prefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    console.log("The files areeee", files);

    if (listErr) throw listErr;
    if (files.length > 0) {
      const paths = files.map((f) => `${prefix}/${f.name}`);
      const { data: removedFiles, error: removedFilesError } =
        await supabase.storage.from("post_media").remove(paths); // deletes these files
      if (removedFilesError) throw removedFilesError;
    }

    const result =
      await sql`DELETE FROM posts WHERE id = ${postId} AND created_by = ${activeUserId};`;
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

userRouter.get("/post/:id", async (req, res) => {
  const active_user = req.session.userId;
  const postId = req.params.id;
  try {
    const postData = await sql`
      SELECT
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id AS user_id,
        u.avatar,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
        COALESCE(BOOL_OR(l.who_liked = ${active_user}), false) AS active_user_liked,
        COALESCE(BOOL_OR(p.created_by = ${active_user}), false) AS active_user_creator,
        p.reply_to,
        (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies
      FROM posts p
      LEFT JOIN profiles u ON p.created_by = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.id = ${postId}
      GROUP BY
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id,
        u.avatar;`;
    if (postData.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(postData[0]);
  } catch (error) {
    console.error("Error loading post:", error);
    res.status(500).json({ message: "Error loading post" });
  }
});

userRouter.get("/post/replies/:id", async (req, res) => {
  const active_user = req.session.userId;
  const postId = req.params.id;
  try {
    const repliesData = await sql`
      SELECT
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id AS user_id,
        u.avatar,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
        COALESCE(BOOL_OR(l.who_liked = ${active_user}), false) AS active_user_liked,
        COALESCE(BOOL_OR(p.created_by = ${active_user}), false) AS active_user_creator,
        p.reply_to,
        (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies
      FROM posts p
      LEFT JOIN profiles u ON p.created_by = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE reply_to = ${postId}
      GROUP BY
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id,
        u.avatar
      ORDER BY p.date_of_creation DESC;`;
    res.status(200).json(repliesData);
  } catch (error) {
    console.error("Error loading replies:", error);
    res.status(500).json({ message: "Error loading replies" });
  }
});

userRouter.get("/profile/:userId/posts", async (req, res) => {
  const activeUserId = req.session.userId;
  const profileUserId = req.params.userId;
  try {
    const posts = await sql`
      SELECT
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id AS user_id,
        u.avatar,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
        COALESCE(BOOL_OR(l.who_liked = ${activeUserId}), false) AS active_user_liked,
        COALESCE(BOOL_OR(p.created_by = ${activeUserId}), false) AS active_user_creator,
        p.reply_to,
        (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies,
        COALESCE(BOOL_OR(f.following = ${activeUserId}), false) AS followed
      FROM posts p
      LEFT JOIN profiles u ON p.created_by = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN follows f ON p.created_by = f.followed
      WHERE
        p.reply_to IS NULL
        AND p.created_by = ${profileUserId}
      GROUP BY
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id,
        u.avatar
      ORDER BY
        p.date_of_creation DESC;`;
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Error retrieving posts" });
  }
});

userRouter.get("/profile/:userId/replies", async (req, res) => {
  const activeUserId = req.session.userId;
  const profileUserId = req.params.userId;
  try {
    const replies = await sql`
      SELECT
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id AS user_id,
        u.avatar,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
        COALESCE(BOOL_OR(l.who_liked = ${activeUserId}), false) AS active_user_liked,
        COALESCE(BOOL_OR(p.created_by = ${activeUserId}), false) AS active_user_creator,
        p.reply_to,
        (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies,
        COALESCE(BOOL_OR(f.following = ${activeUserId}), false) AS followed
      FROM posts p
      LEFT JOIN profiles u ON p.created_by = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN follows f ON p.created_by = f.followed
      WHERE
        p.reply_to IS NOT NULL
        AND p.created_by = ${profileUserId}
      GROUP BY
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id,
        u.avatar
      ORDER BY
        p.date_of_creation DESC;`;
    res.json(replies);
  } catch (error) {
    console.error("Error retrieving replies:", error);
    res.status(500).json({ message: "Error retrieving replies" });
  }
});

userRouter.get("/profile/posts/likes", async (req, res) => {
  const activeUserId = req.session.userId;
  try {
    const likedPosts = await sql`
      SELECT
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id AS user_id,
        u.avatar,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
        COALESCE(BOOL_OR(l.who_liked = ${activeUserId}), false) AS active_user_liked,
        COALESCE(BOOL_OR(p.created_by = ${activeUserId}), false) AS active_user_creator,
        p.reply_to,
        (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies
      FROM posts p
      LEFT JOIN profiles u
        ON p.created_by = u.id
      LEFT JOIN likes l
        ON p.id = l.post_id
      WHERE l.who_liked = ${activeUserId}
      GROUP BY
        p.id,
        p.date_of_creation,
        p.content,
        p.file_1,
        p.file_2,
        p.file_3,
        p.file_4,
        u.name,
        u.t_identifier,
        u.id,
        u.avatar
      ORDER BY
        p.date_of_creation DESC;`;
    res.json(likedPosts);
  } catch (error) {
    console.error("Error retrieving liked posts:", error);
    res.status(500).json({ message: "Error retrieving liked posts" });
  }
});

userRouter.post("/follow", async (req, res) => {
  const activeUserId = req.session.userId;
  console.log(activeUserId);
  const followedUserId = req.body.userId;
  console.log(followedUserId);

  try {
    if (activeUserId === followedUserId) {
      throw Error("You cannot follow yourself");
    }
    const followResponse =
      await sql`INSERT INTO follows (followed, following) VALUES (${followedUserId}, ${activeUserId})`;
    res.status(200).json({ message: "User followed successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json("Error following", e);
  }
});

userRouter.delete("/unfollow/:followedUserId", async (req, res) => {
  const activeUserId = req.session.userId;
  const followedUserId = req.params.followedUserId;

  try {
    if (activeUserId === followedUserId) {
      throw Error("You cannot follow yourself");
    }
    const followResponse =
      await sql`DELETE FROM follows where followed = ${followedUserId} AND following = ${activeUserId};`;
    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json("Err");
  }
});

userRouter.get("/profiles", async (req, res) => {
  const activeUserId = req.session.userId;
  try {
    const profiles = await sql`
SELECT u.name, u.t_identifier, u.id, u.avatar
FROM profiles u
WHERE u.id <> ${activeUserId}
ORDER BY random()
LIMIT 5;
`;
    res.json(profiles);
  } catch (error) {
    console.error("Error retrieving profiles:", error);
    res.status(500).json({ message: "Error retrieving profiles" });
  }
});

export default userRouter;
