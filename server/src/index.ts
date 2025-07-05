import express, { Application, Request, Response } from 'express';
import "dotenv/config";
import { sendMail } from './config/mail.js';
import path from 'path';
import { fileURLToPath } from 'url';

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Application = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.resolve(_dirname, "./views"));


app.get("/", async (req: Request, res: Response) => {
    return res.send("yo ssupppppppp");
 
});

// // Test mail endpoint
// app.get("/test-mail", async (req: Request, res: Response) => {
//     try {
//         await sendMail(
//             "rohitshahi581@gmail.com", // Replace with your email for testing
//             "Welcome to VERSUS!",
//             "<h1>Welcome to VERSUS!</h1><p>this is test verification mail regard -rohit shahi</p>"
//         );
//         res.send("Test email sent!");
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Failed to send test email.");
//     }
// });

import './jobs/index.js'; // Import jobs to ensure they are registered

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});


//routes
import authRoute from './routes/authRoute.js';
import { emailQueue } from './jobs/emailJob.js';
app.use('/api/auth/v1', authRoute);

