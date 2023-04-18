const nodeMailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const env = require("../config");
const { confirmPath } = require("./fs.util");

const saveEmail = async (mailContent) => {
  const outputPath = path.join(__dirname, "../storage", `${new Date().valueOf()}.html`);
  confirmPath(path.join(__dirname, "../storage"));
  await new Promise((resolve) => {
    fs.writeFile(outputPath, mailContent, {}, () => {
      resolve();
    });
  });
};

exports.sendMail = async (targetEmail, mailHtml, subject) => {
  await saveEmail(mailHtml);
  const transporter = nodeMailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: false,
    auth: {
      user: env.MAIL_USERNAME,
      pass: env.MAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: {
      name: env.MAIL_FROM_NAME,
      address: env.MAIL_FROM_ADDRESS
    },
    to: targetEmail,
    replyTo: env.MAIL_FROM_ADDRESS,
    subject: subject,
    html: mailHtml
  };

  try {
    return await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
      }
      return Promise.resolve(info);
    });
  } catch (error) {
    throw error;
  }
};
