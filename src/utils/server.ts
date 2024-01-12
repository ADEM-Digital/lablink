import express from "express";
import cors, { CorsOptions } from "cors";

import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "../routes/index.routes";
import userProfilesRouter from "../routes/userProfiles.routes";
import servicesRouter from "../routes/services.routes";


const createServer = () => {
  const app = express();
 
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
  app.use("/v1/userProfiles", userProfilesRouter);
  app.use("/v1/services", servicesRouter);

  return app;
};

export default createServer;