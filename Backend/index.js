import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import session from "express-session";
import dotenv from "dotenv";
import sql from "./Lib/Utils/db.js";
import authRouter from "./Routes/auth.js";
import userRouter from "./Routes/user.js";
import postRouter from "./Routes/post.js";
import signUpRouter from "./Routes/signUp.js";

dotenv.config();

const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

const indexRouter = express.Router();
app.use(indexRouter, express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/auth", authRouter);
app.use("/user", requireAuth, userRouter);
app.use("/post", requireAuth, postRouter);
app.use("/signup", signUpRouter);

authRouter.use(express.json());
userRouter.use(express.json());

function requireAuth(req, res, next) {
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];

    jwt.verify(token, "access", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "User not authenticated" });
      }
      next();
    });
  } else {
    return res.status(403).json({ message: "User not authenticated" });
  }
}

app.get("/session", (req, res) => {
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];

    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        return res.status(200).json({ user });
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not authenticated" });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
