import express from "express";

import { login, verify, register } from "../controllers/authentication.js";

export default (router: express.Router) => {
  router.post("/auth/register", register);
  router.post("/auth/verify", verify);
  router.post("/auth/login", login);
};
