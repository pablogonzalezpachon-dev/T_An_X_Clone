import express from "express";
import jwt from "jsonwebtoken";
import sql from "../Lib/Utils/db.js";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../Lib/Utils/supabaseClients.js";

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

userRouter.get("/profile/:userId", async (req, res) => {
  const activeUserId = req.session.userId;
  const userId = req.params.userId;
  try {
    const user =
      await sql`SELECT p.id, p.name, p.bio, p.location, p.month_birth, p.day_birth, p.year_birth, p.t_identifier, p.avatar, p.main_photo, p.created_at, COALESCE(BOOL_OR(f.following = ${activeUserId}), false) as followed, (SELECT COUNT(*) FROM follows f WHERE f.followed = p.id) AS followers, (SELECT COUNT(*) FROM follows f WHERE f.following = p.id) AS following, (SELECT COUNT(*) FROM posts where created_by = p.id ) as posts FROM profiles p left join follows f on p.id = f.followed WHERE p.id = ${userId} group by p.id;`;
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

userRouter.post("/post", async (req, res) => {
  const content = req.body.content;
  const userId = req.session.userId;
  const replyTo = req.body.replyTo;
  try {
    const post =
      await sql`INSERT INTO posts (created_by, date_of_creation, content, reply_to) VALUES (${userId}, ${new Date().toISOString()}, ${content}, ${replyTo}) returning id;`;
    return res.status(201).json(post[0].id);
  } catch (e) {
    console.error("Error creating post:", e);
    return res.status(500).json({ message: "Error creating post" });
  }
});

userRouter.get("/posts", async (req, res) => {
  const userId = req.session.userId;
  try {
    const posts =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, COALESCE(BOOL_OR(l.who_liked = ${userId}), false) AS active_user_liked, COALESCE(BOOL_OR(p.created_by = ${userId}), false) AS active_user_creator, p.reply_to, (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies, COALESCE(BOOL_OR(f.following = ${userId}), false) as followed from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id left join follows f on p.created_by = f.followed where p.reply_to IS NULL group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id order by p.date_of_creation desc;`;
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
  const userId = req.session.userId;
  try {
    const result =
      await sql`DELETE FROM posts WHERE id = ${postId} AND created_by = ${userId};`;
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
    const postData =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, COALESCE(BOOL_OR(l.who_liked = ${active_user}), false) AS active_user_liked, COALESCE(BOOL_OR(p.created_by = ${active_user}), false) as active_user_creator, p.reply_to, (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where p.id = ${postId} group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id; `;
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
    const repliesData =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, COALESCE(BOOL_OR(l.who_liked = ${active_user}), false) AS active_user_liked, COALESCE(BOOL_OR(p.created_by = ${active_user}), false) as active_user_creator, p.reply_to, (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where reply_to=${postId} group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id order by p.date_of_creation desc; `;

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
    const posts =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, COALESCE(BOOL_OR(l.who_liked = ${activeUserId}), false) AS active_user_liked, COALESCE(BOOL_OR(p.created_by = ${activeUserId}), false) AS active_user_creator, p.reply_to, (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where p.reply_to IS NULL and p.created_by = ${profileUserId} group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id order by p.date_of_creation desc;`;
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
    const replies =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, COALESCE(BOOL_OR(l.who_liked = ${activeUserId}), false) AS active_user_liked, COALESCE(BOOL_OR(p.created_by = ${activeUserId}), false) AS active_user_creator, p.reply_to, (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where p.reply_to IS NOT NULL and p.created_by = ${profileUserId} group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id order by p.date_of_creation desc;`;
    res.json(replies);
  } catch (error) {
    console.error("Error retrieving replies:", error);
    res.status(500).json({ message: "Error retrieving replies" });
  }
});

userRouter.get("/profile/posts/likes", async (req, res) => {
  const activeUserId = req.session.userId;
  try {
    const likedPosts =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes, COALESCE(BOOL_OR(l.who_liked = ${activeUserId}), false) AS active_user_liked, COALESCE(BOOL_OR(p.created_by = ${activeUserId}), false) AS active_user_creator, p.reply_to, (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where l.who_liked = ${activeUserId} group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id order by p.date_of_creation desc;`;
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

export default userRouter;
