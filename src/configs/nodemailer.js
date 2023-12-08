const nodemailer = require("nodemailer");
const { google } = require("googleapis");

let refreshToken = process.env.NODEMAILER_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  process.env.MAIL_CLIENT_ID,
  process.env.MAIL_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: refreshToken,
});

oAuth2Client.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    console.log("Received new refresh token:", tokens.refresh_token);
    refreshToken = tokens.refresh_token;
  }
});

async function NewTransporter() {
  try {
    const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.SITE_EMAIL_ADDRESS,
        accessToken: ACCESS_TOKEN,
        clientId: process.env.MAIL_CLIENT_ID,
        clientSecret: process.env.MAIL_CLIENT_SECRET,
        refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    return transporter;
  } catch (error) {
    console.log(error);
  }
}

const sendEmail = async (mailOptions) => {
  const transporter = await NewTransporter();

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return; //Not wait result => return
      }
    });
  } catch (error) {
    console.error(error);
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  let mailOptions = {
    from: process.env.SITE_EMAIL_ADDRESS,
    to: email,
    subject: `Verify your email`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1 style="color: #333; text-align: center;">Welcome!</h1>
        <p style="font-size: 16px; color: #555;">Hi there,</p>
        <p style="font-size: 16px; color: #555;">Thank you for signing up! To complete the verification process, please click the button below.</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.DOMAIN_CLIENT}/verification?token_id=${verificationToken}" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none; background-color: #007bff; color: #fff; border-radius: 5px;">Verify Email</a>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">Note: This link will expire in 1 hour.</p>
      </div>
    `,
  };

  sendEmail(mailOptions);
};

const sendRenewPwEmail = async (email, newPw) => {
  let mailOptions = {
    from: process.env.SITE_EMAIL_ADDRESS,
    to: email,
    subject: "Your Password Has Been Changed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1 style="color: #333; text-align: center;">Password Changed</h1>
        <p style="font-size: 16px; color: #555; text-align: center;">Hi there,</p>
        <p style="font-size: 16px; color: #555;">Your password has been changed successfully. Here is your new password:</p>
        <div style="text-align: center; margin-top: 20px; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
          <p style="font-size: 18px; color: #333; margin: 0;">${newPw}</p>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">Please login with your new password.</p>
      </div>
    `,
  };

  sendEmail(mailOptions);
};

const sendRequireResetPwAfterChangePw = async (email, tokenForResetPw) => {
  let mailOptions = {
    from: process.env.SITE_EMAIL_ADDRESS,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        <p style="font-size: 16px; color: #555; text-align: center;">Hi there,</p>
        <p style="font-size: 16px; color: #555;">We have noticed that your password has recently been changed. If this wasn't done by you, please reset your password by clicking the button below:</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.DOMAIN_CLIENT}/reset-password?token_id=${tokenForResetPw}" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none; background-color: #007bff; color: #fff; border-radius: 5px;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">If you did not request this change, please reset your password immediately.</p>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">Please note: This link will expire in 1 day.</p>
      </div>
    `,
  };

  sendEmail(mailOptions);
};

const sendRequireResetPw = async (email, tokenForResetPw) => {
  let mailOptions = {
    from: process.env.SITE_EMAIL_ADDRESS,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        <p style="font-size: 16px; color: #555; text-align: center;">Hi there,</p>
        <p style="font-size: 16px; color: #555; text-align: center;">Please reset your password by clicking the button below:</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.DOMAIN_CLIENT}/reset-password?token_id=${tokenForResetPw}" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none; background-color: #007bff; color: #fff; border-radius: 5px;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">Please note: This link will expire in 1 day.</p>
      </div>
    `,
  };

  sendEmail(mailOptions);
};

const sendInvitationToTheClass = async (from, to, classInfo) => {
  let mailOptions = {
    from: process.env.SITE_EMAIL_ADDRESS,
    to: to,
    subject: `${from.full_name} invites you to participate in the class ${classInfo.class_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Invitation to ${classInfo.class_name}</h1>
        <p style="font-size: 16px; color: #555; text-align: center;">Hi there,</p>
        <p style="font-size: 16px; color: #555; text-align: center;">You're invited to join the following class:</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.DOMAIN_CLIENT}/class/class_id=${classInfo._id}?join_code=${classInfo.class_code}" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none; background-color: #007bff; color: #fff; border-radius: 5px;">Join Class</a>
        </div>
      </div>
    `,
  };

  sendEmail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendRenewPwEmail,
  sendRequireResetPw,
  sendRequireResetPwAfterChangePw,
  sendInvitationToTheClass,
};
