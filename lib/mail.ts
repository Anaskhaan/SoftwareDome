import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"SoftwareDome" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your SoftwareDome Verification Code",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a1a; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #60a5fa; margin: 0; font-size: 28px; letter-spacing: -0.5px;">SoftwareDome</h1>
          <p style="color: #94a3b8; font-size: 14px;">Secure Registration</p>
        </div>
        
        <div style="background: rgba(30, 41, 59, 0.5); padding: 30px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <h2 style="margin-top: 0; font-size: 20px; font-weight: 600;">Verify your email</h2>
          <p style="color: #cbd5e1; line-height: 1.6;">Use the following 6-digit verification code to complete your signup process. This code will expire in 10 minutes.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <div style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ffffff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
              ${otp}
            </div>
          </div>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #475569; font-size: 12px;">
          <p>&copy; 2026 SoftwareDome. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendContactEmail = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  return transporter.sendMail({
    from: `"SoftwareDome Contact Form" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: data.email,
    subject: `[Contact] ${data.subject}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br/>")}</p>
      </div>
    `,
  });
};

export const sendProductSubmissionEmail = async (data: {
  productName: string;
  website: string;
  category: string;
  contactName: string;
  contactEmail: string;
  description: string;
}) => {
  return transporter.sendMail({
    from: `"SoftwareDome Submissions" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: data.contactEmail,
    subject: `[Product Submission] ${data.productName}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New product submission</h2>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Website:</strong> ${data.website}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Submitted by:</strong> ${data.contactName} (${data.contactEmail})</p>
        <p><strong>Description:</strong></p>
        <p>${data.description.replace(/\n/g, "<br/>")}</p>
      </div>
    `,
  });
};
