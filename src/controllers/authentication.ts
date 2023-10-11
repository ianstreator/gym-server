import express from "express";

import { createUser, getUserByEmail } from "../db/users.js";
import {
  authentication,
  random,
  verificationCodeGen,
  sendVerificationEmail,
} from "../helpers/index.js";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res.sendStatus(400);
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password +verified +verification_code"
    );
    if (!user.verified) {
      console.log(user.verified, user.verification_code);

      return res
        .status(403)
        .send(
          "please verify your email. if you cannot find your verification email, you can request a new one below."
        );
    }
    if (!user) {
      return res.sendStatus(400);
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res.sendStatus(403);
    }

    const salt = random();

    user.authentication.sessiontToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    res.cookie("IAN_AUTH", user.authentication.sessiontToken, {
      domain: "localhost",
      path: "/",
    });
    console.log(user);
    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, username, password } = req.body as {
      email: string;
      username: string;
      password: string;
    };
    console.log(req.body);
    if (!email || !username || !password) {
      return res.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.sendStatus(400);
    }
    const verificationCode = verificationCodeGen();
    const salt = random();
    const user = await createUser({
      email,
      username,
      verified: false,
      verification_code: verificationCode,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    sendVerificationEmail({
      userEmail: email,
      verificationCode: verificationCode,
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
