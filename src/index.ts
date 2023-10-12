import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import router from "./router/index.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: process.env.APP_URL }));

mongoose.Promise = Promise;
console.log(process.env.URI)
mongoose.connect(process.env.URI);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.get("/health", (req, res) => {
  res.send("Healthy");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`app listening on port:${PORT}`);
});

app.use("/", router());
