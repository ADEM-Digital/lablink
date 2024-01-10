import express, { Express, Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import indexRouter from "./routes/index";

// Configuration
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = [
  "https://certassist-client.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(logger("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));

app.use("/", indexRouter);
console.log("Running server")
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

module.exports = app;
