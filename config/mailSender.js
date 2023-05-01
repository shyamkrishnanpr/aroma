const otp = require("../model/otpSchema");
const mailer = require("../middleware/otpValidation");
const bcrypt = require("bcrypt");

function mailSender(User) {
  return new Promise(async (resolve, reject) => {
    const OTP = `${Math.floor(1000 + Math.random() * 9000)}`;
    const botp = await bcrypt.hash(OTP, 10);
    console.log(OTP);

    const mailDetails = {
      from: "projectshyam3@gmail.com",
      to: User.email,
      subject: "OTP for aroma E-store",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f6f6f6;
                padding: 20px;
              }
              .container {
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                font-size: 24px;
                margin-top: 0;
              }
              p {
                font-size: 16px;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>OTP for Aroma shop </h1>
              <p>Dear ${User.username},</p>
              <p>Your OTP for registering in Aroma  E-store is <strong>${OTP}</strong></p>
              <p>This OTP is valid for 5 minutes only.</p>
              <p>Thank you for choosing Aroma E-store!</p>
            </div>
          </body>
        </html>
      `,
    };

    mailer.mailTransporter.sendMail(mailDetails, async function (err) {
      if (err) {
        console.log(err);
      } else {
        otp
          .create({
            email: User.email,
            username: User.username,
            phonenumber: User.phonenumber,
            password: User.password,
            otp: botp,
          })
          .then(() => {
            resolve(true);
          });
      }
    });
  });
}

module.exports = mailSender