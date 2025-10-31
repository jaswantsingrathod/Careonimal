import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

//  reusable function
export const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or you can use "Outlook" / "Yahoo"
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS  // app password (not regular password)
      }
    });

    const mailOptions = {
      from: `"Careonimal 🐾" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments 
    };

    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");
  } catch (error) {
    console.error("Mail sending failed:", error.message);
  }
};
