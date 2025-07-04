import express, { Application, Request, Response } from 'express';
import "dotenv/config";
import { sendMail } from './config/mail.js';

const app: Application = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
    return res.send("yo ssupppppppp");
});

// Test mail endpoint
app.get("/test-mail", async (req: Request, res: Response) => {
    try {
        await sendMail(
            "rohitshahi581@gmail.com", // Replace with your email for testing
            "Welcome to VERSUS!",
            "<h1>Welcome to VERSUS!</h1><p>this is test verification mail regard -rohit shahi</p>"
        );
        res.send("Test email sent!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to send test email.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

