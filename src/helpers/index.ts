import dotenv from "dotenv";
dotenv.config();
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

const SECRET = "GYM_API";

export const sendVerificationEmail = ({
  userEmail,
  verificationCode,
}: {
  userEmail: string;
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

  const options: nodeMailer.SendMailOptions = {
    from: appEmail,
    to: userEmail,
    subject: "Verification Code",
    html: `
    <body>
      <div style="padding: 20px;text-align: center; background-color: #3D3D3D;">
        <p>
        Your <span style="font-weight: bolder">CONSTfitness</span> verification code
        </p>
        <div style="background-color: #2D2D2D; text-align: center; padding: 8px; border-radius: 4px; color: #FFD568; font-weight: bold;">
        ${verificationCode}
        </div>
      </div>
    </body>
    `,
  };

  transporter.sendMail(options, (err: Error, res: any) => {
    if (err) {
      console.log(err);
      return false;
    } else {
      console.log(res);
      return true;
    }
  });
};

export const random = () => crypto.randomBytes(128).toString("base64");

export const authentication = (salt: string, password: string) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};

export const verificationCodeGen = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};
