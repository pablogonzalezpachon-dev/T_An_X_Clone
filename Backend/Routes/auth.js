import express from "express";
import jwt from "jsonwebtoken";
import sql from "../Lib/Utils/db.js";
import { createHandle } from "../Lib/Utils/functions.js";
import { supabase } from "../Lib/Utils/supabaseClients.js";
import { toPublicUrl } from "../Lib/Utils/functions.js";
import busboy from "busboy";

const authRouter = express.Router();

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
    req.session.userId = data.user.id;
    if (error) {
      throw error;
    }

    res.json({ message: `${data.user.email} succesfully logged in!` });
  } else {
    console.log(`Login error: ${error}`);
    res.status(403).json({ message: "Invalid credentials" });
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

authRouter.post("/signup", async (req, res) => {
  // Ensure multipart
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    console.log("Invalid Content-Type:", contentType);
    return res
      .status(400)
      .json({ message: "Content-Type must be multipart/form-data" });
  }

  const bb = busboy({
    headers: req.headers,
    limits: { files: 1, fileSize: 5 * 1024 * 1024 }, // 5MB per file
  });

  // Accumulate fields and files (stream each file to memory buffer; adjust if you expect very large files)
  const fields = {};
  const files = [];

  bb.on("field", (name, val) => {
    // You expect "content" and "replyTo"
    fields[name] = val;
  });

  bb.on("file", (_name, file, info) => {
    const { filename, mimeType } = info;
    const chunks = [];
    file.on("data", (chunk) => chunks.push(chunk));
    file.on("limit", () => {
      console.log("File too large");
      res.status(413).json({ message: "File too large" });
    }); // triggered if > fileSize
    file.on("end", () => {
      files.push({ filename, mimeType, buffer: Buffer.concat(chunks) });
    });
  });

  bb.on("error", (err) => {
    console.log("Malformed form-data", err);
    res.status(400).json({ message: "Malformed form-data", err });
  });

  bb.on("close", async () => {
    // Finalize once parsing is done
    try {
      const name = fields["name"];
      const email = fields["email"];
      const monthOfBirth = fields["monthOfBirth"];
      const dayOfBirth = fields["dayOfBirth"];
      const yearOfBirth = fields["yearOfBirth"];
      const password = fields["password"];

      if (
        !name ||
        !email ||
        !monthOfBirth ||
        !dayOfBirth ||
        !yearOfBirth ||
        !password
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
        });
      console.log(userData);
      if (userError) {
        console.log(userError);
        return res.status(400).json({
          message: `User creation failed: ${userError.message}`,
        });
      }
      const storedPaths = [];

      const f = files[0];

      if (f) {
        const objectKey = `${userData.user.id}/${f.filename}`;

        if (!/^image/.test(f.mimeType)) {
          console.log("Unsupported MIME type:", f.mimeType);
          return res
            .status(400)
            .json({ message: `Unsupported MIME type: ${f.mimeType}` });
        }

        const { data: storageData, error: storageError } =
          await supabase.storage.from("avatars").upload(objectKey, f.buffer, {
            contentType: f.mimeType,
            upsert: false, // change to true if you want overwrites
          });
        if (storageError) {
          console.log(storageError);
          return res.status(400).json({
            message: `Storage upload failed for ${f.filename}: ${storageError.message}`,
          });
        }
        storedPaths.push(storageData.path);
      }

      // 3) Save up to 4 paths into columns file_1..file_4 (if you use a separate media table, insert there instead)
      console.log("Stored paths:", storedPaths);
      const p1 = storedPaths[0];
      console.log("Final paths:", p1);

      console.log(
        userData.user.email,
        name,
        monthOfBirth,
        dayOfBirth,
        yearOfBirth,
        createHandle(name),
        userData.user.created_at,
        toPublicUrl(p1, "avatars")
      );

      const profileUser = await sql`
        INSERT INTO profiles 
          (id, email, name, month_birth, day_birth, year_birth, t_identifier, created_at, avatar)
        VALUES 
          (${userData.user.id}, ${
        userData.user.email
      }, ${name}, ${monthOfBirth}, ${dayOfBirth}, ${yearOfBirth}, ${createHandle(
        name
      )}, ${userData.user.created_at}, ${toPublicUrl(p1, "avatars")});
      `;

      // 4) Respond
      res.status(201).json(userData);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Error creating post or uploading media", err });
    }
  });

  req.pipe(bb);
});

export default authRouter;
