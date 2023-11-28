const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.MAIL_CLIENT_ID,
  process.env.MAIL_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.NODEMAILER_REFRESH_TOKEN,
});

async function NewTransporter() {
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
}

const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = await NewTransporter();

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
          <a href="${process.env.SITE_DOMAIN}/api/users/verify/${verificationToken}" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none; background-color: #007bff; color: #fff; border-radius: 5px;">Verify Email</a>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">Note: This link will expire in 1 hour.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};

const sendRenewPwEmail = async (email, newPw) => {
  const transporter = await NewTransporter();

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

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};

const sendRequireResetPw = async (email, tokenForResetPw) => {
  const transporter = await NewTransporter();

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
          <a href="${process.env.DOMAIN_CLIENT}/resetPw/${tokenForResetPw}" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none; background-color: #007bff; color: #fff; border-radius: 5px;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">If you did not request this change, please reset your password immediately.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendRenewPwEmail,
  sendRequireResetPw,
};
