import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Jana Boutique" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Jana Boutique Verification Code",
      html: `
  <div style="background: #f2e9e4; padding: 40px; font-family: 'Segoe UI', sans-serif;">
    <div style="
      max-width: 560px; 
      margin: auto; 
      background: #ffffff; 
      padding: 40px 30px; 
      border-radius: 16px; 
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      border: 1px solid #f0d9cb;
    ">
      
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="
          font-size: 28px; 
          font-weight: 700; 
          color: #b88e5a; 
          letter-spacing: 1px; 
          margin: 0;
        ">
          Jana’s Boutique
        </h1>
        <p style="color: #d6a77a; margin-top: 5px; font-size: 14px;">
          Elegance made personal.
        </p>
      </div>

      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Hello Beautiful, 💖 <br><br>
        Welcome to <b>Jana’s Boutique</b> — we’re excited to have you!  
        To complete your registration, please enter the verification code below:
      </p>

      <div style="
        margin: 30px auto;
        text-align: center;
        background: #fff5ec;
        padding: 15px 0;
        border-radius: 12px;
        border: 1px dashed #e7b98a;
        width: 80%;
        white-space: nowrap;
      ">
        <span style="
          font-size: 28px;      /* smaller font for mobile */
          display: inline-block;
          font-weight: bold; 
          letter-spacing: 4px;  /* reduced spacing */
          color: #b47441;
        ">
    ${code}
  </span>
</div>


      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Your code will expire in <b>5 minutes</b>.  
        If this wasn’t you, feel free to ignore this email — your account is safe.  
      </p>

      <hr style="margin: 35px 0; border: none; border-top: 1px solid #eee;">

      <p style="
        font-size: 12px; 
        color: #999; 
        text-align: center; 
        line-height: 1.5;
      ">
        This is an automated email — kindly do not reply. <br>
        © ${new Date().getFullYear()} Jana’s Boutique • All Rights Reserved
      </p>
    </div>
  </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    res.status(200).json({ message: "Verification email sent", info: info.response });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ message: error.message });
  }
}
