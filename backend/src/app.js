import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
//app.options("*", cors());
app.use(express.json({
    limit: "32kb",
}));
app.use(express.urlencoded({ extended: true,limit: "32kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("JIIT Review API running");
});

//Auth Routes

app.use("/api/auth", authRoutes);


export default app;
