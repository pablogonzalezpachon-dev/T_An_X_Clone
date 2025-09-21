import express from "express";
import sql from "../Lib/Utils/db.js";
import { supabase } from "../Lib/Utils/supabaseClients.js";
import { toPublicUrl } from "../Lib/Utils/functions.js";
import busboy from "busboy";

const postRouter = express.Router();

postRouter.post("/media", async (req, res) => {
  const activeUserId = req.session.userId; // you said you own the session
  if (!activeUserId) {
    console.log("No active user in session");
    return res.status(401).json({ message: "Not authenticated" });
  }

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
    limits: { files: 4, fileSize: 50 * 1024 * 1024 }, // 50MB per file
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
      const content = (fields["content"] ?? "").trim();
      const replyTo =
        fields["replyTo"] === "" ||
        fields["replyTo"] === "null" ||
        fields["replyTo"] == null
          ? null
          : fields["replyTo"];

      // 1) Create the post row first (need postId for storage path)
      const nowIso = new Date().toISOString();

      const inserted =
        await sql`INSERT INTO posts (created_by, date_of_creation, content, reply_to)
                  VALUES (${activeUserId}, ${nowIso}, ${content}, ${replyTo})
                  RETURNING id;`;
      const postId = inserted[0].id;

      // 2) Upload each file to Supabase Storage
      const storedPaths = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        // Optional: validate MIME type(s)
        if (!/^image\/|^video\//.test(f.mimeType)) {
          console.log("Unsupported MIME type:", f.mimeType);
          return res
            .status(400)
            .json({ message: `Unsupported MIME type: ${f.mimeType}` });
        }

        // Never prefix with bucket name; keys are bucket-relative
        const objectKey = `${activeUserId}/${postId}/${i}-${f.filename}`;

        const { data, error } = await supabase.storage
          .from("post_media")
          .upload(objectKey, f.buffer, {
            contentType: f.mimeType,
            upsert: false, // change to true if you want overwrites
          });

        if (error) {
          console.log(error);
          return res.status(400).json({
            message: `Storage upload failed for ${f.filename}: ${error.message}`,
          });
        }
        storedPaths.push(data.path); // e.g., "<userId>/<postId>/0-filename.png"
      }

      // 3) Save up to 4 paths into columns file_1..file_4 (if you use a separate media table, insert there instead)
      console.log("Stored paths:", storedPaths);
      const [p1, p2, p3, p4] = [
        storedPaths[0] || null,
        storedPaths[1] || null,
        storedPaths[2] || null,
        storedPaths[3] || null,
      ];
      console.log("Final paths:", p1, p2, p3, p4);

      await sql`
        UPDATE posts
        SET file_1 = ${toPublicUrl(p1, "post_media")}, file_2 = ${toPublicUrl(
        p2,
        "post_media"
      )}, file_3 = ${toPublicUrl(p3, "post_media")}, file_4 = ${toPublicUrl(
        p4,
        "post_media"
      )}
        WHERE id = ${postId} AND created_by = ${activeUserId};
      `;

      // 4) Respond
      res.status(201).json({ postId, storedPaths });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Error creating post or uploading media", err });
    }
  });

  req.pipe(bb);
});

export default postRouter;
