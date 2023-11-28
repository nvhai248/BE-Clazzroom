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
    subject: "Verify by email!",
    html: `<p>Click <a href="${process.env.SITE_DOMAIN}/api/user/verify/${verificationToken}">here</a> to verify your email.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const sendRenewPwEmail = async (email, newPw) => {
  const transporter = await NewTransporter();

  let mailOptions = {
    from: process.env.SITE_EMAIL_ADDRESS,
    to: email,
    subject: "Change password!",
    html: `<h1>This is new Password:</h1>
      <p>${newPw}</p>
      `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = { sendVerificationEmail, sendRenewPwEmail };
