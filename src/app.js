import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

/* -------------------- MIDDLEWARES -------------------- */

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

/* -------------------- ROUTES -------------------- */

import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import followRouter from "./routes/follow.routes.js";
import storyRouter from "./routes/story.routes.js"; // ✅ ADD THIS

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/follow", followRouter);
app.use("/api/v1/stories", storyRouter); // ✅ ADD THIS

/* -------------------- EXPORT -------------------- */

export default app;
