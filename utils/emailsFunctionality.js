const nodemailer = require("nodemailer");

exports.sendEmail = async ({ email, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  };
  await transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.log(info);
      return info;
    })
    .catch((error) => {
      console.log(error);
      return error;
    });
};
