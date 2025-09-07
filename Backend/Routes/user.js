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
  const userId = req.params.userId;
  try {
    const user = await sql`SELECT * FROM profiles WHERE id = ${userId};`;
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
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, BOOL_OR(l.who_liked = ${userId}) AS active_user_liked, BOOL_OR(p.created_by = ${userId}) AS active_user_creator, p.reply_to from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where p.reply_to IS NULL group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id order by p.date_of_creation desc;`;
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
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, BOOL_OR(l.who_liked = ${active_user}) AS active_user_liked, BOOL_OR(p.created_by = ${active_user}) as active_user_creator from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where p.id = ${postId} group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id; `;
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
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, BOOL_OR(l.who_liked = ${active_user}) AS active_user_liked, BOOL_OR(p.created_by = ${active_user}) as active_user_creator from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where reply_to=${postId} group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id order by p.date_of_creation desc; `;

    res.status(200).json(repliesData);
  } catch (error) {
    console.error("Error loading replies:", error);
    res.status(500).json({ message: "Error loading replies" });
  }
});

userRouter.get("/profile/:userId/posts", async (req, res) => {
  const activeUserId = req.session.userId;
  const userId = req.params.userId;
  try {
    const posts =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id as user_id, count(l.id) AS likes, BOOL_OR(l.who_liked = ${activeUserId}) AS active_user_liked, BOOL_OR(p.created_by = ${activeUserId}) AS active_user_creator, p.reply_to from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id where p.reply_to IS NULL and p.created_by = ${userId} group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier, u.id order by p.date_of_creation desc;`;
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Error retrieving posts" });
  }
});

export default userRouter;
