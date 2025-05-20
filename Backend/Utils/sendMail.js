// import nodemailer from "nodemailer"

// export const sendOtpEmail = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.MY_GMAIL,
//       pass: process.env.MY_PASSWORD
//     }
//   });

//   const mailOptions = {
//     from: 'real-estate098@email.com',
//     to: email,
//     subject: 'OTP Verification',
//     text: `Your OTP is ${otp}. It is valid for 10 minutes.`
//   };

//   await transporter.sendMail(mailOptions);
// };






import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_GMAIL,
    pass: process.env.MY_PASSWORD
  }
});

export default transporter;