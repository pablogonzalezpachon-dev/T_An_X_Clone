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

export default userRouter;
