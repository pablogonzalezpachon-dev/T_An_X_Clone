import express from "express";
import sql from "../Lib/Utils/db.js";
import { supabase } from "../Lib/Utils/supabaseClients.js";
import busboy from "busboy";
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
      SELECT *
      FROM (
        SELECT
          u.name,
          u.t_identifier,
          u.id as id,
          u.avatar,
          COALESCE(BOOL_OR(f.following = ${activeUserId}), false) AS followed
        FROM profiles u
        LEFT JOIN follows f ON u.id = f.followed
        GROUP BY u.name, u.t_identifier, u.id, u.avatar
      ) s
      WHERE s.followed = false AND s.id <> ${activeUserId}
      ORDER BY random()
      LIMIT 5;
`;
    res.json(profiles);
  } catch (error) {
    console.error("Error retrieving profiles:", error);
    res.status(500).json({ message: "Error retrieving profiles" });
  }
});

userRouter.get("/search/profiles", async (req, res) => {
  const query = req.query.q;

  try {
    const rows = await sql`
      SELECT DISTINCT u.name, u.t_identifier, u.id, u.avatar
      FROM profiles u
      LEFT JOIN follows f ON u.id = f.followed
      WHERE
        regexp_replace(u.name, '[[:space:]]+', '', 'g') ILIKE
          regexp_replace(${query}, '[[:space:]]+', '', 'g') || '%'
        OR u.name ILIKE '%' || ${query.trim()} || '%'
        OR u.t_identifier ILIKE '%' || ${query.trim()} || '%'
      LIMIT 3
    `;

    res.json(rows);
  } catch (error) {
    console.error("Error searching profiles:", error);
    res.status(500).json({ message: "Error searching profiles" });
  }
});

userRouter.get("/search/posts", async (req, res) => {
  const query = req.query.q;

  try {
    const rows = await sql`
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
        COALESCE(BOOL_OR(l.who_liked = '13f2a198-cade-41c4-804c-7c5dc1b61b29'), false) AS active_user_liked,
        COALESCE(BOOL_OR(p.created_by = '13f2a198-cade-41c4-804c-7c5dc1b61b29'), false) AS active_user_creator,
        p.reply_to,
        (SELECT COUNT(*) FROM posts WHERE reply_to = p.id) AS replies,
        COALESCE(BOOL_OR(f.following = '13f2a198-cade-41c4-804c-7c5dc1b61b29'), false) AS followed
      FROM posts p
      LEFT JOIN profiles u ON p.created_by = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN follows f ON p.created_by = f.followed
      WHERE p.reply_to IS NULL 
      AND (regexp_replace(p.content, '[[:space:]]+', '', 'g') ILIKE regexp_replace(${query}, '[[:space:]]+', '', 'g') || '%'
      OR p.content ILIKE '%' || ${query} || '%'
      OR (regexp_replace(name, '[[:space:]]+', '', 'g') ) ILIKE regexp_replace(${query}, '[[:space:]]+', '', 'g') || '%'
      OR name ILIKE '%' || ${query} || '%'  )
      OR t_identifier ILIKE '%' || ${query} || '%'
      GROUP BY 
        p.id, 
        p.date_of_creation, 
        p.content, 
        u.name, 
        u.t_identifier, 
        u.id 
        ORDER BY p.date_of_creation desc;
`;

    res.json(rows);
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ message: "Error searching posts" });
  }
});

userRouter.post("/post", async (req, res) => {
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

export default userRouter;
