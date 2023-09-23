const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendVerificationEmail = async function (userEmail, verificationCode) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Email Verification",
    text: `Your verification code is ${verificationCode}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log("Error: ", error);
  }
};
