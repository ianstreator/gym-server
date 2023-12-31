import dotenv from "dotenv";
dotenv.config();
import { ENV_CORS_URL } from "../constants.js";
import crypto from "crypto";
import * as nodeMailer from "nodemailer";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
const OAuth2 = google.auth.OAuth2;

const clientId = process.env.OAUTH_CLIENT_ID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;
const clientRefreshToken = process.env.OAUTH_REFRESH_TOKEN;

const OAuth2_client = new OAuth2(clientId, clientSecret);

OAuth2_client.setCredentials({ refresh_token: clientRefreshToken });

const SECRET = process.env.SECRET_CRYPTO;

export const sendVerificationEmail = async ({
  email,
  verificationCode,
}: {
  email: string;
  verificationCode: string;
}) => {
  const accessToken = OAuth2_client.getAccessToken();

  const appEmail = process.env.APP_EMAIL;
  const transporter: nodeMailer.Transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: appEmail,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: clientRefreshToken,
      accessToken: String(accessToken),
    },
  } as SMTPTransport.Options);

  const emailColors = {
    primary: "#1E293B",
    secondary: "#1A2333",
    gold: "#FCD34D",
    white: "#FFFFFF",
  };
  const options: nodeMailer.SendMailOptions = {
    from: appEmail,
    to: email,
    subject: "Verification Code",
    html: `
    <body style="color: ${emailColors.white};">
      <div style="padding: 20px;text-align: center; background-color: ${emailColors.primary};">
        <img src="https://constfitness.vercel.app/const-logo.png" alt="const-logo" width="200" height="200">
        <p style="color: ${emailColors.white};">
        Your <span style="font-weight: bolder;">CONST</span> verification code
        </p>
        <div style="background-color: ${emailColors.secondary}; text-align: center; padding: 8px; border-radius: 4px; color: ${emailColors.gold}; font-weight: bold;">
        ${verificationCode}
        </div>
        <p style="color: ${emailColors.white};">
        or click the following link
        </p>
        <div style="background-color: ${emailColors.secondary}; text-align: center; padding: 8px; border-radius: 4px; color: ${emailColors.gold}; font-weight: bold;">
        <a href="${ENV_CORS_URL}/verify?email=${email}&code=${verificationCode}">${ENV_CORS_URL}/verify?email=${email}&code=${verificationCode}</a>
        </div>
      </div>
    </body>
    `,
  };

  const sendEmail = new Promise((resolve, reject) => {
    transporter.sendMail(options, (err: Error, res: any) => {
      if (err) {
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
  const emailStatus = await sendEmail;
  return emailStatus;
};

export const random = () => crypto.randomBytes(128).toString("base64");

export const authentication = (salt: string, password: string) => {
  try {
    const hash = crypto
      .createHmac("sha256", [salt, password].join("/"))
      .update(SECRET)
      .digest("hex");
    return hash;
  } catch (error) {
    console.error("Error generating authentication hash:", error);
  }
};

export const verificationCodeGen = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};
