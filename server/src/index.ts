import express,{Application,Request,Response} from 'express';
import "dotenv/config";

const app:Application = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
    return res.send("yo ssupppppppp");
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})

