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

userRouter.get("/posts", async (req, res) => {
  try {
    const posts =
      await sql`select p.id, p.date_of_creation, p.content, u.name, u.t_identifier from posts p left join profiles u on p.created_by = u.id;`;
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Error retrieving posts" });
  }
});

export default userRouter;
