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

    if (!user) {
      return res.sendStatus(400);
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res.status(403).send("email or password is incorrect.");
    } else if (!user.verified) {
      return res
        .status(403)
        .send(
          "please verify your email. if you cannot find your verification email, you can request a new one below."
        );
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
    const { email, username, password } = req.body;

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
      return res.status(400).json({
        message: `The email ${email} is already in use`
      }).end();
    }

    const verificationCode = verificationCodeGen();
    const salt = random();

    await createUser({
      email,
      username,
      verified: false,
      verification_code: verificationCode,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    const emailResponse = await sendVerificationEmail({
      userEmail: email,
      verificationCode,
    });
    console.log(emailResponse)

    if (emailResponse === true) {
      return res
        .status(200)
        .json({
          email_sent: emailResponse,
          message: `We have sent you a verification code to ${email}.`,
        })
        .end();
    } else {
      return res
        .status(400)
        .json({
          email_sent: emailResponse,
          message: `We were unable send ${email} a verification code.`,
        })
        .end();
    }
  } catch (error) {
    return res.sendStatus(500);
  }
};

// export const verify = async (req: express.Request, res: express.Response) => {
//   try {
//     const { email, code } = req.body;
//     console.log(req.body);
//     if (!email || !code) {
//       return res.sendStatus(400);
//     }

//     const existingUser = await getUserByEmail(email);

//     if (existingUser) {
//       return res.sendStatus(400);
//     }
//     const verificationCode = verificationCodeGen();

//     sendVerificationEmail({
//       userEmail: email,
//       verificationCode: verificationCode,
//     });

//     return res.status(200);
//   } catch (error) {
//     console.log(error);
//     return res.sendStatus(400);
//   }
// };
