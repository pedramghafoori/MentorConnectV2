import nodemailer from 'nodemailer';

export const sendPdfEmail = async ({
  to,
  pdfBytes,
  filename,
}: {
  to: string;
  pdfBytes: Uint8Array;
  filename: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"MentorConnect" <no-reply@mentorconnect>',
    to,
    subject: 'Your signed MentorConnect waiver',
    text: 'Attached is the PDF copy of your signed waiver.',
    attachments: [
      {
        filename,
        content: Buffer.from(pdfBytes),
        contentType: 'application/pdf',
      },
    ],
  });
}; 