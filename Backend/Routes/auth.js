import express from "express";
import jwt from "jsonwebtoken";

import { createClient } from "@supabase/supabase-js";

const authRouter = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

authRouter.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });
    if (error) {
      throw error;
    }
    console.log(data);
    res.json({ message: `${data.user} succesfully signed up` });
  } catch (e) {
    res.status(403).json({ message: `${e}` });
  }
});

authRouter.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error) {
    let accessToken = jwt.sign(
      {
        data: data,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
    };

    res.json({ message: `${data.user.email} succesfully logged in!` });
  } else {
    res.status(403).json({ message: "Not authenticated" });
  }
});

authRouter.get("/session", async (req, res) => {
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

authRouter.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
    });
    res.clearCookie("connect.sid");
    return res.json({ message: "successfully logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(403).json({ message: `Error logging out: ${error}` });
  }
});

export default authRouter;
