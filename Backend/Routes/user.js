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

userRouter.post("/profile", async (req, res) => {
  const userId = req.body.id;
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
  const userId = req.body.userId;
  try {
    const post =
      await sql`INSERT INTO posts (created_by, date_of_creation, content) VALUES (${userId}, ${new Date().toISOString()}, ${content});`;
    res.status(201).json({ message: "Post created successfully" });
  } catch (e) {
    console.error("Error creating post:", e);
    res.status(500).json({ message: "Error creating post" });
  }
});

userRouter.post("/posts", async (req, res) => {
  const userId = req.body.userId;
  try {
    const posts =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier, count(l.id) AS likes, BOOL_OR(l.who_liked = ${userId}) AS session_user_liked from posts p left join profiles u on p.created_by = u.id left join likes l on p.id = l.post_id group by p.id, p.date_of_creation, p.content, u.name, u.t_identifier order by p.date_of_creation desc;`;
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Error retrieving posts" });
  }
});

userRouter.post("/post/like", async (req, res) => {
  const postId = req.body.postId;
  const userId = req.body.userId;
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

  try {
    const unlike =
      await sql`DELETE FROM likes WHERE post_id = ${postId} AND who_liked = ${userId};`;
    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ message: "Error unliking post" });
  }
});

export default userRouter;
