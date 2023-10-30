import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import router from "./router/index.js";
import { ENV_CORS_URL } from "./constants.js";
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: ENV_CORS_URL, credentials: true }));

mongoose.Promise = Promise;
mongoose.connect(process.env.URI);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Operational");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`app listening on port:${PORT}`);
});

app.use("/", router());
