import express, { Application, Request, Response } from 'express';
import "dotenv/config";
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { applimiter } from './config/rateLimit.js';
import fileUpload from 'express-fileupload'
import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { setupSocket } from './socket.js';



const _dirname = path.dirname(fileURLToPath(import.meta.url));



const app: Application = express();
const server:HttpServer = createServer(app)

const io = new Server(server,{
  cors:{
    origin:'https://versus-chat.vercel.app'
  }
})

export {io}
setupSocket(io)





const PORT = process.env.PORT || 8000;

app.use(
    cors({
      origin:'https://versus-chat.vercel.app',
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    })
  );
app.use(express.static("public"))
app.use(applimiter)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.set("view engine", "ejs");
app.set("views", path.resolve(_dirname, "./views"));



//@ts-ignore
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

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});


//routes
import authRoute from './routes/authRoute.js';
import verifyemailRoute from './routes/verifyEmailRoutes.js';
import { emailQueue } from './jobs/emailJob.js';

import passwordRoute from './routes/passwordRoute.js'
import postRoute from './routes/postRoute.js'
import authMiddleware from './middleware/authMiddleware.js';
app.use('/api/auth/v1', authRoute);
app.use('/',verifyemailRoute)
app.use('/api/auth/v1',passwordRoute)
app.use('/api/post/v1',postRoute)



