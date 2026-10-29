import nodemailer from "nodemailer";

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jana.workplace.ph@gmail.com",
        pass: "kvphggptbkdxoxll",
      },
    });

    const info = await transporter.sendMail({
      from: "jana.workplace.ph@gmail.com",
      to: "yourpersonalemail@gmail.com",
      subject: "Test Email from Nodemailer",
      text: "Hello! This is a test from Nodemailer using Jana Boutique email.",
    });

    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

testEmail();
