import express from "express";
import jwt from "jsonwebtoken";
import sql from "../Lib/Utils/db.js";
import { createHandle } from "../Lib/Utils/functions.js";
import { supabase } from "../Lib/Utils/supabaseClients.js";

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const monthOfBirth = req.body.monthOfBirth;
  const dayOfBirth = req.body.dayOfBirth;
  const yearOfBirth = req.body.yearOfBirth;
  const password = req.body.password;

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });
    console.log(data);
    if (error) {
      throw error;
    }
    if (data) {
      const profileUser = await sql`
        INSERT INTO profiles 
          (id, email, name, month_birth, day_birth, year_birth, t_identifier)
        VALUES 
          (${data.user.id}, ${
        data.user.email
      }, ${name}, ${monthOfBirth}, ${dayOfBirth}, ${yearOfBirth}, ${createHandle(
        name
      )});
      `;
    }
    res.json({ message: `${data.user} succesfully signed up` });
  } catch (e) {
    console.log(e);
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
    console.log(error);
    res.status(403).json({ message: "Not authenticated" });
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

authRouter.post("/email", async (req, res) => {
  const email = req.body.email;
  try {
    const response =
      await sql`select email from auth.users where email = ${email};`;
    res.send(response);
  } catch (e) {
    res.status(500).json({ message: "Error retrieving email" });
    console.error("Error retrieving email:", e);
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

export default authRouter;
