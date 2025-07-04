import { sendMail } from "./config/mail.js";

(async () => {
  try {
    await sendMail(
      "bhaur0452@gmail.com", // Replace with your test email
      "Test Subject",
      "<h1>Hello from Nodemailer!</h1><p>This is a test email.</p>"
    );
    console.log("Email sent!");
  } catch (err) {
    console.error("Failed to send email:", err);
  }
})();