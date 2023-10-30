import express from "express";

import { ENV_CORS_URL } from "../constants.js";
import { createUser, getUserByEmail, updateUserByEmail } from "../db/users.js";
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
      return res
        .status(400)
        .json({ message: "Please provide both an email and password." });
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password +verified"
    );
    const expectedHash = authentication(user.authentication.salt, password);

    if (!user || user.authentication.password !== expectedHash) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password." })
        .end();
    }
    if (user && !user.verified) {
      return res
        .status(403)
        .json({
          message: `You have not verified your account, check your email or request a new code.`,
        })
        .end();
    }

    // const salt = random();

    user.authentication.sessionToken = authentication(
      random(),
      user._id.toString()
    );

    await user.save();

    res.cookie("const_sessionToken", user.authentication.sessionToken);

    const clientUser = { ...user.toObject() };
    delete clientUser.authentication;
    console.log(clientUser);

    return res
      .status(200)
      .json({ user: clientUser, message: "Successful login!" })
      .end();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  const {
    email,
    username,
    password,
  }: { email: string; username: string; password: string } = req.body;

  if (!email || !username || !password) {
    return res
      .status(400)
      .json({
        message: "You need to fill out all fields to register",
      })
      .end();
  }

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return res
      .status(400)
      .json({
        message: `The email ${email} is already in use`,
      })
      .end();
  }

  const verificationCode = verificationCodeGen();
  const salt = random();
  const hashedPassword = authentication(salt, password);
  try {
    const user = await createUser({
      email,
      username,
      verified: false,
      verificationCode,
      authentication: {
        salt,
        password: hashedPassword,
      },
    });
    const verification = await updateUserByEmail(email, { verificationCode });

    const emailResponse = await sendVerificationEmail({
      email,
      verificationCode,
    });
    if (user && verification && emailResponse) {
      return res
        .status(200)
        .json({
          message: `We have sent an email to ${email}.`,
        })
        .end();
    } else {
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
    });
  }
};

export const verify = async (req: express.Request, res: express.Response) => {
  try {
    const { email, code } = req.body;
    console.log(email);
    if (!email || !code) {
      return res
        .status(400)
        .json({
          message: "Please provide both an email and its associated code.",
        })
        .end();
    }

    const existingUser = await getUserByEmail(email).select(
      "+verificationCode"
    );

    if (!existingUser) {
      return res
        .status(404)
        .json({
          message:
            "No user under that email exists. Please register before attempting to verify.",
        })
        .end();
    }
    if (existingUser.verified) {
      return res
        .status(200)
        .json({
          message: "Your email is already verified. You may now log in.",
        })
        .end();
    }

    if (existingUser.verificationCode !== code) {
      const verificationCode = verificationCodeGen();
      const emailResponse = await sendVerificationEmail({
        email,
        verificationCode,
      });

      if (emailResponse === true) {
        await updateUserByEmail(email, {
          verificationCode,
        });
        return res
          .status(400)
          .json({
            message: `That code has expired, we have sent a new code to ${email} check your spam folder. Codes have a lifetime of 10 minutes before they are no longer valid.`,
          })
          .end();
      } else {
        return res
          .status(500)
          .json({
            message: `That code has expired and we were unable to send a new code to ${email}. This error has been sent to the application maintainers we will send you an email when the issue is resolved.`,
          })
          .end();
      }
    }

    if (existingUser.verificationCode === code) {
      await updateUserByEmail(email, {
        verified: true,
        verificationCode: null,
      });
      return res
        .status(200)
        .json({ message: "Your account has been verified!" })
        .end();
    }
    return res.status(500).json({ message: "Unkown error." });
  } catch (error) {
    return res.sendStatus(500);
  }
};
