import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendLeadEmail = async (to, subject, templateData) => {
  const html = `
    <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="color: #2563eb;">${subject}</h2>
      <p><strong>Lead Name:</strong> ${templateData.name}</p>
      <p><strong>Status:</strong> ${templateData.status}</p>
      <p><strong>Priority:</strong> ${templateData.score}</p>
      <hr />
      <p style="font-size: 12px; color: #666;">View this lead in your dashboard to take action.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"CRM System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
